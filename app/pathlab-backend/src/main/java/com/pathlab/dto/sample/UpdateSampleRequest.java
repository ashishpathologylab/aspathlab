package com.pathlab.dto.sample;

import com.pathlab.entity.enums.SampleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
@Builder
public class UpdateSampleRequest {
    private Long collectedBy;     // optional, can set user
    private SampleStatus status;  // e.g., COLLECTED, IN_TRANSIT, TESTED
    private String notes;         // optional
}
