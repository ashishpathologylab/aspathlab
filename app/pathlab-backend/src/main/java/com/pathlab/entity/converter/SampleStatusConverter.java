package com.pathlab.entity.converter;

import com.pathlab.entity.enums.SampleStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SampleStatusConverter implements AttributeConverter<SampleStatus, String> {
    @Override
    public String convertToDatabaseColumn(SampleStatus attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case COLLECTION_PENDING -> "collection_pending";
            case COLLECTED -> "collected";
            case IN_TRANSIT -> "in_transit";
            case RECEIVED -> "received";
            case TESTED -> "tested";
            case DISCARDED -> "discarded";
        };
    }

    @Override
    public SampleStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "collection_pending" -> SampleStatus.COLLECTION_PENDING;
            case "collected" -> SampleStatus.COLLECTED;
            case "in_transit" -> SampleStatus.IN_TRANSIT;
            case "received" -> SampleStatus.RECEIVED;
            case "tested" -> SampleStatus.TESTED;
            case "discarded" -> SampleStatus.DISCARDED;
            default -> throw new IllegalArgumentException("Unknown sample status: " + dbData);
        };
    }
}


