package com.pathlab.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    @NotBlank
    private String role; // ADMIN, LAB_TECH, DOCTOR

    // If any admin exists in the system, these are required to authorize creation
    private String adminEmail;
    private String adminPassword;
}


