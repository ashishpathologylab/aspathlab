package com.pathlab.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "test_parameters")
public class TestParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "parameter_id")
    private Long id;

    // Many parameters belong to one test
    @ManyToOne(optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    @JsonBackReference("test-parameters")
    private TestEntity test;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Size(max = 50)
    @Column(name = "unit", length = 50)
    private String unit;

    @Size(max = 100)
    @Column(name = "ref_range_male", length = 100)
    private String refRangeMale;

    @Size(max = 100)
    @Column(name = "ref_range_female", length = 100)
    private String refRangeFemale;

    @Size(max = 100)
    @Column(name = "ref_range_child", length = 100)
    private String refRangeChild;
}
