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
public class SaveTestResultsRequest {
    private Long enteredBy;
    private List<ResultEntry> results;
    private String interpretation;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ResultEntry {
        private Long parameterId;
        private String value;
    }
}
