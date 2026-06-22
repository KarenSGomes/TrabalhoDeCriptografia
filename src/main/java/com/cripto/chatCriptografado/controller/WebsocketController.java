package com.cripto.chatCriptografado.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.cripto.chatCriptografado.dto.MessageDTO.MsgRequestDTO;
import com.cripto.chatCriptografado.dto.MessageDTO.MsgResponseDTO;
import com.cripto.chatCriptografado.service.MessageService;

@Controller
public class WebsocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService msgService;

    @Autowired
    public WebsocketController(SimpMessagingTemplate messagingTemplate, MessageService msgService) {
        this.messagingTemplate = messagingTemplate;
        this.msgService = msgService;
    }

    @MessageMapping("/message")
    public void handleMessage(MsgRequestDTO msg) {
        MsgResponseDTO response = msgService.save(msg);

        messagingTemplate.convertAndSend("/topic/chat/" + msg.chatId(), response);
    }
}
