/**
 * MonoTask Application
 * A minimalist task management app with focus timer
 */
(function() {
    'use strict';

    // ========================================
    // Constants
    // ========================================
    const STORAGE_KEYS = {
        CURRENT_TASK: 'monotask',
        COMPLETED_TASKS: 'monotask_completed'
    };

    const TIMER_COLORS = {
        EXPIRED: '#f44336',
        WARNING: '#ff9800',
        NORMAL: '#4CAF50'
    };

    const MAX_COMPLETED_DISPLAY = 10;

    // ========================================
    // State Management
    // ========================================
    const state = {
        currentTask: null,
        completedTasks: [],
        timer: {
            seconds: 0,
            interval: null,
            isRunning: false
        }
    };

    // ========================================
    // DOM Elements Cache
    // ========================================
    const elements = {
        currentTask: document.getElementById('currentTask'),
        emptyState: document.getElementById('emptyState'),
        taskTitle: document.getElementById('taskTitle'),
        taskDescription: document.getElementById('taskDescription'),
        timer: document.getElementById('timer'),
        timerControls: document.getElementById('timerControls'),
        startBtn: document.getElementById('startBtn'),
        pauseBtn: document.getElementById('pauseBtn'),
        resetBtn: document.getElementById('resetBtn'),
        completeBtn: document.getElementById('completeBtn'),
        taskForm: document.getElementById('taskForm'),
        addTaskForm: document.getElementById('addTaskForm'),
        completedTasks: document.getElementById('completedTasks'),
        completedList: document.getElementById('completedList'),
        clearCompletedBtn: document.getElementById('clearCompleted')
    };

    // ========================================
    // Storage Module
    // ========================================
    const storage = {
        loadCurrentTask() {
            const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TASK);
            return saved ? JSON.parse(saved) : null;
        },

        saveCurrentTask(task) {
            if (task) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_TASK, JSON.stringify(task));
            } else {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
            }
        },

        loadCompletedTasks() {
            const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
            return saved ? JSON.parse(saved) : [];
        },

        saveCompletedTasks(tasks) {
            localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(tasks));
        }
    };

    // ========================================
    // Utility Functions
    // ========================================
    const utils = {
        formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        },

        getTimerColor(seconds) {
            if (seconds === 0) return TIMER_COLORS.EXPIRED;
            if (seconds < 60) return TIMER_COLORS.WARNING;
            return TIMER_COLORS.NORMAL;
        },

        toggleElement(element, show) {
            element.classList.toggle('hidden', !show);
        },

        showNotification(title, body) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
            }
        }
    };

    // ========================================
    // Timer Module
    // ========================================
    const timer = {
        start() {
            if (state.timer.isRunning) return;

            state.timer.isRunning = true;
            utils.toggleElement(elements.startBtn, false);
            utils.toggleElement(elements.pauseBtn, true);

            state.timer.interval = setInterval(() => {
                if (state.timer.seconds > 0) {
                    state.timer.seconds--;
                    this.updateDisplay();
                    
                    if (state.currentTask) {
                        state.currentTask.timerSeconds = state.timer.seconds;
                        storage.saveCurrentTask(state.currentTask);
                    }

                    if (state.timer.seconds === 0) {
                        this.pause();
                        utils.showNotification('MonoTask', 'Time is up!');
                    }
                }
            }, 1000);
        },

        pause() {
            state.timer.isRunning = false;
            clearInterval(state.timer.interval);
            utils.toggleElement(elements.startBtn, true);
            utils.toggleElement(elements.pauseBtn, false);
        },

        reset() {
            this.pause();
            if (state.currentTask) {
                state.timer.seconds = state.currentTask.originalTimer || 0;
                state.currentTask.timerSeconds = state.timer.seconds;
                storage.saveCurrentTask(state.currentTask);
                this.updateDisplay();
            }
        },

        updateDisplay() {
            elements.timer.textContent = utils.formatTime(state.timer.seconds);
            elements.timer.style.color = utils.getTimerColor(state.timer.seconds);
        }
    };

    // ========================================
    // UI Module
    // ========================================
    const ui = {
        displayTask() {
            const hasTask = !!state.currentTask;

            utils.toggleElement(elements.currentTask, hasTask);
            utils.toggleElement(elements.emptyState, !hasTask);
            utils.toggleElement(elements.addTaskForm, !hasTask);

            if (!hasTask) return;

            elements.taskTitle.textContent = state.currentTask.title;
            elements.taskDescription.textContent = state.currentTask.description || '';
            elements.taskDescription.style.display = state.currentTask.description ? 'block' : 'none';
            
            state.timer.seconds = state.currentTask.timerSeconds || 0;

            const hasTimer = state.currentTask.originalTimer > 0;
            utils.toggleElement(elements.timer, hasTimer);
            utils.toggleElement(elements.timerControls, hasTimer);

            if (hasTimer) {
                timer.updateDisplay();
            }
        },

        displayCompletedTasks() {
            const hasCompleted = state.completedTasks.length > 0;
            utils.toggleElement(elements.completedTasks, hasCompleted);

            if (!hasCompleted) return;

            elements.completedList.innerHTML = '';
            const recentTasks = state.completedTasks.slice(-MAX_COMPLETED_DISPLAY).reverse();

            recentTasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.title;
                li.title = task.description || '';
                elements.completedList.appendChild(li);
            });
        }
    };

    // ========================================
    // Task Management Module
    // ========================================
    const taskManager = {
        addTask(taskData) {
            if (state.currentTask) return;

            const { title, description, hours, minutes, seconds } = taskData;
            const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

            state.currentTask = {
                title,
                description,
                timerSeconds: totalSeconds,
                originalTimer: totalSeconds
            };

            storage.saveCurrentTask(state.currentTask);
            ui.displayTask();
            elements.taskForm.reset();
        },

        completeTask() {
            timer.pause();

            if (state.currentTask) {
                state.completedTasks.push({
                    title: state.currentTask.title,
                    description: state.currentTask.description,
                    completedAt: new Date().toISOString()
                });
                storage.saveCompletedTasks(state.completedTasks);
                ui.displayCompletedTasks();
            }

            state.currentTask = null;
            storage.saveCurrentTask(null);
            ui.displayTask();
        },

        clearCompleted() {
            state.completedTasks = [];
            storage.saveCompletedTasks(state.completedTasks);
            ui.displayCompletedTasks();
        }
    };

    // ========================================
    // Event Handlers
    // ========================================
    const eventHandlers = {
        handleTaskFormSubmit(e) {
            e.preventDefault();

            const taskData = {
                title: document.getElementById('title').value.trim(),
                description: document.getElementById('description').value.trim(),
                hours: parseInt(document.getElementById('hours').value) || 0,
                minutes: parseInt(document.getElementById('minutes').value) || 0,
                seconds: parseInt(document.getElementById('seconds').value) || 0
            };

            taskManager.addTask(taskData);
        }
    };

    // ========================================
    // Initialization
    // ========================================
    function initializeEventListeners() {
        elements.startBtn.addEventListener('click', () => timer.start());
        elements.pauseBtn.addEventListener('click', () => timer.pause());
        elements.resetBtn.addEventListener('click', () => timer.reset());
        elements.completeBtn.addEventListener('click', () => taskManager.completeTask());
        elements.clearCompletedBtn.addEventListener('click', () => taskManager.clearCompleted());
        elements.taskForm.addEventListener('submit', eventHandlers.handleTaskFormSubmit);
    }

    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    function loadInitialData() {
        state.currentTask = storage.loadCurrentTask();
        state.completedTasks = storage.loadCompletedTasks();
        ui.displayTask();
        ui.displayCompletedTasks();
    }

    function init() {
        loadInitialData();
        initializeEventListeners();
        requestNotificationPermission();
    }

    // Start the application
    init();
})();
