package com.pathlab.entity.converter;

import com.pathlab.entity.enums.SampleType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SampleTypeConverter implements AttributeConverter<SampleType, String> {
    @Override
    public String convertToDatabaseColumn(SampleType attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case BLOOD -> "blood";
            case URINE -> "urine";
            case SALIVA -> "saliva";
            case TISSUE -> "tissue";
            case OTHER -> "other";
        };
    }

    @Override
    public SampleType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "blood" -> SampleType.BLOOD;
            case "urine" -> SampleType.URINE;
            case "saliva" -> SampleType.SALIVA;
            case "tissue" -> SampleType.TISSUE;
            case "other" -> SampleType.OTHER;
            default -> throw new IllegalArgumentException("Unknown sample status: " + dbData);
        };
    }
}


