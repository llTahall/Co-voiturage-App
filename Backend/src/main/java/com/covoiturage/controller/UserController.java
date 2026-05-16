package com.covoiturage.controller;

import com.covoiturage.entity.User;
import com.covoiturage.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(req.prenom(), req.nom(), req.telephone()));
    }

    public record UpdateProfileRequest(String prenom, String nom, String telephone) {
    }
}
