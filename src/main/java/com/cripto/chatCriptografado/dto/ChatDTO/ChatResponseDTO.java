package com.cripto.chatCriptografado.dto.ChatDTO;

import java.util.List;

import com.cripto.chatCriptografado.entity.Message;
import com.cripto.chatCriptografado.entity.User;

public record ChatResponseDTO(
    String id,
    List<User> userList,
    List<Message> msgList
) {}
