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
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(chatService.create(dto));
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponseDTO> findById(@PathVariable String chatId) {
        return ResponseEntity.ok(chatService.findById(chatId));
    }

    @GetMapping("/between")
    public ResponseEntity<ChatResponseDTO> findBetween(
        @RequestParam String user1Id,
        @RequestParam String user2Id
    ) {
        return ResponseEntity.ok(chatService.findBetween(user1Id, user2Id));
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(@PathVariable String chatId) {
        chatService.deleteChat(chatId);
        return ResponseEntity.noContent().build();
    }
}