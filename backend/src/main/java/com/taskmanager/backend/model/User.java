/* Stores user info */

package com.taskmanager.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity //Tells JPA this is a database table
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    
    @Id //This is the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Auto-increment ID
    private Long id;
    
    @Column(unique = true, nullable = false) //Username must be unique
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) //One user has many modules
    private List<Module> modules = new ArrayList<>();
    
    @Column(name = "created_at")
    private String createdAt;
    
    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.createdAt = java.time.LocalDateTime.now().toString();
    }
}