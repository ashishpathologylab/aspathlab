package com.pathlab.service;

import com.pathlab.dto.sample.CreateSampleRequest;
import com.pathlab.dto.sample.UpdateSampleRequest;
import com.pathlab.entity.*;
import com.pathlab.entity.enums.SampleStatus;
import com.pathlab.repository.BookingRepository;
import com.pathlab.repository.SampleRepository;
import com.pathlab.repository.TestEntityRepository;
import com.pathlab.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SampleService {

    @Autowired
    private  SampleRepository sampleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TestEntityRepository testEntityRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Sample> getAllSamples() {
        return sampleRepository.findAll();
    }

    public Optional<Sample> getSampleById(Long id) {
        return sampleRepository.findById(id);
    }


    @Transactional
    public void deleteSample(Long id) {
        Sample sample = sampleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sample not found with id: " + id));
        sampleRepository.delete(sample);
    }

    @Transactional
    public Sample createSample(CreateSampleRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found: " + request.getBookingId()));

        TestEntity test = testEntityRepository.findById(request.getTestId())
                .orElseThrow(() -> new RuntimeException("Test not found: " + request.getTestId()));

        User collectedBy = null;
        if (request.getCollectedBy() != null) {
            collectedBy = userRepository.findById(request.getCollectedBy())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getCollectedBy()));
        }

        Sample sample = Sample.builder()
                .booking(booking)
                .test(test)
                .collectedAt(LocalDateTime.now())
                .collectedBy(collectedBy)
                .status(SampleStatus.COLLECTION_PENDING) // default always
                .notes(request.getNotes())
                .build();

        return sampleRepository.save(sample);
    }

    @Transactional
    public Sample updateSample(Long sampleId, UpdateSampleRequest request) {
        Sample sample = sampleRepository.findById(sampleId)
                .orElseThrow(() -> new RuntimeException("Sample not found: " + sampleId));

        if (request.getCollectedBy() != null) {
            User collectedBy = userRepository.findById(request.getCollectedBy())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getCollectedBy()));
            sample.setCollectedBy(collectedBy);
        }

        if (request.getStatus() != null) {
            sample.setStatus(request.getStatus());
            if (request.getStatus() == SampleStatus.COLLECTED) {
                sample.setCollectedAt(LocalDateTime.now()); // set collection time
            }
        }

        if (request.getNotes() != null) {
            sample.setNotes(request.getNotes());
        }

        return sampleRepository.save(sample);
    }

}

