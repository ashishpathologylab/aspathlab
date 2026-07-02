package com.pathlab.service;

import com.pathlab.dto.payment.CreatePaymentRequest;
import com.pathlab.dto.payment.UpdatePaymentRequest;
import com.pathlab.entity.Booking;
import com.pathlab.entity.Patient;
import com.pathlab.entity.Payment;
import com.pathlab.repository.BookingRepository;
import com.pathlab.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public Payment createPayment(CreatePaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Bookikng not found withid: " + request.getBookingId()));

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .status(request.getPaymentStatus())
                .paidAt(LocalDateTime.now())
                .build();
        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    @Transactional
    public Payment updatePayment(Long id, UpdatePaymentRequest request) {
        Payment existingPayment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        existingPayment.setAmount(request.getAmount());
        existingPayment.setStatus(request.getPaymentStatus());
        existingPayment.setPaidAt(LocalDateTime.now());
        return paymentRepository.save(existingPayment);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Booking booking = payment.getBooking();
        if (booking != null) {
            booking.setPayment(null); // detach the relationship
        }

        paymentRepository.delete(payment);
    }

    @Transactional
    public Map<String, Object> getInvoiceData(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        Booking booking = payment.getBooking();
        Patient patient = booking.getPatient();

        Map<String, Object> model = new HashMap<>();
        model.put("payment", payment);
        model.put("booking", booking);
        model.put("patient", patient);
        model.put("generatedAt", new Date());

        return model;
    }

}
