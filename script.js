const DEFAULT_ACCESS_PASSWORD = "Hg99";
const MASTER_DELETE_PASSWORD = "Hg88";
const TRASH_DAYS = 50;
const TRASH_TIME = TRASH_DAYS * 24 * 60 * 60 * 1000;

const KEYS = {
    password: "secreto_v3_password",
    goals: "secreto_v3_goals",
    tasks: "secreto_v3_tasks",
    notes: "secreto_v3_notes",
    clothes: "secreto_v3_clothes",
    trash: "secreto_v3_trash",
    theme: "secreto_v3_theme",
    viewer: "secreto_v3_viewer",
    timeFormat: "secreto_v3_time_format",
    timer: "secreto_v3_timer"
};

const state = {
    password:
        localStorage.getItem(KEYS.password) ||
        DEFAULT_ACCESS_PASSWORD,

    goals: loadArray(KEYS.goals),
    tasks: loadArray(KEYS.tasks),
    notes: loadArray(KEYS.notes),
    clothes: loadArray(KEYS.clothes),
    trash: loadArray(KEYS.trash),

    theme:
        localStorage.getItem(KEYS.theme) ||
        "dark",

    viewer:
        localStorage.getItem(KEYS.viewer) === "true",

    timeFormat:
        localStorage.getItem(KEYS.timeFormat) ||
        "24",

    timerSeconds:
        Number(
            localStorage.getItem(KEYS.timer) || 0
        ),

    timerRunning: false,
    timerInterval: null,

    detailType: null,
    detailId: null,
    detailOrigin: "home"
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init() {

    cleanTrash();

    applyTheme();
    applyViewer();

    setupNavigation();
    setupLogin();

    setupGoals();
    setupTasks();
    setupNotes();
    setupClothes();

    setupTimer();
    setupProgress();

    setupSettings();

    updateClock();

    setInterval(
        updateClock,
        1000
    );

    updateAll();

    registerServiceWorker();
}


/* =========================================================
   UTILIDADES
========================================================= */

function loadArray(key) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return [];
        }

        const parsed =
            JSON.parse(value);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];
    }
}

function saveArray(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

function get(id) {
    return document.getElementById(id);
}

function generateId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}

function normalizeText(text) {

    return String(text || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}

function escapeHTML(text) {

    return String(text || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function escapeAttribute(text) {
    return escapeHTML(text);
}

function sortItems(a, b) {

    if (
        Boolean(a.pinned) !==
        Boolean(b.pinned)
    ) {
        return a.pinned
            ? -1
            : 1;
    }

    return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

const screens = [
    "loginScreen",
    "homeScreen",
    "goalsScreen",
    "tasksScreen",
    "notesScreen",
    "clothesScreen",
    "timerScreen",
    "progressScreen",
    "settingsScreen",
    "trashScreen",
    "aboutScreen",
    "detailScreen"
];

function showScreen(id) {

    screens.forEach(screenId => {

        const screen =
            get(screenId);

        if (screen) {
            screen.classList.add(
                "hidden"
            );
        }

    });

    const target =
        get(id);

    if (target) {
        target.classList.remove(
            "hidden"
        );
    }

    window.scrollTo(
        0,
        0
    );

    if (
        id ===
        "progressScreen"
    ) {
        renderProgress();
    }

    if (
        id ===
        "trashScreen"
    ) {
        renderTrash();
    }

    if (
        id ===
        "settingsScreen"
    ) {
        updateSettingsButtons();
    }
}

function setupNavigation() {

    const map = {

        goalsCard:
            "goalsScreen",

        tasksCard:
            "tasksScreen",

        notesCard:
            "notesScreen",

        clothesCard:
            "clothesScreen",

        timerCard:
            "timerScreen",

        progressCard:
            "progressScreen",

        settingsCard:
            "settingsScreen"
    };

    Object.entries(map)
        .forEach(
            ([buttonId, screenId]) => {

                const button =
                    get(buttonId);

                if (!button) {
                    return;
                }

                button.addEventListener(
                    "click",
                    () => {
                        showScreen(
                            screenId
                        );
                    }
                );

            }
        );

    document
        .querySelectorAll(
            "[data-back]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showScreen(
                        button.dataset.back
                    );

                }
            );

        });
}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const button =
        get("loginButton");

    const input =
        get("passwordInput");

    if (button) {

        button.addEventListener(
            "click",
            login
        );

    }

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {
                    login();
                }

            }
        );

    }
}

function login() {

    const input =
        get("passwordInput");

    const message =
        get("loginMessage");

    if (!input) {
        return;
    }

    if (
        input.value ===
        state.password
    ) {

        input.value = "";

        if (message) {
            message.textContent = "";
        }

        showScreen(
            "homeScreen"
        );

        return;
    }

    if (message) {
        message.textContent =
            "Senha incorreta.";
    }
}

function lockSite() {

    closeModals();

    const input =
        get("passwordInput");

    const message =
        get("loginMessage");

    if (input) {
        input.value = "";
    }

    if (message) {
        message.textContent = "";
    }

    showScreen(
        "loginScreen"
    );
}


/* =========================================================
   DATA E HORA
========================================================= */

function updateClock() {

    const now =
        new Date();

    const date =
        get("currentDate");

    const time =
        get("currentTime");

    if (date) {
        date.textContent =
            formatDate(now);
    }

    if (time) {
        time.textContent =
            formatTime(now);
    }
}

function formatDate(date) {

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);
}

function formatTime(date) {

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12:
                state.timeFormat ===
                "12"
        }
    ).format(date);
}

function formatDateTime(iso) {

    return formatDate(
        new Date(iso)
    ) +
        " • " +
        formatTime(
            new Date(iso)
        );
}


/* =========================================================
   METAS
========================================================= */

function setupGoals() {

    const add =
        get("addGoalButton");

    const share =
        get("shareGoalsButton");

    const search =
        get("goalSearch");

    if (add) {

        add.addEventListener(
            "click",
            () => {

                if (state.viewer) {
                    return;
                }

                openGoalForm();

            }
        );

    }

    if (share) {

        share.addEventListener(
            "click",
            shareGoals
        );

    }

    if (search) {

        search.addEventListener(
            "input",
            renderGoals
        );

    }

    renderGoals();
}

function renderGoals() {

    const container =
        get("goalsList");

    if (!container) {
        return;
    }

    const search =
        normalizeText(
            get("goalSearch")?.value
        );

    let list =
        state.goals.filter(
            goal =>
                normalizeText(
                    goal.title
                ).includes(search)
        );

    list.sort(sortItems);

    container.innerHTML = "";

    if (!list.length) {

        container.innerHTML =
            `<div class="empty-message">
                Nenhuma meta encontrada.
            </div>`;

        return;
    }

    list.forEach(goal => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "item-card";

        if (goal.pinned) {
            card.classList.add(
                "pinned"
            );
        }

        if (goal.completed) {
            card.classList.add(
                "completed"
            );
        }

        const checkbox =
            document.createElement(
                "input"
            );

        checkbox.type =
            "checkbox";

        checkbox.className =
            "item-checkbox";

        checkbox.checked =
            Boolean(
                goal.completed
            );

        checkbox.disabled =
            state.viewer;

        checkbox.addEventListener(
            "change",
            () => {

                if (state.viewer) {
                    return;
                }

                goal.completed =
                    checkbox.checked;

                saveArray(
                    KEYS.goals,
                    state.goals
                );

                renderGoals();
                renderProgress();

            }
        );

        const main =
            document.createElement(
                "div"
            );

        main.className =
            "item-main";

        const title =
            document.createElement(
                "button"
            );

        title.className =
            "item-title";

        title.textContent =
            goal.title;

        title.addEventListener(
            "click",
            () => {

                openDetail(
                    "goal",
                    goal.id,
                    "goalsScreen"
                );

            }
        );

        const date =
            document.createElement(
                "div"
            );

        date.className =
            "item-date";

        date.textContent =
            formatDateTime(
                goal.createdAt
            );

        main.appendChild(title);
        main.appendChild(date);

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "item-actions";

        if (
            goal.pinned &&
            !state.viewer
        ) {

            const pin =
                document.createElement(
                    "span"
                );

            pin.className =
                "pin-indicator";

            pin.textContent =
                "📌";

            actions.appendChild(pin);
        }

        if (!state.viewer) {

            actions.appendChild(
                createActionButton(
                    "📌",
                    "Fixar",
                    () =>
                        togglePin(
                            "goal",
                            goal.id
                        )
                )
            );

            actions.appendChild(
                createActionButton(
                    "✏️",
                    "Editar",
                    () =>
                        openGoalForm(
                            goal
                        )
                )
            );

            actions.appendChild(
                createActionButton(
                    "🗑️",
                    "Excluir",
                    () =>
                        moveToTrash(
                            "goal",
                            goal.id
                        )
                )
            );
        }

        card.appendChild(
            checkbox
        );

        card.appendChild(
            main
        );

        card.appendChild(
            actions
        );

        container.appendChild(
            card
        );

    });
}

function openGoalForm(goal = null) {

    const editing =
        Boolean(goal);

    showModal({

        title:
            editing
                ? "Editar meta"
                : "Adicionar meta",

        content: `
            <div class="form-group">
                <label>Título</label>

                <input
                    id="modalTitle"
                    type="text"
                    maxlength="120"
                    value="${escapeAttribute(
                        goal?.title || ""
                    )}"
                    placeholder="Título da meta"
                >
            </div>

            <div class="form-group">
                <label>Descrição</label>

                <textarea
                    id="modalContent"
                    rows="7"
                    placeholder="Descrição da meta"
                >${escapeHTML(
                    goal?.content || ""
                )}</textarea>
            </div>
        `,

        buttons: [

            {
                text: "Cancelar",
                className:
                    "secondary-button",
                action:
                    closeModals
            },

            {
                text:
                    editing
                        ? "Salvar"
                        : "Adicionar",

                className:
                    "primary-button",

                action: () => {

                    const title =
                        get("modalTitle")
                            ?.value.trim();

                    const content =
                        get("modalContent")
                            ?.value.trim();

                    if (!title) {

                        modalMessage(
                            "Digite o título."
                        );

                        return;
                    }

                    if (editing) {

                        goal.title =
                            title;

                        goal.content =
                            content;

                    } else {

                        state.goals.push({

                            id:
                                generateId(),

                            title,

                            content,

                            completed:
                                false,

                            pinned:
                                false,

                            createdAt:
                                new Date()
                                    .toISOString()

                        });

                    }

                    saveArray(
                        KEYS.goals,
                        state.goals
                    );

                    closeModals();

                    renderGoals();
                    renderProgress();

                }
            }
        ]
    });
}

async function shareGoals() {

    if (!state.goals.length) {

        toast(
            "Não há metas para compartilhar."
        );

        return;
    }

    const text =
        state.goals
            .slice()
            .sort(sortItems)
            .map(
                (goal, index) =>
                    `${index + 1}. ${goal.title}
Status: ${
    goal.completed
        ? "Concluída"
        : "Em andamento"
}
Criada: ${formatDateTime(
    goal.createdAt
)}

${goal.content || ""}`
            )
            .join(
                "\n\n"
            );

    share(
        "Metas",
        "🎯 METAS\n\n" +
            text
    );
}


/* =========================================================
   TAREFAS
========================================================= */

function setupTasks() {

    const add =
        get("addTaskButton");

    const shareButton =
        get("shareTasksButton");

    const search =
        get("taskSearch");

    if (add) {

        add.addEventListener(
            "click",
            () => {

                if (state.viewer) {
                    return;
                }

                openTaskForm();

            }
        );

    }

    if (shareButton) {

        shareButton.addEventListener(
            "click",
            shareTasks
        );

    }

    if (search) {

        search.addEventListener(
            "input",
            renderTasks
        );

    }

    renderTasks();
}

function renderTasks() {

    const container =
        get("tasksList");

    if (!container) {
        return;
    }

    const search =
        normalizeText(
            get("taskSearch")?.value
        );

    let list =
        state.tasks.filter(
            task =>
                normalizeText(
                    task.title
                ).includes(search)
        );

    list.sort(sortItems);

    container.innerHTML = "";

    if (!list.length) {

        container.innerHTML =
            `<div class="empty-message">
                Nenhuma tarefa encontrada.
            </div>`;

        return;
    }

    list.forEach(task => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "item-card";

        if (task.pinned) {
            card.classList.add(
                "pinned"
            );
        }

        if (task.completed) {
            card.classList.add(
                "completed"
            );
        }

        const checkbox =
            document.createElement(
                "input"
            );

        checkbox.type =
            "checkbox";

        checkbox.className =
            "item-checkbox";

        checkbox.checked =
            Boolean(
                task.completed
            );

        checkbox.disabled =
            state.viewer;

        checkbox.addEventListener(
            "change",
            () => {

                if (state.viewer) {
                    return;
                }

                task.completed =
                    checkbox.checked;

                saveArray(
                    KEYS.tasks,
                    state.tasks
                );

                renderTasks();

            }
        );

        const main =
            document.createElement(
                "div"
            );

        main.className =
            "item-main";

        const title =
            document.createElement(
                "button"
            );

        title.className =
            "item-title";

        title.textContent =
            task.title;

        title.addEventListener(
            "click",
            () => {

                openDetail(
                    "task",
                    task.id,
                    "tasksScreen"
                );

            }
        );

        const date =
            document.createElement(
                "div"
            );

        date.className =
            "item-date";

        date.textContent =
            formatDateTime(
                task.createdAt
            );

        main.appendChild(title);
        main.appendChild(date);

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "item-actions";

        if (!state.viewer) {

            actions.appendChild(
                createActionButton(
                    "📌",
                    "Fixar",
                    () =>
                        togglePin(
                            "task",
                            task.id
                        )
                )
            );

            actions.appendChild(
                createActionButton(
                    "✏️",
                    "Editar",
                    () =>
                        openTaskForm(
                            task
                        )
                )
            );

            actions.appendChild(
                createActionButton(
                    "🗑️",
                    "Excluir",
                    () =>
                        moveToTrash(
                            "task",
                            task.id
                        )
                )
            );
        }

        card.appendChild(
            checkbox
        );

        card.appendChild(
            main
        );

        card.appendChild(
            actions
        );

        container.appendChild(
            card
        );

    });
}

function openTaskForm(task = null) {

    const editing =
        Boolean(task);

    showModal({

        title:
            editing
                ? "Editar tarefa"
                : "Adicionar tarefa",

        content: `
            <div class="form-group">
                <label>Título</label>

                <input
                    id="modalTitle"
                    type="text"
                    maxlength="120"
                    value="${escapeAttribute(
                        task?.title || ""
                    )}"
                    placeholder="Título da tarefa"
                >
            </div>

            <div class="form-group">
                <label>Descrição</label>

                <textarea
                    id="modalContent"
                    rows="7"
                    placeholder="Descrição da tarefa"
                >${escapeHTML(
                    task?.content || ""
                )}</textarea>
            </div>
        `,

        buttons: [

            {
                text: "Cancelar",
                className:
                    "secondary-button",
                action:
                    closeModals
            },

            {
                text:
                    editing
                        ? "Salvar"
                        : "Adicionar",

                className:
                    "primary-button",

                action: () => {

                    const title =
                        get("modalTitle")
                            ?.value.trim();

                    const content =
                        get("modalContent")
                            ?.value.trim();

                    if (!title) {

                        modalMessage(
                            "Digite o título."
                        );

                        return;
                    }

                    if (editing) {

                        task.title =
                            title;

                        task.content =
                            content;

                    } else {

                        state.tasks.push({

                            id:
                                generateId(),

                            title,

                            content,

                            completed:
                                false,

                            pinned:
                                false,

                            createdAt:
                                new Date()
                                    .toISOString()

                        });

                    }

                    saveArray(
                        KEYS.tasks,
                        state.tasks
                    );

                    closeModals();

                    renderTasks();

                }
            }
        ]
    });
}

async function shareTasks() {

    if (!state.tasks.length) {

        toast(
            "Não há tarefas para compartilhar."
        );

        return;
    }

    const text =
        state.tasks
            .slice()
            .sort(sortItems)
            .map(
                (task, index) =>
                    `${index + 1}. ${task.title}
Status: ${
    task.completed
        ? "Concluída"
        : "Em andamento"
}
Criada: ${formatDateTime(
    task.createdAt
)}

${task.content || ""}`
            )
            .join(
                "\n\n"
            );

    share(
        "Tarefas",
        "📋 TAREFAS\n\n" +
            text
    );
}


/* =========================================================
   NOTAS
========================================================= */

function setupNotes() {

    const add =
        get("addNoteButton");

    const shareButton =
        get("shareNotesButton");

    const search =
        get("noteSearch");

    if (add) {

        add.addEventListener(
            "click",
            () => {

                if (state.viewer) {
                    return;
                }

                openNoteForm();

            }
        );

    }

    if (shareButton) {

        shareButton.addEventListener(
            "click",
            shareNotes
        );

    }

    if (search) {

        search.addEventListener(
            "input",
            renderNotes
        );

    }

    renderNotes();
}

function renderNotes() {

    const container =
        get("notesList");

    if (!container) {
        return;
    }

    const search =
        normalizeText(
            get("noteSearch")?.value
        );

    let list =
        state.notes.filter(
            note =>
                normalizeText(
                    note.title
                ).includes(search)
        );

    list.sort(sortItems);

    container.innerHTML = "";

    if (!list.length) {

        container.innerHTML =
            `<div class="empty-message">
                Nenhuma nota encontrada.
            </div>`;

        return;
    }

    list.forEach(note => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "item-card";

        if (note.pinned) {
            card.classList.add(
                "pinned"
            );
        }

        const main =
            document.createElement(
                "div"
            );

        main.className =
            "item-main";

        const title =
            document.createElement(
                "button"
            );

        title.className =
            "item-title";

        title.textContent =
            note.title;

        title.addEventListener(
            "click",
            () => {

                openDetail(
                    "note",
                    note.id,
                    "notesScreen"
                );

            }
        );

        const date =
            document.createElement(
                "div"
            );

        date.className =
            "item-date";

        date.textContent =
            formatDateTime(
                note.createdAt
            );

        main.appendChild(title);
        main.appendChild(date);

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "item-actions";

        if (!state.viewer) {

            actions.appendChild(
                createActionButton(
                    "📌",
                    "Fixar",
                    () =>
                        togglePin(
                            "note",
                            note.id
                        )
                )
            );

            actions.appendChild(
                createActionButton(
                    "✏️",
                    "Editar",
                    () =>
                        openNoteForm(
                            note
                        )
                )
            );

            actions.appendChild(
                createActionButton(
                    "🗑️",
                    "Excluir",
                    () =>
                        moveToTrash(
                            "note",
                            note.id
                        )
                )
            );
        }

        card.appendChild(
            main
        );

        card.appendChild(
            actions
        );

        container.appendChild(
            card
        );

    });
}

function openNoteForm(note = null) {

    const editing =
        Boolean(note);

    showModal({

        title:
            editing
                ? "Editar nota"
                : "Adicionar nota",

        content: `
            <div class="form-group">
                <label>Título</label>

                <input
                    id="modalTitle"
                    type="text"
                    maxlength="120"
                    value="${escapeAttribute(
                        note?.title || ""
                    )}"
                    placeholder="Título da nota"
                >
            </div>

            <div class="form-group">
                <label>Conteúdo</label>

                <textarea
                    id="modalContent"
                    rows="9"
                    placeholder="Conteúdo da nota"
                >${escapeHTML(
                    note?.content || ""
                )}</textarea>
            </div>
        `,

        buttons: [

            {
                text: "Cancelar",
                className:
                    "secondary-button",
                action:
                    closeModals
            },

            {
                text:
                    editing
                        ? "Salvar"
                        : "Adicionar",

                className:
                    "primary-button",

                action: () => {

                    const title =
                        get("modalTitle")
                            ?.value.trim();

                    const content =
                        get("modalContent")
                            ?.value.trim();

                    if (!title) {

                        modalMessage(
                            "Digite o título."
                        );

                        return;
                    }

                    if (editing) {

                        note.title =
                            title;

                        note.content =
                            content;

                    } else {

                        state.notes.push({

                            id:
                                generateId(),

                            title,

                            content,

                            pinned:
                                false,

                            createdAt:
                                new Date()
                                    .toISOString()

                        });

                    }

                    saveArray(
                        KEYS.notes,
                        state.notes
                    );

                    closeModals();

                    renderNotes();

                }
            }
        ]
    });
}

async function shareNotes() {

    if (!state.notes.length) {

        toast(
            "Não há notas para compartilhar."
        );

        return;
    }

    const text =
        state.notes
            .slice()
            .sort(sortItems)
            .map(
                (note, index) =>
                    `${index + 1}. ${note.title}
Criada: ${formatDateTime(
    note.createdAt
)}

${note.content || ""}`
            )
            .join(
                "\n\n----------------\n\n"
            );

    share(
        "Notas",
        "📝 NOTAS\n\n" +
            text
    );
}


/* =========================================================
   ROUPAS SÍTIO
========================================================= */

function setupClothes() {

    const button =
        get("addClothesButton");

    if (button) {

        button.addEventListener(
            "click",
            () => {

                if (state.viewer) {
                    return;
                }

                openClothesForm();

            }
        );

    }

    renderClothes();
}

function renderClothes() {

    const container =
        get("clothesList");

    if (!container) {
        return;
    }

    const list =
        state.clothes
            .slice()
            .sort(sortItems);

    container.innerHTML = "";

    if (!list.length) {

        container.innerHTML =
            `<div class="empty-message">
                Nenhuma lista de roupas cadastrada.
            </div>`;

        return;
    }

    list.forEach(item => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "clothes-card";

        const main =
            document.createElement(
                "div"
            );

        main.className =
            "clothes-main";

        const title =
            document.createElement(
                "button"
            );

        title.className =
            "clothes-title";

        title.textContent =
            item.title;

        title.addEventListener(
            "click",
            () => {

                openClothesDetail(
                    item
                );

            }
        );

        const date =
            document.createElement(
                "div"
            );

        date.className =
            "clothes-date";

        date.textContent =
            formatDateTime(
                item.createdAt
            );

        main.appendChild(title);
        main.appendChild(date);

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "clothes-actions";

        if (
            item.pinned &&
            !state.viewer
        ) {

            const pin =
                document.createElement(
                    "span"
                );

            pin.className =
                "pin-indicator";

            pin.textContent =
                "📌";

            actions.appendChild(pin);
        }

        if (!state.viewer) {

            actions.appendChild(
                createClothesAction(
                    "📌",
                    "Fixar",
                    () =>
                        toggleClothesPin(
                            item.id
                        )
                )
            );

            actions.appendChild(
                createClothesAction(
                    "✏️",
                    "Editar",
                    () =>
                        openClothesForm(
                            item
                        )
                )
            );

            actions.appendChild(
                createClothesAction(
                    "🗑️",
                    "Excluir",
                    () =>
                        deleteClothes(
                            item.id
                        )
                )
            );
        }

        card.appendChild(main);
        card.appendChild(actions);

        container.appendChild(card);

    });
}

function openClothesForm(item = null) {

    const editing =
        Boolean(item);

    showModal({

        title:
            editing
                ? "Editar roupa"
                : "Adicionar roupa",

        content: `

            <div class="form-group">

                <label>Título</label>

                <input
                    id="clothesTitle"
                    type="text"
                    maxlength="120"
                    value="${escapeAttribute(
                        item?.title || ""
                    )}"
                    placeholder="Título"
                >

            </div>


            <div class="form-group">

                <label>Touca</label>

                <input
                    id="clothesTouca"
                    type="text"
                    value="${escapeAttribute(
                        item?.touca || ""
                    )}"
                    placeholder="Touca"
                >

            </div>


            <div class="form-group">

                <label>Camiseta</label>

                <input
                    id="clothesCamiseta"
                    type="text"
                    value="${escapeAttribute(
                        item?.camiseta || ""
                    )}"
                    placeholder="Camiseta"
                >

            </div>


            <div class="form-group">

                <label>Blusa</label>

                <input
                    id="clothesBlusa"
                    type="text"
                    value="${escapeAttribute(
                        item?.blusa || ""
                    )}"
                    placeholder="Blusa"
                >

            </div>


            <div class="form-group">

                <label>Calça</label>

                <input
                    id="clothesCalca"
                    type="text"
                    value="${escapeAttribute(
                        item?.calca || ""
                    )}"
                    placeholder="Calça"
                >

            </div>


            <div class="form-group">

                <label>Adicionar extras</label>

                <textarea
                    id="clothesExtras"
                    rows="5"
                    placeholder="Ex.: toalha, meia, chinelo..."
                >${escapeHTML(
                    item?.extras || ""
                )}</textarea>

            </div>
        `,

        buttons: [

            {
                text: "Cancelar",
                className:
                    "secondary-button",
                action:
                    closeModals
            },

            {
                text:
                    editing
                        ? "Salvar"
                        : "Adicionar",

                className:
                    "primary-button",

                action: () => {

                    const title =
                        get(
                            "clothesTitle"
                        )?.value.trim();

                    const touca =
                        get(
                            "clothesTouca"
                        )?.value.trim();

                    const camiseta =
                        get(
                            "clothesCamiseta"
                        )?.value.trim();

                    const blusa =
                        get(
                            "clothesBlusa"
                        )?.value.trim();

                    const calca =
                        get(
                            "clothesCalca"
                        )?.value.trim();

                    const extras =
                        get(
                            "clothesExtras"
                        )?.value.trim();

                    if (!title) {

                        modalMessage(
                            "Digite o título."
                        );

                        return;
                    }

                    if (editing) {

                        item.title =
                            title;

                        item.touca =
                            touca;

                        item.camiseta =
                            camiseta;

                        item.blusa =
                            blusa;

                        item.calca =
                            calca;

                        item.extras =
                            extras;

                    } else {

                        state.clothes.push({

                            id:
                                generateId(),

                            title,

                            touca,

                            camiseta,

                            blusa,

                            calca,

                            extras,

                            pinned:
                                false,

                            createdAt:
                                new Date()
                                    .toISOString()

                        });

                    }

                    saveArray(
                        KEYS.clothes,
                        state.clothes
                    );

                    closeModals();

                    renderClothes();

                }
            }
        ]
    });
}

function openClothesDetail(item) {

    showModal({

        title:
            item.title,

        content: `

            <div class="about-card">

                <p>
                    <strong>Touca:</strong><br>
                    ${escapeHTML(
                        item.touca ||
                        "Não informado"
                    )}
                </p>

                <p>
                    <strong>Camiseta:</strong><br>
                    ${escapeHTML(
                        item.camiseta ||
                        "Não informado"
                    )}
                </p>

                <p>
                    <strong>Blusa:</strong><br>
                    ${escapeHTML(
                        item.blusa ||
                        "Não informado"
                    )}
                </p>

                <p>
                    <strong>Calça:</strong><br>
                    ${escapeHTML(
                        item.calca ||
                        "Não informado"
                    )}
                </p>

                <p>
                    <strong>Adicionar extras:</strong><br>
                    ${escapeHTML(
                        item.extras ||
                        "Nenhum extra"
                    )}
                </p>

                <p>
                    <strong>Criado:</strong><br>
                    ${formatDateTime(
                        item.createdAt
                    )}
                </p>

            </div>

        `,

        buttons: [

            {
                text: "Fechar",
                className:
                    "secondary-button",
                action:
                    closeModals
            }

        ]
    });
}

function toggleClothesPin(id) {

    if (state.viewer) {
        return;
    }

    const item =
        state.clothes.find(
            clothes =>
                clothes.id === id
        );

    if (!item) {
        return;
    }

    item.pinned =
        !item.pinned;

    saveArray(
        KEYS.clothes,
        state.clothes
    );

    renderClothes();
}

function deleteClothes(id) {

    if (state.viewer) {
        return;
    }

    const item =
        state.clothes.find(
            clothes =>
                clothes.id === id
        );

    if (!item) {
        return;
    }

    confirmModal(
        "Excluir roupa?",
        `Excluir "${item.title}"?`,
        "Excluir",
        () => {

            state.clothes =
                state.clothes.filter(
                    clothes =>
                        clothes.id !== id
                );

            saveArray(
                KEYS.clothes,
                state.clothes
            );

            renderClothes();

            toast(
                "Roupa excluída."
            );

        }
    );
}


/* =========================================================
   DETALHES DE METAS / TAREFAS / NOTAS
========================================================= */

function openDetail(
    type,
    id,
    origin
) {

    let item = null;

    if (type === "goal") {

        item =
            state.goals.find(
                element =>
                    element.id === id
            );

    }

    if (type === "task") {

        item =
            state.tasks.find(
                element =>
                    element.id === id
            );

    }

    if (type === "note") {

        item =
            state.notes.find(
                element =>
                    element.id === id
            );

    }

    if (!item) {
        return;
    }

    const title =
        type === "goal"
            ? "Meta"
            : type === "task"
                ? "Tarefa"
                : "Nota";

    const status =
        type === "goal" ||
        type === "task"
            ? item.completed
                ? "Concluída"
                : "Em andamento"
            : "";

    const content =
        item.content ||
        "Sem conteúdo.";

    showModal({

        title:
            item.title,

        content: `

            <div class="detail-content">

                <p>
                    <strong>${title}</strong>
                    ${status
                        ? " • " + status
                        : ""}
                </p>

                <p>
                    <strong>Criado:</strong>
                    ${formatDateTime(
                        item.createdAt
                    )}
                </p>

                <hr>

                <div>
                    ${escapeHTML(
                        content
                    )}
                </div>

            </div>

        `,

        buttons: [

            {
                text: "Fechar",
                className:
                    "secondary-button",
                action:
                    closeModals
            }

        ]
    });
}


/* =========================================================
   FIXAR
========================================================= */

function togglePin(
    type,
    id
) {

    if (state.viewer) {
        return;
    }

    let list;
    let key;

    if (type === "goal") {

        list =
            state.goals;

        key =
            KEYS.goals;
    }

    if (type === "task") {

        list =
            state.tasks;

        key =
            KEYS.tasks;
    }

    if (type === "note") {

        list =
            state.notes;

        key =
            KEYS.notes;
    }

    if (!list) {
        return;
    }

    const item =
        list.find(
            element =>
                element.id === id
        );

    if (!item) {
        return;
    }

    item.pinned =
        !item.pinned;

    saveArray(
        key,
        list
    );

    renderGoals();
    renderTasks();
    renderNotes();
}


/* =========================================================
   LIXEIRA
========================================================= */

function moveToTrash(
    type,
    id
) {

    if (state.viewer) {
        return;
    }

    let list;
    let key;
    let item;

    if (type === "goal") {

        list =
            state.goals;

        key =
            KEYS.goals;
    }

    if (type === "task") {

        list =
            state.tasks;

        key =
            KEYS.tasks;
    }

    if (type === "note") {

        list =
            state.notes;

        key =
            KEYS.notes;
    }

    if (!list) {
        return;
    }

    item =
        list.find(
            element =>
                element.id === id
        );

    if (!item) {
        return;
    }

    const typeName =
        type === "goal"
            ? "meta"
            : type === "task"
                ? "tarefa"
                : "nota";

    confirmModal(
        `Excluir ${typeName}?`,
        `O item será enviado para a lixeira e ficará lá por 50 dias.`,
        "Enviar para lixeira",
        () => {

            const trashItem = {

                trashId:
                    generateId(),

                originalId:
                    item.id,

                type,

                title:
                    item.title,

                content:
                    item.content || "",

                completed:
                    Boolean(
                        item.completed
                    ),

                pinned:
                    Boolean(
                        item.pinned
                    ),

                createdAt:
                    item.createdAt,

                deletedAt:
                    new Date()
                        .toISOString()

            };

            state.trash.push(
                trashItem
            );

            list =
                list.filter(
                    element =>
                        element.id !== id
                );

            if (type === "goal") {
                state.goals = list;
            }

            if (type === "task") {
                state.tasks = list;
            }

            if (type === "note") {
                state.notes = list;
            }

            saveArray(
                KEYS.trash,
                state.trash
            );

            saveArray(
                key,
                list
            );

            renderGoals();
            renderTasks();
            renderNotes();
            renderProgress();

            toast(
                "Enviado para a lixeira."
            );
        }
    );
}

function cleanTrash() {

    const now =
        Date.now();

    const valid =
        state.trash.filter(
            item => {

                const deleted =
                    new Date(
                        item.deletedAt
                    ).getTime();

                return (
                    now - deleted
                    <
                    TRASH_TIME
                );

            }
        );

    if (
        valid.length !==
        state.trash.length
    ) {

        state.trash =
            valid;

        saveArray(
            KEYS.trash,
            state.trash
        );
    }
}

function setupTrash() {

    const button =
        get("trashButton");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            if (state.viewer) {

                toast(
                    "Desative o Modo Visualizador primeiro."
                );

                return;
            }

            cleanTrash();

            showScreen(
                "trashScreen"
            );

        }
    );
}

function renderTrash() {

    cleanTrash();

    const container =
        get("trashList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!state.trash.length) {

        container.innerHTML =
            `<div class="empty-message">
                A lixeira está vazia.
            </div>`;

        return;
    }

    const list =
        state.trash
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.deletedAt
                    ) -
                    new Date(
                        a.deletedAt
                    )
            );

    list.forEach(item => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "trash-card";

        const typeName =
            item.type === "goal"
                ? "Meta"
                : item.type === "task"
                    ? "Tarefa"
                    : "Nota";

        const deleted =
            new Date(
                item.deletedAt
            );

        const expires =
            new Date(
                deleted.getTime() +
                TRASH_TIME
            );

        const title =
            document.createElement(
                "div"
            );

        title.className =
            "trash-title";

        title.textContent =
            item.title;

        const info =
            document.createElement(
                "div"
            );

        info.className =
            "trash-info";

        info.textContent =
            `${typeName} • Excluído em ${formatDateTime(
                item.deletedAt
            )} • Expira em ${formatDateTime(
                expires.toISOString()
            )}`;

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "trash-actions";

        const restore =
            document.createElement(
                "button"
            );

        restore.className =
            "primary-button";

        restore.textContent =
            "♻️ Restaurar";

        restore.addEventListener(
            "click",
            () => restoreTrash(
                item.trashId
            )
        );

        const permanent =
            document.createElement(
                "button"
            );

        permanent.className =
            "danger-button";

        permanent.textContent =
            "🗑️ Apagar";

        permanent.addEventListener(
            "click",
            () =>
                permanentlyDeleteTrash(
                    item.trashId
                )
        );

        actions.appendChild(
            restore
        );

        actions.appendChild(
            permanent
        );

        card.appendChild(
            title
        );

        card.appendChild(
            info
        );

        card.appendChild(
            actions
        );

        container.appendChild(
            card
        );

    });
}

function restoreTrash(
    trashId
) {

    const item =
        state.trash.find(
            element =>
                element.trashId ===
                trashId
        );

    if (!item) {
        return;
    }

    confirmModal(
        "Restaurar item?",
        `Restaurar "${item.title}"?`,
        "Restaurar",
        () => {

            const restored = {

                id:
                    item.originalId ||
                    generateId(),

                title:
                    item.title,

                content:
                    item.content || "",

                pinned:
                    Boolean(
                        item.pinned
                    ),

                createdAt:
                    item.createdAt

            };

            if (
                item.type ===
                "goal"
            ) {

                restored.completed =
                    Boolean(
                        item.completed
                    );

                state.goals.push(
                    restored
                );

                saveArray(
                    KEYS.goals,
                    state.goals
                );

                renderGoals();
                renderProgress();

            }

            if (
                item.type ===
                "task"
            ) {

                restored.completed =
                    Boolean(
                        item.completed
                    );

                state.tasks.push(
                    restored
                );

                saveArray(
                    KEYS.tasks,
                    state.tasks
                );

                renderTasks();

            }

            if (
                item.type ===
                "note"
            ) {

                state.notes.push(
                    restored
                );

                saveArray(
                    KEYS.notes,
                    state.notes
                );

                renderNotes();

            }

            state.trash =
                state.trash.filter(
                    element =>
                        element.trashId !==
                        trashId
                );

            saveArray(
                KEYS.trash,
                state.trash
            );

            renderTrash();

            toast(
                "Item restaurado."
            );

        }
    );
}

function permanentlyDeleteTrash(
    trashId
) {

    const item =
        state.trash.find(
            element =>
                element.trashId ===
                trashId
        );

    if (!item) {
        return;
    }

    confirmModal(
        "Apagar definitivamente?",
        `"${item.title}" será apagado definitivamente.`,
        "Apagar",
        () => {

            state.trash =
                state.trash.filter(
                    element =>
                        element.trashId !==
                        trashId
                );

            saveArray(
                KEYS.trash,
                state.trash
            );

            renderTrash();

            toast(
                "Apagado definitivamente."
            );

        }
    );
}


/* =========================================================
   CRONÔMETRO
========================================================= */

function setupTimer() {

    const start =
        get("startTimerButton");

    const pause =
        get("pauseTimerButton");

    const reset =
        get("resetTimerButton");

    if (start) {

        start.addEventListener(
            "click",
            startTimer
        );

    }

    if (pause) {

        pause.addEventListener(
            "click",
            pauseTimer
        );

    }

    if (reset) {

        reset.addEventListener(
            "click",
            resetTimer
        );

    }

    updateTimer();
}

function startTimer() {

    if (state.timerRunning) {
        return;
    }

    state.timerRunning =
        true;

    state.timerInterval =
        setInterval(
            () => {

                state.timerSeconds++;

                localStorage.setItem(
                    KEYS.timer,
                    String(
                        state.timerSeconds
                    )
                );

                updateTimer();

            },
            1000
        );

    updateTimerButtons();
}

function pauseTimer() {

    state.timerRunning =
        false;

    if (
        state.timerInterval
    ) {

        clearInterval(
            state.timerInterval
        );

        state.timerInterval =
            null;
    }

    updateTimerButtons();
}

function resetTimer() {

    pauseTimer();

    state.timerSeconds =
        0;

    localStorage.setItem(
        KEYS.timer,
        "0"
    );

    updateTimer();
}

function updateTimer() {

    const display =
        get("timerDisplay");

    if (display) {

        display.textContent =
            formatStopwatch(
                state.timerSeconds
            );

    }

    updateTimerButtons();
}

function updateTimerButtons() {

    const start =
        get("startTimerButton");

    const pause =
        get("pauseTimerButton");

    if (start) {
        start.disabled =
            state.timerRunning;
    }

    if (pause) {
        pause.disabled =
            !state.timerRunning;
    }
}

function formatStopwatch(
    seconds
) {

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const secs =
        seconds % 60;

    return (
        String(hours)
            .padStart(2, "0") +
        ":" +
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(secs)
            .padStart(2, "0")
    );
}


/* =========================================================
   PROGRESSO
========================================================= */

function setupProgress() {

    const button =
        get(
            "shareProgressButton"
        );

    if (button) {

        button.addEventListener(
            "click",
            shareProgress
        );

    }

    renderProgress();
}

function getStats() {

    const total =
        state.goals.length;

    const completed =
        state.goals.filter(
            goal =>
                goal.completed
        ).length;

    const inProgress =
        total - completed;

    const completedPercent =
        total
            ? Math.round(
                completed /
                total *
                100
            )
            : 0;

    const inProgressPercent =
        total
            ? Math.round(
                inProgress /
                total *
                100
            )
            : 0;

    return {
        total,
        completed,
        inProgress,
        completedPercent,
        inProgressPercent
    };
}

function renderProgress() {

    const stats =
        getStats();

    const total =
        get("totalGoals");

    const completed =
        get("completedGoals");

    const inProgress =
        get("inProgressGoals");

    if (total) {
        total.textContent =
            stats.total;
    }

    if (completed) {
        completed.textContent =
            stats.completed;
    }

    if (inProgress) {
        inProgress.textContent =
            stats.inProgress;
    }

    const completedBar =
        get("completedBar");

    const inProgressBar =
        get("inProgressBar");

    if (completedBar) {

        completedBar.style.width =
            stats.completedPercent +
            "%";
    }

    if (inProgressBar) {

        inProgressBar.style.width =
            stats.inProgressPercent +
            "%";
    }

    const completedPercent =
        get("completedPercent");

    const inProgressPercent =
        get("inProgressPercent");

    if (completedPercent) {

        completedPercent.textContent =
            stats.completedPercent +
            "%";
    }

    if (inProgressPercent) {

        inProgressPercent.textContent =
            stats.inProgressPercent +
            "%";
    }
}

function shareProgress() {

    const stats =
        getStats();

    const text =
        `📊 PROGRESSO

Metas totais: ${stats.total}
Metas concluídas: ${stats.completed}
Em andamento: ${stats.inProgress}

Concluídas: ${stats.completedPercent}%
Em andamento: ${stats.inProgressPercent}%`;

    share(
        "Progresso",
        text
    );
}


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

function setupSettings() {

    setupTrash();

    const lock =
        get("settingsLockButton");

    const deleteAll =
        get("deleteAllButton");

    const viewer =
        get("viewerModeButton");

    const theme =
        get("themeButton");

    const password =
        get(
            "changePasswordButton"
        );

    const time =
        get("timeFormatButton");

    const about =
        get("aboutProjectButton");

    const generalShare =
        get("generalShareButton");

    if (lock) {

        lock.addEventListener(
            "click",
            lockSite
        );

    }

    if (deleteAll) {

        deleteAll.addEventListener(
            "click",
            deleteEverything
        );

    }

    if (viewer) {

        viewer.addEventListener(
            "click",
            toggleViewer
        );

    }

    if (theme) {

        theme.addEventListener(
            "click",
            toggleTheme
        );

    }

    if (password) {

        password.addEventListener(
            "click",
            changePassword
        );

    }

    if (time) {

        time.addEventListener(
            "click",
            toggleTimeFormat
        );

    }

    if (about) {

        about.addEventListener(
            "click",
            () =>
                showScreen(
                    "aboutScreen"
                )
        );

    }

    if (generalShare) {

        generalShare.addEventListener(
            "click",
            shareEverything
        );

    }

    updateSettingsButtons();
}

function updateSettingsButtons() {

    const viewer =
        get(
            "viewerModeButton"
        );

    const theme =
        get("themeButton");

    const time =
        get("timeFormatButton");

    if (viewer) {

        viewer.textContent =
            state.viewer
                ? "👁️ Modo Visualizador: ATIVO"
                : "👁️ Modo Visualizador: DESATIVADO";

    }

    if (theme) {

        theme.textContent =
            state.theme === "dark"
                ? "🎨 Tema: Preto e vermelho"
                : "🎨 Tema: Branco e vermelho";

    }

    if (time) {

        time.textContent =
            state.timeFormat === "24"
                ? "🕐 Formato da hora: 24 horas"
                : "🕐 Formato da hora: 12 horas";

    }
}

function toggleViewer() {

    state.viewer =
        !state.viewer;

    localStorage.setItem(
        KEYS.viewer,
        String(
            state.viewer
        )
    );

    applyViewer();

    updateSettingsButtons();

    renderGoals();
    renderTasks();
    renderNotes();
    renderClothes();

    toast(
        state.viewer
            ? "Modo Visualizador ativado."
            : "Modo Visualizador desativado."
    );
}

function applyViewer() {

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
        KEYS.theme,
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
        KEYS.timeFormat,
        state.timeFormat
    );

    updateClock();

    renderGoals();
    renderTasks();
    renderNotes();
    renderClothes();

    updateSettingsButtons();
}

function changePassword() {

    if (state.viewer) {

        toast(
            "Desative o Modo Visualizador primeiro."
        );

        return;
    }

    showModal({

        title:
            "Alterar senha de acesso",

        content: `

            <div class="form-group">

                <label>
                    Senha atual
                </label>

                <input
                    id="currentPassword"
                    type="password"
                >

            </div>

            <div class="form-group">

                <label>
                    Nova senha
                </label>

                <input
                    id="newPassword"
                    type="password"
                >

            </div>

            <div class="form-group">

                <label>
                    Confirmar nova senha
                </label>

                <input
                    id="confirmPassword"
                    type="password"
                >

            </div>

        `,

        buttons: [

            {
                text: "Cancelar",
                className:
                    "secondary-button",
                action:
                    closeModals
            },

            {
                text:
                    "Salvar",

                className:
                    "primary-button",

                action: () => {

                    const current =
                        get(
                            "currentPassword"
                        )?.value;

                    const newPassword =
                        get(
                            "newPassword"
                        )?.value;

                    const confirm =
                        get(
                            "confirmPassword"
                        )?.value;

                    if (
                        current !==
                        state.password
                    ) {

                        modalMessage(
                            "Senha atual incorreta."
                        );

                        return;
                    }

                    if (
                        !newPassword
                    ) {

                        modalMessage(
                            "Digite a nova senha."
                        );

                        return;
                    }

                    if (
                        newPassword !==
                        confirm
                    ) {

                        modalMessage(
                            "As senhas não são iguais."
                        );

                        return;
                    }

                    state.password =
                        newPassword;

                    localStorage.setItem(
                        KEYS.password,
                        newPassword
                    );

                    closeModals();

                    toast(
                        "Senha alterada."
                    );

                }
            }

        ]
    });
}

function deleteEverything() {

    if (state.viewer) {

        toast(
            "Desative o Modo Visualizador primeiro."
        );

        return;
    }

    showModal({

        title:
            "Apagar geral",

        content: `

            <div class="form-group">

                <label>
                    Senha de confirmação
                </label>

                <input
                    id="masterDeletePassword"
                    type="password"
                    placeholder="Digite a senha"
                >

            </div>

            <p class="modal-warning">
                Isso apagará todas as metas,
                tarefas, notas, roupas,
                lixeira, cronômetro e configurações.
            </p>

        `,

        buttons: [

            {
                text:
                    "Cancelar",

                className:
                    "secondary-button",

                action:
                    closeModals
            },

            {
                text:
                    "Continuar",

                className:
                    "danger-button",

                action: () => {

                    const password =
                        get(
                            "masterDeletePassword"
                        )?.value;

                    if (
                        password !==
                        MASTER_DELETE_PASSWORD
                    ) {

                        modalMessage(
                            "Senha de confirmação incorreta."
                        );

                        return;
                    }

                    closeModals();

                    confirmModal(
                        "Apagar tudo?",
                        "Todos os dados serão apagados e a senha voltará para Hg99.",
                        "Apagar tudo",
                        fullReset
                    );

                }
            }

        ]
    });
}

function fullReset() {

    pauseTimer();

    Object.values(KEYS)
        .forEach(
            key =>
                localStorage.removeItem(
                    key
                )
        );

    state.password =
        DEFAULT_ACCESS_PASSWORD;

    state.goals = [];
    state.tasks = [];
    state.notes = [];
    state.clothes = [];
    state.trash = [];

    state.theme =
        "dark";

    state.viewer =
        false;

    state.timeFormat =
        "24";

    state.timerSeconds =
        0;

    applyTheme();
    applyViewer();

    renderGoals();
    renderTasks();
    renderNotes();
    renderClothes();
    renderTrash();
    renderProgress();

    updateTimer();

    updateSettingsButtons();

    lockSite();

    toast(
        "Tudo foi apagado."
    );
}

function shareEverything() {

    const stats =
        getStats();

    const goals =
        state.goals.length
            ? state.goals
                .slice()
                .sort(sortItems)
                .map(
                    (item, i) =>
                        `${i + 1}. ${item.title}
Status: ${
    item.completed
        ? "Concluída"
        : "Em andamento"
}
${item.content || ""}`
                )
                .join(
                    "\n\n"
                )
            : "Nenhuma.";

    const tasks =
        state.tasks.length
            ? state.tasks
                .slice()
                .sort(sortItems)
                .map(
                    (item, i) =>
                        `${i + 1}. ${item.title}
Status: ${
    item.completed
        ? "Concluída"
        : "Em andamento"
}
${item.content || ""}`
                )
                .join(
                    "\n\n"
                )
            : "Nenhuma.";

    const notes =
        state.notes.length
            ? state.notes
                .slice()
                .sort(sortItems)
                .map(
                    (item, i) =>
                        `${i + 1}. ${item.title}

${item.content || ""}`
                )
                .join(
                    "\n\n"
                )
            : "Nenhuma.";

    const clothes =
        state.clothes.length
            ? state.clothes
                .slice()
                .sort(sortItems)
                .map(
                    (item, i) =>
                        `${i + 1}. ${item.title}
Touca: ${item.touca || "Não informado"}
Camiseta: ${item.camiseta || "Não informado"}
Blusa: ${item.blusa || "Não informado"}
Calça: ${item.calca || "Não informado"}
Extras: ${item.extras || "Nenhum"}`
                )
                .join(
                    "\n\n"
                )
            : "Nenhuma.";

    const text =
        `📦 SECRETO V3

🎯 METAS

${goals}

====================

📋 TAREFAS

${tasks}

====================

📝 NOTAS

${notes}

====================

👕 ROUPAS SÍTIO

${clothes}

====================

⏱️ CRONÔMETRO

${formatStopwatch(
    state.timerSeconds
)}

====================

📊 PROGRESSO

Metas totais: ${stats.total}
Concluídas: ${stats.completed}
Em andamento: ${stats.inProgress}
Concluídas: ${stats.completedPercent}%
Em andamento: ${stats.inProgressPercent}%`;

    share(
        "Secreto V3",
        text
    );
}


/* =========================================================
   COMPARTILHAMENTO
========================================================= */

async function share(
    title,
    text
) {

    if (
        navigator.share
    ) {

        try {

            await navigator.share({
                title,
                text
            });

            return;

        } catch (error) {

            if (
                error?.name ===
                "AbortError"
            ) {
                return;
            }

        }
    }

    showShareFallback(
        title,
        text
    );
}

function showShareFallback(
    title,
    text
) {

    showModal({

        title:
            "Compartilhar — " +
            title,

        content: `

            <div class="form-group">

                <label>
                    Texto
                </label>

                <textarea
                    id="shareText"
                    rows="14"
                    readonly
                ></textarea>

            </div>

        `,

        buttons: [

            {
                text:
                    "Fechar",

                className:
                    "secondary-button",

                action:
                    closeModals
            },

            {
                text:
                    "Copiar",

                className:
                    "primary-button",

                action:
                    async () => {

                        const textarea =
                            get(
                                "shareText"
                            );

                        try {

                            await navigator
                                .clipboard
                                .writeText(
                                    text
                                );

                            toast(
                                "Texto copiado."
                            );

                        } catch {

                            if (
                                textarea
                            ) {

                                textarea
                                    .select();

                            }

                            toast(
                                "Selecione e copie."
                            );
                        }

                    }
            }

        ]
    });

    const textarea =
        get("shareText");

    if (textarea) {
        textarea.value =
            text;
    }
}


/* =========================================================
   MODAIS
========================================================= */

function showModal(
    options
) {

    closeModals();

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "modal-overlay";

    const box =
        document.createElement(
            "div"
        );

    box.className =
        "modal-box";

    const title =
        document.createElement(
            "h2"
        );

    title.textContent =
        options.title || "";

    const body =
        document.createElement(
            "div"
        );

    body.className =
        "modal-body";

    body.innerHTML =
        options.content || "";

    const buttons =
        document.createElement(
            "div"
        );

    buttons.className =
        "modal-buttons";

    (
        options.buttons || []
    ).forEach(
        buttonConfig => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                buttonConfig.className ||
                "secondary-button";

            button.type =
                "button";

            button.textContent =
                buttonConfig.text;

            button.addEventListener(
                "click",
                buttonConfig.action
            );

            buttons.appendChild(
                button
            );

        }
    );

    box.appendChild(
        title
    );

    box.appendChild(
        body
    );

    box.appendChild(
        buttons
    );

    overlay.appendChild(
        box
    );

    document.body.appendChild(
        overlay
    );

    const firstInput =
        box.querySelector(
            "input, textarea"
        );

    if (firstInput) {

        setTimeout(
            () =>
                firstInput.focus(),
            50
        );
    }
}

function confirmModal(
    title,
    message,
    confirmText,
    action
) {

    showModal({

        title,

        content:
            `<p class="modal-message">
                ${escapeHTML(
                    message
                )}
            </p>`,

        buttons: [

            {
                text:
                    "Cancelar",

                className:
                    "secondary-button",

                action:
                    closeModals
            },

            {
                text:
                    confirmText,

                className:
                    "danger-button",

                action: () => {

                    closeModals();

                    action();

                }
            }

        ]
    });
}

function modalMessage(
    message
) {

    const old =
        document.querySelector(
            ".modal-inline-message"
        );

    if (old) {
        old.remove();
    }

    const box =
        document.querySelector(
            ".modal-box"
        );

    if (!box) {
        return;
    }

    const element =
        document.createElement(
            "p"
        );

    element.className =
        "modal-inline-message";

    element.textContent =
        message;

    box.insertBefore(
        element,
        box.querySelector(
            ".modal-buttons"
        )
    );
}

function closeModals() {

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal =>
                modal.remove()
        );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function toast(message) {

    const old =
        document.querySelector(
            ".app-toast"
        );

    if (old) {
        old.remove();
    }

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "app-toast";

    element.textContent =
        message;

    document.body.appendChild(
        element
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                element.remove();

            },
            2500
        );
}


/* =========================================================
   BOTÕES
========================================================= */

function createActionButton(
    icon,
    title,
    action
) {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        title === "Excluir"
            ? "delete-button"
            : title === "Editar"
                ? "edit-button"
                : "pin-button";

    button.textContent =
        icon;

    button.title =
        title;

    button.setAttribute(
        "aria-label",
        title
    );

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            action();

        }
    );

    return button;
}

function createClothesAction(
    icon,
    title,
    action
) {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "clothes-action-button";

    button.textContent =
        icon;

    button.title =
        title;

    button.setAttribute(
        "aria-label",
        title
    );

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            action();

        }
    );

    return button;
}


/* =========================================================
   ATUALIZAÇÃO GERAL
========================================================= */

function updateAll() {

    renderGoals();
    renderTasks();
    renderNotes();
    renderClothes();
    renderTrash();
    renderProgress();

    updateTimer();

    updateSettingsButtons();
}


/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }

    window.addEventListener(
        "load",
        () => {

            navigator
                .serviceWorker
                .register("./sw.js")
                .then(
                    registration => {

                        registration
                            .update()
                            .catch(
                                () => {}
                            );

                    }
                )
                .catch(
                    error => {

                        console.log(
                            "Erro no Service Worker:",
                            error
                        );

                    }
                );

        }
    );
}
