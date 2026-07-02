package com.pathlab.entity.converter;

import com.pathlab.entity.enums.Role;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, String> {
    @Override
    public String convertToDatabaseColumn(Role attribute) {
        if (attribute == null) return null;
        return switch (attribute) {
            case ADMIN -> "admin";
            case LAB_TECH -> "lab_tech";
            case DOCTOR -> "doctor";
        };
    }

    @Override
    public Role convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return switch (dbData) {
            case "admin" -> Role.ADMIN;
            case "lab_tech" -> Role.LAB_TECH;
            case "doctor" -> Role.DOCTOR;
            default -> throw new IllegalArgumentException("Unknown role: " + dbData);
        };
    }
}


