package com.pathlab.entity.converter;

import com.pathlab.entity.enums.UserType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserTypeConverter implements AttributeConverter<UserType, String> {
    @Override
    public String convertToDatabaseColumn(UserType attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case PATIENT -> "patient";
            case USER -> "user";
        };
    }

    @Override
    public UserType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "patient" -> UserType.PATIENT;
            case "user" -> UserType.USER;
            default -> throw new IllegalArgumentException("Unknown user type: " + dbData);
        };
    }
}


