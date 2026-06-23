package com.cripto.chatCriptografado.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cripto.chatCriptografado.dto.ChatDTO.ChatRequestDTO;
import com.cripto.chatCriptografado.dto.ChatDTO.ChatResponseDTO;
import com.cripto.chatCriptografado.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponseDTO> createChat(@RequestBody ChatRequestDTO dto) {

        ChatResponseDTO chat = chatService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(chat);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponseDTO> findById(@PathVariable String chatId) {
        
        return ResponseEntity.ok(chatService.findById(chatId));
    }

    @PostMapping("/{chatId}/users/{userId}")
    public ResponseEntity<ChatResponseDTO> addUserToChat(
        @PathVariable String chatId, 
        @PathVariable String userId) {

        return ResponseEntity.ok(chatService.addUserToChat(chatId, userId));
    }

    @DeleteMapping("/{chatId}/users/{userId}")
    public ResponseEntity<Void> removeUserFromChat(
            @PathVariable String chatId,
            @PathVariable String userId) {

        chatService.removeUserFromChat(chatId, userId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable String chatId) {

        chatService.deleteChat(chatId);
        return ResponseEntity.noContent().build();
    }
}