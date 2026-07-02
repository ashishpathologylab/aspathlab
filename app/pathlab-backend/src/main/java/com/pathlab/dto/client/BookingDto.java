package com.pathlab.dto.client;

import com.pathlab.entity.Booking;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class BookingDto {
    private Long bookingId;
    private String testName;
    private LocalDate bookingDate;
    private String sampleStatus;
    private String testStatus;

    public static BookingDto fromEntity(Booking booking) {
        return BookingDto.builder()
                .bookingId(booking.getId())
                .testName(booking.getBookingTests().isEmpty() ? "N/A" : booking.getBookingTests().get(0).getTest().getTestName())
                .bookingDate(booking.getBookingDate())
                .sampleStatus(booking.getSamples().isEmpty() ? "Pending" : booking.getSamples().get(0).getStatus().name())
                .testStatus(booking.getStatus().name())
                .build();
    }
}
