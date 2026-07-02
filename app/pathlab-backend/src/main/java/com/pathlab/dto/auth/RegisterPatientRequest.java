package com.pathlab.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterPatientRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Pattern(regexp = "[MFO]", message = "gender must be one of M,F,O")
    private String gender;

    @NotNull
    private LocalDate dateOfBirth;

    @Size(max = 15)
    private String contactNumber;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    private String address;
}


