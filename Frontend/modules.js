// modules.js
// This file handles ALL module-related operations with backend API

// ==================== GLOBAL VARIABLES ====================
let modules = [];

// ==================== INITIALIZATION ====================

/**
 * Load modules from backend
 */
async function loadModules() {
    try {
        console.log('Loading modules from backend...');
        modules = await fetchModules();
        console.log('Modules loaded:', modules);
        renderModules();
    } catch (error) {
        console.error('Failed to load modules:', error);
        alert('Failed to load modules. Please refresh the page.');
    }
}

// ==================== CORE FUNCTIONS ====================

/**
 * Add a new module
 */
/**
 * Add a new module
 */
async function addModule(moduleName) {
    try {
        console.log('Adding module:', moduleName);
        
        // Show loading state
        const addButton = document.querySelector('#moduleForm button');
        const originalText = addButton.textContent;
        addButton.textContent = 'Adding...';
        addButton.disabled = true;
        
        const newModule = await createModule({ name: moduleName });
        
        modules.push(newModule);
        renderModules();
        
        // Reset button
        addButton.textContent = originalText;
        addButton.disabled = false;
        
        console.log('Module added:', newModule);
        
    } catch (error) {
        console.error('Failed to add module - DETAILS:', error);
        
        // Show alert with error details
        alert(`Failed to add module: ${error.message || 'Unknown error'}`);
        
        // Check if user is still authenticated
        if (!isAuthenticated()) {
            alert('You have been logged out. Please login again.');
            logout();
        }
        
        // Reset button
        const addButton = document.querySelector('#moduleForm button');
        addButton.textContent = '➕ Add Module';
        addButton.disabled = false;
    }
}

/**
 * Delete a module and all its tasks
 */
async function deleteModule(moduleId) {
    const moduleToDelete = modules.find(m => m.id === moduleId);
    
    if (confirm(`Are you sure you want to delete "${moduleToDelete.name}"? All tasks in this module will also be deleted!`)) {
        try {
            console.log('Deleting module:', moduleId);
            
            await deleteModule(moduleId);
            
            modules = modules.filter(module => module.id !== moduleId);
            renderModules();
            
            // Refresh tasks if function exists
            if (typeof loadTasks === 'function') {
                await loadTasks();
            }
            
            console.log('Module deleted successfully');
        } catch (error) {
            console.error('Failed to delete module:', error);
            alert('Failed to delete module. Please try again.');
        }
    }
}

// ==================== DISPLAY FUNCTIONS ====================

/**
 * Display all modules
 */
function renderModules() {
    const moduleList = document.getElementById('moduleList');
    
    if (!moduleList) return;
    
    if (modules.length === 0) {
        moduleList.innerHTML = '<p class="no-items">No modules yet. Add your first module above!</p>';
    } else {
        moduleList.innerHTML = modules.map(module => `
            <div class="module-item" data-module-id="${module.id}">
                <div class="module-info">
                    <strong>${module.name}</strong>
                    <small>Created: ${module.createdAt ? new Date(module.createdAt).toLocaleDateString() : 'Just now'}</small>
                </div>
                <button onclick="deleteModule(${module.id})" class="delete-btn">🗑️ Delete</button>
            </div>
        `).join('');
    }
    
    updateModuleDropdown();
    updateModuleFilterDropdown();
}

/**
 * Update module dropdown in Add Task form
 */
function updateModuleDropdown() {
    const moduleSelect = document.getElementById('taskModule');
    
    if (!moduleSelect) return;
    
    moduleSelect.innerHTML = '<option value="">Select a Module</option>';
    
    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module.id;
        option.textContent = module.name;
        moduleSelect.appendChild(option);
    });
}

/**
 * Update module filter dropdown
 */
function updateModuleFilterDropdown() {
    const filterSelect = document.getElementById('moduleFilter');
    
    if (!filterSelect) return;
    
    filterSelect.innerHTML = '<option value="All">All Modules</option>';
    
    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module.id;
        option.textContent = module.name;
        filterSelect.appendChild(option);
    });
}

/**
 * Get module name by ID
 */
function getModuleName(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : 'Unknown';
}

console.log('✅ modules.js loaded');