package com.pathlab.mapper;

import com.pathlab.dto.payment.PaymentResponse;
import com.pathlab.entity.Payment;

import java.util.stream.Collectors;

public class PaymentMapper {

    public static PaymentResponse toDto(Payment payment) {
        var booking = payment.getBooking();
        var patient = booking.getPatient();

        var testNames = booking.getBookingTests()
                .stream()
                .map(bt -> bt.getTest().getTestName())
                .collect(Collectors.toList());

        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(booking.getId()) // ✅ expose bookingId
                .patientName(patient.getName())
                .patientContactNumber(patient.getContactNumber())
                .testNames(testNames)
                .bookingDate(booking.getBookingDate().toString())
                .status(payment.getStatus().name().toLowerCase())
                .totalAmount(payment.getAmount().doubleValue())
                .paidAt(payment.getPaidAt())
                .build();
    }

}
