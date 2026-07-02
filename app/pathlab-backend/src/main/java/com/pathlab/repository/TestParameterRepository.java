package com.pathlab.repository;

import com.pathlab.entity.TestParameter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestParameterRepository extends JpaRepository<TestParameter, Long> {
    public List<TestParameter> findByTestId(Long id);
}


