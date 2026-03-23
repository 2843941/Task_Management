// analytics.js
// This file handles all dashboard charts and statistics

// ==================== GLOBAL VARIABLES ====================

let taskChart = null;
let priorityChart = null;
let moduleChart = null;

// ==================== MAIN DASHBOARD UPDATE ====================

/**
 * Update all dashboard statistics and charts
 */
function updateDashboard() {
    console.log('📊 Updating dashboard...');
    
    // Get task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed === true).length;
    const pendingTasks = tasks.filter(t => t.completed === false).length;
    const overdueTasks = tasks.filter(t => 
        t.completed === false && isOverdue(t.dueDate)
    ).length;
    
    // Calculate completion percentage
    const completionRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
    
    console.log(`📊 Stats: Total=${totalTasks}, Completed=${completedTasks}, Overdue=${overdueTasks}, Rate=${completionRate}%`);
    
    // Update stat cards
    updateStatCards(totalTasks, completedTasks, overdueTasks, completionRate);
    
    // Create/update all charts
    createTaskOverviewChart(completedTasks, pendingTasks, overdueTasks);
    createPriorityChart();
    createModuleChart();
}

// ==================== STAT CARDS ====================

/**
 * Update the statistic cards in the dashboard
 */
function updateStatCards(total, completed, overdue, rate) {
    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const overdueEl = document.getElementById('overdue-tasks');
    let rateEl = document.getElementById('completion-rate');
    
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (overdueEl) overdueEl.textContent = overdue;
    
    // Create or update completion rate card
    if (!rateEl && totalEl) {
        const statsContainer = document.querySelector('.stats');
        if (statsContainer) {
            const newCard = document.createElement('div');
            newCard.className = 'stat-card';
            newCard.innerHTML = `
                <h3>📈 Completion Rate</h3>
                <p id="completion-rate">${rate}%</p>
            `;
            statsContainer.appendChild(newCard);
        }
    } else if (rateEl) {
        rateEl.textContent = rate + '%';
    }
}

// ==================== TASK OVERVIEW CHART ====================

/**
 * Create the main task overview doughnut chart
 */
function createTaskOverviewChart(completed, pending, overdue) {
    const canvas = document.getElementById('taskChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (taskChart) {
        taskChart.destroy();
    }
    
    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['✅ Completed', '⏳ Pending', '⚠️ Overdue'],
            datasets: [{
                data: [completed, pending, overdue],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Task Overview',
                    font: { size: 16 }
                },
                legend: { position: 'bottom' }
            }
        }
    });
    
    console.log('📊 Task overview chart created');
}

// ==================== PRIORITY CHART ====================

/**
 * Create bar chart showing tasks by priority
 */
function createPriorityChart() {
    let canvas = document.getElementById('priorityChart');
    
    if (!canvas) {
        const dashboard = document.getElementById('dashboard');
        const chartContainer = document.createElement('div');
        chartContainer.innerHTML = '<canvas id="priorityChart" style="max-height: 300px; margin-top: 20px;"></canvas>';
        dashboard.appendChild(chartContainer.firstChild);
        canvas = document.getElementById('priorityChart');
    }
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const highCount = tasks.filter(t => t.priority === 'HIGH').length;
    const mediumCount = tasks.filter(t => t.priority === 'MEDIUM').length;
    const lowCount = tasks.filter(t => t.priority === 'LOW').length;
    
    if (priorityChart) {
        priorityChart.destroy();
    }
    
    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Tasks by Priority',
                data: [highCount, mediumCount, lowCount],
                backgroundColor: ['#F44336', '#FFC107', '#4CAF50'],
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tasks by Priority',
                    font: { size: 16 }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
    
    console.log('📊 Priority chart created');
}

// ==================== MODULE CHART ====================

/**
 * Create bar chart showing tasks by module
 */
function createModuleChart() {
    let canvas = document.getElementById('moduleChart');
    
    if (!canvas) {
        const dashboard = document.getElementById('dashboard');
        const chartContainer = document.createElement('div');
        chartContainer.innerHTML = '<canvas id="moduleChart" style="max-height: 300px; margin-top: 20px;"></canvas>';
        dashboard.appendChild(chartContainer.firstChild);
        canvas = document.getElementById('moduleChart');
    }
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const moduleMap = new Map();
    tasks.forEach(task => {
        const moduleName = task.module ? task.module.name : 'Unknown';
        moduleMap.set(moduleName, (moduleMap.get(moduleName) || 0) + 1);
    });
    
    const moduleNames = Array.from(moduleMap.keys());
    const moduleCounts = Array.from(moduleMap.values());
    
    const colors = moduleNames.map((_, i) => {
        const hue = (i * 137) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    });
    
    if (moduleChart) {
        moduleChart.destroy();
    }
    
    moduleChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: moduleNames,
            datasets: [{
                label: 'Tasks by Module',
                data: moduleCounts,
                backgroundColor: colors,
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tasks by Module',
                    font: { size: 16 }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
    
    console.log('📊 Module chart created');
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get upcoming tasks (due in the next 7 days)
 */
function getUpcomingTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
    });
}

/**
 * Get task summary text
 */
function getTaskSummary() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;
    
    return {
        total,
        completed,
        overdue,
        pending: total - completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        upcoming: getUpcomingTasks().length
    };
}

// ==================== INITIALIZATION ====================

/**
 * Initialize dashboard when page loads
 */
function initDashboard() {
    console.log('📊 Initializing dashboard...');
    setTimeout(() => {
        if (typeof tasks !== 'undefined' && tasks.length >= 0) {
            updateDashboard();
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', initDashboard);

console.log('✅ analytics.js is loaded!');
