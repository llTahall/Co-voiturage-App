package com.covoiturage.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class AnnonceRequest {
    @NotNull
    private LocalDate dateDepart;
    @NotNull
    private LocalTime heureDepart;
    @Positive
    private Integer placesTotal;
    @Positive
    private Double prixParPlace;
    @NotNull
    private Long vehiculeId;

    // Remplacement du Trajet simple par des métriques globales et une liste
    // d'étapes
    @Positive
    private Double distanceTotale;
    @Positive
    private Integer dureeEstimeeTotale;

    @NotNull
    private List<EtapeDTO> etapes;

    @Data
    public static class EtapeDTO {
        private String ville;
        private String adresse;
        private Double latitude;
        private Double longitude;
    }
}
