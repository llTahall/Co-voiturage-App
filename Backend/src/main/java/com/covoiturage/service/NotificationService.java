package com.covoiturage.service;

import com.covoiturage.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifier(String userEmail, String type, String message, Long referenceId) {
        messagingTemplate.convertAndSendToUser(userEmail, "/queue/notifications", build(type, message, referenceId));
    }

    public void broadcast(String type, String message, Long referenceId) {
        messagingTemplate.convertAndSend("/topic/annonces", build(type, message, referenceId));
    }

    private NotificationDTO build(String type, String message, Long referenceId) {
        return NotificationDTO.builder()
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
