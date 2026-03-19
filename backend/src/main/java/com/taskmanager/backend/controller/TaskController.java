package com.taskmanager.backend.controller;

import com.taskmanager.backend.model.Module;
import com.taskmanager.backend.model.Task;
import com.taskmanager.backend.model.User;
import com.taskmanager.backend.repository.ModuleRepository;
import com.taskmanager.backend.repository.TaskRepository;
import com.taskmanager.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
    
    @GetMapping
    public ResponseEntity<?> getAllTasks() {
        try {
            System.out.println("=== GET ALL TASKS CALLED ===");
            
            User currentUser = getCurrentUser();
            System.out.println("Current user ID: " + currentUser.getId());
            System.out.println("Current user username: " + currentUser.getUsername());
            
            List<Task> tasks = taskRepository.findAllByUserId(currentUser.getId());
            System.out.println("Tasks found: " + tasks.size());
            
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            System.err.println("ERROR in getAllTasks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching tasks: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task) {
        try {
            System.out.println("=== CREATE TASK CALLED ===");
            System.out.println("Task data: " + task);
            
            // Get current user
            User currentUser = getCurrentUser();
            System.out.println("Current user ID: " + currentUser.getId());
            
            // Check if module exists
            if (task.getModule() == null || task.getModule().getId() == null) {
                System.out.println("ERROR: Module ID is required");
                return ResponseEntity.badRequest().body("Module ID is required");
            }
            
            System.out.println("Looking for module with ID: " + task.getModule().getId());
            Module module = moduleRepository.findById(task.getModule().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found"));
            
            System.out.println("Module found: " + module.getId() + " - " + module.getName());
            System.out.println("Module belongs to user ID: " + module.getUser().getId());
            
            // Check if module belongs to current user
            if (!module.getUser().getId().equals(currentUser.getId())) {
                System.out.println("ERROR: Module does not belong to current user");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You don't have access to this module");
            }
            
            // Set the module and save
            task.setModule(module);
            task.setCompleted(false);
            
            System.out.println("Saving task...");
            Task savedTask = taskRepository.save(task);
            System.out.println("Task saved with ID: " + savedTask.getId());
            
            return ResponseEntity.ok(savedTask);
            
        } catch (ResponseStatusException e) {
            System.err.println("ResponseStatusException: " + e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            System.err.println("ERROR in createTask: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating task: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        try {
            System.out.println("=== UPDATE TASK CALLED ===");
            System.out.println("Task ID: " + id);
            System.out.println("Update details: " + taskDetails);
            
            User currentUser = getCurrentUser();
            System.out.println("Current user ID: " + currentUser.getId());
            
            Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
            
            System.out.println("Found task: " + task.getId() + " - " + task.getTitle());
            
            Module module = task.getModule();
            System.out.println("Task belongs to module ID: " + module.getId());
            System.out.println("Module belongs to user ID: " + module.getUser().getId());
            
            // Check if task belongs to current user
            if (!module.getUser().getId().equals(currentUser.getId())) {
                System.out.println("ERROR: Task does not belong to current user");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You don't have access to this task");
            }
            
            // Update fields
            task.setTitle(taskDetails.getTitle());
            task.setDueDate(taskDetails.getDueDate());
            task.setPriority(taskDetails.getPriority());
            task.setCompleted(taskDetails.isCompleted());
            
            System.out.println("Saving updated task...");
            Task updatedTask = taskRepository.save(task);
            System.out.println("Task updated successfully");
            
            return ResponseEntity.ok(updatedTask);
            
        } catch (ResponseStatusException e) {
            System.err.println("ResponseStatusException: " + e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            System.err.println("ERROR in updateTask: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating task: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            System.out.println("=== DELETE TASK CALLED ===");
            System.out.println("Task ID: " + id);
            
            User currentUser = getCurrentUser();
            System.out.println("Current user ID: " + currentUser.getId());
            
            Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
            
            Module module = task.getModule();
            
            // Check if task belongs to current user
            if (!module.getUser().getId().equals(currentUser.getId())) {
                System.out.println("ERROR: Task does not belong to current user");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You don't have access to this task");
            }
            
            taskRepository.delete(task);
            System.out.println("Task deleted successfully");
            
            return ResponseEntity.ok("Task deleted successfully");
            
        } catch (ResponseStatusException e) {
            System.err.println("ResponseStatusException: " + e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            System.err.println("ERROR in deleteTask: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting task: " + e.getMessage());
        }
    }
}