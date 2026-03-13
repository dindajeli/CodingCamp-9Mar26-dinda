// Productivity Dashboard - Main Application File

/**
 * Theme Manager Module
 * Manages light/dark mode theme toggle with localStorage persistence
 */
const ThemeManager = (function() {
  const STORAGE_KEY = 'productivity-dashboard-theme';
  let currentTheme = 'light';

  /**
   * Load theme from localStorage
   */
  function loadTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme) {
        currentTheme = JSON.parse(savedTheme);
      }
    } catch (e) {
      currentTheme = 'light';
    }
    applyTheme(currentTheme);
  }

  /**
   * Apply theme to document
   * @param {string} theme - 'light' or 'dark'
   */
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    updateThemeIcon(theme);
  }

  /**
   * Update theme toggle button icon
   * @param {string} theme - Current theme
   */
  function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      // Show moon for light mode (click to go dark), sun for dark mode (click to go light)
      themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTheme));
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  }

  /**
   * Initialize theme manager
   */
  function init() {
    // Load saved theme
    loadTheme();

    // Set up theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  }

  return {
    init
  };
})();


/**
 * Storage Manager Module
 * Provides centralized interface for Local Storage operations with error handling
 * Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2
 */
const StorageManager = (function() {
  let errorCallback = null;

  /**
   * Set error callback for user-facing error messages
   * @param {Function} callback - Function to call with error message
   */
  function setErrorCallback(callback) {
    errorCallback = callback;
  }

  /**
   * Display error to user
   * @param {string} message - Error message to display
   */
  function showError(message) {
    if (errorCallback) {
      errorCallback(message);
    }
  }

  /**
   * Save data to Local Storage with JSON serialization
   * @param {string} key - Storage key
   * @param {*} data - Data to save (will be JSON serialized)
   * @returns {boolean} - True if successful, false if error occurred
   */
  function save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.error('Local Storage quota exceeded. Please clear some data.');
        showError('Storage full. Please delete some tasks or links to continue.');
        return false;
      }
      // Handle access denied or other errors
      console.error('Failed to save to Local Storage:', error);
      showError('Unable to save data. Please check your browser settings.');
      return false;
    }
  }

  /**
   * Load data from Local Storage with JSON deserialization
   * @param {string} key - Storage key
   * @returns {*} - Parsed data, or null if key doesn't exist or parse fails
   */
  function load(key) {
    try {
      const serialized = localStorage.getItem(key);
      
      // Return null for missing keys instead of throwing
      if (serialized === null) {
        return null;
      }
      
      return JSON.parse(serialized);
    } catch (error) {
      // Handle JSON parse errors from corrupted data
      console.error('Failed to parse data from Local Storage:', error);
      showError('Data corrupted. Starting fresh.');
      return null;
    }
  }

  /**
   * Remove data from Local Storage
   * @param {string} key - Storage key to remove
   * @returns {boolean} - True if successful, false if error occurred
   */
  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from Local Storage:', error);
      showError('Unable to delete data. Please check your browser settings.');
      return false;
    }
  }

  // Public interface
  return {
    save,
    load,
    remove,
    setErrorCallback
  };
})();

/**
 * Greeting Module
 * Displays current time, date, and time-appropriate greeting with automatic updates
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
/**
 * Greeting Module
 * Displays current time, date, and time-appropriate greeting with automatic updates
 * Supports custom user names with modal input
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
const GreetingModule = (function() {
  const STORAGE_KEY = 'productivity-dashboard-username';
  let intervalId = null;
  let containerElement = null;
  let userName = null;

  /**
   * Determine greeting based on current hour
   * @param {number} hour - Hour of day (0-23)
   * @returns {string} - Appropriate greeting message
   */
  function getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good afternoon';
    } else {
      // 17-23 and 0-4
      return 'Good evening';
    }
  }

  /**
   * Load user name from Local Storage
   */
  function loadUserName() {
    userName = StorageManager.load(STORAGE_KEY);
  }

  /**
   * Save user name to Local Storage
   * @param {string} name - User name to save
   */
  function saveUserName(name) {
    userName = name.trim();
    StorageManager.save(STORAGE_KEY, userName);
  }

  /**
   * Show the name input modal
   */
  function showNameModal() {
    const modal = document.getElementById('name-modal');
    const nameInput = document.getElementById('name-input');

    if (modal && nameInput) {
      modal.classList.add('active');
      nameInput.value = userName || '';
      nameInput.focus();
    }
  }

  /**
   * Hide the name input modal
   */
  function hideNameModal() {
    const modal = document.getElementById('name-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Handle save name button click
   */
  function handleSaveName() {
    const nameInput = document.getElementById('name-input');
    if (!nameInput) return;

    const name = nameInput.value.trim();
    if (name) {
      saveUserName(name);
      hideNameModal();
      updateDisplay();
    }
  }

  /**
   * Handle cancel button click
   */
  function handleCancelName() {
    hideNameModal();
  }

  /**
   * Update the time, date, and greeting display
   */
  function updateDisplay() {
    if (!containerElement) return;

    const now = new Date();

    // Get DOM elements
    const timeDisplay = containerElement.querySelector('.time-display');
    const dateDisplay = containerElement.querySelector('.date-display');
    const greetingText = document.getElementById('greeting-text');

    // Update time display
    if (timeDisplay) {
      timeDisplay.textContent = now.toLocaleTimeString();
    }

    // Update date display with full format (e.g., "Friday, March 13, 2026")
    if (dateDisplay) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    // Update greeting message with custom name
    if (greetingText) {
      const hour = now.getHours();
      const greeting = getGreeting(hour);
      greetingText.textContent = userName ? `${greeting}, ${userName}!` : `${greeting}!`;
    }
  }

  /**
   * Initialize the greeting module
   * @param {HTMLElement} container - Container element for the greeting display
   */
  function init(container) {
    containerElement = container;

    // Load user name from storage
    loadUserName();

    // Show modal if no name is set (first visit)
    if (!userName) {
      showNameModal();
    }

    // Set up edit name button
    const editNameBtn = document.getElementById('edit-name-btn');
    if (editNameBtn) {
      editNameBtn.addEventListener('click', showNameModal);
    }

    // Set up modal buttons
    const saveNameBtn = document.getElementById('save-name-btn');
    const cancelNameBtn = document.getElementById('cancel-name-btn');
    const nameInput = document.getElementById('name-input');

    if (saveNameBtn) {
      saveNameBtn.addEventListener('click', handleSaveName);
    }

    if (cancelNameBtn) {
      cancelNameBtn.addEventListener('click', handleCancelName);
    }

    // Handle Enter key to save, Escape to cancel
    if (nameInput) {
      nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveName();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelName();
        }
      });
    }

    // Initial display update
    updateDisplay();

    // Set up interval to update every second
    intervalId = setInterval(updateDisplay, 1000);
  }

  /**
   * Cleanup function to stop the interval (useful for testing or cleanup)
   */
  function destroy() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Public interface
  return {
    init,
    destroy,
    getGreeting // Exposed for testing
  };
})()

/**
 * Timer Module
 * Manages 25-minute countdown timer with start, stop, and reset controls
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */
const TimerModule = (function() {
  // Internal state
  const state = {
    totalSeconds: 1500,        // 25 minutes in seconds
    remainingSeconds: 1500,    // Current countdown value
    isRunning: false,          // Timer state
    intervalId: null           // Reference to setInterval
  };

  let containerElement = null;

  /**
   * Format seconds as MM:SS with zero-padding
   * @param {number} seconds - Number of seconds to format
   * @returns {string} - Formatted time string (MM:SS)
   */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    // Zero-pad both minutes and seconds
    const minutesStr = String(minutes).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');
    
    return `${minutesStr}:${secsStr}`;
  }

  /**
   * Update the timer display
   */
  function updateDisplay() {
    if (!containerElement) return;

    const timerDisplay = containerElement.querySelector('.timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(state.remainingSeconds);
    }
  }

  /**
   * Countdown logic - decrements remainingSeconds every second
   */
  function countdown() {
    if (state.remainingSeconds > 0) {
      state.remainingSeconds--;
      updateDisplay();

      // Stop automatically when reaching zero
      if (state.remainingSeconds === 0) {
        stop();
      }
    }
  }

  /**
   * Start the timer countdown
   */
  function start() {
    if (state.isRunning) return; // Already running

    state.isRunning = true;
    state.intervalId = setInterval(countdown, 1000);
  }

  /**
   * Stop (pause) the timer countdown
   */
  function stop() {
    if (!state.isRunning) return; // Already stopped

    state.isRunning = false;
    
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  /**
   * Reset the timer to initial state
   */
  function reset() {
    stop(); // Stop the timer if running
    state.remainingSeconds = state.totalSeconds;
    updateDisplay();
  }

  /**
   * Initialize the timer module
   * @param {HTMLElement} container - Container element for the timer
   */
  function init(container) {
    containerElement = container;

    // Set up event listeners for control buttons
    const startButton = document.getElementById('timer-start');
    const stopButton = document.getElementById('timer-stop');
    const resetButton = document.getElementById('timer-reset');

    if (startButton) {
      startButton.addEventListener('click', start);
    }

    if (stopButton) {
      stopButton.addEventListener('click', stop);
    }

    if (resetButton) {
      resetButton.addEventListener('click', reset);
    }

    // Initial display update
    updateDisplay();
  }

  /**
   * Cleanup function to stop the timer (useful for testing or cleanup)
   */
  function destroy() {
    stop();
  }

  // Public interface
  return {
    init,
    destroy,
    formatTime, // Exposed for testing
    getState: () => ({ ...state }) // Exposed for testing (returns copy)
  };
})();

/**
 * Tasks Module
 * Manages to-do list with add, edit, mark done, delete operations and Local Storage persistence
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
const TasksModule = (function() {
  // Storage key for tasks
  const STORAGE_KEY = 'productivity-dashboard-tasks';

  // Internal state
  const state = {
    tasks: [] // Array of task objects
  };

  let containerElement = null;

  /**
   * Generate unique ID using timestamp + random number
   * @returns {string} - Unique identifier
   */
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Load tasks from Local Storage
   */
  function loadTasks() {
    const loadedTasks = StorageManager.load(STORAGE_KEY);
    
    if (loadedTasks && Array.isArray(loadedTasks)) {
      state.tasks = loadedTasks;
    } else {
      state.tasks = [];
    }
  }

  /**
   * Save tasks to Local Storage
   */
  function saveTasks() {
    return StorageManager.save(STORAGE_KEY, state.tasks);
  }

  /**
   * Validate task text
   * @param {string} text - Task text to validate
   * @returns {object} - { valid: boolean, error: string }
   */
  function validateTaskText(text) {
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, error: 'Task text cannot be empty' };
    }
    
    if (trimmed.length > 500) {
      return { valid: false, error: 'Task text cannot exceed 500 characters' };
    }
    
    return { valid: true, error: '' };
  }

  /**
   * Show validation message
   * @param {string} message - Message to display
   * @param {boolean} isError - Whether this is an error message
   */
  function showValidationMessage(message, isError = true) {
    const validationEl = document.getElementById('task-validation-message');
    if (!validationEl) return;

    validationEl.textContent = message;
    validationEl.className = isError ? 'validation-message error' : 'validation-message success';
    validationEl.style.display = message ? 'block' : 'none';

    // Clear message after 3 seconds
    if (message) {
      setTimeout(() => {
        validationEl.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Update character counter
   * @param {number} currentLength - Current text length
   * @param {number} maxLength - Maximum allowed length
   */
  function updateCharCounter(currentLength, maxLength) {
    const counterEl = document.getElementById('task-char-counter');
    if (!counterEl) return;

    counterEl.textContent = `${currentLength} / ${maxLength}`;
    
    // Add warning class if approaching limit
    if (currentLength > maxLength * 0.9) {
      counterEl.classList.add('warning');
    } else {
      counterEl.classList.remove('warning');
    }
  }

  /**
   * Check if task already exists (case-insensitive)
   * @param {string} text - Task text to check
   * @returns {boolean} - True if duplicate exists
   */
  function isDuplicateTask(text) {
    const trimmedLower = text.trim().toLowerCase();
    return state.tasks.some(task => task.text.toLowerCase() === trimmedLower);
  }

  /**
   * Add a new task
   * @param {string} text - Task text
   * @returns {boolean} - True if task was added successfully
   */
  function addTask(text) {
    const validation = validateTaskText(text);
    
    if (!validation.valid) {
      console.error(validation.error);
      showValidationMessage(validation.error, true);
      return false;
    }

    // Check for duplicate tasks
    if (isDuplicateTask(text)) {
      showValidationMessage('This task already exists', true);
      return false;
    }

    const newTask = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };

    state.tasks.push(newTask);
    const saved = saveTasks();
    
    if (saved) {
      render();
      showValidationMessage('', false); // Clear any previous messages
    }
    
    return saved;
  }

  /**
   * Edit a task's text
   * @param {string} taskId - ID of the task to edit
   * @param {string} newText - New text for the task
   * @returns {boolean} - True if task was edited successfully
   */
  function editTask(taskId, newText) {
    const validation = validateTaskText(newText);
    
    if (!validation.valid) {
      console.error(validation.error);
      return false;
    }

    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error('Task not found');
      return false;
    }

    // Update task text while preserving id, completed, and createdAt
    task.text = newText.trim();
    
    saveTasks();
    render();
    
    return true;
  }

  /**
   * Toggle task completion status
   * @param {string} taskId - ID of the task to toggle
   * @returns {boolean} - True if task was toggled successfully
   */
  function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error('Task not found');
      return false;
    }

    task.completed = !task.completed;
    saveTasks();
    render();
    
    return true;
  }

  /**
   * Delete a task
   * @param {string} taskId - ID of the task to delete
   * @returns {boolean} - True if task was deleted successfully
   */
  function deleteTask(taskId) {
    const initialLength = state.tasks.length;
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    
    if (state.tasks.length === initialLength) {
      console.error('Task not found');
      return false;
    }

    saveTasks();
    render();
    
    return true;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render the task list
   */
  function render() {
    if (!containerElement) return;

    const taskList = containerElement.querySelector('#task-list');
    if (!taskList) return;

    // Check if there are no tasks - show empty state
    if (state.tasks.length === 0) {
      taskList.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>';
      return;
    }

    // Render tasks
    taskList.innerHTML = state.tasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="btn-delete">Delete</button>
      </div>
    `).join('');
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  function handleFormSubmit(event) {
    event.preventDefault();

    const taskInput = document.getElementById('task-input');
    if (!taskInput) return;

    const text = taskInput.value;
    const success = addTask(text);

    if (success) {
      // Clear input after successful add
      taskInput.value = '';
      updateCharCounter(0, 500);
    }
  }

  /**
   * Handle input changes for character counter
   * @param {Event} event - Input event
   */
  function handleTaskInput(event) {
    const input = event.target;
    updateCharCounter(input.value.length, 500);
  }

  /**
   * Handle double-click on task text to enable inline editing
   * @param {Event} event - Double-click event
   */
  function handleTaskDoubleClick(event) {
    const taskText = event.target;
    if (!taskText.classList.contains('task-text')) return;

    const taskItem = taskText.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;
    const currentText = taskText.textContent;

    // Create input element for inline editing
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = currentText;
    input.maxLength = 500;

    // Replace task text with input
    taskText.replaceWith(input);
    input.focus();
    input.select();

    // Save on blur
    input.addEventListener('blur', function() {
      saveEdit(taskId, input.value);
    });

    // Save on Enter key, cancel on Escape
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur(); // Trigger blur event to save
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        render(); // Re-render to restore original state
      }
    });
  }

  /**
   * Save the edited task text
   * @param {string} taskId - ID of the task being edited
   * @param {string} newText - New text value
   */
  function saveEdit(taskId, newText) {
    const success = editTask(taskId, newText);
    
    if (!success) {
      // If validation fails, restore original state
      render();
    }
  }

  /**
   * Handle checkbox click to toggle task completion
   * @param {Event} event - Click event
   */
  function handleCheckboxClick(event) {
    const checkbox = event.target;
    if (!checkbox.classList.contains('task-checkbox')) return;

    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;
    toggleTask(taskId);
  }

  /**
   * Handle delete button click
   * @param {Event} event - Click event
   */
  function handleDeleteClick(event) {
    const deleteBtn = event.target;
    if (!deleteBtn.classList.contains('btn-delete')) return;

    const taskItem = deleteBtn.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;
    deleteTask(taskId);
  }

  /**
   * Initialize the tasks module
   * @param {HTMLElement} container - Container element for the tasks section
   */
  function init(container) {
    containerElement = container;

    // Load tasks from Local Storage
    loadTasks();

    // Set up form submit handler
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', handleFormSubmit);
    }

    // Set up input handler for character counter
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
      taskInput.addEventListener('input', handleTaskInput);
      // Initialize counter
      updateCharCounter(0, 500);
    }

    // Set up event delegation for task list interactions
    const taskList = document.getElementById('task-list');
    if (taskList) {
      // Double-click for editing
      taskList.addEventListener('dblclick', handleTaskDoubleClick);
      
      // Click for checkbox and delete button
      taskList.addEventListener('click', function(event) {
        handleCheckboxClick(event);
        handleDeleteClick(event);
      });
    }

    // Initial render
    render();
  }

  // Public interface
  return {
    init,
    generateId, // Exposed for testing
    addTask, // Exposed for testing
    editTask, // Exposed for testing
    toggleTask, // Exposed for testing
    deleteTask, // Exposed for testing
    validateTaskText, // Exposed for testing
    getTasks: () => [...state.tasks] // Exposed for testing (returns copy)
  };
})();

/**
 * Quick Links Module
 * Manages quick links with add, delete operations and Local Storage persistence
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4
 */
const QuickLinksModule = (function() {
  // Storage key for links
  const STORAGE_KEY = 'productivity-dashboard-links';

  // Internal state
  const state = {
    links: [] // Array of link objects: { id, name, url, createdAt }
  };

  let containerElement = null;

  /**
   * Generate unique ID using timestamp + random number
   * @returns {string} - Unique identifier
   */
  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Load links from Local Storage
   */
  function loadLinks() {
    const loadedLinks = StorageManager.load(STORAGE_KEY);
    
    if (loadedLinks && Array.isArray(loadedLinks)) {
      state.links = loadedLinks;
    } else {
      state.links = [];
    }
  }

  /**
   * Save links to Local Storage
   */
  function saveLinks() {
    return StorageManager.save(STORAGE_KEY, state.links);
  }

  /**
   * Validate link name
   * @param {string} name - Link name to validate
   * @returns {object} - { valid: boolean, error: string }
   */
  function validateLinkName(name) {
    const trimmed = name.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, error: 'Link name cannot be empty' };
    }
    
    if (trimmed.length > 50) {
      return { valid: false, error: 'Link name cannot exceed 50 characters' };
    }
    
    return { valid: true, error: '' };
  }

  /**
   * Normalize URL by adding https:// if protocol is missing
   * @param {string} url - URL to normalize
   * @returns {string} - Normalized URL with protocol
   */
  function normalizeUrl(url) {
    const trimmed = url.trim();
    
    // If already has protocol, return as is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Add https:// by default
    return `https://${trimmed}`;
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {object} - { valid: boolean, error: string }
   */
  function validateUrl(url) {
    const trimmed = url.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, error: 'URL cannot be empty' };
    }
    
    // Basic validation - check if it looks like a URL
    // Allow with or without protocol
    const urlPattern = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/.*)?$/i;
    if (!urlPattern.test(trimmed)) {
      return { valid: false, error: 'Please enter a valid URL (e.g., google.com or https://google.com)' };
    }
    
    return { valid: true, error: '' };
  }

  /**
   * Show validation message
   * @param {string} message - Message to display
   * @param {boolean} isError - Whether this is an error message
   */
  function showValidationMessage(message, isError = true) {
    const validationEl = document.getElementById('link-validation-message');
    if (!validationEl) return;

    validationEl.textContent = message;
    validationEl.className = isError ? 'validation-message error' : 'validation-message success';
    validationEl.style.display = message ? 'block' : 'none';

    // Clear message after 3 seconds
    if (message) {
      setTimeout(() => {
        validationEl.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * Update character counter for link name
   * @param {number} currentLength - Current text length
   * @param {number} maxLength - Maximum allowed length
   */
  function updateCharCounter(currentLength, maxLength) {
    const counterEl = document.getElementById('link-name-char-counter');
    if (!counterEl) return;

    counterEl.textContent = `${currentLength} / ${maxLength}`;
    
    // Add warning class if approaching limit
    if (currentLength > maxLength * 0.9) {
      counterEl.classList.add('warning');
    } else {
      counterEl.classList.remove('warning');
    }
  }

  /**
   * Check if link already exists (case-insensitive name or exact URL match)
   * @param {string} name - Link name to check
   * @param {string} url - Link URL to check
   * @returns {boolean} - True if duplicate exists
   */
  function isDuplicateLink(name, url) {
    const trimmedNameLower = name.trim().toLowerCase();
    const trimmedUrl = url.trim();
    
    return state.links.some(link => 
      link.name.toLowerCase() === trimmedNameLower || 
      link.url === trimmedUrl
    );
  }

  /**
   * Add a new link
   * @param {string} name - Link name
   * @param {string} url - Link URL
   * @returns {boolean} - True if link was added successfully
   */
  function addLink(name, url) {
    const nameValidation = validateLinkName(name);
    if (!nameValidation.valid) {
      console.error(nameValidation.error);
      showValidationMessage(nameValidation.error, true);
      return false;
    }

    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      console.error(urlValidation.error);
      showValidationMessage(urlValidation.error, true);
      return false;
    }

    // Normalize URL (add https:// if missing)
    const normalizedUrl = normalizeUrl(url);

    // Check for duplicate links (by name or URL)
    if (isDuplicateLink(name, normalizedUrl)) {
      showValidationMessage('This link name or URL already exists', true);
      return false;
    }

    const newLink = {
      id: generateId(),
      name: name.trim(),
      url: normalizedUrl,
      createdAt: Date.now()
    };

    state.links.push(newLink);
    const saved = saveLinks();
    
    if (saved) {
      render();
      showValidationMessage('', false); // Clear any previous messages
    }
    
    return saved;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render the link list
   */
  function render() {
    if (!containerElement) return;

    const linkList = containerElement.querySelector('#link-list');
    if (!linkList) return;

    // Check if there are no links - show empty state
    if (state.links.length === 0) {
      linkList.innerHTML = '<p class="empty-state">No links yet. Add one to get started!</p>';
      return;
    }

    // Render links as clickable buttons with delete button
    linkList.innerHTML = state.links.map(link => `
      <div class="link-item" data-id="${link.id}">
        <button class="link-button" data-url="${escapeHtml(link.url)}">
          ${escapeHtml(link.name)}
        </button>
        <button class="btn-delete-link" aria-label="Delete ${escapeHtml(link.name)}"></button>
      </div>
    `).join('');
  }

  /**
   * Delete a link
   * @param {string} linkId - ID of the link to delete
   * @returns {boolean} - True if link was deleted successfully
   */
  function deleteLink(linkId) {
    const initialLength = state.links.length;
    state.links = state.links.filter(link => link.id !== linkId);
    
    if (state.links.length === initialLength) {
      console.error('Link not found');
      return false;
    }

    saveLinks();
    render();
    
    return true;
  }

  /**
   * Handle link button click to open URL in new tab
   * @param {Event} event - Click event
   */
  function handleLinkClick(event) {
    const linkButton = event.target;
    if (!linkButton.classList.contains('link-button')) return;

    const url = linkButton.dataset.url;
    if (url) {
      // Open URL in new tab with security attributes
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Handle delete button click
   * @param {Event} event - Click event
   */
  function handleDeleteClick(event) {
    const deleteBtn = event.target;
    if (!deleteBtn.classList.contains('btn-delete-link')) return;

    const linkItem = deleteBtn.closest('.link-item');
    if (!linkItem) return;

    const linkId = linkItem.dataset.id;
    deleteLink(linkId);
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  function handleFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('link-name-input');
    const urlInput = document.getElementById('link-url-input');
    
    if (!nameInput || !urlInput) return;

    const name = nameInput.value;
    const url = urlInput.value;
    
    const success = addLink(name, url);

    if (success) {
      // Clear inputs after successful add
      nameInput.value = '';
      urlInput.value = '';
      updateCharCounter(0, 50);
    }
  }

  /**
   * Handle input changes for character counter
   * @param {Event} event - Input event
   */
  function handleLinkNameInput(event) {
    const input = event.target;
    updateCharCounter(input.value.length, 50);
  }

  /**
   * Initialize the quick links module
   * @param {HTMLElement} container - Container element for the links section
   */
  function init(container) {
    containerElement = container;

    // Load links from Local Storage
    loadLinks();

    // Set up form submit handler
    const linkForm = document.getElementById('link-form');
    if (linkForm) {
      linkForm.addEventListener('submit', handleFormSubmit);
    }

    // Set up input handler for character counter
    const linkNameInput = document.getElementById('link-name-input');
    if (linkNameInput) {
      linkNameInput.addEventListener('input', handleLinkNameInput);
      // Initialize counter
      updateCharCounter(0, 50);
    }

    // Set up event delegation for link clicks and delete button
    const linkList = document.getElementById('link-list');
    if (linkList) {
      linkList.addEventListener('click', function(event) {
        handleLinkClick(event);
        handleDeleteClick(event);
      });
    }

    // Initial render
    render();
  }

  // Public interface
  return {
    init,
    generateId, // Exposed for testing
    addLink, // Exposed for testing
    deleteLink, // Exposed for testing
    validateLinkName, // Exposed for testing
    validateUrl, // Exposed for testing
    getLinks: () => [...state.links] // Exposed for testing (returns copy)
  };
})();

/**
 * App Initializer
 * Coordinates initialization of all modules when DOM is ready
 * Requirements: 9.4
 */
const App = (function() {
  /**
   * Display global error message
   * @param {string} message - Error message to display
   */
  function showGlobalError(message) {
    // Create error notification if it doesn't exist
    let errorNotification = document.getElementById('global-error-notification');
    
    if (!errorNotification) {
      errorNotification = document.createElement('div');
      errorNotification.id = 'global-error-notification';
      errorNotification.className = 'global-error';
      document.body.appendChild(errorNotification);
    }

    errorNotification.textContent = message;
    errorNotification.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorNotification.style.display = 'none';
    }, 5000);
  }

  function init() {
    try {
      // Set up global error handler for Storage Manager
      StorageManager.setErrorCallback(showGlobalError);

      // Initialize theme manager first
      ThemeManager.init();

      // Get container elements
      const greetingContainer = document.getElementById('greeting-container');
      const timerContainer = document.getElementById('timer-container');
      const tasksContainer = document.getElementById('tasks-container');
      const linksContainer = document.getElementById('links-container');

      // Initialize modules
      if (greetingContainer) {
        GreetingModule.init(greetingContainer);
      }

      if (timerContainer) {
        TimerModule.init(timerContainer);
      }

      if (tasksContainer) {
        TasksModule.init(tasksContainer);
      }

      if (linksContainer) {
        QuickLinksModule.init(linksContainer);
      }

    } catch (error) {
      console.error('Failed to initialize app:', error);
      showGlobalError('Failed to initialize app. Please refresh the page.');
    }
  }

  return {
    init
  };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
