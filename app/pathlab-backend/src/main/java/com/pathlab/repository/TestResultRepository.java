package com.pathlab.repository;

import com.pathlab.entity.Booking;
import com.pathlab.entity.TestParameter;
import com.pathlab.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    List<TestResult> findByBooking_Id(Long bookingId);

    Optional<TestResult> findByBookingAndParameter(Booking booking, TestParameter parameter);

    @Query("SELECT r FROM TestResult r WHERE r.booking = :booking AND r.parameter.test.id = :testId")
    List<TestResult> findByBookingAndTestId(@Param("booking") Booking booking, @Param("testId") Long testId);
}
