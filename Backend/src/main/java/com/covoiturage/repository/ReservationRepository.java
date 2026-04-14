package com.covoiturage.repository;

import com.covoiturage.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT DISTINCT r FROM Reservation r WHERE r.passager.id = :passagerId")
    List<Reservation> findByPassagerId(@Param("passagerId") Long passagerId);

    @Query("SELECT DISTINCT r FROM Reservation r WHERE r.annonce.id = :annonceId")
    List<Reservation> findByAnnonceId(@Param("annonceId") Long annonceId);

    boolean existsByPassagerIdAndAnnonceId(Long passagerId, Long annonceId);

    @Query("SELECT DISTINCT r FROM Reservation r WHERE r.annonce.conducteur.id = :conducteurId")
    List<Reservation> findByAnnonceConducteurId(@Param("conducteurId") Long conducteurId);
}
