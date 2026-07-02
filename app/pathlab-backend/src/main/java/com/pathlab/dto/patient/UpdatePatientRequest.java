package com.pathlab.dto.patient;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UpdatePatientRequest {

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

    private String address;
}
