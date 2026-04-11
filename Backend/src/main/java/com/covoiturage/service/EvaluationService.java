package com.covoiturage.service;

import com.covoiturage.dto.EvaluationRequest;
import com.covoiturage.entity.Evaluation;
import com.covoiturage.entity.Reservation;
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
