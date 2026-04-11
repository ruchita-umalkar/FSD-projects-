// ===========================
// Blog Application - Main Script
// ===========================

const STORAGE_KEY = 'blogPosts';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize application
function initializeApp() {
    renderPosts();
    setupEventListeners();
    loadPostsFromStorage();
}

// ===========================
// Event Listeners
// ===========================

function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Post form submission
    const postForm = document.getElementById('post-form');
    postForm.addEventListener('submit', handlePostSubmit);

    // Image URL preview
    const imageInput = document.getElementById('post-image');
    imageInput.addEventListener('change', previewImage);
}

// ===========================
// Navigation & Sections
// ===========================

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo(0, 0);
}

// ===========================
// Blog Posts Management
// ===========================

// Get all posts from localStorage
function getPostsFromStorage() {
    const posts = localStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
}

// Save posts to localStorage
function savePostsToStorage(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// Load posts from storage and render them
function loadPostsFromStorage() {
    renderPosts();
}

// Render all blog posts
function renderPosts() {
    const posts = getPostsFromStorage();
    const postsContainer = document.getElementById('posts-container');
    const emptyState = document.getElementById('empty-state');

    // Clear container
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Render posts in reverse order (newest first)
    posts.reverse().forEach((post, index) => {
        const postCard = createPostCard(post, index);
        postsContainer.appendChild(postCard);
    });
}

// Create a post card element
function createPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const truncatedDescription = truncateText(post.content, 100);
    const formattedDate = formatDate(post.date);

    card.innerHTML = `
        <img src="${post.image}" alt="${post.title}" class="post-card-image" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
        <div class="post-card-content">
            <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
            <p class="post-card-description">${escapeHtml(truncatedDescription)}</p>
            <div class="post-card-footer">
                <span class="post-card-date">${formattedDate}</span>
                <button class="post-card-delete" onclick="deletePost(${index})">Delete</button>
            </div>
        </div>
    `;

    // Add click event to open full post
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('post-card-delete')) {
            viewPost(index);
        }
    });

    return card;
}

// View full blog post
function viewPost(index) {
    const posts = getPostsFromStorage();
    const reversedIndex = posts.length - 1 - index;
    const post = posts[reversedIndex];

    if (!post) return;

    const postDetailSection = document.getElementById('post-content-detail');
    const formattedDate = formatDate(post.date);

    postDetailSection.innerHTML = `
        <img src="${post.image}" alt="${post.title}" class="post-detail-image" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'">
        <div class="post-detail-header">
            <h1 class="post-detail-title">${escapeHtml(post.title)}</h1>
            <p class="post-detail-date">Published on ${formattedDate}</p>
        </div>
        <div class="post-detail-content">${escapeHtml(post.content)}</div>
    `;

    showSection('post-detail');
}

// Delete a post
function deletePost(index) {
    const posts = getPostsFromStorage();
    const reversedIndex = posts.length - 1 - index;

    if (confirm('Are you sure you want to delete this post?')) {
        posts.splice(reversedIndex, 1);
        savePostsToStorage(posts);
        renderPosts();
        showSection('home');
    }
}

// ===========================
// Form Handling
// ===========================

function handlePostSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const image = document.getElementById('post-image').value.trim();
    const content = document.getElementById('post-content').value.trim();

    if (!title || !image || !content) {
        alert('Please fill in all required fields');
        return;
    }

    // Create new post
    const newPost = {
        title: title,
        image: image,
        content: content,
        date: new Date().toISOString()
    };

    // Get existing posts
    const posts = getPostsFromStorage();
    posts.push(newPost);

    // Save to storage
    savePostsToStorage(posts);

    // Reset form
    e.target.reset();
    document.getElementById('image-preview').classList.remove('show');

    // Show success message
    alert('Post published successfully!');

    // Render posts
    renderPosts();

    // Navigate to home
    showSection('home');
}

function previewImage(e) {
    const imageUrl = e.target.value;
    const preview = document.getElementById('image-preview');

    if (imageUrl) {
        preview.style.backgroundImage = `url('${imageUrl}')`;
        preview.classList.add('show');
    } else {
        preview.classList.remove('show');
    }
}

// ===========================
// Utility Functions
// ===========================

// Truncate text to specified length
function truncateText(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Format date to readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML special characters to prevent XSS
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