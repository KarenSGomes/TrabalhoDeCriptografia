package com.cripto.chatCriptografado.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cripto.chatCriptografado.dto.UserDTO.UserLoginDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserRequestDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserResponseDTO;
import com.cripto.chatCriptografado.entity.Chat;
import com.cripto.chatCriptografado.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO create(@RequestBody UserRequestDTO dto) {
        return service.save(dto);
    }

    @GetMapping("/{id}")
    public UserResponseDTO findById(@PathVariable String id) {
        return service.findById(id);
    }

    @GetMapping("/email")
    public UserResponseDTO findByEmail(@RequestParam String email) {
        return service.findByEmail(email);
    }

    @GetMapping("/{id}/chats")
    public List<Chat> getAllChats(@PathVariable String id) {
        return service.getUserChats(id);
    }

    @PostMapping("/login")
    public String login(@RequestBody UserLoginDTO dto) {
        return service.login(dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
