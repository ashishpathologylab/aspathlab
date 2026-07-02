package com.pathlab.dto.patient;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PatientSummaryResponse {
    private Long id;
    private String name;
    private String gender;
    private String dateOfBirth;
    private String contactNumber;
    private String email;
    private String address;
    private Boolean isActive;
    private LocalDateTime createdAt;

    private Long totalBookings;
    private LocalDate lastVisit;  // ✅ only date now
}

