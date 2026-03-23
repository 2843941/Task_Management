// app.js
// Main application file with authentication UI

console.log('📁 app.js loaded - START');

// Add flag to prevent multiple initializations
let isInitialized = false;
let authCheckCount = 0;

// ==================== AUTH UI FUNCTIONS ====================

/**
 * Show login form
 */
function showLogin() {
    console.log('🔄 showLogin called');
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    const loginTab = document.querySelector('.auth-tab');
    if (loginTab) loginTab.classList.add('active');
    document.getElementById('login-form').classList.add('active');
}

/**
 * Show register form
 */
function showRegister() {
    console.log('🔄 showRegister called');
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    const registerTab = document.querySelectorAll('.auth-tab')[1];
    if (registerTab) registerTab.classList.add('active');
    document.getElementById('register-form').classList.add('active');
}

/**
 * Handle login
 */
async function handleLogin() {
    console.log('🔐 handleLogin called');
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }
    
    try {
        console.log('🔐 Attempting login for:', username);
        const user = await login(username, password);
        console.log('🔐 Login successful:', user);
        
        // Reset initialization flag
        isInitialized = false;
        
        // Show app, hide auth
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('welcome-user').textContent = `Welcome, ${user.username}!`;
        
        // Load data
        console.log('🔐 Loading modules after login...');
        await loadModules();
        console.log('🔐 Loading tasks after login...');
        await loadTasks();
        
        // Setup filters
        setupFilters();
        
    } catch (error) {
        console.error('🔐 Login error:', error);
        errorEl.textContent = 'Login failed. Check your credentials.';
    }
}

/**
 * Handle register
 */
async function handleRegister() {
    console.log('📝 handleRegister called');
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const errorEl = document.getElementById('register-error');
    
    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }
    
    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }
    
    try {
        console.log('📝 Registering:', username);
        const result = await register(username, password);
        console.log('📝 Registration result:', result);
        alert('Registration successful! Please login.');
        showLogin();
        
        // Clear fields
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm').value = '';
        
    } catch (error) {
        console.error('📝 Registration error:', error);
        errorEl.textContent = error.message || 'Registration failed';
    }
}

// ==================== LOGOUT FUNCTION ====================

/**
 * Logout user
 */
function logout() {
    console.log('🚪 logout called');
    
    // Reset initialization flag
    isInitialized = false;
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Clear ALL form fields
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm').value = '';
    
    // Clear error messages
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
    
    // Hide app, show auth
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    
    // Reset to login tab
    showLogin();
    
    console.log('✅ logout successful');
}

// ==================== FORM SETUP ====================

/**
 * Setup module form
 */
function setupModuleForm() {
    console.log('📋 setupModuleForm called');
    const moduleForm = document.getElementById('moduleForm');
    
    if (!moduleForm) return;
    
    // Remove any existing listeners to prevent duplicates
    moduleForm.replaceWith(moduleForm.cloneNode(true));
    const newModuleForm = document.getElementById('moduleForm');
    
    newModuleForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('📋 Module form submitted');
        
        const moduleName = document.getElementById('moduleName').value.trim();
        
        if (moduleName === '') {
            alert('Please enter a module name!');
            return;
        }
        
        await addModule(moduleName);
        document.getElementById('moduleName').value = '';
    });
}

/**
 * Setup task form
 */
function setupTaskForm() {
    console.log('✅ setupTaskForm called');
    const taskForm = document.getElementById('taskForm');
    
    if (!taskForm) return;
    
    // Remove any existing listeners to prevent duplicates
    taskForm.replaceWith(taskForm.cloneNode(true));
    const newTaskForm = document.getElementById('taskForm');
    
    newTaskForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('✅ Task form submitted');
        
        const moduleId = document.getElementById('taskModule').value;
        const taskName = document.getElementById('taskName').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        
        if (!moduleId) {
            alert('Please select a module!');
            return;
        }
        
        if (taskName === '') {
            alert('Please enter a task name!');
            return;
        }
        
        if (!dueDate) {
            alert('Please select a due date!');
            return;
        }
        
        await addTask(moduleId, taskName, dueDate, priority);
        
        document.getElementById('taskName').value = '';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskPriority').value = 'LOW';
    });
}

/**
 * Setup filters
 */
function setupFilters() {
    console.log('🔍 setupFilters called');
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

// ==================== DARK MODE ====================

function toggleDarkMode() {
    console.log('🌙 toggleDarkMode called');
    document.body.classList.toggle('dark-mode');
    const btn = document.querySelector('.dark-mode-toggle');
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function loadDarkModePreference() {
    console.log('🌙 loadDarkModePreference called');
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.dark-mode-toggle');
        if (btn) btn.textContent = '☀️ Light Mode';
    }
}

// ==================== INITIALIZATION ====================

/**
 * Check authentication on page load
 */
async function checkAuth() {
    authCheckCount++;
    console.log(`🔍 checkAuth called (count: ${authCheckCount})`);
    
    // Prevent multiple executions
    if (isInitialized) {
        console.log('🔍 checkAuth already ran, skipping');
        return;
    }
    isInitialized = true;
    
    console.log('🔍 isAuthenticated():', isAuthenticated());
    console.log('🔍 localStorage token:', localStorage.getItem('token') ? 'exists' : 'none');
    
    if (isAuthenticated()) {
        console.log('🔍 User is authenticated, showing app');
        
        // User is logged in
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('welcome-user').textContent = `Welcome, ${localStorage.getItem('username')}!`;
        
        // Load data ONLY after successful login
        try {
            console.log('🔍 Loading modules...');
            await loadModules();
            console.log('🔍 Modules loaded, now loading tasks...');
            await loadTasks();
            
            // Setup forms and filters
            console.log('🔍 Setting up forms and filters...');
            setupModuleForm();
            setupTaskForm();
            setupFilters();
        } catch (error) {
            console.error('🔍 Failed to load initial data:', error);
            // If token is invalid, logout
            logout();
        }
    } else {
        console.log('🔍 User not authenticated, showing auth screen');
        // User not logged in
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }
}

// Initialize on page load - use a flag to prevent double initialization
let domLoaded = false;
document.addEventListener('DOMContentLoaded', () => {
    if (domLoaded) {
        console.log('⚠️ DOMContentLoaded already fired, skipping');
        return;
    }
    domLoaded = true;
    
    console.log('🏁 DOMContentLoaded fired');
    loadDarkModePreference();
    checkAuth();
});

console.log('✅ app.js initialized - END');
