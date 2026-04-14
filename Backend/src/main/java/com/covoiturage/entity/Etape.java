package com.covoiturage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "etapes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Etape {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer ordre;

    private String ville;

    private String adresse;

    @Column(columnDefinition = "POINT")
    private Point coordonnees;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trajet_id")
    private Trajet trajet;
}
