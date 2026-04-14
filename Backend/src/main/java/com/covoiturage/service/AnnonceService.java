package com.covoiturage.service;

import com.covoiturage.dto.AnnonceRequest;
import com.covoiturage.dto.AnnonceResponse;
import com.covoiturage.entity.*;
import com.covoiturage.repository.AnnonceRepository;
import com.covoiturage.repository.ReservationRepository;
import com.covoiturage.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
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

    // Factory spatiale : SRID 4326 correspond aux normes GPS (WGS 84)
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public Annonce create(AnnonceRequest req) {
        User me = userService.getCurrentUser();
        if (!"CONDUCTEUR".equals(me.getRole())) {
            throw new RuntimeException("Not authorized: only drivers can create trips");
        }
        if (annonceRepository.existsByConducteurIdAndStatutIn(
                me.getId(), List.of(StatusAnnonce.PUBLIEE, StatusAnnonce.COMPLETE))) {
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

        return annonceRepository.save(annonce);
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

        reservationRepository.findByAnnonceId(id).stream()
                .filter(r -> r.getStatut() == StatusReservation.ACCEPTEE
                        || r.getStatut() == StatusReservation.EN_ATTENTE)
                .forEach(r -> {
                    r.setStatut(StatusReservation.ANNULEE_CONDUCTEUR);
                    reservationRepository.save(r);
                });
    }

    @Transactional(readOnly = true)
    public AnnonceResponse getById(Long id) {
        Annonce a = annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce not found: " + id));
        return AnnonceResponse.from(a);
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

        LocalDateTime depart = LocalDateTime.of(annonce.getDateDepart(), annonce.getHeureDepart());
        long demiDuree = annonce.getTrajet().getDureeEstimeeTotale() / 2;
        LocalDateTime seuilTerminaison = depart.plusMinutes(demiDuree);

        if (LocalDateTime.now().isBefore(seuilTerminaison)) {
            throw new RuntimeException("Trop tôt pour terminer ce trajet");
        }

        annonce.setStatut(StatusAnnonce.TERMINEE);
        annonceRepository.save(annonce);
    }

}
