package com.cripto.chatCriptografado.dto.ChatDTO;

import java.util.List;
import com.cripto.chatCriptografado.dto.MessageDTO.MsgResponseDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserResponseDTO;

public record ChatResponseDTO(
        String id,
        String user1Id,           // <-- NOVO
        String user2Id,           // <-- NOVO
        String aesKeyForUser1,    // <-- NOVO
        String aesKeyForUser2,    // <-- NOVO
        List<UserResponseDTO> users,
        List<MsgResponseDTO> messages
) {}