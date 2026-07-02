package com.pathlab.entity.converter;

import com.pathlab.entity.enums.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, String> {
    @Override
    public String convertToDatabaseColumn(BookingStatus attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case PENDING -> "pending";
            case COMPLETED -> "completed";
            case CANCELLED -> "cancelled";
        };
    }

    @Override
    public BookingStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "pending" -> BookingStatus.PENDING;
            case "completed" -> BookingStatus.COMPLETED;
            case "cancelled" -> BookingStatus.CANCELLED;
            default -> throw new IllegalArgumentException("Unknown booking status: " + dbData);
        };
    }
}


