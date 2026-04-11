package com.covoiturage.controller;

import com.covoiturage.dto.AnnonceRequest;
import com.covoiturage.entity.Annonce;
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
    public ResponseEntity<Annonce> create(@Valid @RequestBody AnnonceRequest request) {
        return ResponseEntity.ok(annonceService.create(request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Annonce>> search(
            @RequestParam(required = false) String villeDepart,
            @RequestParam(required = false) String villeArrivee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") int places) {
        return ResponseEntity.ok(annonceService.search(villeDepart, villeArrivee, date, places));
    }

    @GetMapping("/mes-annonces")
    public ResponseEntity<List<Annonce>> getMesAnnonces() {
        return ResponseEntity.ok(annonceService.getMesAnnonces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Annonce> getById(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.getById(id));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        annonceService.annuler(id);
        return ResponseEntity.noContent().build();
    }
}
