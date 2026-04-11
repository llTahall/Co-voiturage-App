package com.covoiturage.service;

import com.covoiturage.entity.User;
import com.covoiturage.entity.Vehicule;
import com.covoiturage.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final UserService userService;

    public List<Vehicule> getMesVehicules() {
        User me = userService.getCurrentUser();
        return vehiculeRepository.findByConducteurId(me.getId());
    }

    public Vehicule create(Vehicule vehicule) {
        User me = userService.getCurrentUser();
        vehicule.setConducteur(me);
        return vehiculeRepository.save(vehicule);
    }

    public void delete(Long id) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicule not found: " + id));
        User me = userService.getCurrentUser();
        if (!vehicule.getConducteur().getId().equals(me.getId())) {
            throw new RuntimeException("Not authorized");
        }
        vehiculeRepository.delete(vehicule);
    }
}
