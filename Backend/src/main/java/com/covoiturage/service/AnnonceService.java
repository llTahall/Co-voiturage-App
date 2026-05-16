package com.covoiturage.service;

import com.covoiturage.dto.AnnonceRequest;
import com.covoiturage.dto.AnnonceResponse;
import com.covoiturage.entity.*;
import com.covoiturage.repository.AnnonceRepository;
import com.covoiturage.repository.ReservationRepository;
import com.covoiturage.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ReservationRepository reservationRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    // Factory spatiale : SRID 4326 correspond aux normes GPS (WGS 84)
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public Annonce create(AnnonceRequest req) {
        User me = userService.getCurrentUser();
        if (!"CONDUCTEUR".equals(me.getRole())) {
            throw new RuntimeException("Not authorized: only drivers can create trips");
        }
        if (annonceRepository.existsByConducteurIdAndStatutIn(
                me.getId(), List.of(StatusAnnonce.PUBLIEE, StatusAnnonce.COMPLETE, StatusAnnonce.EN_COURS))) {
            throw new RuntimeException(
                    "Vous avez déjà une annonce active. Elle doit être terminée avant d'en créer une nouvelle.");
        }

        Vehicule vehicule = vehiculeRepository.findById(req.getVehiculeId())
                .orElseThrow(() -> new RuntimeException("Vehicule not found"));

        // 1. Initialiser le trajet sans les étapes
        Trajet trajet = Trajet.builder()
                .distanceTotale(req.getDistanceTotale())
                .dureeEstimeeTotale(req.getDureeEstimeeTotale())
                .build();

        // 2. Traitement géométrique des étapes
        List<Etape> etapesEntities = new ArrayList<>();
        int ordre = 1;

        if (req.getEtapes() != null) {
            for (AnnonceRequest.EtapeDTO eDto : req.getEtapes()) {
                // Création du Point spatial (Attention: X = Longitude, Y = Latitude)
                Point pt = geometryFactory.createPoint(new Coordinate(eDto.getLongitude(), eDto.getLatitude()));

                Etape etape = Etape.builder()
                        .ordre(ordre++)
                        .ville(eDto.getVille())
                        .adresse(eDto.getAdresse())
                        .coordonnees(pt)
                        .trajet(trajet) // Liaison bidirectionnelle
                        .build();
                etapesEntities.add(etape);
            }
        }
        trajet.setEtapes(etapesEntities);

        // 3. Liaison Finale
        Annonce annonce = Annonce.builder()
                .dateDepart(req.getDateDepart())
                .heureDepart(req.getHeureDepart())
                .placesTotal(req.getPlacesTotal())
                .placesDisponibles(req.getPlacesTotal())
                .prixParPlace(req.getPrixParPlace())
                .statut(StatusAnnonce.PUBLIEE)
                .conducteur(me)
                .trajet(trajet)
                .vehicule(vehicule)
                .build();

        Annonce saved = annonceRepository.save(annonce);

        final Long annonceId = saved.getId();
        final String nomConducteur = me.getPrenom() + " " + me.getNom();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.broadcast("NOUVELLE_ANNONCE", nomConducteur + " propose un trajet", annonceId);
            }
        });

        return saved;
    }

    @Transactional(readOnly = true)
    public List<AnnonceResponse> search(String villeDepart, String villeArrivee, LocalDate date, int places) {
        return annonceRepository.search(villeDepart, villeArrivee, date, places)
                .stream().distinct().map(AnnonceResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AnnonceResponse> getMesAnnonces() {
        User me = userService.getCurrentUser();
        return annonceRepository.findByConducteurId(me.getId())
                .stream()
                .distinct()
                .map(AnnonceResponse::from)
                .toList();
    }

    @Transactional
    public void annuler(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce not found"));
        User me = userService.getCurrentUser();
        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }
        annonce.setStatut(StatusAnnonce.ANNULEE);
        annonceRepository.save(annonce);

        final Long annonceId = id;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.broadcast("ANNONCE_ANNULEE", "Un trajet a été annulé", annonceId);
            }
        });

        List<Reservation> affected = reservationRepository.findByAnnonceId(id).stream()
                .filter(r -> r.getStatut() == StatusReservation.ACCEPTEE
                        || r.getStatut() == StatusReservation.EN_ATTENTE)
                .toList();

        affected.forEach(r -> {
            r.setStatut(StatusReservation.ANNULEE_CONDUCTEUR);
            reservationRepository.save(r);
        });

        List<String> passagerEmails = affected.stream()
                .map(r -> r.getPassager().getEmail())
                .distinct().toList();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                passagerEmails.forEach(email ->
                    notificationService.notifier(email, "RESERVATION_ANNULEE_CONDUCTEUR",
                            "Le conducteur a annulé le trajet", id));
            }
        });
    }

    @Transactional(readOnly = true)
    public AnnonceResponse getById(Long id) {
        Annonce a = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce not found: " + id));
        return AnnonceResponse.from(a);
    }

    @Transactional
    public void demarrer(Long id) {
        User me = userService.getCurrentUser();
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce not found: " + id));
        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }
        if (annonce.getStatut() != StatusAnnonce.PUBLIEE && annonce.getStatut() != StatusAnnonce.COMPLETE) {
            throw new RuntimeException("L'annonce doit être active pour démarrer le trajet");
        }
        annonce.setStatut(StatusAnnonce.EN_COURS);
        annonceRepository.save(annonce);

        final Long annonceId = id;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.broadcast("TRAJET_DEMARRE", "Un trajet a démarré", annonceId);
            }
        });
    }

    @Transactional
    public void terminerManuellement(Long id) {
        User me = userService.getCurrentUser();
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce not found: " + id));

        if (!annonce.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }

        if (annonce.getStatut() == StatusAnnonce.TERMINEE || annonce.getStatut() == StatusAnnonce.ANNULEE) {
            throw new RuntimeException("Annonce déjà terminée ou annulée");
        }

        // Si le trajet est EN_COURS (démarré), on peut terminer immédiatement
        // Sinon, on applique la contrainte de temps (demi-durée écoulée)
        if (annonce.getStatut() != StatusAnnonce.EN_COURS) {
            LocalDateTime depart = LocalDateTime.of(annonce.getDateDepart(), annonce.getHeureDepart());
            long demiDuree = annonce.getTrajet().getDureeEstimeeTotale() / 2;
            LocalDateTime seuilTerminaison = depart.plusMinutes(demiDuree);
            if (LocalDateTime.now().isBefore(seuilTerminaison)) {
                throw new RuntimeException("Trop tôt pour terminer ce trajet");
            }
        }

        annonce.setStatut(StatusAnnonce.TERMINEE);
        annonceRepository.save(annonce);

        final Long annonceId = id;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                notificationService.broadcast("TRAJET_TERMINE", "Un trajet est terminé", annonceId);
            }
        });
    }

}
