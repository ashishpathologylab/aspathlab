package com.pathlab.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestDistributionDTO {
    private String name;
    private int value;
}