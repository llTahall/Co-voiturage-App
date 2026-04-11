package com.covoiturage.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trajets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String villeDepart;
    private String adresseDepart;
    private Double latitudeDepart;
    private Double longitudeDepart;

    private String villeArrivee;
    private String adresseArrivee;
    private Double latitudeArrivee;
    private Double longitudeArrivee;

    private Integer dureeEstimee;
}
