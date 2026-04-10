// --- Wait for DOM ---
document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
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
        const pass = passwordInput.value;
        
        // --- STRICT VALIDATION LOGIC ---
        // Validate Alphanumeric User
        const userRegex = /^[a-zA-Z0-9]+$/;
        if (!userRegex.test(user)) {
            showToast('⚠️ Error: Usuario sólo debe contener letras o números.');
            return;
        }
        
        // Validate Length
        if (user.length < 4) {
            showToast('⚠️ Error: Usuario muy corto (mínimo 4 caracteres).');
            return;
        }
        if (pass.length < 6) {
            showToast('⚠️ Error: Clave muy corta (mínimo 6 caracteres).');
            return;
        }

        login(user);
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
        renderNotes(false);
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
        
        // Re-render and inject new note smoothly
        renderNotes(true);
        
        showToast('Nota guardada');
        newNoteForm.reset();
        newNoteForm.classList.add('hidden-view');
    });

    // We expose this so DOM nodes can trigger delete smoothly
    window.handleDeleteNote = function(id, nodeElem) {
        // Trigger CSS exit animation
        nodeElem.classList.add('slide-out');
        
        // Wait for Web Animations / Keyframe to complete
        setTimeout(() => {
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            renderNotes(false);
            showToast('Nota eliminada');
        }, 300); // 300ms matches CSS Outwards Keyframe
    }

    function renderNotes(animatedInsert) {
        notesList.innerHTML = '';
        
        if (notes.length === 0) {
            notesList.innerHTML = '<div class="empty-state delayed-fade">No hay notas todavía. ¡Crea la primera!</div>';
            return;
        }

        notes.forEach((note, index) => {
            const dateObj = new Date(note.date);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const div = document.createElement('div');
            // Adding dynamic base classes. If it's a new insert and it's the very first element:
            div.className = (animatedInsert && index === 0) ? 'note-item slide-in' : 'note-item';
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
            delBtn.addEventListener('click', function() {
                window.handleDeleteNote(note.id, div);
            });
            
            notesList.appendChild(div);
        });
    }

    // --- Utils ---
    function showToast(msg) {
        toastElem.textContent = msg;
        toastElem.classList.remove('hidden');
        toastElem.classList.remove('show');
        
        // Force reflow
        void toastElem.offsetWidth; 
        
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

    // --- ACDP LIVE MONITOR POLLING LOGIC ---
    let lastLogCount = 0;
    const radarScreen = document.getElementById('radar-screen');
    const radarPanel = document.getElementById('acdp-radar');
    const radarToggle = document.getElementById('radar-toggle');

    if(radarToggle) {
        radarToggle.addEventListener('click', () => {
            radarPanel.classList.toggle('closed');
            radarToggle.textContent = radarPanel.classList.contains('closed') ? '📡' : '_';
        });
    }

    function buildLogHTML(log) {
        let colorClass = 'log-default';
        let prefix = '➤';
        if (log.type === 'intent') { colorClass = 'log-blue'; prefix = '💡'; }
        if (log.type === 'lock') { colorClass = 'log-red'; prefix = '🔒'; }
        if (log.type === 'release') { colorClass = 'log-green'; prefix = '🔓'; }
        if (log.type === 'complete') { colorClass = 'log-yellow'; prefix = '✅'; }

        const time = new Date(log.timestamp).toLocaleTimeString();
        let payloadString = '';
        if(log.payload.resource) payloadString += ` [${log.payload.resource}]`;
        if(log.payload.description) payloadString += ` - ${log.payload.description}`;

        return `<div class="radar-log slide-up ${colorClass}">
                    <span class="log-time">[${time}]</span> 
                    <strong>${log.agent_id}</strong> 
                    ${prefix} <span style="font-weight:700;">${log.type.toUpperCase()}</span>${payloadString}
                </div>`;
    }

    function fetchACDPLogs() {
        fetch('/api/logs')
            .then(res => res.json())
            .then(data => {
                if(data.length > lastLogCount) {
                    // New Logs identified!
                    const newLogs = data.slice(lastLogCount);
                    newLogs.forEach(log => {
                        radarScreen.insertAdjacentHTML('beforeend', buildLogHTML(log));
                    });
                    
                    lastLogCount = data.length;
                    radarScreen.scrollTop = radarScreen.scrollHeight; // Auto-scroll
                    
                    // Auto open radar if critical architecture event happens locally
                    if(radarPanel && newLogs.some(l => ['lock', 'release', 'intent', 'complete'].includes(l.type))) {
                       if (radarPanel.classList.contains('closed')) {
                           radarPanel.classList.remove('closed');
                           radarToggle.textContent = '_';
                       }
                    }
                }
            })
            // Ignore fetch errors to prevent polluting user network tab if server is down
            .catch(err => { /* Monitor server.js not running, gracefully degraded */ }); 
    }

    // Ping API every 1500 MS to detect any protocol events
    setInterval(fetchACDPLogs, 1500);

});
