package com.covoiturage.service;

import com.covoiturage.dto.ReservationRequest;
import com.covoiturage.dto.ReservationResponse;
import com.covoiturage.entity.*;
import com.covoiturage.repository.AnnonceRepository;
import com.covoiturage.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AnnonceRepository annonceRepository;
    private final UserService userService;

    @Transactional
    public Reservation create(ReservationRequest req) {
        User me = userService.getCurrentUser();

        Annonce annonce = annonceRepository.findById(req.getAnnonceId())
                .orElseThrow(() -> new RuntimeException("Annonce not found"));

        // Empêcher le conducteur de réserver sa propre annonce
        if (annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Vous ne pouvez pas réserver votre propre annonce");
        }

        // Empêcher un conducteur de réserver tout court (logique métier)
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

        // On NE décrémente PAS les places ici !

        Reservation reservation = Reservation.builder()
                .passager(me)
                .annonce(annonce)
                .nombrePlaces(req.getNombrePlaces())
                .statut(StatusReservation.EN_ATTENTE) // <-- NOUVEAU STATUT
                .build();

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void accepter(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User me = userService.getCurrentUser();
        Annonce annonce = reservation.getAnnonce();

        // Sécurité : Seul le conducteur de l'annonce peut accepter
        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized - You are not the driver");
        }

        if (reservation.getStatut() != StatusReservation.EN_ATTENTE) {
            throw new RuntimeException("Reservation is not pending");
        }

        // On vérifie une deuxième fois au cas où une autre réservation a pris les
        // dernières places entre temps
        if (annonce.getPlacesDisponibles() < reservation.getNombrePlaces()) {
            throw new RuntimeException("No more seats available");
        }

        // C'EST ICI qu'on décrémente
        annonce.setPlacesDisponibles(annonce.getPlacesDisponibles() - reservation.getNombrePlaces());
        if (annonce.getPlacesDisponibles() == 0) {
            annonce.setStatut(StatusAnnonce.COMPLETE);
        }
        annonceRepository.save(annonce);

        reservation.setStatut(StatusReservation.ACCEPTEE);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void annuler(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User me = userService.getCurrentUser();
        if (!reservation.getPassager().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }

        // Si la résa avait déjà été acceptée, on doit rendre les places au conducteur
        if (reservation.getStatut() == StatusReservation.ACCEPTEE) {
            Annonce annonce = reservation.getAnnonce();
            annonce.setPlacesDisponibles(annonce.getPlacesDisponibles() + reservation.getNombrePlaces());
            if (annonce.getStatut() == StatusAnnonce.COMPLETE) {
                annonce.setStatut(StatusAnnonce.PUBLIEE);
            }
            annonceRepository.save(annonce);
        }

        reservation.setStatut(StatusReservation.ANNULEE_PASSAGER);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void refuser(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        User me = userService.getCurrentUser();
        Annonce annonce = reservation.getAnnonce();

        // Sécurité : Seul le conducteur de l'annonce peut refuser
        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized - You are not the driver");
        }

        if (reservation.getStatut() != StatusReservation.EN_ATTENTE) {
            throw new RuntimeException("Reservation is not pending");
        }

        // On change simplement le statut, on ne touche pas aux places de l'annonce
        reservation.setStatut(StatusReservation.REFUSEE_CONDUCTEUR);
        reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMesReservations() {
        User me = userService.getCurrentUser();
        // Assure-toi d'importer java.util.List
        return reservationRepository.findByPassagerId(me.getId())
                .stream().map(ReservationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMesPassagers() {
        User me = userService.getCurrentUser();
        return reservationRepository.findByAnnonceConducteurId(me.getId())
                .stream().map(ReservationResponse::from).toList();
    }

}
