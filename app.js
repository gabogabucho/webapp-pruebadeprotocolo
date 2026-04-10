// --- Wait for DOM ---
document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const avatarInitials = document.getElementById('avatar-initials');
    const displayName = document.getElementById('display-name');
    const logoutBtn = document.getElementById('logout-btn');
    const toastElem = document.getElementById('toast');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // DB / Notes Elements
    const addNoteBtn = document.getElementById('add-note-btn');
    const newNoteForm = document.getElementById('new-note-form');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');
    const noteTitleInput = document.getElementById('note-title');
    const notesList = document.getElementById('notes-list');

    // State
    const DB_KEY = 'webapp_pcad_notes';
    let currentUser = null;
    let notes = [];

    // --- Theme Initialization ---
    initTheme();

    function initTheme() {
        const savedTheme = localStorage.getItem('webapp_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if(themeToggleBtn) themeToggleBtn.textContent = '☀️';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if(themeToggleBtn) themeToggleBtn.textContent = '🌙';
        }
    }

    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('webapp_theme', 'light');
                themeToggleBtn.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('webapp_theme', 'dark');
                themeToggleBtn.textContent = '☀️';
            }
        });
    }

    // --- Initialization ---
    checkAuthSession();

    // --- Authentication Flow ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = usernameInput.value.trim();
        if (user) {
            login(user);
        }
    });

    logoutBtn.addEventListener('click', logout);

    function login(username) {
        currentUser = username;
        localStorage.setItem('auth_user', username);
        
        // Update UI
        avatarInitials.textContent = username.charAt(0).toUpperCase();
        displayName.textContent = username;

        // Transition views
        loginView.classList.replace('active-view', 'hidden-view');
        dashboardView.classList.replace('hidden-view', 'active-view');
        
        showToast(`¡Bienvenido de nuevo, ${username}!`);
        loadNotes();
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('auth_user');
        
        // Transition views
        dashboardView.classList.replace('active-view', 'hidden-view');
        loginView.classList.replace('hidden-view', 'active-view');
        
        // Reset inputs
        loginForm.reset();
        
        showToast('Sesión cerrada correctamente');
    }

    function checkAuthSession() {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            login(savedUser);
        }
    }

    // --- Local Database (Notes) Flow ---
    function loadNotes() {
        try {
            const stored = localStorage.getItem(DB_KEY);
            notes = stored ? JSON.parse(stored) : [];
        } catch (err) {
            notes = [];
        }
        renderNotes();
    }

    function saveNotes() {
        localStorage.setItem(DB_KEY, JSON.stringify(notes));
    }

    // UI Interactions for Notes
    addNoteBtn.addEventListener('click', () => {
        newNoteForm.classList.remove('hidden-view');
        noteTitleInput.focus();
    });

    cancelNoteBtn.addEventListener('click', () => {
        newNoteForm.classList.add('hidden-view');
        newNoteForm.reset();
    });

    newNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = noteTitleInput.value.trim();
        if (!title) return;

        const newNote = {
            id: Date.now().toString(),
            title: title,
            date: new Date().toISOString()
        };

        notes.unshift(newNote);
        saveNotes();
        renderNotes();
        
        showToast('Nota guardada');
        newNoteForm.reset();
        newNoteForm.classList.add('hidden-view');
    });

    function deleteNote(id) {
        notes = notes.filter(n => n.id !== id);
        saveNotes();
        renderNotes();
        showToast('Nota eliminada');
    }

    function renderNotes() {
        notesList.innerHTML = '';
        
        if (notes.length === 0) {
            notesList.innerHTML = '<div class="empty-state">No hay notas todavía. ¡Crea la primera!</div>';
            return;
        }

        notes.forEach(note => {
            const dateObj = new Date(note.date);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const div = document.createElement('div');
            div.className = 'note-item';
            div.innerHTML = `
                <div class="note-content">
                    <p>${escapeHTML(note.title)}</p>
                    <div class="note-date">${dateStr}</div>
                </div>
                <button class="delete-btn" data-id="${note.id}" title="Eliminar nota">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            `;
            
            const delBtn = div.querySelector('.delete-btn');
            delBtn.addEventListener('click', () => deleteNote(note.id));
            
            notesList.appendChild(div);
        });
    }

    // --- Utils ---
    function showToast(msg) {
        toastElem.textContent = msg;
        toastElem.classList.remove('hidden');
        toastElem.classList.add('show');
        
        setTimeout(() => {
            toastElem.classList.remove('show');
            setTimeout(() => toastElem.classList.add('hidden'), 300);
        }, 3000);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }
});
