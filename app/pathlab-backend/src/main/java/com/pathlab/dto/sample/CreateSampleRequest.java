package com.pathlab.dto.sample;

import lombok.Data;

@Data
public class CreateSampleRequest {
    private Long bookingId;   // Required
    private Long testId;      // Required
    private Long collectedBy; // Optional (null when pending)
    private String notes;     // Optional
}
