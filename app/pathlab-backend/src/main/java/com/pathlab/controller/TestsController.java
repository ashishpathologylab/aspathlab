package com.pathlab.controller;

import com.pathlab.dto.test.CreateTestRequest;
import com.pathlab.dto.test.UpdateTestRequest;
import com.pathlab.entity.TestEntity;
import com.pathlab.entity.TestParameter;
import com.pathlab.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/api/tests")
@RequiredArgsConstructor
public class TestsController {

    private final TestService testService;

    @GetMapping
    public ResponseEntity<List<TestEntity>> list() {
        List<TestEntity> tests = testService.getAllTests();
        return ResponseEntity.ok(tests);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TestEntity> get(@PathVariable Long id) {
        return testService.getTestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create test with multiple parameters
    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PostMapping
    public ResponseEntity<TestEntity> create(@Valid @RequestBody CreateTestRequest request) {
        TestEntity saved = testService.createTestWithParameters(request);
        return ResponseEntity.created(URI.create("/api/tests/" + saved.getId())).body(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<TestEntity> update(@PathVariable Long id, @Valid @RequestBody UpdateTestRequest request) {
        try {
            TestEntity updated = testService.updateTest(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            testService.deleteTest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/parameters/{testId}")
    public ResponseEntity<List<TestParameter>> getTestParameterByTestId(@PathVariable Long testId){
        return ResponseEntity.ok(testService.getTestParameterByTestId(testId));
    }
}


