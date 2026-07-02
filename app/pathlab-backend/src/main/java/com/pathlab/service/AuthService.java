package com.pathlab.service;

import com.pathlab.dto.auth.*;
import com.pathlab.entity.*;
import com.pathlab.entity.enums.Gender;
import com.pathlab.entity.enums.Role;
import com.pathlab.entity.enums.UserType;
import com.pathlab.repository.*;
import com.pathlab.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final BlacklistedJwtRepository blacklistedJwtRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Transactional
    public void registerPatient(RegisterPatientRequest request, String verificationBaseUrl) {
        if (patientRepository.existsByEmail(request.getEmail()) || userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        Patient patient = Patient.builder()
                .name(request.getName())
                .gender(Gender.valueOf(request.getGender()))
                .dateOfBirth(request.getDateOfBirth())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .isActive(false)
                .build();
        patientRepository.save(patient);
        storePasswordHistory(UserType.PATIENT, patient.getId(), patient.getPassword());

        String token = UUID.randomUUID().toString();
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .token(token)
                .userType(UserType.PATIENT)
                .refId(patient.getId())
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        emailVerificationTokenRepository.save(evt);

        String verifyLink = verificationBaseUrl + "?token=" + token;
        try {
            emailService.sendVerificationEmail(patient.getEmail(), patient.getName(), "Verify your email", verifyLink);
        } catch (MessagingException | IOException e) {
            // Do not fail registration if email cannot be sent in dev environments
            log.warn("Failed to send verification email to {}: {}", patient.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public void registerUser(RegisterUserRequest request, String verificationBaseUrl) {
        if (patientRepository.existsByEmail(request.getEmail()) || userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        Role role = Role.valueOf(request.getRole().toUpperCase());

        // If any ADMIN exists, require adminEmail/adminPassword to authorize creating any staff user (including another admin)
        boolean anyAdminExists = userRepository.existsByRole(Role.ADMIN);
        if (anyAdminExists) {
            if (request.getAdminEmail() == null || request.getAdminPassword() == null) {
                throw new IllegalArgumentException("Admin credentials required to create users");
            }
            User admin = userRepository.findByEmail(request.getAdminEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
            if (admin.getRole() != Role.ADMIN) {
                throw new IllegalArgumentException("Only ADMIN can authorize user creation");
            }
            if (!admin.getIsActive()) {
                throw new IllegalStateException("Admin account is not verified");
            }
            if (!passwordEncoder.matches(request.getAdminPassword(), admin.getPassword())) {
                throw new IllegalArgumentException("Invalid admin credentials");
            }
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role(role)
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(false)
                .build();
        userRepository.save(user);
        storePasswordHistory(UserType.USER, user.getId(), user.getPassword());

        String token = UUID.randomUUID().toString();
        EmailVerificationToken evt = EmailVerificationToken.builder()
                .token(token)
                .userType(UserType.USER)
                .refId(user.getId())
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        emailVerificationTokenRepository.save(evt);

        String verifyLink = verificationBaseUrl + "?token=" + token;
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getName(), "Verify your email", verifyLink);
        } catch (MessagingException | IOException e) {
            log.warn("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public JwtResponse login(LoginRequest request) {
        String email = request.getEmail();
        String rawPassword = request.getPassword();
        String userType = request.getUserType();

        if (userType != null && userType.equalsIgnoreCase("PATIENT")) {
            Patient patient = patientRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
            if (!patient.getIsActive()) throw new IllegalStateException("Email not verified");
            if (!passwordEncoder.matches(rawPassword, patient.getPassword())) throw new IllegalArgumentException("Invalid credentials");
            Map<String, Object> claims = new HashMap<>();
            claims.put("roles", List.of("ROLE_PATIENT"));
            claims.put("userType", "PATIENT");
            claims.put("refId", patient.getId());
            String token = jwtUtil.generateAccessToken(patient.getEmail(), claims);
            return JwtResponse.builder().accessToken(token).tokenType("Bearer").expiresIn(900).build();
        }

        // Default: staff users
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!user.getIsActive()) throw new IllegalStateException("Email not verified");
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) throw new IllegalArgumentException("Invalid credentials");
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of("ROLE_" + user.getRole().name()));
        claims.put("userType", "USER");
        claims.put("refId", user.getId());
        String token = jwtUtil.generateAccessToken(user.getEmail(), claims);
        return JwtResponse.builder().accessToken(token).tokenType("Bearer").expiresIn(900).build();
    }

    @Transactional
    public String verifyEmail(String token) {
        EmailVerificationToken evt = emailVerificationTokenRepository.findByToken(token).orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        if (evt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }
        if (evt.getUserType() == UserType.PATIENT) {
            Patient patient = patientRepository.findById(evt.getRefId()).orElseThrow();
            patient.setIsActive(true);
            patientRepository.save(patient);
        } else {
            User user = userRepository.findById(evt.getRefId()).orElseThrow();
            user.setIsActive(true);
            userRepository.save(user);
        }
        emailVerificationTokenRepository.delete(evt);
        return "Email verified";
    }

    @Transactional
    public void logout(String token) {
        Claims claims = jwtUtil.parseClaims(token);
        LocalDateTime expiryAt = LocalDateTime.ofInstant(claims.getExpiration().toInstant(), java.time.ZoneId.systemDefault());
        BlacklistedJwt blacklistedJwt = BlacklistedJwt.builder()
                .token(token)
                .expiryAt(expiryAt)
                .build();
        blacklistedJwtRepository.save(blacklistedJwt);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String resetBaseUrl) {
        String email = request.getEmail();
        UserType userType = (request.getUserType() != null && request.getUserType().equalsIgnoreCase("PATIENT")) ? UserType.PATIENT : UserType.USER;

        Long refId;
        if (userType == UserType.PATIENT) {
            Patient patient = patientRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Email not found"));
            refId = patient.getId();
        } else {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Email not found"));
            refId = user.getId();
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = PasswordResetToken.builder()
                .token(token)
                .userType(userType)
                .refId(refId)
                .expiryDate(LocalDateTime.now().plusHours(2))
                .build();
        passwordResetTokenRepository.save(prt);

        String link = resetBaseUrl + "?token=" + token;
        // Reuse verification template for simplicity or add a separate reset template in a real app
        try {
            String recipientName = (userType == UserType.PATIENT)
                    ? patientRepository.findById(refId).map(Patient::getName).orElse("User")
                    : userRepository.findById(refId).map(User::getName).orElse("User");
            emailService.sendVerificationEmail(email, recipientName, "Reset your password", link);
        } catch (MessagingException | IOException e) {
            log.warn("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(request.getToken()).orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }
        if (prt.getUserType() == UserType.PATIENT) {
            Patient patient = patientRepository.findById(prt.getRefId()).orElseThrow();
            String encoded = passwordEncoder.encode(request.getNewPassword());
            patient.setPassword(encoded);
            patientRepository.save(patient);
            storePasswordHistory(UserType.PATIENT, patient.getId(), encoded);
        } else {
            User user = userRepository.findById(prt.getRefId()).orElseThrow();
            String encoded = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(encoded);
            userRepository.save(user);
            storePasswordHistory(UserType.USER, user.getId(), encoded);
        }
        passwordResetTokenRepository.delete(prt);
    }

    private void storePasswordHistory(UserType userType, Long refId, String password) {
        PasswordHistory history = PasswordHistory.builder()
                .userType(userType)
                .refId(refId)
                .password(password)
                .changeDate(LocalDateTime.now())
                .build();
        passwordHistoryRepository.save(history);
    }
}


