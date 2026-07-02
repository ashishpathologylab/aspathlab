package com.pathlab.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String patientName;
    private String patientContactNumber;
    private List<String> testNames;
    private String bookingDate;
    private String status;
    private Double totalAmount;
    private LocalDateTime paidAt;
}
