package com.taskmanager.backend.repository;

import com.taskmanager.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Find tasks by module ID
    List<Task> findByModuleId(Long moduleId);
    
    // Find all tasks for a specific user
    @Query("SELECT t FROM Task t WHERE t.module.user.id = :userId")
    List<Task> findAllByUserId(@Param("userId") Long userId);
    
    // Alternative method if the above doesn't work
    @Query(value = "SELECT t.* FROM tasks t " +
                   "JOIN modules m ON t.module_id = m.id " +
                   "WHERE m.user_id = :userId", nativeQuery = true)
    List<Task> findAllTasksByUserId(@Param("userId") Long userId);
}