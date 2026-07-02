    package com.pathlab.entity;

    import com.fasterxml.jackson.annotation.JsonManagedReference;
    import com.pathlab.entity.enums.SampleType;
    import jakarta.persistence.*;
    import jakarta.validation.constraints.NotNull;
    import jakarta.validation.constraints.Size;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.math.BigDecimal;
    import java.util.ArrayList;
    import java.util.List;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "tests")
    public class TestEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "test_id")
        private Long id;

        @NotNull
        @Size(max = 100)
        @Column(name = "test_name", nullable = false, length = 100)
        private String testName;

        @Column(name = "description")
        private String description;

        @NotNull
        @Column(name = "sample_type", nullable = false, length = 20)
        private SampleType sampleType;

        @NotNull
        @Column(name = "price", nullable = false, precision = 10, scale = 2)
        private BigDecimal price;

        @Builder.Default
        @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonManagedReference("test-parameters")
        private List<TestParameter> parameters = new ArrayList<>();

    }


