package com.pathlab.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.pathlab.entity.enums.BookingStatus;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateBookingRequest {
    private LocalDate bookingDate;
    private BookingStatus status;
    private List<Long> testIds;
}
