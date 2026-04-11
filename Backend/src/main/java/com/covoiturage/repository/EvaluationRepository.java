package com.covoiturage.repository;

import com.covoiturage.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByDestinataireId(Long destinataireId);
    boolean existsByEmetteurIdAndReservationId(Long emetteurId, Long reservationId);
}
