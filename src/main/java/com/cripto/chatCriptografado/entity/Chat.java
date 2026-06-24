package com.cripto.chatCriptografado.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tb_chat", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user1Id", "user2Id" })
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user1Id", nullable = false)
    private String user1Id;

    @Column(name = "user2Id", nullable = false)
    private String user2Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1Id", insertable = false, updatable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2Id", insertable = false, updatable = false)
    private User user2;

    @OneToMany(mappedBy = "chat", orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Message> messages = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String aesKeyForUser1;

    @Column(columnDefinition = "TEXT")
    private String aesKeyForUser2;
}
