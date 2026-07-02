package com.pathlab.controller;

import com.pathlab.dto.sample.CreateSampleRequest;
import com.pathlab.dto.sample.UpdateSampleRequest;
import com.pathlab.entity.Sample;
import com.pathlab.service.SampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/samples")
public class SampleController {
    private final SampleService sampleService;

    @GetMapping
    public ResponseEntity<List<Sample>> list() {
        List<Sample> samples = sampleService.getAllSamples();
        return ResponseEntity.ok(samples);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Sample> get(@PathVariable Long id) {
        return sampleService.getSampleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PostMapping
    public ResponseEntity<Sample> createSample(@RequestBody CreateSampleRequest request) {
        Sample sample = sampleService.createSample(request);
        return ResponseEntity.ok(sample);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<Sample> updateSample(@PathVariable Long id,
                                               @RequestBody UpdateSampleRequest request) {
        Sample sample = sampleService.updateSample(id, request);
        return ResponseEntity.ok(sample);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            sampleService.deleteSample(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
