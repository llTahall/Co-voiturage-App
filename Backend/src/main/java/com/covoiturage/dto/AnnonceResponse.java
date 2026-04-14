package com.covoiturage.dto;

import com.covoiturage.entity.Annonce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
public class AnnonceResponse {
    private Long id;
    private LocalDate dateDepart;
    private LocalTime heureDepart;
    private Integer placesTotal;
    private Integer placesDisponibles;
    private Double prixParPlace;
    private String statut;

    private TrajetInfo trajet;
    private ConducteurInfo conducteur;
    private VehiculeInfo vehicule;

    @Data
    @Builder
    @AllArgsConstructor
    public static class TrajetInfo {
        private Double distanceTotale;
        private Integer dureeEstimeeTotale;
        private List<EtapeInfo> etapes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class EtapeInfo {
        private Integer ordre;
        private String ville;
        private String adresse;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class ConducteurInfo {
        private Long id;
        private String nom;
        private String prenom;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class VehiculeInfo {
        private Long id;
        private String marque;
        private String modele;
        private String couleur;
    }

    public static AnnonceResponse from(Annonce a) {
        AnnonceResponseBuilder b = AnnonceResponse.builder()
                .id(a.getId())
                .dateDepart(a.getDateDepart())
                .heureDepart(a.getHeureDepart())
                .placesTotal(a.getPlacesTotal())
                .placesDisponibles(a.getPlacesDisponibles())
                .prixParPlace(a.getPrixParPlace())
                .statut(a.getStatut() != null ? a.getStatut().name() : null);

        if (a.getTrajet() != null) {
            List<EtapeInfo> etapesResponse = null;
            if (a.getTrajet().getEtapes() != null) {
                // On reconvertit le Point Géométrique en lat/lon pour le front
                etapesResponse = a.getTrajet().getEtapes().stream().map(e -> EtapeInfo.builder()
                        .ordre(e.getOrdre())
                        .ville(e.getVille())
                        .adresse(e.getAdresse())
                        .latitude(e.getCoordonnees() != null ? e.getCoordonnees().getY() : null)
                        .longitude(e.getCoordonnees() != null ? e.getCoordonnees().getX() : null)
                        .build()).collect(Collectors.toList());
            }

            b.trajet(TrajetInfo.builder()
                    .distanceTotale(a.getTrajet().getDistanceTotale())
                    .dureeEstimeeTotale(a.getTrajet().getDureeEstimeeTotale())
                    .etapes(etapesResponse)
                    .build());
        }

        if (a.getConducteur() != null) {
            b.conducteur(ConducteurInfo.builder()
                    .id(a.getConducteur().getId())
                    .nom(a.getConducteur().getNom())
                    .prenom(a.getConducteur().getPrenom())
                    .build());
        }

        if (a.getVehicule() != null) {
            b.vehicule(VehiculeInfo.builder()
                    .id(a.getVehicule().getId())
                    .marque(a.getVehicule().getMarque())
                    .modele(a.getVehicule().getModele())
                    .couleur(a.getVehicule().getCouleur())
                    .build());
        }

        return b.build();
    }
}
