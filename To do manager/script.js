// Version 1: Modern Glassmorphism Design - JavaScript

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const completedCount = document.getElementById('completedCount');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingId = null;

// Initialize app
function init() {
  renderTasks();
  updateCounter();
}

/**
 * Add new task
 */
function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;

  if (editingId) {
    // Update existing task
    tasks = tasks.map(task =>
      task.id === editingId ? { ...task, title } : task
    );
    editingId = null;
    addBtn.textContent = '+';
  } else {
    // Create new task
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date().toLocaleString()
    };
    tasks.unshift(newTask);
  }

  taskInput.value = '';
  taskInput.focus();
  saveTasks();
  renderTasks();
  updateCounter();
}

/**
 * Delete task
 */
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  updateCounter();
}

/**
 * Toggle task completion
 */
function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
  updateCounter();
}

/**
 * Edit task
 */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    editingId = id;
    taskInput.value = task.title;
    taskInput.focus();
    addBtn.textContent = '✓';
  }
}

/**
 * Render tasks based on filter
 */
function renderTasks() {
  taskList.innerHTML = '';

  let filteredTasks = tasks;
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  }

  if (filteredTasks.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-state';
    emptyLi.textContent =
      currentFilter === 'all'
        ? 'No tasks yet. Add one to get started! 🚀'
        : currentFilter === 'active'
        ? 'No active tasks. You\'re all caught up! 🎉'
        : 'No completed tasks yet.';
    taskList.appendChild(emptyLi);
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    // Task text
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.title;

    // Actions container
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = '✎';
    editBtn.addEventListener('click', () => editTask(task.id));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

/**
 * Update task counter
 */
function updateCounter() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  taskCount.textContent = total;
  completedCount.textContent = completed;
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Clear all completed tasks
 */
function clearCompleted() {
  if (confirm('Clear all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    updateCounter();
  }
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

clearBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Initialize on page load
window.addEventListener('load', init);