package com.covoiturage.repository;

import com.covoiturage.entity.Annonce;
import com.covoiturage.entity.StatusAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findByConducteurId(Long conducteurId);

    @Query("""
        SELECT a FROM Annonce a
        WHERE a.statut = 'PUBLIEE'
          AND (:villeDepart IS NULL OR LOWER(a.trajet.villeDepart) LIKE LOWER(CONCAT('%', :villeDepart, '%')))
          AND (:villeArrivee IS NULL OR LOWER(a.trajet.villeArrivee) LIKE LOWER(CONCAT('%', :villeArrivee, '%')))
          AND (:date IS NULL OR a.dateDepart = :date)
          AND a.placesDisponibles >= :places
        """)
    List<Annonce> search(
            @Param("villeDepart") String villeDepart,
            @Param("villeArrivee") String villeArrivee,
            @Param("date") LocalDate date,
            @Param("places") int places
    );
}
