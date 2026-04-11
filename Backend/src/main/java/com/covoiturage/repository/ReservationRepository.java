package com.covoiturage.repository;

import com.covoiturage.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByPassagerId(Long passagerId);
    List<Reservation> findByAnnonceId(Long annonceId);
    boolean existsByPassagerIdAndAnnonceId(Long passagerId, Long annonceId);
}
