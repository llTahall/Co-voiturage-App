package com.covoiturage.service;

import com.covoiturage.dto.ReservationRequest;
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

        if (annonce.getStatut() != StatusAnnonce.PUBLIEE) {
            throw new RuntimeException("Annonce is not available");
        }
        if (annonce.getPlacesDisponibles() < req.getNombrePlaces()) {
            throw new RuntimeException("Not enough seats available");
        }
        if (reservationRepository.existsByPassagerIdAndAnnonceId(me.getId(), annonce.getId())) {
            throw new RuntimeException("Already reserved");
        }

        // Decrement places
        annonce.setPlacesDisponibles(annonce.getPlacesDisponibles() - req.getNombrePlaces());
        if (annonce.getPlacesDisponibles() == 0) {
            annonce.setStatut(StatusAnnonce.COMPLETE);
        }
        annonceRepository.save(annonce);

        Reservation reservation = Reservation.builder()
                .passager(me)
                .annonce(annonce)
                .nombrePlaces(req.getNombrePlaces())
                .statut(StatusReservation.CONFIRMEE)
                .build();

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getMesReservations() {
        User me = userService.getCurrentUser();
        return reservationRepository.findByPassagerId(me.getId());
    }

    @Transactional
    public void annuler(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        User me = userService.getCurrentUser();
        if (!reservation.getPassager().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }

        // Restore places
        Annonce annonce = reservation.getAnnonce();
        annonce.setPlacesDisponibles(annonce.getPlacesDisponibles() + reservation.getNombrePlaces());
        if (annonce.getStatut() == StatusAnnonce.COMPLETE) {
            annonce.setStatut(StatusAnnonce.PUBLIEE);
        }
        annonceRepository.save(annonce);

        reservation.setStatut(StatusReservation.ANNULEE_PASSAGER);
        reservationRepository.save(reservation);
    }
}
