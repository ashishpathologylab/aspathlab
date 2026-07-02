package com.pathlab.dto.client;

import com.pathlab.entity.Payment;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentDto {
    private Long paymentId;
    private Long bookingId;
    private LocalDateTime paidAt;
    private BigDecimal amount;
    private String status;

    public static PaymentDto fromEntity(Payment payment) {
        return PaymentDto.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBooking().getId())
                .paidAt(payment.getPaidAt())
                .amount(payment.getAmount())
                .status(payment.getStatus() != null ? payment.getStatus().name() : "Pending")
                .build();
    }
}
