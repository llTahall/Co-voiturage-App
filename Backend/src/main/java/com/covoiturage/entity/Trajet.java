package com.covoiturage.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trajets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double distanceTotale;
    
    private Integer dureeEstimeeTotale;

    @OneToMany(mappedBy = "trajet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Etape> etapes = new ArrayList<>();
}
