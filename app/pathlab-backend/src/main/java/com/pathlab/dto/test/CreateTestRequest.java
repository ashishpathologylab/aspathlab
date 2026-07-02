package com.pathlab.dto.test;

import com.pathlab.entity.enums.SampleType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateTestRequest {
    @NotBlank
    @Size(max = 100)
    private String testName;

    private String description;

    private SampleType sampleType;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @NotNull
    @Size(min = 1)
    private List<ParameterDTO> parameters;

    @Data
    public static class ParameterDTO {
        @NotBlank
        @Size(max = 100)
        private String name;
        @Size(max = 50)
        private String unit;
        @Size(max = 100)
        private String refRangeMale;
        @Size(max = 100)
        private String refRangeFemale;
        @Size(max = 100)
        private String refRangeChild;
    }
}


