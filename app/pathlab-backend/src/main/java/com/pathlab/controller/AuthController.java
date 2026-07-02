package com.pathlab.controller;

import com.pathlab.dto.auth.*;
import com.pathlab.service.AuthService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/auth")
public class AuthController {

    private final AuthService authService;
    private final String publicBaseUrl;

    public AuthController(AuthService authService,
                          @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl) {
        this.authService = authService;
        this.publicBaseUrl = publicBaseUrl;
    }

    @PostMapping(value = "/register/patient")
    public ResponseEntity<Map<String, String>> registerPatient(@Valid @RequestBody RegisterPatientRequest request) throws MessagingException, IOException {
        String base = publicBaseUrl + "/verify-email";
        authService.registerPatient(request, base);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "verification email sent"));
    }

    @PostMapping(value = "/register/user")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterUserRequest request) throws MessagingException, IOException {
        String base = publicBaseUrl + "/verify-email";
        authService.registerUser(request, base);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "verification email sent"));
    }

    @PostMapping(value = "/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse resp = authService.login(request);
        return ResponseEntity.ok(resp);
    }

    @PostMapping(value = "/logout")
    public ResponseEntity<Void> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam("token") String token) {
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping(value = "/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) throws MessagingException, IOException {
        String base = publicBaseUrl + "/reset-password"; // could be a frontend URL that captures token
        authService.forgotPassword(request, base);
        return ResponseEntity.ok(Map.of("message", "password reset email sent"));
    }

    @PostMapping(value = "/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "password updated"));
    }
}


