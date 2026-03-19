package com.taskmanager.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules")
@Data
@NoArgsConstructor
public class Module {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String color;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore  // ← THIS FIXES THE INFINITE LOOP!
    private List<Task> tasks = new ArrayList<>();
    
    @Column(name = "created_at")
    private String createdAt;
    
    public Module(String name, User user) {
        this.name = name;
        this.user = user;
        this.color = "#" + Integer.toHexString((int)(Math.random() * 0xFFFFFF));
        this.createdAt = java.time.LocalDateTime.now().toString();
    }
}