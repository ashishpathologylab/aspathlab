package com.pathlab.service;

import com.pathlab.dto.booking.CreateBookingRequest;
import com.pathlab.dto.booking.UpdateBookingRequest;
import com.pathlab.entity.*;
import com.pathlab.entity.enums.PaymentStatus;
import com.pathlab.entity.enums.SampleStatus;
import com.pathlab.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private TestEntityRepository testEntityRepository;

    @Autowired
    private BookingTestRepository bookingTestRepository;

    @Autowired
    private SampleRepository sampleRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }


    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }

    @Transactional
    public Booking createBooking(CreateBookingRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));

        Booking booking = Booking.builder()
                .patient(patient)
                .bookingDate(request.getBookingDate())
                .status(request.getStatus())
                .build();

        Booking saved = bookingRepository.save(booking);

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.getTestIds() != null && !request.getTestIds().isEmpty()) {
            List<TestEntity> tests = testEntityRepository.findAllById(request.getTestIds());

            for (TestEntity test : tests) {
                BookingTest bt = BookingTest.builder()
                        .booking(saved)
                        .test(test)
                        .interpretation("NA")
                        .build();
                bookingTestRepository.save(bt);

                Sample sample = Sample.builder()
                        .booking(saved) // use saved booking, not raw booking
                        .test(test)
                        .collectedAt(LocalDateTime.now())
                        .collectedBy(null)
                        .status(SampleStatus.COLLECTION_PENDING) // always set default
                        .notes(request.getNotes())
                        .build();
                sampleRepository.save(sample);

                // ✅ Remove manual add() (Hibernate manages via mappedBy)
                totalAmount = totalAmount.add(test.getPrice() != null ? test.getPrice() : BigDecimal.ZERO);
            }

            Payment payment = Payment.builder()
                    .booking(saved)
                    .amount(totalAmount)
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);
        }

        return saved;
    }


    @Transactional
    public Booking updateBooking(Long id, UpdateBookingRequest request) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (request.getBookingDate() != null) {
            existing.setBookingDate(request.getBookingDate());
        }
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }

        if (request.getTestIds() != null) {
            // Load current booking_tests
            List<BookingTest> currentBookingTests = bookingTestRepository.findAllByBookingId(existing.getId());

            // Map by test_id for quick lookup
            Map<Long, BookingTest> currentMap = currentBookingTests.stream()
                    .collect(Collectors.toMap(bt -> bt.getTest().getId(), bt -> bt));

            // Load new tests requested
            List<TestEntity> tests = testEntityRepository.findAllById(request.getTestIds());

            List<BookingTest> finalBookingTests = new ArrayList<>();

            for (TestEntity test : tests) {
                BookingTest existingBT = currentMap.get(test.getId());
                if (existingBT != null) {
                    // Already exists → preserve interpretation as is
                    finalBookingTests.add(existingBT);
                } else {
                    // New test → create with interpretation = "NA"
                    BookingTest bt = BookingTest.builder()
                            .booking(existing)
                            .test(test)
                            .interpretation("NA")
                            .build();
                    finalBookingTests.add(bt);
                }
            }

            // Replace old collection with merged one
            existing.getBookingTests().clear();
            existing.getBookingTests().addAll(finalBookingTests);

            bookingTestRepository.saveAll(finalBookingTests);
        }

        return bookingRepository.save(existing);
    }


    public List<BookingTest> getTestsByBooking(Long bookingId) {
        return bookingTestRepository.findByBookingId(bookingId);
    }

}
