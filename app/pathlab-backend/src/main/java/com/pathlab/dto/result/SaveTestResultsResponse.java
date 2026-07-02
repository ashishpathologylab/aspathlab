package com.pathlab.dto.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SaveTestResultsResponse {
    private Long bookingId;
    private Long testId;
    private Long enteredBy;
    private LocalDateTime createdAt;
    private List<ResultEntry> savedResults;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ResultEntry {
        private Long parameterId;
        private String value;
    }
}
