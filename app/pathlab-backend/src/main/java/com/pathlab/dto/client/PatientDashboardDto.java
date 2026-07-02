package com.pathlab.dto.client;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientDashboardDto {
    private long totalBookings;
    private long totalTestsCompleted;
    private long pendingTests;
}
