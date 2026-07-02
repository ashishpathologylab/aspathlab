package com.pathlab.controller;

import com.pathlab.dto.client.BookingDto;
import com.pathlab.dto.client.PatientDashboardDto;
import com.pathlab.dto.client.PaymentDto;
import com.pathlab.entity.*;
import com.pathlab.entity.enums.BookingStatus;
import com.pathlab.repository.*;
import com.pathlab.service.AuthHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients") // plural for REST convention
@RequiredArgsConstructor
public class PatientClientController {

    private final PatientRepository patientRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AuthHelper authHelper;

    /** Dashboard Overview */
    @GetMapping("/dashboard")
    public ResponseEntity<PatientDashboardDto> getDashboard() {
        Long patientId = authHelper.getLoggedInRefId();
        if (patientId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        long totalBookings = bookingRepository.countByPatientId(patientId);
        long totalTestsCompleted = bookingRepository.countByPatientIdAndStatus(patientId, BookingStatus.COMPLETED);
        long pendingTests = bookingRepository.countByPatientIdAndStatus(patientId, BookingStatus.PENDING);

        PatientDashboardDto dto = PatientDashboardDto.builder()
                .totalBookings(totalBookings)
                .totalTestsCompleted(totalTestsCompleted)
                .pendingTests(pendingTests)
                .build();

        return ResponseEntity.ok(dto);
    }

    /** Bookings Table */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getBookings() {
        Long patientId = authHelper.getLoggedInRefId();
        if (patientId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Booking> bookings = bookingRepository.findByPatientId(patientId);
        List<BookingDto> bookingDtos = bookings.stream()
                .map(BookingDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(bookingDtos);
    }

    /** Payments Table */
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDto>> getPayments() {
        Long patientId = authHelper.getLoggedInRefId();
        if (patientId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Payment> payments = paymentRepository.findByBookingPatientId(patientId);
        List<PaymentDto> paymentDtos = payments.stream()
                .map(PaymentDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(paymentDtos);
    }

    /** Profile GET */
    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile() {
        Long patientId = authHelper.getLoggedInRefId();
        if (patientId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return patientRepository.findById(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Profile UPDATE */
    @PutMapping("/profile")
    public ResponseEntity<Patient> updateProfile(@RequestBody Patient updatedPatient) {
        Long patientId = authHelper.getLoggedInRefId();
        if (patientId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return patientRepository.findById(patientId).map(existing -> {
            existing.setName(updatedPatient.getName());
            existing.setContactNumber(updatedPatient.getContactNumber());
            existing.setEmail(updatedPatient.getEmail());
            existing.setAddress(updatedPatient.getAddress());
            patientRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }
}

