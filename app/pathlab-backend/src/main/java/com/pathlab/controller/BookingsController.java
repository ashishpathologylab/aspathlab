package com.pathlab.controller;

import com.pathlab.dto.booking.CreateBookingRequest;
import com.pathlab.dto.booking.UpdateBookingRequest;
import com.pathlab.entity.Booking;
import com.pathlab.entity.BookingTest;
import com.pathlab.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/bookings")
public class BookingsController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> list() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Booking> get(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bookingId}/tests")
    public ResponseEntity<List<BookingTest>> getTestsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.getTestsByBooking(bookingId));
    }

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody CreateBookingRequest request) {
        Booking saved = bookingService.createBooking(request);
        return ResponseEntity.created(URI.create("/api/bookings/" + saved.getId())).body(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<Booking> update(@PathVariable Long id, @Valid @RequestBody UpdateBookingRequest request) {
        try {
            Booking updated = bookingService.updateBooking(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}


