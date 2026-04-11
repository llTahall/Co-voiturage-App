package com.covoiturage.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvaluationRequest {
    @NotNull private Long reservationId;
    @NotNull private Long destinataireId;
    @Min(1) @Max(5) private Integer note;
    private String commentaire;
}
