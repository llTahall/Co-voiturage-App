package com.covoiturage.controller;

import com.covoiturage.dto.AnnonceRequest;
import com.covoiturage.dto.AnnonceResponse;
import com.covoiturage.service.AnnonceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService annonceService;

    @PostMapping
    public ResponseEntity<Long> create(@Valid @RequestBody AnnonceRequest request) {
        return ResponseEntity.ok(annonceService.create(request).getId());
    }

    @GetMapping("/search")
    public ResponseEntity<List<AnnonceResponse>> search(
            @RequestParam(required = false) String villeDepart,
            @RequestParam(required = false) String villeArrivee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") int places) {
        return ResponseEntity.ok(annonceService.search(villeDepart, villeArrivee, date, places));
    }

    @GetMapping("/mes-annonces")
    public ResponseEntity<List<AnnonceResponse>> getMesAnnonces() {
        return ResponseEntity.ok(annonceService.getMesAnnonces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnonceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.getById(id));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        annonceService.annuler(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/terminer")
    public ResponseEntity<Void> terminer(@PathVariable Long id) {
        annonceService.terminerManuellement(id);
        return ResponseEntity.noContent().build();
    }

}
