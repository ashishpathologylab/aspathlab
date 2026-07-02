package com.pathlab.dto.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookingResultsResponse {
    private Long bookingId;
    private PatientInfo patient;
    private List<TestResultGroup> tests;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientInfo {
        private Long id;
        private String name;
        private Integer age;
        private String gender;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TestResultGroup {
        private Long testId;
        private Long sampleId;
        private String testName;
        private String testDescription;
        private String testInterpretation;
        private String interpretation;
        private List<ParameterResult> parameters;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ParameterResult {
        private Long parameterId;
        private String name;
        private String unit;
        private String refRangeMale;
        private String refRangeFemale;
        private String refRangeChild;
        private String value;
        private String status;
    }
}
