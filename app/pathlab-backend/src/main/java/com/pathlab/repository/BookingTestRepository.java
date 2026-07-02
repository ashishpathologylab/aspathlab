package com.pathlab.repository;

import com.pathlab.entity.BookingTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingTestRepository extends JpaRepository<BookingTest, Long> {

    @Modifying
    @Query("DELETE FROM BookingTest bt WHERE bt.booking.id = :bookingId")
    void deleteAllByBookingId(@Param("bookingId") Long bookingId);

    List<BookingTest> findByBookingId(Long bookingId);

    List<BookingTest> findByTestId(Long testId);

    List<BookingTest> findAllByBookingId(Long bookingId);

    Optional<BookingTest> findByBookingIdAndTestId(Long bookingId, Long testId);

}