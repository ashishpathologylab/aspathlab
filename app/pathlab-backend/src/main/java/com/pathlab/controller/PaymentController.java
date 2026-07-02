package com.pathlab.controller;

import com.pathlab.dto.payment.CreatePaymentRequest;
import com.pathlab.dto.payment.PaymentResponse;
import com.pathlab.dto.payment.UpdatePaymentRequest;
import com.pathlab.entity.Payment;
import com.pathlab.mapper.PaymentMapper;
import com.pathlab.service.PaymentService;
import com.pathlab.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PdfService pdfService;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> list() {
        return ResponseEntity.ok(
                paymentService.getAllPayments()
                        .stream()
                        .map(PaymentMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> get(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(payment -> ResponseEntity.ok(PaymentMapper.toDto(payment)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> create(@Valid @RequestBody CreatePaymentRequest request) {
        Payment saved = paymentService.createPayment(request);
        return ResponseEntity.created(URI.create("/api/payments/" + saved.getId()))
                .body(PaymentMapper.toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody UpdatePaymentRequest request) {
        try {
            Payment updated = paymentService.updatePayment(id, request);
            return ResponseEntity.ok(PaymentMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECH')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/invoice/pdf")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        try {
            Map<String, Object> model = paymentService.getInvoiceData(id);
            byte[] pdf = pdfService.generatePdf("invoice.ftl", model);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice for payment " + id, e);
        }
    }
}
