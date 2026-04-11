package com.covoiturage.service;

import com.covoiturage.dto.AnnonceRequest;
import com.covoiturage.entity.*;
import com.covoiturage.repository.AnnonceRepository;
import com.covoiturage.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final VehiculeRepository vehiculeRepository;
    private final UserService userService;

    @Transactional
    public Annonce create(AnnonceRequest req) {
        User me = userService.getCurrentUser();

        Vehicule vehicule = vehiculeRepository.findById(req.getVehiculeId())
                .orElseThrow(() -> new RuntimeException("Vehicule not found"));

        Trajet trajet = Trajet.builder()
                .villeDepart(req.getVilleDepart())
                .adresseDepart(req.getAdresseDepart())
                .latitudeDepart(req.getLatitudeDepart())
                .longitudeDepart(req.getLongitudeDepart())
                .villeArrivee(req.getVilleArrivee())
                .adresseArrivee(req.getAdresseArrivee())
                .latitudeArrivee(req.getLatitudeArrivee())
                .longitudeArrivee(req.getLongitudeArrivee())
                .dureeEstimee(req.getDureeEstimee())
                .build();

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

    public List<Annonce> search(String villeDepart, String villeArrivee, LocalDate date, int places) {
        return annonceRepository.search(villeDepart, villeArrivee, date, places);
    }

    public List<Annonce> getMesAnnonces() {
        User me = userService.getCurrentUser();
        return annonceRepository.findByConducteurId(me.getId());
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
    }

    public Annonce getById(Long id) {
        return annonceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Annonce not found: " + id));
    }
}
