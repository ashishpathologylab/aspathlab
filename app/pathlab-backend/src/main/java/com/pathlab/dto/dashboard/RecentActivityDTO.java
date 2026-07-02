package com.pathlab.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RecentActivityDTO {
    private Long id;
    private String type;
    private String message;
    private String time;
    private String status;
    private LocalDateTime timestamp; // For sorting
}