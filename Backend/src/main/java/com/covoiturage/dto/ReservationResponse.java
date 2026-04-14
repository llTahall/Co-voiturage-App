package com.covoiturage.dto;

import com.covoiturage.entity.Etape;
import com.covoiturage.entity.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;

@Data
@Builder
@AllArgsConstructor
public class ReservationResponse {

    private Long id;
    private Integer nombrePlaces;
    private String statut;
    private AnnonceInfo annonce;

    @Data
    @Builder
    @AllArgsConstructor
    public static class AnnonceInfo {
        private Long id;
        private LocalDate dateDepart;
        private LocalTime heureDepart;
        private Double prixParPlace;
        private TrajetInfo trajet;
        private ConducteurInfo conducteur;

    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class ConducteurInfo {
        private String prenom;
        private String nom;
        private String telephone;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class TrajetInfo {
        private String villeDepart;
        private String villeArrivee;
        private Double distanceTotale;
        private Integer dureeEstimeeTotale;
    }

    public static ReservationResponse from(Reservation r) {
        AnnonceInfo annonceInfo = null;
        if (r.getAnnonce() != null) {
            var a = r.getAnnonce();
            TrajetInfo trajetInfo = null;

            if (a.getTrajet() != null) {
                String depart = null;
                String arrivee = null;

                // On récupère dynamiquement la première et la dernière étape
                if (a.getTrajet().getEtapes() != null && !a.getTrajet().getEtapes().isEmpty()) {
                    depart = a.getTrajet().getEtapes().stream()
                            .min(Comparator.comparingInt(Etape::getOrdre))
                            .map(Etape::getVille).orElse(null);

                    arrivee = a.getTrajet().getEtapes().stream()
                            .max(Comparator.comparingInt(Etape::getOrdre))
                            .map(Etape::getVille).orElse(null);
                }

                trajetInfo = TrajetInfo.builder()
                        .villeDepart(depart)
                        .villeArrivee(arrivee)
                        .distanceTotale(a.getTrajet().getDistanceTotale())
                        .dureeEstimeeTotale(a.getTrajet().getDureeEstimeeTotale())
                        .build();
            }

            annonceInfo = AnnonceInfo.builder()
                    .id(a.getId())
                    .dateDepart(a.getDateDepart())
                    .heureDepart(a.getHeureDepart())
                    .prixParPlace(a.getPrixParPlace())
                    .trajet(trajetInfo)
                    .conducteur(a.getConducteur() != null ? ConducteurInfo.builder()
                            .prenom(a.getConducteur().getPrenom())
                            .nom(a.getConducteur().getNom())
                            .telephone(a.getConducteur().getTelephone())
                            .build() : null)
                    .build();

        }

        return ReservationResponse.builder()
                .id(r.getId())
                .nombrePlaces(r.getNombrePlaces())
                .statut(r.getStatut() != null ? r.getStatut().name() : null)
                .annonce(annonceInfo)
                .build();
    }
}
