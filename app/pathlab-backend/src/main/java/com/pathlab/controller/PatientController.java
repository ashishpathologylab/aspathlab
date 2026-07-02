package com.pathlab.controller;

import com.pathlab.dto.patient.CreatePatientRequest;
import com.pathlab.dto.patient.PatientSummaryResponse;
import com.pathlab.dto.patient.UpdatePatientRequest;
import com.pathlab.entity.Patient;
import com.pathlab.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientSummaryResponse>> list() {
        List<PatientSummaryResponse> patients = patientService.getAllPatientsWithStats();
        return ResponseEntity.ok(patients);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Patient> get(@PathVariable Long id) {
        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //Create Patient By Admin
    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PostMapping
    public ResponseEntity<Patient> create(@Valid @RequestBody CreatePatientRequest request) {
        Patient saved = patientService.createPatient(request);
        return ResponseEntity.created(URI.create("/api/patients/" + saved.getId())).body(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH','DOCTOR')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id, @Valid @RequestBody UpdatePatientRequest request) {
        try {
            Patient updated = patientService.updatePatient(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            patientService.deletePatient(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
