package com.pathlab.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pathlab.entity.enums.SampleStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "samples")
public class Sample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sample_id")
    private Long id;

    // Child side → prevent recursion
    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonBackReference("booking-samples")
    private Booking booking;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    private TestEntity test;

    @Column(name = "collected_at", nullable = true)
    private LocalDateTime collectedAt;

    @ManyToOne
    @JoinColumn(name = "collected_by", nullable = true)
    private User collectedBy;

    @Column(name = "status", length = 20)
    private SampleStatus status;

    @Column(name = "notes")
    private String notes;
}
