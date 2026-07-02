package com.pathlab.controller;

import com.pathlab.dto.dashboard.DashboardStatsDTO;
import com.pathlab.dto.dashboard.MonthlyBookingDTO;
import com.pathlab.dto.dashboard.RecentActivityDTO;
import com.pathlab.dto.dashboard.TestDistributionDTO;
import com.pathlab.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')") // Adjust based on your security setup
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/monthly-bookings")
    public ResponseEntity<List<MonthlyBookingDTO>> getMonthlyBookings(
            @RequestParam(defaultValue = "6") int months) {
        List<MonthlyBookingDTO> monthlyData = dashboardService.getMonthlyBookings(months);
        return ResponseEntity.ok(monthlyData);
    }

    @GetMapping("/test-distribution")
    public ResponseEntity<List<TestDistributionDTO>> getTestDistribution() {
        List<TestDistributionDTO> distribution = dashboardService.getTestDistribution();
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        List<RecentActivityDTO> activities = dashboardService.getRecentActivity(limit);
        return ResponseEntity.ok(activities);
    }
}