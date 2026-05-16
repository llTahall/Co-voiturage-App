package com.covoiturage.service;

import com.covoiturage.entity.User;
import com.covoiturage.repository.UserRepository;
import com.covoiturage.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User updateProfile(String prenom, String nom, String telephone) {
        User user = getCurrentUser();
        if (prenom != null && !prenom.isBlank())
            user.setPrenom(prenom);
        if (nom != null && !nom.isBlank())
            user.setNom(nom);
        user.setTelephone(telephone);
        return userRepository.save(user);
    }

}
