package com.covoiturage.controller;

import com.covoiturage.dto.EvaluationRequest;
import com.covoiturage.entity.Evaluation;
import com.covoiturage.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<Evaluation> create(@Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.ok(evaluationService.create(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Evaluation>> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(evaluationService.getEvaluationsForUser(userId));
    }
}
