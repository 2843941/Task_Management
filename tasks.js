// tasks.js
// This file handles ALL task-related operations with backend API

// ==================== GLOBAL VARIABLES ====================
let tasks = [];

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a task is overdue
 */
function isOverdue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    return due < today;
}

// ==================== DISPLAY FUNCTIONS ====================

/**
 * Render tasks with filters
 */
function renderTasks() {
    console.log('📋 Rendering tasks...');
    
    const taskList = document.getElementById('taskList');
    
    if (!taskList) return;
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="no-items">No tasks yet. Add your first task above!</p>';
        return;
    }
    
    // Get filter values
    const priorityFilter = document.getElementById('priorityFilter').value;
    const moduleFilter = document.getElementById('moduleFilter').value;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    // Apply filters
    let filteredTasks = [...tasks];
    
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm)
        );
    }
    
    if (priorityFilter !== 'All') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    if (moduleFilter !== 'All') {
        filteredTasks = filteredTasks.filter(task => task.module.id === parseInt(moduleFilter));
    }
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p class="no-items">No tasks match your filters</p>';
        return;
    }
    
    // Generate HTML
    taskList.innerHTML = filteredTasks.map(task => {
        const overdue = isOverdue(task.dueDate) && !task.completed;
        const moduleName = task.module ? task.module.name : 'Unknown';
        const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="task-item ${overdue ? 'overdue' : ''}" data-priority="${task.priority}" data-task-id="${task.id}">
                <div class="task-info">
                    <strong>${task.title}</strong>
                    <span class="module-badge">📁 ${moduleName}</span>
                    <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="due-date">📅 ${formattedDate}</span>
                    <span class="status-badge">${task.completed ? '✅ Done' : '⏳ Pending'}</span>
                </div>
                <div class="task-actions">
                    <button onclick="toggleTaskStatus(${task.id})" class="complete-btn">
                        ${task.completed ? '↩️ Undo' : '✅ Complete'}
                    </button>
                    <button onclick="deleteTask(${task.id})" class="delete-btn">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('📋 Tasks rendered:', filteredTasks.length);
}

// ==================== CORE FUNCTIONS ====================

/**
 * Load tasks from backend
 */
async function loadTasks() {
    try {
        console.log('📋 Loading tasks from backend...');
        tasks = await fetchTasks();
        console.log('📋 Tasks loaded:', tasks.length);
        renderTasks();
        
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    } catch (error) {
        console.error('📋 Failed to load tasks:', error);
    }
}

/**
 * Add a new task
 */
async function addTask(moduleId, title, dueDate, priority) {
    try {
        console.log('📋 Adding task:', { moduleId, title, dueDate, priority });
        
        const taskData = {
            title,
            dueDate,
            priority,
            module: {
                id: parseInt(moduleId)
            }
        };
        
        const newTask = await createTask(taskData);
        tasks.push(newTask);
        renderTasks();
        
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        console.log('📋 Task added:', newTask);
    } catch (error) {
        console.error('📋 Failed to add task:', error);
        alert('Failed to add task: ' + error.message);
    }
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            console.log('📋 Deleting task:', taskId);
            await deleteTask(taskId);
            tasks = tasks.filter(task => task.id !== taskId);
            renderTasks();
            
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            console.log('📋 Task deleted successfully');
        } catch (error) {
            console.error('📋 Failed to delete task:', error);
            alert('Failed to delete task');
        }
    }
}

/**
 * Toggle task completion status
 */
async function toggleTaskStatus(taskId) {
    console.log('📋 Toggling task:', taskId);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error('📋 Task not found:', taskId);
        return;
    }
    
    // Store the button element if available
    const button = event?.target;
    const originalText = button ? button.textContent : '';
    
    try {
        // Show loading state
        if (button) {
            button.textContent = '⏳ Updating...';
            button.disabled = true;
        }
        
        // Prepare updated task data
        const updatedTaskData = {
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            completed: !task.completed,
            module: {
                id: task.module.id
            }
        };
        
        console.log('📋 Sending update:', updatedTaskData);
        
        // Call API
        const result = await updateTask(taskId, updatedTaskData);
        console.log('📋 Update result:', result);
        
        // Update local array
        const index = tasks.findIndex(t => t.id === taskId);
        tasks[index] = result;
        
        // Re-render tasks
        renderTasks();
        
        // Force dashboard update
        console.log('📋 Forcing dashboard update...');
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        } else {
            console.log('📋 updateDashboard function not found');
        }
        
        // Reset button
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
        
    } catch (error) {
        console.error('📋 Failed to toggle task:', error);
        alert('Failed to update task: ' + error.message);
        
        // Reset button
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
}

/**
 * Sort tasks by due date
 */
function sortByDate() {
    console.log('📋 Sorting tasks by date');
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    renderTasks();
}

/**
 * Add quick task from template
 */
async function addQuickTask(priority) {
    const moduleId = document.getElementById('taskModule').value;
    if (!moduleId) {
        alert('Please select a module first!');
        return;
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0];
    
    const taskName = prompt('Enter task name:');
    if (taskName) {
        await addTask(moduleId, taskName, dueDate, priority);
    }
}

// ==================== FILTER FUNCTIONS ====================

function filterByPriority() {
    renderTasks();
}

function filterByModule() {
    renderTasks();
}

// ==================== INITIALIZATION ====================

/**
 * Setup filter listeners
 */
function setupFilters() {
    console.log('📋 Setting up filters');
    const priorityFilter = document.getElementById('priorityFilter');
    const moduleFilter = document.getElementById('moduleFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (priorityFilter) {
        priorityFilter.removeEventListener('change', filterByPriority);
        priorityFilter.addEventListener('change', filterByPriority);
    }
    
    if (moduleFilter) {
        moduleFilter.removeEventListener('change', filterByModule);
        moduleFilter.addEventListener('change', filterByModule);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('input', renderTasks);
        searchInput.addEventListener('input', renderTasks);
    }
}

console.log('✅ tasks.js loaded');
