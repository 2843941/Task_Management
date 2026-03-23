// storage.js
// This file handles ALL data saving and loading using localStorage
// Think of localStorage as a tiny database in your browser

// ==================== MODULE FUNCTIONS ====================

/**
 * Get all modules from localStorage
 * @returns {Array} Array of module objects, empty array if none exist
 */
function getModules() {
    console.log('📦 Getting modules from localStorage...');
    
    // Try to get modules from localStorage
    const modulesJSON = localStorage.getItem('modules');
    console.log('Raw modules JSON:', modulesJSON);
    
    // If modules exist, convert from JSON string back to array
    // If no modules, return empty array
    const modules = modulesJSON ? JSON.parse(modulesJSON) : [];
    console.log('Parsed modules:', modules);
    
    return modules;
}

/**
 * Save modules to localStorage
 * @param {Array} modules - Array of module objects to save
 */
function saveModules(modules) {
    console.log('💾 Saving modules to localStorage:', modules);
    
    // Convert modules array to JSON string and save to localStorage
    localStorage.setItem('modules', JSON.stringify(modules));
    console.log('✅ Modules saved successfully');
}

// ==================== TASK FUNCTIONS ====================

/**
 * Get all tasks from localStorage
 * @returns {Array} Array of task objects, empty array if none exist
 */
function getTasks() {
    console.log('📦 Getting tasks from localStorage...');
    
    // Try to get tasks from localStorage
    const tasksJSON = localStorage.getItem('tasks');
    console.log('Raw tasks JSON:', tasksJSON);
    
    // If tasks exist, convert from JSON string back to array
    // If no tasks, return empty array
    const tasks = tasksJSON ? JSON.parse(tasksJSON) : [];
    console.log('Parsed tasks:', tasks);
    
    return tasks;
}

/**
 * Save tasks to localStorage
 * @param {Array} tasks - Array of task objects to save
 */
function saveTasks(tasks) {
    console.log('💾 Saving tasks to localStorage:', tasks);
    
    // Convert tasks array to JSON string and save to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log('✅ Tasks saved successfully');
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Clear all data from localStorage (useful for testing)
 */
function clearAllData() {
    localStorage.removeItem('modules');
    localStorage.removeItem('tasks');
    console.log('🧹 All data cleared from localStorage!');
}

/**
 * Check if we have any data stored
 * @returns {Object} Object with boolean values for modules and tasks
 */
function hasData() {
    return {
        hasModules: localStorage.getItem('modules') !== null,
        hasTasks: localStorage.getItem('tasks') !== null
    };
}

/**
 * Get storage usage information
 * @returns {Object} Information about stored data
 */
function getStorageInfo() {
    const modules = getModules();
    const tasks = getTasks();
    
    return {
        moduleCount: modules.length,
        taskCount: tasks.length,
        modules: modules,
        tasks: tasks
    };
}

// ==================== DEBUG FUNCTIONS ====================

/**
 * Print all storage contents to console (for debugging)
 */
function debugStorage() {
    console.log('========== STORAGE DEBUG ==========');
    console.log('localStorage contents:');
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
    }
    
    console.log('====================================');
}

console.log('✅ storage.js is loaded and ready!');
