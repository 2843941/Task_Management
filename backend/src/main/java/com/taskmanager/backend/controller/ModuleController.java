/* Manage modules for logged-in user */

package com.taskmanager.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;

import com.taskmanager.backend.model.Module;
import com.taskmanager.backend.model.User;
import com.taskmanager.backend.repository.ModuleRepository;
import com.taskmanager.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, allowCredentials = "true", allowedHeaders = "*")
@RestController
@RequestMapping("/api/modules")
public class ModuleController {
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername()).get();
    }
    
    @GetMapping
    public List<Module> getAllModules() {
        User user = getCurrentUser();
        return moduleRepository.findByUserId(user.getId());
    }
    
    @PostMapping
    public Module createModule(@RequestBody Module module) {
        User user = getCurrentUser();
        module.setUser(user);
        return moduleRepository.save(module);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Module> updateModule(@PathVariable Long id, @RequestBody Module moduleDetails) {
        Module module = moduleRepository.findById(id).orElseThrow();
        
        // Check if module belongs to current user
        if (!module.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        
        module.setName(moduleDetails.getName());
        module.setColor(moduleDetails.getColor());
        
        return ResponseEntity.ok(moduleRepository.save(module));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModule(@PathVariable Long id) {
        Module module = moduleRepository.findById(id).orElseThrow();
        
        // Check if module belongs to current user
        if (!module.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        
        moduleRepository.delete(module);
        return ResponseEntity.ok().build();
    }
}