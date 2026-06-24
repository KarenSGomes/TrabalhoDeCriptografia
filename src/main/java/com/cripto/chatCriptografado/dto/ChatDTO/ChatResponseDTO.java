package com.cripto.chatCriptografado.dto.ChatDTO;

import java.util.List;
import com.cripto.chatCriptografado.dto.MessageDTO.MsgResponseDTO;
import com.cripto.chatCriptografado.dto.UserDTO.UserResponseDTO;

public record ChatResponseDTO(
    String id,
    List<UserResponseDTO> users,
    List<MsgResponseDTO> messages
) {}