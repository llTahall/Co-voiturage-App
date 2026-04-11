package com.covoiturage.controller;

import com.covoiturage.dto.ReservationRequest;
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
    public ResponseEntity<Reservation> create(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.create(request));
    }

    @GetMapping("/mes-reservations")
    public ResponseEntity<List<Reservation>> getMesReservations() {
        return ResponseEntity.ok(reservationService.getMesReservations());
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        reservationService.annuler(id);
        return ResponseEntity.noContent().build();
    }
}
