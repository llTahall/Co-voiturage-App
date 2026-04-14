package com.covoiturage.service;

import com.covoiturage.dto.EvaluationRequest;
import com.covoiturage.entity.Evaluation;
import com.covoiturage.entity.Reservation;
import com.covoiturage.entity.StatusAnnonce;
import com.covoiturage.entity.StatusReservation;
import com.covoiturage.entity.User;
import com.covoiturage.repository.EvaluationRepository;
import com.covoiturage.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ReservationRepository reservationRepository;
    private final UserService userService;

    @Transactional
    public Evaluation create(EvaluationRequest req) {
        User me = userService.getCurrentUser();

        if (evaluationRepository.existsByEmetteurIdAndReservationId(me.getId(), req.getReservationId())) {
            throw new RuntimeException("Already evaluated this reservation");
        }

        Reservation reservation = reservationRepository.findById(req.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
                // Juste après avoir fait : Reservation reservation = reservationRepository.findById(req.getReservationId())...

// RÈGLE 1 : La réservation devait être formellement acceptée par le conducteur
if (reservation.getStatut() != StatusReservation.ACCEPTEE) {
    throw new RuntimeException("Impossible d'évaluer : la réservation n'a jamais été validée.");
}

// RÈGLE 2 : L'annonce (le trajet) doit s'être terminée ! (C'est là qu'intervient le Job qu'on a créé)
if (reservation.getAnnonce().getStatut() != StatusAnnonce.TERMINEE) {
    throw new RuntimeException("Impossible d'évaluer : le trajet n'est pas encore terminé.");
}

// Sécurité supplémentaire : S'assurer que le créateur est bien impliqué dans le trajet
if (!reservation.getPassager().getId().equals(me.getId()) && 
    !reservation.getAnnonce().getConducteur().getId().equals(me.getId())) {
    throw new RuntimeException("Non autorisé : vous ne faites pas partie de ce trajet.");
}


        User destinataire = userService.getById(req.getDestinataireId());

        Evaluation evaluation = Evaluation.builder()
                .emetteur(me)
                .destinataire(destinataire)
                .reservation(reservation)
                .note(req.getNote())
                .commentaire(req.getCommentaire())
                .build();

        return evaluationRepository.save(evaluation);
    }

    public List<Evaluation> getEvaluationsForUser(Long userId) {
        return evaluationRepository.findByDestinataireId(userId);
    }
}
