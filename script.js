/* ============================================
   Notes Manager - JavaScript Functionality
   Handles all note CRUD operations and localStorage
   ============================================ */

// Initialize notes from localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let editingNoteId = null;

// DOM Elements
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const closeBtn = document.querySelector('.close');
const modalTitle = document.getElementById('modalTitle');
const cancelBtn = document.querySelector('.btn-cancel');

// Event Listeners
addNoteBtn.addEventListener('click', openAddNoteModal);
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
window.addEventListener('click', closeModalOnOutsideClick);
noteForm.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', handleSearch);

// ============================================
// Core Functions
// ============================================

/**
 * Open modal for adding a new note
 */
function openAddNoteModal() {
    editingNoteId = null;
    noteForm.reset();
    modalTitle.textContent = 'Add New Note';
    noteModal.style.display = 'block';
    noteTitle.focus();
}

/**
 * Open modal for editing an existing note
 * @param {string} id - The unique ID of the note to edit
 */
function openEditNoteModal(id) {
    editingNoteId = id;
    const note = notes.find(n => n.id === id);
    
    if (note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
        modalTitle.textContent = 'Edit Note';
        noteModal.style.display = 'block';
        noteTitle.focus();
    }
}

/**
 * Close the modal
 */
function closeModal() {
    noteModal.style.display = 'none';
    noteForm.reset();
    editingNoteId = null;
}

/**
 * Close modal when clicking outside of it
 */
function closeModalOnOutsideClick(event) {
    if (event.target === noteModal) {
        closeModal();
    }
}

/**
 * Handle form submission (add or edit note)
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }

    if (editingNoteId) {
        // Edit existing note
        const note = notes.find(n => n.id === editingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.edited = new Date().toISOString();
        }
    } else {
        // Add new note
        const newNote = {
            id: generateId(),
            title: title,
            content: content,
            created: new Date().toISOString(),
            edited: null
        };
        notes.push(newNote);
    }

    // Save and refresh
    saveNotes();
    renderNotes();
    closeModal();
}

/**
 * Delete a note with confirmation
 */
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
    }
}

/**
 * Save notes to localStorage
 */
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// ============================================
// Search & Filter
// ============================================

/**
 * Handle search input
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    renderNotes(searchTerm);
}

/**
 * Filter notes based on search term
 */
function filterNotes(searchTerm) {
    if (!searchTerm) {
        return notes;
    }

    return notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
    );
}

// ============================================
// Rendering
// ============================================

/**
 * Render all or filtered notes
 */
function renderNotes(searchTerm = '') {
    const filteredNotes = filterNotes(searchTerm);
    notesContainer.innerHTML = '';

    // Show empty state if no notes
    if (filteredNotes.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Create note cards
    filteredNotes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesContainer.appendChild(noteCard);
    });
}

/**
 * Create a note card element
 */
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';

    const createdDate = new Date(note.created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const editedInfo = note.edited 
        ? `(Edited: ${new Date(note.edited).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })})`
        : '';

    card.innerHTML = `
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <p class="note-content">${escapeHtml(note.content)}</p>
        <small class="note-timestamp">Created: ${createdDate} ${editedInfo}</small>
        <div class="note-actions">
            <button class="btn-edit" onclick="openEditNoteModal('${note.id}')">Edit</button>
            <button class="btn-delete" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
    `;

    return card;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID for new notes
 */
function generateId() {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize on page load
renderNotes();