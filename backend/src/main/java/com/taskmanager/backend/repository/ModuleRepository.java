/* Find all modules belonging to a specific user */

package com.taskmanager.backend.repository;

import com.taskmanager.backend.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByUserId(Long userId);
}