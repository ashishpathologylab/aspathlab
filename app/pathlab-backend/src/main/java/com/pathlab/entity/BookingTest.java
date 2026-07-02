package com.pathlab.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "booking_tests", uniqueConstraints = {
        @UniqueConstraint(name = "uk_booking_test_unique", columnNames = {"booking_id", "test_id"})
})
public class BookingTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Child side → prevent recursion
    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonBackReference("booking-tests")
    private Booking booking;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    private TestEntity test;

    private String interpretation;
}



