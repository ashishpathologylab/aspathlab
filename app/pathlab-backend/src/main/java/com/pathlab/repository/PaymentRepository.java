package com.pathlab.repository;

import  com.pathlab.entity.Payment;
import com.pathlab.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Sum payments by status
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumByStatus(@Param("status") PaymentStatus status);

    // Sum payments in a date range with status
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paidAt BETWEEN :start AND :end AND p.status = :status")
    BigDecimal sumByPaidAtBetweenAndStatus(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("status") PaymentStatus status);

    // Find top N recent payments
    @Query("SELECT p FROM Payment p WHERE p.paidAt IS NOT NULL ORDER BY p.paidAt DESC")
    List<Payment> findTopNByPaidAtIsNotNullOrderByPaidAtDesc(@Param("limit") int limit);

    // Find all payments for a patient via booking
    List<Payment> findByBookingPatientId(Long patientId);
}


