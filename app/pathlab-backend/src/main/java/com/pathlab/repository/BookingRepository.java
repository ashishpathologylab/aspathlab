package com.pathlab.repository;

import com.pathlab.entity.Booking;
import com.pathlab.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Long countByPatientId(Long patientId);

    @Query("SELECT MAX(b.bookingDate) FROM Booking b WHERE b.patient.id = :patientId")
    LocalDate findLastVisitByPatientId(@Param("patientId") Long patientId);

    // Count bookings in a date range
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Find top N recent bookings
    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findTopNByOrderByCreatedAtDesc(@Param("limit") int limit);


    // Count completed tests for a patient
    long countByPatientIdAndStatus(Long patientId, BookingStatus status);

    // Find all bookings for a patient
    List<Booking> findByPatientId(Long patientId);
}
