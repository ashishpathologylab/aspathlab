package com.pathlab.service;

import com.pathlab.dto.dashboard.DashboardStatsDTO;
import com.pathlab.dto.dashboard.MonthlyBookingDTO;
import com.pathlab.dto.dashboard.RecentActivityDTO;
import com.pathlab.dto.dashboard.TestDistributionDTO;
import com.pathlab.entity.Booking;
import com.pathlab.entity.Payment;
import com.pathlab.entity.Sample;
import com.pathlab.entity.enums.PaymentStatus;
import com.pathlab.entity.enums.SampleStatus;
import com.pathlab.entity.enums.SampleType;
import com.pathlab.repository.BookingRepository;
import com.pathlab.repository.PatientRepository;
import com.pathlab.repository.PaymentRepository;
import com.pathlab.repository.SampleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SampleRepository sampleRepository;

    public DashboardStatsDTO getDashboardStats() {
        // Total patients
        long totalPatients = patientRepository.count();

        // Total bookings
        long totalBookings = bookingRepository.count();

        // Tests completed: Samples with status TESTED
        long testsCompleted = sampleRepository.countByStatus(SampleStatus.TESTED);

        // Pending reports: Samples with status not TESTED
        long pendingReports = sampleRepository.countByStatusNot(SampleStatus.TESTED);

        // Total revenue: Sum of paid payments
        BigDecimal totalRevenue = paymentRepository.sumByStatus(PaymentStatus.PAID);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        // Monthly growth: Percentage growth in bookings from previous month to current
        LocalDate now = LocalDate.now();
        LocalDateTime firstOfCurrentMonth = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime firstOfPreviousMonth = firstOfCurrentMonth.minusMonths(1);

        long currentMonthBookings = bookingRepository.countByCreatedAtBetween(
                firstOfCurrentMonth, now.atTime(23, 59, 59));
        long previousMonthBookings = bookingRepository.countByCreatedAtBetween(
                firstOfPreviousMonth, firstOfCurrentMonth.minusSeconds(1));

        double monthlyGrowth = 0;
        if (previousMonthBookings > 0) {
            monthlyGrowth = ((double) (currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100;
            monthlyGrowth = BigDecimal.valueOf(monthlyGrowth).setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        return DashboardStatsDTO.builder()
                .totalPatients(totalPatients)
                .totalBookings(totalBookings)
                .testsCompleted(testsCompleted)
                .pendingReports(pendingReports)
                .totalRevenue(totalRevenue.doubleValue())
                .monthlyGrowth(monthlyGrowth)
                .build();
    }

    public List<MonthlyBookingDTO> getMonthlyBookings(int months) {
        LocalDate now = LocalDate.now();
        List<MonthlyBookingDTO> result = new ArrayList<>();

        for (int i = months - 1; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDateTime start = monthStart.atStartOfDay();
            LocalDateTime end = monthStart.withDayOfMonth(monthStart.lengthOfMonth()).atTime(23, 59, 59);

            long bookings = bookingRepository.countByCreatedAtBetween(start, end);

            BigDecimal revenue = paymentRepository.sumByPaidAtBetweenAndStatus(
                    start, end, PaymentStatus.PAID);
            if (revenue == null) revenue = BigDecimal.ZERO;

            String monthName = monthStart.format(DateTimeFormatter.ofPattern("MMM"));

            result.add(MonthlyBookingDTO.builder()
                    .month(monthName)
                    .bookings(bookings)
                    .revenue(revenue.doubleValue())
                    .build());
        }
        return result;
    }

    public List<TestDistributionDTO> getTestDistribution() {
        List<Object[]> rawData = sampleRepository.countByTestSampleType();
        long total = rawData.stream().mapToLong(row -> (long) row[1]).sum();

        return rawData.stream().map(row -> {
            SampleType type = (SampleType) row[0];
            long count = (long) row[1];
            double percentage = total > 0 ? (double) count / total * 100 : 0;

            String name = switch (type) {
                case BLOOD -> "Blood Tests";
                case URINE -> "Urine Tests";
                case SALIVA -> "Saliva Tests";
                case TISSUE -> "Tissue Tests";
                case OTHER -> "Others";
            };

            return TestDistributionDTO.builder()
                    .name(name)
                    .value((int) percentage)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<RecentActivityDTO> getRecentActivity(int limit) {
        List<Booking> recentBookings = bookingRepository.findTopNByOrderByCreatedAtDesc(limit);
        List<Payment> recentPayments = paymentRepository.findTopNByPaidAtIsNotNullOrderByPaidAtDesc(limit);
        List<Sample> recentSamples = sampleRepository.findTopNByCollectedAtIsNotNullOrderByCollectedAtDesc(limit);

        List<RecentActivityDTO> activities = new ArrayList<>();

        recentBookings.forEach(booking -> {
            List<Sample> samples = sampleRepository.findByBooking_Id(booking.getId());
            String testNames = samples.stream()
                    .map(s -> s.getTest().getTestName())
                    .collect(Collectors.joining(", "));
            String message = "New booking from " + booking.getPatient().getName() + " for " + testNames;
            String time = formatTimeAgo(booking.getCreatedAt());
            activities.add(RecentActivityDTO.builder()
                    .id(booking.getId())
                    .type("booking")
                    .message(message)
                    .time(time)
                    .status(booking.getStatus().name().toLowerCase())
                    .timestamp(booking.getCreatedAt())
                    .build());
        });

        recentPayments.forEach(payment -> {
            String message = "Payment received from " + payment.getBooking().getPatient().getName();
            String time = formatTimeAgo(payment.getPaidAt());
            activities.add(RecentActivityDTO.builder()
                    .id(payment.getId())
                    .type("payment")
                    .message(message)
                    .time(time)
                    .status("completed")
                    .timestamp(payment.getPaidAt())
                    .build());
        });

        recentSamples.forEach(sample -> {
            String message = "Report generated for " + sample.getBooking().getPatient().getName() +
                    " (" + sample.getTest().getTestName() + ")";
            String time = formatTimeAgo(sample.getCollectedAt());
            activities.add(RecentActivityDTO.builder()
                    .id(sample.getId())
                    .type("report")
                    .message(message)
                    .time(time)
                    .status("completed")
                    .timestamp(sample.getCollectedAt())
                    .build());
        });

        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return activities.subList(0, Math.min(limit, activities.size()));
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        long minutesAgo = ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutesAgo < 1) return "Just now";
        if (minutesAgo < 60) return minutesAgo + " minute" + (minutesAgo == 1 ? "" : "s") + " ago";
        long hoursAgo = minutesAgo / 60;
        if (hoursAgo < 24) return hoursAgo + " hour" + (hoursAgo == 1 ? "" : "s") + " ago";
        return (hoursAgo / 24) + " day" + (hoursAgo / 24 == 1 ? "" : "s") + " ago";
    }
}