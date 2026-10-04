const DEFAULT_ACCESS_PASSWORD = "Hg99";
const MASTER_DELETE_PASSWORD = "Hg88";

const STORAGE_KEYS = {
    accessPassword: "metas016_access_password",
    goals: "metas016_goals",
    tasks: "metas016_tasks",
    notes: "metas016_notes",
    theme: "metas016_theme",
    viewer: "metas016_viewer_mode",
    timeFormat: "metas016_time_format",
    timerSeconds: "metas016_timer_seconds"
};

const state = {
    accessPassword: localStorage.getItem(STORAGE_KEYS.accessPassword) || DEFAULT_ACCESS_PASSWORD,
    goals: loadJSON(STORAGE_KEYS.goals, []),
    tasks: loadJSON(STORAGE_KEYS.tasks, []),
    notes: loadJSON(STORAGE_KEYS.notes, []),
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "dark",
    viewer: localStorage.getItem(STORAGE_KEYS.viewer) === "true",
    timeFormat: localStorage.getItem(STORAGE_KEYS.timeFormat) || "24",
    timerSeconds: Number(localStorage.getItem(STORAGE_KEYS.timerSeconds) || 0),
    timerRunning: false,
    timerInterval: null,
    detailOrigin: "home",
    detailType: null,
    detailId: null
};

document.addEventListener("DOMContentLoaded", () => {
    setupApp();
});

function loadJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function setupApp() {
    applyTheme();
    applyViewerMode();
    setupNavigation();
    setupLogin();
    setupGoals();
    setupTasks();
    setupNotes();
    setupTimer();
    setupProgress();
    setupSettings();
    setupAbout();
    updateClock();
    setInterval(updateClock, 1000);
    updateAll();
    registerServiceWorker();
}

function $(id) {
    return document.getElementById(id);
}

/* =========================
   NAVEGAÇÃO
========================= */

const screenIds = [
    "loginScreen",
    "homeScreen",
    "goalsScreen",
    "tasksScreen",
    "notesScreen",
    "timerScreen",
    "progressScreen",
    "settingsScreen",
    "aboutScreen",
    "detailScreen"
];

function showScreen(screenId) {
    screenIds.forEach(id => {
        const element = $(id);
        if (element) {
            element.classList.add("hidden");
        }
    });

    const target = $(screenId);

    if (target) {
        target.classList.remove("hidden");
    }

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    if (screenId === "progressScreen") {
        renderProgress();
    }

    if (screenId === "settingsScreen") {
        updateSettingsButtons();
    }
}

function setupNavigation() {
    const menuMap = {
        goalsCard: "goalsScreen",
        tasksCard: "tasksScreen",
        notesCard: "notesScreen",
        timerCard: "timerScreen",
        progressCard: "progressScreen",
        settingsCard: "settingsScreen"
    };

    Object.entries(menuMap).forEach(([buttonId, screenId]) => {
        const button = $(buttonId);

        if (button) {
            button.addEventListener("click", () => {
                showScreen(screenId);
            });
        }
    });

    document.querySelectorAll("[data-back]").forEach(button => {
        button.addEventListener("click", () => {
            showScreen(button.dataset.back);
        });
    });

    const homeBackButtons = document.querySelectorAll(".back-home");

    homeBackButtons.forEach(button => {
        button.addEventListener("click", () => {
            showScreen("homeScreen");
        });
    });
}

/* =========================
   LOGIN
========================= */

function setupLogin() {
    const loginButton = $("loginButton");
    const passwordInput = $("passwordInput");

    if (loginButton) {
        loginButton.addEventListener("click", login);
    }

    if (passwordInput) {
        passwordInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                login();
            }
        });
    }
}

function login() {
    const passwordInput = $("passwordInput");
    const loginMessage = $("loginMessage");

    if (!passwordInput) return;

    const password = passwordInput.value;

    if (password === state.accessPassword) {
        passwordInput.value = "";

        if (loginMessage) {
            loginMessage.textContent = "";
        }

        showScreen("homeScreen");
        return;
    }

    if (loginMessage) {
        loginMessage.textContent = "Senha incorreta.";
    }
}

function lockSite() {
    if (state.timerRunning) {
        pauseTimer();
    }

    closeAllModals();

    const passwordInput = $("passwordInput");
    const loginMessage = $("loginMessage");

    if (passwordInput) {
        passwordInput.value = "";
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }

    showScreen("loginScreen");
}

/* =========================
   RELÓGIO
========================= */

function updateClock() {
    const now = new Date();

    const dateElement = $("currentDate");
    const timeElement = $("currentTime");

    if (dateElement) {
        dateElement.textContent = formatDate(now);
    }

    if (timeElement) {
        timeElement.textContent = formatTime(now);
    }

    updateItemDates();
}

function formatDate(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function formatTime(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: state.timeFormat === "12"
    }).format(date);
}

function formatDateTime(iso) {
    const date = new Date(iso);

    return `${formatDate(date)} • ${formatTime(date)}`;
}

function updateItemDates() {
    document.querySelectorAll("[data-created-at]").forEach(element => {
        const date = element.dataset.createdAt;

        if (date) {
            element.textContent = formatDateTime(date);
        }
    });
}

/* =========================
   METAS
========================= */

function setupGoals() {
    const addButton = $("addGoalButton");
    const shareButton = $("shareGoalsButton");
    const searchInput = $("goalSearch");

    if (addButton) {
        addButton.addEventListener("click", () => {
            if (state.viewer) return;

            openGoalEditor();
        });
    }

    if (shareButton) {
        shareButton.addEventListener("click", shareGoals);
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderGoals);
    }

    renderGoals();
}

function renderGoals() {
    const container = $("goalsList");

    if (!container) return;

    const searchInput = $("goalSearch");
    const search = normalizeText(searchInput ? searchInput.value : "");

    let goals = state.goals.filter(goal => {
        return normalizeText(goal.title).includes(search);
    });

    goals.sort(sortItems);

    container.innerHTML = "";

    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Nenhuma meta encontrada.
            </div>
        `;
        return;
    }

    goals.forEach(goal => {
        const card = document.createElement("div");
        card.className = "item-card";

        if (goal.completed) {
            card.classList.add("completed");
        }

        if (goal.pinned) {
            card.classList.add("pinned");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = Boolean(goal.completed);
        checkbox.title = goal.completed ? "Meta concluída" : "Marcar como concluída";
        checkbox.disabled = state.viewer;

        checkbox.addEventListener("change", () => {
            if (state.viewer) return;

            goal.completed = checkbox.checked;
            saveJSON(STORAGE_KEYS.goals, state.goals);

            renderGoals();
            renderProgress();
        });

        const content = document.createElement("div");
        content.className = "item-main";

        const title = document.createElement("button");
        title.className = "item-title";
        title.textContent = goal.title || "Meta sem título";

        title.addEventListener("click", () => {
            openDetail("goal", goal.id, "goalsScreen");
        });

        const meta = document.createElement("div");
        meta.className = "item-date";
        meta.dataset.createdAt = goal.createdAt;
        meta.textContent = formatDateTime(goal.createdAt);

        content.appendChild(title);
        content.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "item-actions";

        if (goal.pinned) {
            const pinLabel = document.createElement("span");
            pinLabel.className = "pin-indicator";
            pinLabel.textContent = "📌";
            pinLabel.title = "Fixada";
            actions.appendChild(pinLabel);
        }

        if (!state.viewer) {
            const pinButton = createSmallButton(
                "📌",
                "Fixar/desafixar",
                "pin-button",
                () => togglePin("goal", goal.id)
            );

            const editButton = createSmallButton(
                "✏️",
                "Editar",
                "edit-button",
                () => openGoalEditor(goal)
            );

            const deleteButton = createSmallButton(
                "🗑️",
                "Excluir",
                "delete-button",
                () => deleteItem("goal", goal.id)
            );

            actions.appendChild(pinButton);
            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
        }

        card.appendChild(checkbox);
        card.appendChild(content);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

function openGoalEditor(goal = null) {
    const editing = Boolean(goal);

    const html = `
        <div class="form-group">
            <label for="modalTitle">Título</label>
            <input id="modalTitle" type="text" maxlength="120"
                value="${escapeAttribute(goal?.title || "")}"
                placeholder="Título da meta">
        </div>

        <div class="form-group">
            <label for="modalContent">Descrição</label>
            <textarea id="modalContent" rows="6"
                placeholder="Descreva sua meta">${escapeHTML(goal?.content || "")}</textarea>
        </div>
    `;

    showModal({
        title: editing ? "Editar meta" : "Nova meta",
        content: html,
        buttons: [
            {
                text: "Cancelar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: editing ? "Salvar" : "Adicionar",
                className: "primary-button",
                action: () => {
                    const titleInput = $("modalTitle");
                    const contentInput = $("modalContent");

                    const title = titleInput ? titleInput.value.trim() : "";
                    const content = contentInput ? contentInput.value.trim() : "";

                    if (!title) {
                        showModalMessage("Digite um título para a meta.");
                        return;
                    }

                    if (editing) {
                        goal.title = title;
                        goal.content = content;
                    } else {
                        state.goals.push({
                            id: generateId(),
                            title,
                            content,
                            completed: false,
                            pinned: false,
                            createdAt: new Date().toISOString()
                        });
                    }

                    saveJSON(STORAGE_KEYS.goals, state.goals);

                    closeAllModals();
                    renderGoals();
                    renderProgress();
                }
            }
        ]
    });
}

async function shareGoals() {
    if (state.goals.length === 0) {
        showToast("Não há metas para compartilhar.");
        return;
    }

    const text = state.goals
        .slice()
        .sort(sortItems)
        .map((goal, index) => {
            return `${index + 1}. ${goal.title}
Status: ${goal.completed ? "Concluída" : "Em andamento"}
Criada: ${formatDateTime(goal.createdAt)}
${goal.content || ""}`;
        })
        .join("\n\n");

    await shareContent("Minhas metas", `🎯 METAS\n\n${text}`);
}

/* =========================
   TAREFAS
========================= */

function setupTasks() {
    const addButton = $("addTaskButton");
    const shareButton = $("shareTasksButton");
    const searchInput = $("taskSearch");

    if (addButton) {
        addButton.addEventListener("click", () => {
            if (state.viewer) return;

            openTaskEditor();
        });
    }

    if (shareButton) {
        shareButton.addEventListener("click", shareTasks);
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderTasks);
    }

    renderTasks();
}

function renderTasks() {
    const container = $("tasksList");

    if (!container) return;

    const searchInput = $("taskSearch");
    const search = normalizeText(searchInput ? searchInput.value : "");

    let tasks = state.tasks.filter(task => {
        return normalizeText(task.title).includes(search);
    });

    tasks.sort(sortItems);

    container.innerHTML = "";

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Nenhuma tarefa encontrada.
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "item-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        if (task.pinned) {
            card.classList.add("pinned");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = Boolean(task.completed);
        checkbox.title = task.completed ? "Tarefa concluída" : "Marcar como concluída";
        checkbox.disabled = state.viewer;

        checkbox.addEventListener("change", () => {
            if (state.viewer) return;

            task.completed = checkbox.checked;
            saveJSON(STORAGE_KEYS.tasks, state.tasks);

            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "item-main";

        const title = document.createElement("button");
        title.className = "item-title";
        title.textContent = task.title || "Tarefa sem título";

        title.addEventListener("click", () => {
            openDetail("task", task.id, "tasksScreen");
        });

        const meta = document.createElement("div");
        meta.className = "item-date";
        meta.dataset.createdAt = task.createdAt;
        meta.textContent = formatDateTime(task.createdAt);

        content.appendChild(title);
        content.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "item-actions";

        if (task.pinned) {
            const pinLabel = document.createElement("span");
            pinLabel.className = "pin-indicator";
            pinLabel.textContent = "📌";
            pinLabel.title = "Fixada";
            actions.appendChild(pinLabel);
        }

        if (!state.viewer) {
            actions.appendChild(
                createSmallButton(
                    "📌",
                    "Fixar/desafixar",
                    "pin-button",
                    () => togglePin("task", task.id)
                )
            );

            actions.appendChild(
                createSmallButton(
                    "✏️",
                    "Editar",
                    "edit-button",
                    () => openTaskEditor(task)
                )
            );

            actions.appendChild(
                createSmallButton(
                    "🗑️",
                    "Excluir",
                    "delete-button",
                    () => deleteItem("task", task.id)
                )
            );
        }

        card.appendChild(checkbox);
        card.appendChild(content);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

function openTaskEditor(task = null) {
    const editing = Boolean(task);

    const html = `
        <div class="form-group">
            <label for="modalTitle">Título</label>
            <input id="modalTitle" type="text" maxlength="120"
                value="${escapeAttribute(task?.title || "")}"
                placeholder="Título da tarefa">
        </div>

        <div class="form-group">
            <label for="modalContent">Descrição</label>
            <textarea id="modalContent" rows="6"
                placeholder="Descreva a tarefa">${escapeHTML(task?.content || "")}</textarea>
        </div>
    `;

    showModal({
        title: editing ? "Editar tarefa" : "Nova tarefa",
        content: html,
        buttons: [
            {
                text: "Cancelar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: editing ? "Salvar" : "Adicionar",
                className: "primary-button",
                action: () => {
                    const titleInput = $("modalTitle");
                    const contentInput = $("modalContent");

                    const title = titleInput ? titleInput.value.trim() : "";
                    const content = contentInput ? contentInput.value.trim() : "";

                    if (!title) {
                        showModalMessage("Digite um título para a tarefa.");
                        return;
                    }

                    if (editing) {
                        task.title = title;
                        task.content = content;
                    } else {
                        state.tasks.push({
                            id: generateId(),
                            title,
                            content,
                            completed: false,
                            pinned: false,
                            createdAt: new Date().toISOString()
                        });
                    }

                    saveJSON(STORAGE_KEYS.tasks, state.tasks);

                    closeAllModals();
                    renderTasks();
                }
            }
        ]
    });
}

async function shareTasks() {
    if (state.tasks.length === 0) {
        showToast("Não há tarefas para compartilhar.");
        return;
    }

    const text = state.tasks
        .slice()
        .sort(sortItems)
        .map((task, index) => {
            return `${index + 1}. ${task.title}
Status: ${task.completed ? "Concluída" : "Em andamento"}
Criada: ${formatDateTime(task.createdAt)}
${task.content || ""}`;
        })
        .join("\n\n");

    await shareContent("Minhas tarefas", `📋 TAREFAS\n\n${text}`);
}

/* =========================
   NOTAS
========================= */

function setupNotes() {
    const addButton = $("addNoteButton");
    const shareButton = $("shareNotesButton");
    const searchInput = $("noteSearch");

    if (addButton) {
        addButton.addEventListener("click", () => {
            if (state.viewer) return;

            openNoteEditor();
        });
    }

    if (shareButton) {
        shareButton.addEventListener("click", shareNotes);
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderNotes);
    }

    renderNotes();
}

function renderNotes() {
    const container = $("notesList");

    if (!container) return;

    const searchInput = $("noteSearch");
    const search = normalizeText(searchInput ? searchInput.value : "");

    let notes = state.notes.filter(note => {
        return normalizeText(note.title).includes(search);
    });

    notes.sort(sortItems);

    container.innerHTML = "";

    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Nenhuma nota encontrada.
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const card = document.createElement("div");
        card.className = "item-card";

        if (note.pinned) {
            card.classList.add("pinned");
        }

        const content = document.createElement("div");
        content.className = "item-main";

        const title = document.createElement("button");
        title.className = "item-title";
        title.textContent = note.title || "Nota sem título";

        title.addEventListener("click", () => {
            openDetail("note", note.id, "notesScreen");
        });

        const meta = document.createElement("div");
        meta.className = "item-date";
        meta.dataset.createdAt = note.createdAt;
        meta.textContent = formatDateTime(note.createdAt);

        content.appendChild(title);
        content.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "item-actions";

        if (note.pinned) {
            const pinLabel = document.createElement("span");
            pinLabel.className = "pin-indicator";
            pinLabel.textContent = "📌";
            pinLabel.title = "Fixada";
            actions.appendChild(pinLabel);
        }

        if (!state.viewer) {
            actions.appendChild(
                createSmallButton(
                    "📌",
                    "Fixar/desafixar",
                    "pin-button",
                    () => togglePin("note", note.id)
                )
            );

            actions.appendChild(
                createSmallButton(
                    "✏️",
                    "Editar",
                    "edit-button",
                    () => openNoteEditor(note)
                )
            );

            actions.appendChild(
                createSmallButton(
                    "🗑️",
                    "Excluir",
                    "delete-button",
                    () => deleteItem("note", note.id)
                )
            );
        }

        card.appendChild(content);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

function openNoteEditor(note = null) {
    const editing = Boolean(note);

    const html = `
        <div class="form-group">
            <label for="modalTitle">Título</label>
            <input id="modalTitle" type="text" maxlength="120"
                value="${escapeAttribute(note?.title || "")}"
                placeholder="Título da nota">
        </div>

        <div class="form-group">
            <label for="modalContent">Conteúdo</label>
            <textarea id="modalContent" rows="8"
                placeholder="Escreva sua nota">${escapeHTML(note?.content || "")}</textarea>
        </div>
    `;

    showModal({
        title: editing ? "Editar nota" : "Nova nota",
        content: html,
        buttons: [
            {
                text: "Cancelar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: editing ? "Salvar" : "Adicionar",
                className: "primary-button",
                action: () => {
                    const titleInput = $("modalTitle");
                    const contentInput = $("modalContent");

                    const title = titleInput ? titleInput.value.trim() : "";
                    const content = contentInput ? contentInput.value.trim() : "";

                    if (!title) {
                        showModalMessage("Digite um título para a nota.");
                        return;
                    }

                    if (editing) {
                        note.title = title;
                        note.content = content;
                    } else {
                        state.notes.push({
                            id: generateId(),
                            title,
                            content,
                            pinned: false,
                            createdAt: new Date().toISOString()
                        });
                    }

                    saveJSON(STORAGE_KEYS.notes, state.notes);

                    closeAllModals();
                    renderNotes();
                }
            }
        ]
    });
}

async function shareNotes() {
    if (state.notes.length === 0) {
        showToast("Não há notas para compartilhar.");
        return;
    }

    const text = state.notes
        .slice()
        .sort(sortItems)
        .map((note, index) => {
            return `${index + 1}. ${note.title}
Criada: ${formatDateTime(note.createdAt)}

${note.content || ""}`;
        })
        .join("\n\n--------------------\n\n");

    await shareContent("Minhas notas", `📝 NOTAS\n\n${text}`);
}

/* =========================
   DETALHES
========================= */

function ensureDetailScreen() {
    if ($("detailScreen")) return;

    const section = document.createElement("section");
    section.id = "detailScreen";
    section.className = "screen hidden";

    section.innerHTML = `
        <header class="page-header">
            <button id="detailBackButton" class="back-button">←</button>

            <div class="page-header-info">
                <h1 id="detailTitle">Detalhes</h1>
                <p id="detailMeta"></p>
            </div>
        </header>

        <main class="page-content">
            <div class="about-card detail-card">
                <div id="detailContent"></div>
            </div>
        </main>
    `;

    document.body.appendChild(section);

    $("detailBackButton").addEventListener("click", () => {
        showScreen(state.detailOrigin);
    });
}

function openDetail(type, id, origin) {
    ensureDetailScreen();

    let item = null;

    if (type === "goal") {
        item = state.goals.find(goal => goal.id === id);
    }

    if (type === "task") {
        item = state.tasks.find(task => task.id === id);
    }

    if (type === "note") {
        item = state.notes.find(note => note.id === id);
    }

    if (!item) return;

    state.detailOrigin = origin;
    state.detailType = type;
    state.detailId = id;

    const title = $("detailTitle");
    const meta = $("detailMeta");
    const content = $("detailContent");

    if (title) {
        title.textContent = item.title || "Sem título";
    }

    if (meta) {
        let typeName = "Nota";

        if (type === "goal") typeName = item.completed ? "Meta concluída" : "Meta em andamento";
        if (type === "task") typeName = item.completed ? "Tarefa concluída" : "Tarefa em andamento";

        meta.textContent = `${typeName} • ${formatDateTime(item.createdAt)}`;
    }

    if (content) {
        content.textContent = item.content || "Sem conteúdo.";
    }

    showScreen("detailScreen");
}

/* =========================
   PIN
========================= */

function togglePin(type, id) {
    if (state.viewer) return;

    let collection = null;
    let storageKey = "";

    if (type === "goal") {
        collection = state.goals;
        storageKey = STORAGE_KEYS.goals;
    }

    if (type === "task") {
        collection = state.tasks;
        storageKey = STORAGE_KEYS.tasks;
    }

    if (type === "note") {
        collection = state.notes;
        storageKey = STORAGE_KEYS.notes;
    }

    if (!collection) return;

    const item = collection.find(element => element.id === id);

    if (!item) return;

    item.pinned = !item.pinned;

    saveJSON(storageKey, collection);

    renderGoals();
    renderTasks();
    renderNotes();
}

/* =========================
   EXCLUSÃO
========================= */

function deleteItem(type, id) {
    if (state.viewer) return;

    let item = null;

    if (type === "goal") {
        item = state.goals.find(element => element.id === id);
    }

    if (type === "task") {
        item = state.tasks.find(element => element.id === id);
    }

    if (type === "note") {
        item = state.notes.find(element => element.id === id);
    }

    if (!item) return;

    const names = {
        goal: "meta",
        task: "tarefa",
        note: "nota"
    };

    showConfirmModal(
        `Excluir ${names[type]}?`,
        `Você realmente deseja excluir "${item.title}"?`,
        "Excluir",
        () => {
            if (type === "goal") {
                state.goals = state.goals.filter(element => element.id !== id);
                saveJSON(STORAGE_KEYS.goals, state.goals);
                renderGoals();
                renderProgress();
            }

            if (type === "task") {
                state.tasks = state.tasks.filter(element => element.id !== id);
                saveJSON(STORAGE_KEYS.tasks, state.tasks);
                renderTasks();
            }

            if (type === "note") {
                state.notes = state.notes.filter(element => element.id !== id);
                saveJSON(STORAGE_KEYS.notes, state.notes);
                renderNotes();
            }

            showToast("Excluído.");
        }
    );
}

/* =========================
   CRONÔMETRO
========================= */

function setupTimer() {
    const startButton = $("startTimerButton");
    const pauseButton = $("pauseTimerButton");
    const resetButton = $("resetTimerButton");

    if (startButton) {
        startButton.addEventListener("click", startTimer);
    }

    if (pauseButton) {
        pauseButton.addEventListener("click", pauseTimer);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetTimer);
    }

    updateTimerDisplay();
}

function startTimer() {
    if (state.timerRunning) return;

    state.timerRunning = true;

    state.timerInterval = setInterval(() => {
        state.timerSeconds++;

        localStorage.setItem(
            STORAGE_KEYS.timerSeconds,
            String(state.timerSeconds)
        );

        updateTimerDisplay();
    }, 1000);

    updateTimerButtons();
}

function pauseTimer() {
    if (!state.timerRunning) return;

    state.timerRunning = false;

    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    updateTimerButtons();
}

function resetTimer() {
    pauseTimer();

    state.timerSeconds = 0;

    localStorage.setItem(
        STORAGE_KEYS.timerSeconds,
        "0"
    );

    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerDisplay = $("timerDisplay");

    if (!timerDisplay) return;

    timerDisplay.textContent = formatStopwatch(state.timerSeconds);
}

function updateTimerButtons() {
    const startButton = $("startTimerButton");
    const pauseButton = $("pauseTimerButton");

    if (startButton) {
        startButton.disabled = state.timerRunning;
    }

    if (pauseButton) {
        pauseButton.disabled = !state.timerRunning;
    }
}

function formatStopwatch(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
    ].join(":");
}

/* =========================
   PROGRESSO
========================= */

function setupProgress() {
    const shareButton = $("shareProgressButton");

    if (shareButton) {
        shareButton.addEventListener("click", shareProgress);
    }

    renderProgress();
}

function getGoalStats() {
    const total = state.goals.length;

    const completed = state.goals.filter(goal => goal.completed).length;

    const inProgress = total - completed;

    const completedPercent =
        total === 0 ? 0 : Math.round((completed / total) * 100);

    const inProgressPercent =
        total === 0 ? 0 : Math.round((inProgress / total) * 100);

    return {
        total,
        completed,
        inProgress,
        completedPercent,
        inProgressPercent
    };
}

function renderProgress() {
    const stats = getGoalStats();

    const totalElement = $("totalGoals");
    const completedElement = $("completedGoals");
    const inProgressElement = $("inProgressGoals");

    if (totalElement) {
        totalElement.textContent = stats.total;
    }

    if (completedElement) {
        completedElement.textContent = stats.completed;
    }

    if (inProgressElement) {
        inProgressElement.textContent = stats.inProgress;
    }

    const completedBar = $("completedBar");
    const inProgressBar = $("inProgressBar");

    if (completedBar) {
        completedBar.style.width = `${stats.completedPercent}%`;
        completedBar.setAttribute(
            "aria-label",
            `${stats.completedPercent}% concluídas`
        );
    }

    if (inProgressBar) {
        inProgressBar.style.width = `${stats.inProgressPercent}%`;
        inProgressBar.setAttribute(
            "aria-label",
            `${stats.inProgressPercent}% em andamento`
        );
    }

    const completedPercent = $("completedPercent");
    const inProgressPercent = $("inProgressPercent");

    if (completedPercent) {
        completedPercent.textContent = `${stats.completedPercent}%`;
    }

    if (inProgressPercent) {
        inProgressPercent.textContent = `${stats.inProgressPercent}%`;
    }
}

async function shareProgress() {
    const stats = getGoalStats();

    const text = `📊 PROGRESSO

Metas totais: ${stats.total}
Metas concluídas: ${stats.completed}
Em andamento: ${stats.inProgress}

Concluídas: ${stats.completedPercent}%
Em andamento: ${stats.inProgressPercent}%`;

    await shareContent("Progresso das metas", text);
}

/* =========================
   CONFIGURAÇÕES
========================= */

function setupSettings() {
    const lockButton = $("settingsLockButton");
    const deleteAllButton = $("deleteAllButton");
    const viewerButton = $("viewerModeButton");
    const themeButton = $("themeButton");
    const changePasswordButton = $("changePasswordButton");
    const timeFormatButton = $("timeFormatButton");
    const generalShareButton = $("generalShareButton");

    if (lockButton) {
        lockButton.addEventListener("click", lockSite);
    }

    if (deleteAllButton) {
        deleteAllButton.addEventListener("click", deleteEverything);
    }

    if (viewerButton) {
        viewerButton.addEventListener("click", toggleViewerMode);
    }

    if (themeButton) {
        themeButton.addEventListener("click", toggleTheme);
    }

    if (changePasswordButton) {
        changePasswordButton.addEventListener("click", changeAccessPassword);
    }

    if (timeFormatButton) {
        timeFormatButton.addEventListener("click", toggleTimeFormat);
    }

    if (generalShareButton) {
        generalShareButton.addEventListener("click", shareEverything);
    }

    updateSettingsButtons();
}

function updateSettingsButtons() {
    const viewerButton = $("viewerModeButton");
    const themeButton = $("themeButton");
    const timeFormatButton = $("timeFormatButton");

    if (viewerButton) {
        viewerButton.textContent = state.viewer
            ? "Modo Visualizador: ATIVO"
            : "Modo Visualizador: DESATIVADO";
    }

    if (themeButton) {
        themeButton.textContent =
            state.theme === "dark"
                ? "Tema: Preto e vermelho"
                : "Tema: Branco e vermelho";
    }

    if (timeFormatButton) {
        timeFormatButton.textContent =
            state.timeFormat === "24"
                ? "Formato da hora: 24 horas"
                : "Formato da hora: 12 horas";
    }
}

function toggleViewerMode() {
    state.viewer = !state.viewer;

    localStorage.setItem(
        STORAGE_KEYS.viewer,
        String(state.viewer)
    );

    applyViewerMode();
    updateSettingsButtons();

    renderGoals();
    renderTasks();
    renderNotes();

    showToast(
        state.viewer
            ? "Modo Visualizador ativado."
            : "Modo Visualizador desativado."
    );
}

function applyViewerMode() {
    document.body.classList.toggle(
        "viewer-mode",
        state.viewer
    );
}

function toggleTheme() {
    state.theme =
        state.theme === "dark"
            ? "light"
            : "dark";

    localStorage.setItem(
        STORAGE_KEYS.theme,
        state.theme
    );

    applyTheme();
    updateSettingsButtons();
}

function applyTheme() {
    document.body.classList.toggle(
        "light-theme",
        state.theme === "light"
    );
}

function toggleTimeFormat() {
    state.timeFormat =
        state.timeFormat === "24"
            ? "12"
            : "24";

    localStorage.setItem(
        STORAGE_KEYS.timeFormat,
        state.timeFormat
    );

    updateClock();
    updateSettingsButtons();
    renderGoals();
    renderTasks();
    renderNotes();

    showToast(
        state.timeFormat === "24"
            ? "Hora em formato de 24 horas."
            : "Hora em formato de 12 horas."
    );
}

function changeAccessPassword() {
    if (state.viewer) {
        showToast("Desative o Modo Visualizador primeiro.");
        return;
    }

    const html = `
        <div class="form-group">
            <label for="currentPassword">Senha atual</label>
            <input id="currentPassword" type="password"
                placeholder="Senha atual">
        </div>

        <div class="form-group">
            <label for="newPassword">Nova senha</label>
            <input id="newPassword" type="password"
                placeholder="Nova senha">
        </div>

        <div class="form-group">
            <label for="confirmPassword">Confirmar nova senha</label>
            <input id="confirmPassword" type="password"
                placeholder="Digite novamente">
        </div>
    `;

    showModal({
        title: "Alterar senha de acesso",
        content: html,
        buttons: [
            {
                text: "Cancelar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: "Salvar senha",
                className: "primary-button",
                action: () => {
                    const current = $("currentPassword")?.value || "";
                    const newPassword = $("newPassword")?.value || "";
                    const confirm = $("confirmPassword")?.value || "";

                    if (current !== state.accessPassword) {
                        showModalMessage("A senha atual está incorreta.");
                        return;
                    }

                    if (!newPassword) {
                        showModalMessage("Digite uma nova senha.");
                        return;
                    }

                    if (newPassword !== confirm) {
                        showModalMessage("As senhas novas não são iguais.");
                        return;
                    }

                    state.accessPassword = newPassword;

                    localStorage.setItem(
                        STORAGE_KEYS.accessPassword,
                        newPassword
                    );

                    closeAllModals();

                    showToast("Senha alterada com sucesso.");
                }
            }
        ]
    });
}

function deleteEverything() {
    if (state.viewer) {
        showToast("Desative o Modo Visualizador primeiro.");
        return;
    }

    const html = `
        <div class="form-group">
            <label for="masterPassword">Senha de confirmação</label>
            <input id="masterPassword" type="password"
                placeholder="Digite a senha">
        </div>

        <p class="modal-warning">
            Essa ação apagará metas, tarefas, notas, cronômetro
            e configurações salvas.
        </p>
    `;

    showModal({
        title: "Apagar geral",
        content: html,
        buttons: [
            {
                text: "Cancelar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: "Continuar",
                className: "danger-button",
                action: () => {
                    const password = $("masterPassword")?.value || "";

                    if (password !== MASTER_DELETE_PASSWORD) {
                        showModalMessage("Senha de confirmação incorreta.");
                        return;
                    }

                    closeAllModals();

                    showConfirmModal(
                        "Apagar tudo?",
                        "Todas as metas, tarefas, notas, cronômetro e configurações serão apagados. A senha de acesso voltará para Hg99.",
                        "Apagar tudo",
                        performFullReset
                    );
                }
            }
        ]
    });
}

function performFullReset() {
    pauseTimer();

    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });

    state.accessPassword = DEFAULT_ACCESS_PASSWORD;
    state.goals = [];
    state.tasks = [];
    state.notes = [];
    state.theme = "dark";
    state.viewer = false;
    state.timeFormat = "24";
    state.timerSeconds = 0;
    state.timerRunning = false;

    applyTheme();
    applyViewerMode();
    updateSettingsButtons();
    updateTimerDisplay();
    updateClock();

    renderGoals();
    renderTasks();
    renderNotes();
    renderProgress();

    showScreen("loginScreen");

    showToast("Tudo foi apagado.");
}

async function shareEverything() {
    const stats = getGoalStats();

    const goalsText =
        state.goals.length === 0
            ? "Nenhuma meta."
            : state.goals
                .slice()
                .sort(sortItems)
                .map((goal, index) => {
                    return `${index + 1}. ${goal.title}
Status: ${goal.completed ? "Concluída" : "Em andamento"}
Criada: ${formatDateTime(goal.createdAt)}
${goal.content || ""}`;
                })
                .join("\n\n");

    const tasksText =
        state.tasks.length === 0
            ? "Nenhuma tarefa."
            : state.tasks
                .slice()
                .sort(sortItems)
                .map((task, index) => {
                    return `${index + 1}. ${task.title}
Status: ${task.completed ? "Concluída" : "Em andamento"}
Criada: ${formatDateTime(task.createdAt)}
${task.content || ""}`;
                })
                .join("\n\n");

    const notesText =
        state.notes.length === 0
            ? "Nenhuma nota."
            : state.notes
                .slice()
                .sort(sortItems)
                .map((note, index) => {
                    return `${index + 1}. ${note.title}
Criada: ${formatDateTime(note.createdAt)}

${note.content || ""}`;
                })
                .join("\n\n");

    const text = `📦 MEU ESPAÇO

🎯 METAS

${goalsText}

====================

📋 TAREFAS

${tasksText}

====================

📝 NOTAS

${notesText}

====================

📊 PROGRESSO

Metas totais: ${stats.total}
Metas concluídas: ${stats.completed}
Em andamento: ${stats.inProgress}
Concluídas: ${stats.completedPercent}%
Em andamento: ${stats.inProgressPercent}%

====================

⏱️ CRONÔMETRO

Tempo: ${formatStopwatch(state.timerSeconds)}
Status: ${state.timerRunning ? "Em andamento" : "Parado"}`;

    await shareContent("Meu Espaço", text);
}

/* =========================
   SOBRE
========================= */

function setupAbout() {
    const aboutButton = $("aboutProjectButton");

    if (aboutButton) {
        aboutButton.addEventListener("click", () => {
            showScreen("aboutScreen");
        });
    }
}

/* =========================
   COMPARTILHAMENTO
========================= */

async function shareContent(title, text) {
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text
            });

            return;
        } catch (error) {
            if (error && error.name === "AbortError") {
                return;
            }
        }
    }

    showShareFallback(title, text);
}

function showShareFallback(title, text) {
    const html = `
        <div class="form-group">
            <label>Conteúdo</label>
            <textarea id="shareFallbackText" rows="12" readonly></textarea>
        </div>
    `;

    showModal({
        title: `Compartilhar — ${title}`,
        content: html,
        buttons: [
            {
                text: "Fechar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: "Copiar",
                className: "primary-button",
                action: async () => {
                    try {
                        await navigator.clipboard.writeText(text);
                        showToast("Texto copiado.");
                    } catch {
                        const textarea = $("shareFallbackText");

                        if (textarea) {
                            textarea.select();
                        }

                        showToast("Selecione e copie o texto.");
                    }
                }
            }
        ]
    });

    const textarea = $("shareFallbackText");

    if (textarea) {
        textarea.value = text;
    }
}

/* =========================
   MODAIS
========================= */

let activeModal = null;

function showModal(options) {
    closeAllModals();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal-box";

    const title = document.createElement("h2");
    title.textContent = options.title || "";

    const body = document.createElement("div");
    body.className = "modal-body";
    body.innerHTML = options.content || "";

    const buttons = document.createElement("div");
    buttons.className = "modal-buttons";

    (options.buttons || []).forEach(buttonConfig => {
        const button = document.createElement("button");

        button.type = "button";
        button.className =
            buttonConfig.className || "secondary-button";

        button.textContent = buttonConfig.text;

        button.addEventListener("click", () => {
            buttonConfig.action();
        });

        buttons.appendChild(button);
    });

    modal.appendChild(title);
    modal.appendChild(body);
    modal.appendChild(buttons);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    activeModal = overlay;

    const firstInput = modal.querySelector("input, textarea");

    if (firstInput) {
        setTimeout(() => firstInput.focus(), 50);
    }
}

function showConfirmModal(title, message, confirmText, confirmAction) {
    const html = `
        <p class="modal-message">
            ${escapeHTML(message)}
        </p>
    `;

    showModal({
        title,
        content: html,
        buttons: [
            {
                text: "Cancelar",
                className: "secondary-button",
                action: closeAllModals
            },
            {
                text: confirmText,
                className: "danger-button",
                action: () => {
                    closeAllModals();
                    confirmAction();
                }
            }
        ]
    });
}

function showModalMessage(message) {
    const existingMessage = document.querySelector(".modal-inline-message");

    if (existingMessage) {
        existingMessage.remove();
    }

    const modal = document.querySelector(".modal-box");

    if (!modal) return;

    const messageElement = document.createElement("p");

    messageElement.className = "modal-inline-message";
    messageElement.textContent = message;

    modal.insertBefore(
        messageElement,
        modal.querySelector(".modal-buttons")
    );
}

function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(element => {
        element.remove();
    });

    activeModal = null;
}

/* =========================
   TOAST
========================= */

let toastTimeout = null;

function showToast(message) {
    const oldToast = document.querySelector(".app-toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className = "app-toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.remove();
    }, 2500);
}

/* =========================
   UTILIDADES
========================= */

function createSmallButton(icon, title, className, action) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = icon;
    button.title = title;
    button.setAttribute("aria-label", title);

    button.addEventListener("click", event => {
        event.stopPropagation();
        action();
    });

    return button;
}

function generateId() {
    return `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function sortItems(a, b) {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
}

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}

function updateAll() {
    renderGoals();
    renderTasks();
    renderNotes();
    renderProgress();
    updateTimerDisplay();
    updateTimerButtons();
    updateSettingsButtons();
}

/* =========================
   SERVICE WORKER
========================= */

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then(registration => {
                registration.update().catch(() => {});
            })
            .catch(error => {
                console.log(
                    "Service Worker não pôde ser registrado:",
                    error
                );
            });
    });
}
