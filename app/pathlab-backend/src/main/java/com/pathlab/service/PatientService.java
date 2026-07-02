package com.pathlab.service;

import com.pathlab.dto.patient.CreatePatientRequest;
import com.pathlab.dto.patient.PatientSummaryResponse;
import com.pathlab.dto.patient.UpdatePatientRequest;
import com.pathlab.entity.Patient;
import com.pathlab.entity.enums.Gender;
import com.pathlab.repository.BookingRepository;
import com.pathlab.repository.PatientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    private final PasswordEncoder passwordEncoder;
    private final BookingRepository bookingRepository;

    @Transactional
    public Patient createPatient(CreatePatientRequest request) {
        Patient patient = Patient.builder()
                .name(request.getName())
                .gender(Gender.valueOf(request.getGender()))
                .dateOfBirth(request.getDateOfBirth())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
        return patientRepository.save(patient);
    }

    public List<PatientSummaryResponse> getAllPatientsWithStats() {
        List<Patient> patients = patientRepository.findAll();

        return patients.stream().map(p -> {
            Long totalBookings = bookingRepository.countByPatientId(p.getId());
            LocalDate lastVisit = bookingRepository.findLastVisitByPatientId(p.getId());

            return PatientSummaryResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .gender(p.getGender().name())
                    .dateOfBirth(p.getDateOfBirth().toString())
                    .contactNumber(p.getContactNumber())
                    .email(p.getEmail())
                    .address(p.getAddress())
                    .isActive(p.getIsActive())
                    .createdAt(p.getCreatedAt())
                    .totalBookings(totalBookings)
                    .lastVisit(lastVisit)
                    .build();
        }).toList();
    }


    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    @Transactional
    public Patient updatePatient(Long id, UpdatePatientRequest request) {
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        // Update basic patient information
        existingPatient.setName(request.getName());
        existingPatient.setGender(Gender.valueOf(request.getGender()));
        existingPatient.setDateOfBirth(request.getDateOfBirth());
        existingPatient.setContactNumber(request.getContactNumber());
        existingPatient.setEmail(request.getEmail());
        existingPatient.setAddress(request.getAddress());
        return patientRepository.save(existingPatient);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        patientRepository.delete(patient);
    }

}
