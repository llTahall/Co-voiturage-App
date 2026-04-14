package com.covoiturage.repository;

import com.covoiturage.entity.Annonce;
import com.covoiturage.entity.StatusAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

  @Query("SELECT DISTINCT a FROM Annonce a WHERE a.conducteur.id = :conducteurId")
  List<Annonce> findByConducteurId(@Param("conducteurId") Long conducteurId);

  @Query("""
      SELECT DISTINCT a FROM Annonce a
      LEFT JOIN a.trajet.etapes e1
      LEFT JOIN a.trajet.etapes e2
      WHERE a.statut = 'PUBLIEE'
        AND a.placesDisponibles >= :places
        AND (:date IS NULL OR a.dateDepart = :date)
        AND (:villeDepart IS NULL OR LOWER(e1.ville) LIKE LOWER(CONCAT('%', :villeDepart, '%')))
        AND (:villeArrivee IS NULL OR LOWER(e2.ville) LIKE LOWER(CONCAT('%', :villeArrivee, '%')))
        AND (
            (:villeDepart IS NULL OR :villeArrivee IS NULL)
            OR (e1.ordre < e2.ordre)
        )
      """)
  List<Annonce> search(
      @Param("villeDepart") String villeDepart,
      @Param("villeArrivee") String villeArrivee,
      @Param("date") LocalDate date,
      @Param("places") int places);

  @Modifying
  @Query(value = """
      UPDATE annonces a
      JOIN trajets t ON a.trajet_id = t.id
      SET a.statut = 'TERMINEE'
      WHERE a.statut IN ('PUBLIEE', 'COMPLETE')
      AND ADDDATE(TIMESTAMP(a.date_depart, a.heure_depart), INTERVAL t.duree_estimee_totale MINUTE) < NOW()
      """, nativeQuery = true)
  int updateAnnoncesToTermineeSiExpirees();

  boolean existsByConducteurIdAndStatutIn(Long conducteurId, List<StatusAnnonce> statuts);

}
