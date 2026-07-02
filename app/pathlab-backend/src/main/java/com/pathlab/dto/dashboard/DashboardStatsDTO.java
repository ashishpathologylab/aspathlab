package com.pathlab.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalPatients;
    private long totalBookings;
    private long testsCompleted;
    private long pendingReports;
    private double totalRevenue;
    private double monthlyGrowth;
}