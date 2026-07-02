package com.pathlab.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MonthlyBookingDTO {
    private String month;
    private long bookings;
    private double revenue;
}
