package com.covoiturage.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AnnonceRequest {
    @NotNull private LocalDate dateDepart;
    @NotNull private LocalTime heureDepart;
    @Positive private Integer placesTotal;
    @Positive private Double prixParPlace;
    @NotNull private Long vehiculeId;

    // Trajet fields
    @NotNull private String villeDepart;
    private String adresseDepart;
    private Double latitudeDepart;
    private Double longitudeDepart;

    @NotNull private String villeArrivee;
    private String adresseArrivee;
    private Double latitudeArrivee;
    private Double longitudeArrivee;

    private Integer dureeEstimee;
}
