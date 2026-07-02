package com.pathlab.controller;

import com.pathlab.dto.result.BookingResultsResponse;
import com.pathlab.dto.result.SaveTestResultsRequest;
import com.pathlab.dto.result.SaveTestResultsResponse;
import com.pathlab.repository.BookingRepository;
import com.pathlab.service.PdfService;
import com.pathlab.service.TestResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingResultsController {

    private final TestResultService testResultService;
    private final BookingRepository bookingRepository;
    private final PdfService pdfService;

    @PostMapping("/{bookingId}/tests/{testId}/results")
    public ResponseEntity<SaveTestResultsResponse> saveResultsForTest(
            @PathVariable Long bookingId,
            @PathVariable Long testId,
            @RequestBody SaveTestResultsRequest request
    ) {
        return ResponseEntity.ok(testResultService.saveResultsForTest(bookingId, testId, request));
    }

    @GetMapping("/{bookingId}/results")
    public ResponseEntity<BookingResultsResponse> getResultsByBooking(
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(testResultService.getResultsGroupedByTest(bookingId));
    }

    @PutMapping("/{bookingId}/tests/{testId}/results")
    public ResponseEntity<SaveTestResultsResponse> updateResultsForTest(
            @PathVariable Long bookingId,
            @PathVariable Long testId,
            @RequestBody SaveTestResultsRequest request
    ) {
        return ResponseEntity.ok(testResultService.updateResultsForTest(bookingId, testId, request));
    }

    @GetMapping("/{bookingId}/results/pdf")
    public ResponseEntity<byte[]> downloadResultsPdf(@PathVariable Long bookingId) {
        try {
            BookingResultsResponse bookingResults = testResultService.getResultsGroupedByTest(bookingId);

            Map<String, Object> model = new HashMap<>();
            model.put("booking", bookingResults);
            model.put("patient", bookingResults.getPatient());
            model.put("tests", bookingResults.getTests());
            model.put("generatedAt", new Date());

            // template name must match your `.ftl` file under /templates
            byte[] pdf = pdfService.generatePdf("report.ftl", model);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report_" + bookingId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for booking " + bookingId, e);
        }
    }

    @DeleteMapping("/{bookingId}/tests/{testId}/results")
    public ResponseEntity<Void> deleteResultsForTest(
            @PathVariable Long bookingId,
            @PathVariable Long testId
    ) {
        testResultService.deleteResultsForTest(bookingId, testId);
        return ResponseEntity.noContent().build();
    }


}

