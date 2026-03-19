package com.taskmanager.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    private String priority; // HIGH, MEDIUM, LOW
    
    private boolean completed;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    @JsonIgnoreProperties({"tasks", "user"})
    private Module module;
    
    @Column(name = "created_at")
    private String createdAt;
    
    public Task(String title, LocalDate dueDate, String priority, Module module) {
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.module = module;
        this.completed = false;
        this.createdAt = java.time.LocalDateTime.now().toString();
    }
}