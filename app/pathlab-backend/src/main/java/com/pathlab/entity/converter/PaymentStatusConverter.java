package com.pathlab.entity.converter;

import com.pathlab.entity.enums.PaymentStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {
    @Override
    public String convertToDatabaseColumn(PaymentStatus attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case PAID -> "paid";
            case PENDING -> "pending";
        };
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "paid" -> PaymentStatus.PAID;
            case "pending" -> PaymentStatus.PENDING;
            default -> throw new IllegalArgumentException("Unknown payment status: " + dbData);
        };
    }
}


