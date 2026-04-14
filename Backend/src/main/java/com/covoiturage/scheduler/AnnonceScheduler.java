package com.covoiturage.scheduler;

import com.covoiturage.repository.AnnonceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@RequiredArgsConstructor
public class AnnonceScheduler {

    private final AnnonceRepository annonceRepository;

    /*
     * S'exécute toutes les heures (3 600 000 ms).
     * cron = "0 0 * * * *" est une autre syntaxe possible.
     */
    @Scheduled(fixedRate = 400000)
    @Transactional
    public void terminerAnnoncesExpirees() {
        log.info("Lancement du Job : Vérification des annonces expirées...");

        // Note : Tu devras créer cette méthode dans ton AnnonceRepository.
        // L'idée est de faire un UPDATE des annonces où la date/heure + durée
        // est dépassée par rapport à l'heure actuelle.

        int annoncesMisesAJour = annonceRepository.updateAnnoncesToTermineeSiExpirees();

        log.info("{} annonce(s) passée(s) au statut TERMINEE.", annoncesMisesAJour);
    }
}
