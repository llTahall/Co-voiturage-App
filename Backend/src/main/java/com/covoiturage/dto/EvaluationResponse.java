package com.covoiturage.dto;

import com.covoiturage.entity.Evaluation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class EvaluationResponse {

    private Long id;
    private Integer note;
    private String commentaire;
    private LocalDateTime dateEvaluation;
    private EmetteurInfo emetteur;

    @Data
    @Builder
    @AllArgsConstructor
    public static class EmetteurInfo {
        private String prenom;
        private String nom;
    }

    public static EvaluationResponse from(Evaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId())
                .note(e.getNote())
                .commentaire(e.getCommentaire())
                .dateEvaluation(e.getDateEvaluation())
                .emetteur(e.getEmetteur() != null ? EmetteurInfo.builder()
                        .prenom(e.getEmetteur().getPrenom())
                        .nom(e.getEmetteur().getNom())
                        .build() : null)
                .build();
    }
}
