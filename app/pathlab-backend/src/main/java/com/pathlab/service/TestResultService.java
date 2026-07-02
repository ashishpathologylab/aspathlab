package com.pathlab.service;

import com.pathlab.dto.result.BookingResultsResponse;
import com.pathlab.dto.result.SaveTestResultsRequest;
import com.pathlab.dto.result.SaveTestResultsResponse;
import com.pathlab.entity.*;
import com.pathlab.entity.enums.BookingStatus;
import com.pathlab.repository.*;
import com.pathlab.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestResultService {

    private final TestResultRepository testResultRepository;
    private final BookingRepository bookingRepository;
    private final TestParameterRepository testParameterRepository;
    private final UserRepository userRepository;
    private final SampleRepository sampleRepository;
    private final BookingTestRepository bookingTestRepository;

    @Transactional
    public SaveTestResultsResponse saveResultsForTest(Long bookingId, Long testId, SaveTestResultsRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.COMPLETED);

        User user = userRepository.findById(request.getEnteredBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Updated: Get list and filter by booking to ensure context-specific
        List<BookingTest> bookingTests = bookingTestRepository.findByTestId(testId);
        BookingTest bookingTest = bookingTests.stream()
                .filter(bt -> bt.getBooking().getId().equals(bookingId))  // Scope to this booking
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Test not found in BookingTest for this booking"));

        // Rest of the method remains the same...
        LocalDateTime now = LocalDateTime.now();

        List<SaveTestResultsResponse.ResultEntry> saved = request.getResults().stream().map(entry -> {
            TestParameter parameter = testParameterRepository.findById(entry.getParameterId())
                    .orElseThrow(() -> new RuntimeException("Parameter not found"));

            // check if already exists
            TestResult existing = testResultRepository.findByBookingAndParameter(booking, parameter).orElse(null);
            if (existing != null) {
                existing.setValue(entry.getValue());
                existing.setEnteredBy(user);
                return SaveTestResultsResponse.ResultEntry.builder()
                        .parameterId(parameter.getId())
                        .value(existing.getValue())
                        .build();
            }

            TestResult result = TestResult.builder()
                    .booking(booking)
                    .parameter(parameter)
                    .value(entry.getValue())
                    .enteredBy(user)
                    .createdAt(now)
                    .build();

            testResultRepository.save(result);

            bookingTest.setInterpretation(request.getInterpretation());  // Now safe: single bookingTest

            return SaveTestResultsResponse.ResultEntry.builder()
                    .parameterId(parameter.getId())
                    .value(result.getValue())
                    .build();
        }).toList();

        return SaveTestResultsResponse.builder()
                .bookingId(bookingId)
                .testId(testId)
                .enteredBy(user.getId())
                .createdAt(now)
                .savedResults(saved)
                .build();
    }

    @Transactional(readOnly = true)
    public BookingResultsResponse getResultsGroupedByTest(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        List<TestResult> results = testResultRepository.findByBooking_Id(bookingId);

        List<Sample> samples = sampleRepository.findByBooking_Id(bookingId);
        Map<Long, Long> testToSampleId = samples.stream()
                .collect(Collectors.toMap(s -> s.getTest().getId(), Sample::getId));

        Map<TestEntity, List<TestResult>> grouped = results.stream()
                .collect(Collectors.groupingBy(r -> r.getParameter().getTest()));

        Map<Long, String> testInterpretations = booking.getBookingTests().stream()
                .collect(Collectors.toMap(bt -> bt.getTest().getId(), BookingTest::getInterpretation));


        List<BookingResultsResponse.TestResultGroup> tests = grouped.entrySet().stream()
                .map(entry -> {
                    Long testId = entry.getKey().getId();
                    Long sampleId = testToSampleId.get(testId);
                    String interpretation = testInterpretations.get(testId);

                    return BookingResultsResponse.TestResultGroup.builder()
                            .testId(testId)
                            .sampleId(sampleId)
                            .testName(entry.getKey().getTestName())
                            .testDescription(entry.getKey().getDescription())
                            .interpretation(interpretation) // ✅ added
                            .parameters(entry.getValue().stream().map(r -> {
                                TestParameter p = r.getParameter();
                                return BookingResultsResponse.ParameterResult.builder()
                                        .parameterId(p.getId())
                                        .name(p.getName())
                                        .unit(p.getUnit())
                                        .refRangeMale(p.getRefRangeMale())
                                        .refRangeFemale(p.getRefRangeFemale())
                                        .refRangeChild(p.getRefRangeChild())
                                        .value(r.getValue())
                                        .status(determineStatus(r.getValue(), p))
                                        .build();
                            }).toList())
                            .build();
                }).toList();


        BookingResultsResponse.PatientInfo patientInfo = BookingResultsResponse.PatientInfo.builder()
                .id(booking.getPatient().getId())
                .name(booking.getPatient().getName())
                .age(DateUtils.calculateAge(booking.getPatient().getDateOfBirth()))
                .gender(booking.getPatient().getGender().name())
                .build();

        return BookingResultsResponse.builder()
                .bookingId(bookingId)
                .patient(patientInfo)
                .tests(tests)
                .build();
    }

    private String determineStatus(String value, TestParameter p) {
        // dummy: you can parse and compare ranges
        return "Normal";
    }

    @Transactional
    public SaveTestResultsResponse updateResultsForTest(Long bookingId, Long testId, SaveTestResultsRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User user = userRepository.findById(request.getEnteredBy())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<BookingTest> bookingTests = bookingTestRepository.findByTestId(testId);
        BookingTest bookingTest = bookingTests.stream()
                .filter(bt -> bt.getBooking().getId().equals(bookingId))  // Scope to this booking
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Test not found in BookingTest for this booking"));


        LocalDateTime now = LocalDateTime.now();

        List<SaveTestResultsResponse.ResultEntry> updated = request.getResults().stream().map(entry -> {
            TestParameter parameter = testParameterRepository.findById(entry.getParameterId())
                    .orElseThrow(() -> new RuntimeException("Parameter not found"));

            TestResult existing = testResultRepository.findByBookingAndParameter(booking, parameter)
                    .orElseThrow(() -> new RuntimeException("Result does not exist for parameter: " + parameter.getName()));

            existing.setValue(entry.getValue());
            existing.setEnteredBy(user);
            bookingTest.setInterpretation(request.getInterpretation());  // Now safe: single bookingTest
            // optional: update timestamp manually if you want an "updatedAt"

            return SaveTestResultsResponse.ResultEntry.builder()
                    .parameterId(parameter.getId())
                    .value(existing.getValue())
                    .build();
        }).toList();

        return SaveTestResultsResponse.builder()
                .bookingId(bookingId)
                .testId(testId)
                .enteredBy(user.getId())
                .createdAt(now)
                .savedResults(updated)
                .build();
    }

    @Transactional
    public void deleteResultsForTest(Long bookingId, Long testId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.PENDING);

        // Ensure the test belongs to this booking
        BookingTest bookingTest = bookingTestRepository.findByBookingIdAndTestId(bookingId, testId)
                .orElseThrow(() -> new RuntimeException("Test not found in BookingTest for this booking"));

        // Delete all results for this booking + test
        List<TestResult> results = testResultRepository.findByBookingAndTestId(booking, testId);
        testResultRepository.deleteAll(results);

        // Optionally reset interpretation to "NA"
        bookingTest.setInterpretation("NA");
        bookingTestRepository.save(bookingTest);
    }


}
