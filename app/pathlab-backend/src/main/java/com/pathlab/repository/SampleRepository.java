package com.pathlab.repository;

import com.pathlab.entity.Sample;
import com.pathlab.entity.enums.SampleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SampleRepository extends JpaRepository<Sample, Long> {

    // Fetch all samples for a booking
    List<Sample> findByBooking_Id(Long bookingId);

    // Fetch a single sample by bookingId and testId
    Optional<Sample> findByBooking_IdAndTest_Id(Long bookingId, Long testId);
    // Count completed samples (assuming COLLECTED or a similar status indicates completion)
    @Query("SELECT COUNT(s) FROM Sample s WHERE s.status = :status")
    long countByStatus(@Param("status") SampleStatus status);

    // Count pending samples (e.g., status != COLLECTED or similar)
    @Query("SELECT COUNT(s) FROM Sample s WHERE s.status != :status")
    long countByStatusNot(@Param("status") SampleStatus status);

    // Group by sample type for test distribution
    @Query("SELECT s.test.sampleType, COUNT(s) FROM Sample s GROUP BY s.test.sampleType")
    List<Object[]> countByTestSampleType();

    // Find top N recent samples (for reports)
    @Query("SELECT s FROM Sample s WHERE s.collectedAt IS NOT NULL ORDER BY s.collectedAt DESC")
    List<Sample> findTopNByCollectedAtIsNotNullOrderByCollectedAtDesc(@Param("limit") int limit);
}