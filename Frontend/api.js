// api.js
// This file handles all API calls to the Spring Boot backend

const API_URL = 'http://localhost:8080/api';

// Store JWT token
let authToken = localStorage.getItem('token');
let currentUser = null;

// ==================== AUTHENTICATION ====================

/**
 * Register a new user
 */
async function register(username, password) {
    console.log('📝 API: register called for:', username);
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('📝 API: register response status:', response.status);
        
        if (!response.ok) {
            const error = await response.text();
            console.error('📝 API: register error:', error);
            throw new Error(error);
        }
        
        const result = await response.text();
        console.log('📝 API: register success:', result);
        return result;
    } catch (error) {
        console.error('📝 API: register error:', error);
        throw error;
    }
}

/**
 * Login user
 */
async function login(username, password) {
    console.log('🔐 API: login called for:', username);
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('🔐 API: login response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔐 API: login error response:', errorText);
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        console.log('🔐 API: login success - token received:', data.token ? 'yes' : 'no');
        
        if (data.token) {
            console.log('🔐 API: token length:', data.token.length);
            console.log('🔐 API: token starts with:', data.token.substring(0, 20) + '...');
            
            // Check token format (JWT should have 3 parts)
            const parts = data.token.split('.');
            console.log('🔐 API: token parts:', parts.length);
        }
        
        authToken = data.token;
        currentUser = data;
        
        // Save to localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('username', data.username);
        
        console.log('🔐 API: token saved to localStorage');
        console.log('🔐 API: localStorage after save:', {
            token: localStorage.getItem('token') ? 'exists' : 'missing',
            userId: localStorage.getItem('userId'),
            username: localStorage.getItem('username')
        });
        
        return data;
    } catch (error) {
        console.error('🔐 API: login error:', error);
        throw error;
    }
}

/**
 * Logout user
 */
function logout() {
    console.log('🚪 API: logout called');
    authToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    console.log('🚪 API: localStorage cleared');
}

/**
 * Check if user is logged in
 */
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const authenticated = !!token;
    console.log('🔍 API: isAuthenticated check:', authenticated);
    return authenticated;
}

/**
 * Get auth headers for API calls
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    console.log('📨 API: getAuthHeaders - token exists:', !!token);
    
    if (token) {
        console.log('📨 API: token starts with:', token.substring(0, 15) + '...');
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ==================== MODULES API ====================

/**
 * Get all modules for current user
 */
async function fetchModules() {
    console.log('📁 API: fetchModules called');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('📁 API: no token found');
            return [];
        }
        
        console.log('📁 API: fetching from:', `${API_URL}/modules`);
        
        const response = await fetch(`${API_URL}/modules`, {
            headers: getAuthHeaders()
        });
        
        console.log('📁 API: modules response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('📁 API: token rejected - logging out');
            logout();
            return [];
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch modules');
        }
        
        const data = await response.json();
        console.log('📁 API: modules fetched:', data.length);
        return data;
        
    } catch (error) {
        console.error('📁 API: fetch modules error:', error);
        return [];
    }
}

/**
 * Create a new module
 */
async function createModule(moduleData) {
    console.log('📁 API: createModule called:', moduleData);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('📁 API: no token found');
            throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${API_URL}/modules`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(moduleData)
        });
        
        console.log('📁 API: create module response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('📁 API: token rejected - logging out');
            logout();
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            throw new Error('Failed to create module');
        }
        
        const data = await response.json();
        console.log('📁 API: module created:', data);
        return data;
        
    } catch (error) {
        console.error('📁 API: create module error:', error);
        throw error;
    }
}

/**
 * Delete a module
 */
async function deleteModule(id) {
    console.log('📁 API: deleteModule called:', id);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('📁 API: no token found');
            throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${API_URL}/modules/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        console.log('📁 API: delete module response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('📁 API: token rejected - logging out');
            logout();
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            throw new Error('Failed to delete module');
        }
        
        console.log('📁 API: module deleted successfully');
        return true;
        
    } catch (error) {
        console.error('📁 API: delete module error:', error);
        throw error;
    }
}

// ==================== TASKS API ====================

/**
 * Get all tasks for current user
 */
async function fetchTasks() {
    console.log('✅ API: fetchTasks called');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('✅ API: no token found');
            return [];
        }
        
        console.log('✅ API: fetching from:', `${API_URL}/tasks`);
        
        const response = await fetch(`${API_URL}/tasks`, {
            headers: getAuthHeaders()
        });
        
        console.log('✅ API: tasks response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('✅ API: token rejected - logging out');
            logout();
            return [];
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        console.log('✅ API: tasks fetched:', data.length);
        return data;
        
    } catch (error) {
        console.error('✅ API: fetch tasks error:', error);
        return [];
    }
}

/**
 * Create a new task
 */
async function createTask(taskData) {
    console.log('✅ API: createTask called:', taskData);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('✅ API: no token found');
            throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        
        console.log('✅ API: create task response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('✅ API: token rejected - logging out');
            logout();
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            const error = await response.text();
            console.error('✅ API: create task error response:', error);
            throw new Error(error || 'Failed to create task');
        }
        
        const data = await response.json();
        console.log('✅ API: task created:', data);
        return data;
        
    } catch (error) {
        console.error('✅ API: create task error:', error);
        throw error;
    }
}

/**
 * Update a task
 */
async function updateTask(id, taskData) {
    console.log('✅ API: updateTask called:', id, taskData);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('✅ API: no token found');
            throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        
        console.log('✅ API: update response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('✅ API: token rejected - logging out');
            logout();
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            const error = await response.text();
            console.error('✅ API: update error response:', error);
            throw new Error(`Failed to update task: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API: task updated:', data);
        return data;
        
    } catch (error) {
        console.error('✅ API: update task error:', error);
        throw error;
    }
}

/**
 * Delete a task
 */
async function deleteTask(id) {
    console.log('✅ API: deleteTask called:', id);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('✅ API: no token found');
            throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        console.log('✅ API: delete response status:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.log('✅ API: token rejected - logging out');
            logout();
            throw new Error('Session expired');
        }
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        console.log('✅ API: task deleted successfully');
        return true;
        
    } catch (error) {
        console.error('✅ API: delete task error:', error);
        throw error;
    }
}

// ==================== INITIALIZATION ====================

/**
 * Check if user is logged in on page load
 */
function initAuth() {
    console.log('🔍 API: initAuth called');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    console.log('🔍 API: localStorage check:', { 
        token: token ? 'exists' : 'none', 
        userId, 
        username 
    });
    
    if (token) {
        authToken = token;
        currentUser = {
            id: userId,
            username: username
        };
        console.log('🔍 API: user restored from localStorage:', currentUser);
        return true;
    }
    return false;
}

// Initialize auth state
const authenticated = initAuth();
console.log(`✅ api.js loaded. Authenticated: ${authenticated}`);

// Export functions for use in other files
window.login = login;
window.register = register;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.fetchModules = fetchModules;
window.createModule = createModule;
window.deleteModule = deleteModule;
window.fetchTasks = fetchTasks;
window.createTask = createTask;
window.updateTask = updateTask;
window.deleteTask = deleteTask;