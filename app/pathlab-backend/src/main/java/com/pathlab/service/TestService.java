package com.pathlab.service;

import com.pathlab.dto.test.CreateTestRequest;
import com.pathlab.dto.test.UpdateTestRequest;
import com.pathlab.entity.TestEntity;
import com.pathlab.entity.TestParameter;
import com.pathlab.repository.TestEntityRepository;
import com.pathlab.repository.TestParameterRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TestService {

    @Autowired
    private TestEntityRepository testRepository;

    @Autowired
    private TestParameterRepository testParameterRepository;

    @Transactional
    public TestEntity createTestWithParameters(CreateTestRequest request) {
        TestEntity test = TestEntity.builder()
                .testName(request.getTestName())
                .description(request.getDescription())
                .sampleType(request.getSampleType())
                .price(request.getPrice())
                .build();

        // Map parameters and set back-reference
        List<TestParameter> params = request.getParameters().stream().map(p -> TestParameter.builder()
                        .test(test)
                        .name(p.getName())
                        .unit(p.getUnit())
                        .refRangeMale(p.getRefRangeMale())
                        .refRangeFemale(p.getRefRangeFemale())
                        .refRangeChild(p.getRefRangeChild())
                        .build())
                .toList();
        test.getParameters().addAll(params);

        return testRepository.save(test);
    }

    public List<TestEntity> getAllTests() {
        return testRepository.findAll();
    }

    public Optional<TestEntity> getTestById(Long id) {
        return testRepository.findById(id);
    }

    public List<TestParameter> getTestParameterByTestId(Long testId){
        return testParameterRepository.findByTestId(testId);
    }

    @Transactional
    public TestEntity updateTest(Long id, UpdateTestRequest request) {
        TestEntity existingTest = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));

        // Update basic test information
        existingTest.setTestName(request.getTestName());
        existingTest.setDescription(request.getDescription());
        if (request.getSampleType() != null) {
            existingTest.setSampleType(request.getSampleType());
        }

        existingTest.setPrice(request.getPrice());

        // Update parameters if provided
        if (request.getParameters() != null && !request.getParameters().isEmpty()) {
            // Clear existing parameters
            existingTest.getParameters().clear();
            
            // Add new parameters
            List<TestParameter> newParams = request.getParameters().stream()
                    .map(p -> TestParameter.builder()
                            .test(existingTest)
                            .name(p.getName())
                            .unit(p.getUnit())
                            .refRangeMale(p.getRefRangeMale())
                            .refRangeFemale(p.getRefRangeFemale())
                            .refRangeChild(p.getRefRangeChild())
                            .build())
                    .toList();
            existingTest.getParameters().addAll(newParams);
        }

        return testRepository.save(existingTest);
    }

    @Transactional
    public void deleteTest(Long id) {
        TestEntity test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));
        testRepository.delete(test);
    }

    public boolean testExists(Long id) {
        return testRepository.existsById(id);
    }
}


