package com.covoiturage.service;

import com.covoiturage.dto.ReservationRequest;
import com.covoiturage.dto.ReservationResponse;
import com.covoiturage.entity.*;
import com.covoiturage.repository.AnnonceRepository;
import com.covoiturage.repository.EvaluationRepository;
import com.covoiturage.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AnnonceRepository annonceRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public Reservation create(ReservationRequest req) {
        User me = userService.getCurrentUser();

        Annonce annonce = annonceRepository.findById(req.getAnnonceId())
                .orElseThrow(() -> new RuntimeException("Annonce not found"));

        if (annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Vous ne pouvez pas réserver votre propre annonce");
        }
        if ("CONDUCTEUR".equals(me.getRole())) {
            throw new RuntimeException("Les conducteurs ne peuvent pas réserver de trajets");
        }
        if (annonce.getStatut() != StatusAnnonce.PUBLIEE) {
            throw new RuntimeException("Annonce is not available");
        }
        if (annonce.getPlacesDisponibles() < req.getNombrePlaces()) {
            throw new RuntimeException("Not enough seats available right now");
        }
        if (reservationRepository.existsByPassagerIdAndAnnonceId(me.getId(), annonce.getId())) {
            throw new RuntimeException("Already requested or reserved");
        }

        Reservation reservation = Reservation.builder()
                .passager(me)
                .annonce(annonce)
                .nombrePlaces(req.getNombrePlaces())
                .statut(StatusReservation.EN_ATTENTE)
                .build();

        reservation = reservationRepository.save(reservation);

        final String conducteurEmail = annonce.getConducteur().getEmail();
        final Long resaId = reservation.getId();
        final String nomPassager = me.getPrenom() + " " + me.getNom();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.notifier(conducteurEmail, "NOUVELLE_RESERVATION", nomPassager + " demande une réservation", resaId);
            }
        });

        return reservation;
    }

    @Transactional
    public void accepter(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User me = userService.getCurrentUser();
        Annonce annonce = reservation.getAnnonce();

        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized - You are not the driver");
        }
        if (reservation.getStatut() != StatusReservation.EN_ATTENTE) {
            throw new RuntimeException("Reservation is not pending");
        }
        if (annonce.getPlacesDisponibles() < reservation.getNombrePlaces()) {
            throw new RuntimeException("No more seats available");
        }

        annonce.setPlacesDisponibles(annonce.getPlacesDisponibles() - reservation.getNombrePlaces());
        if (annonce.getPlacesDisponibles() == 0) {
            annonce.setStatut(StatusAnnonce.COMPLETE);
        }
        annonceRepository.save(annonce);

        reservation.setStatut(StatusReservation.ACCEPTEE);
        reservationRepository.save(reservation);

        final String passagerEmailA = reservation.getPassager().getEmail();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.notifier(passagerEmailA, "RESERVATION_ACCEPTEE", "Votre réservation a été acceptée", reservationId);
            }
        });
    }

    @Transactional
    public void annuler(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User me = userService.getCurrentUser();
        if (!reservation.getPassager().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }

        boolean wasAcceptee = reservation.getStatut() == StatusReservation.ACCEPTEE;
        if (wasAcceptee) {
            Annonce annonce = reservation.getAnnonce();
            annonce.setPlacesDisponibles(annonce.getPlacesDisponibles() + reservation.getNombrePlaces());
            if (annonce.getStatut() == StatusAnnonce.COMPLETE) {
                annonce.setStatut(StatusAnnonce.PUBLIEE);
            }
            annonceRepository.save(annonce);
        }

        reservation.setStatut(StatusReservation.ANNULEE_PASSAGER);
        reservationRepository.save(reservation);

        final String conducteurEmail = reservation.getAnnonce().getConducteur().getEmail();
        final String nomPassager = me.getPrenom() + " " + me.getNom();
        final Long annonceId = reservation.getAnnonce().getId();
        final boolean placesFreed = wasAcceptee;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.notifier(conducteurEmail, "RESERVATION_ANNULEE_PASSAGER",
                        nomPassager + " a annulé sa réservation", id);
                if (placesFreed) {
                    notificationService.broadcast("ANNONCE_MISE_A_JOUR", "Des places sont à nouveau disponibles", annonceId);
                }
            }
        });
    }

    @Transactional
    public void refuser(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User me = userService.getCurrentUser();
        Annonce annonce = reservation.getAnnonce();

        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized - You are not the driver");
        }
        if (reservation.getStatut() != StatusReservation.EN_ATTENTE) {
            throw new RuntimeException("Reservation is not pending");
        }

        reservation.setStatut(StatusReservation.REFUSEE_CONDUCTEUR);
        reservationRepository.save(reservation);

        final String passagerEmailR = reservation.getPassager().getEmail();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.notifier(passagerEmailR, "RESERVATION_REFUSEE", "Votre réservation a été refusée", reservationId);
            }
        });
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMesReservations() {
        User me = userService.getCurrentUser();
        return reservationRepository.findByPassagerId(me.getId()).stream().map(r -> {
            ReservationResponse res = ReservationResponse.from(r);
            res.setHasEvaluated(evaluationRepository.existsByEmetteurIdAndReservationId(me.getId(), r.getId()));
            return res;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMesPassagers() {
        User me = userService.getCurrentUser();
        return reservationRepository.findByAnnonceConducteurId(me.getId()).stream().map(r -> {
            ReservationResponse res = ReservationResponse.from(r);
            res.setHasEvaluated(evaluationRepository.existsByEmetteurIdAndReservationId(me.getId(), r.getId()));
            return res;
        }).toList();
    }
}
