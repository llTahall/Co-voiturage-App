package com.covoiturage.controller;

import com.covoiturage.dto.ReservationRequest;
import com.covoiturage.dto.ReservationResponse;
import com.covoiturage.entity.Reservation;
import com.covoiturage.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<Long> create(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.create(request).getId());
    }

    @GetMapping("/mes-reservations")
    public ResponseEntity<List<ReservationResponse>> getMesReservations() {
        return ResponseEntity.ok(reservationService.getMesReservations());
    }

    @GetMapping("/mes-passagers")
    public ResponseEntity<List<ReservationResponse>> getMesPassagers() {
        return ResponseEntity.ok(reservationService.getMesPassagers());
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        reservationService.annuler(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/accepter")
    public ResponseEntity<Void> accepter(@PathVariable Long id) {
        reservationService.accepter(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/refuser")
    public ResponseEntity<Void> refuser(@PathVariable Long id) {
        reservationService.refuser(id);
        return ResponseEntity.noContent().build();
    }
}
