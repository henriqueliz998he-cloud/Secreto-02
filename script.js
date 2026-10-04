/* =========================================================
   MINHAS METAS V3.0
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const DEFAULT_PASSWORD = "Hg99";
const GENERAL_DELETE_PASSWORD = "Hg88";

const GOALS_STORAGE_KEY = "metas016_goals";
const TASKS_STORAGE_KEY = "metas016_tasks";

const PASSWORD_STORAGE_KEY = "metas016_password";
const THEME_STORAGE_KEY = "metas016_theme";
const TIME_FORMAT_STORAGE_KEY = "metas016_time_format";
const VISUALIZER_STORAGE_KEY = "metas016_visualizer";


/* =========================================================
   DADOS
========================================================= */

let password =
    localStorage.getItem(PASSWORD_STORAGE_KEY)
    || DEFAULT_PASSWORD;

let goals = loadData(GOALS_STORAGE_KEY);
let tasks = loadData(TASKS_STORAGE_KEY);

let currentTheme =
    localStorage.getItem(THEME_STORAGE_KEY)
    || "dark";

let timeFormat =
    localStorage.getItem(TIME_FORMAT_STORAGE_KEY)
    || "24";

let visualizerMode =
    localStorage.getItem(VISUALIZER_STORAGE_KEY)
    === "true";


/* =========================================================
   ELEMENTOS
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const homeScreen =
    document.getElementById("homeScreen");

const passwordInput =
    document.getElementById("passwordInput");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const currentDate =
    document.getElementById("currentDate");

const currentTime =
    document.getElementById("currentTime");

const screens =
    document.querySelectorAll(".screen");

const menuCards =
    document.querySelectorAll(".menu-card");

const backButtons =
    document.querySelectorAll(".back-button");


/* =========================================================
   METAS
========================================================= */

const addGoalButton =
    document.getElementById("addGoalButton");

const goalsList =
    document.getElementById("goalsList");

const goalSearchInput =
    document.getElementById("goalSearchInput");

const shareGoalsButton =
    document.getElementById("shareGoalsButton");


/* =========================================================
   TAREFAS
========================================================= */

const addTaskButton =
    document.getElementById("addTaskButton");

const tasksList =
    document.getElementById("tasksList");

const taskSearchInput =
    document.getElementById("taskSearchInput");

const shareTasksButton =
    document.getElementById("shareTasksButton");


/* =========================================================
   DETALHE
========================================================= */

const detailBackButton =
    document.getElementById("detailBackButton");

const detailHeaderTitle =
    document.getElementById("detailHeaderTitle");

const detailHeaderType =
    document.getElementById("detailHeaderType");

const detailTitle =
    document.getElementById("detailTitle");

const detailDescription =
    document.getElementById("detailDescription");

const detailDate =
    document.getElementById("detailDate");

const detailCompleteButton =
    document.getElementById("detailCompleteButton");

const detailEditButton =
    document.getElementById("detailEditButton");

const detailDeleteButton =
    document.getElementById("detailDeleteButton");

const shareDetailButton =
    document.getElementById("shareDetailButton");

let currentDetailType = null;
let currentDetailItem = null;
let previousDetailScreen = "homeScreen";


/* =========================================================
   CRONÔMETRO
========================================================= */

const timerDisplay =
    document.getElementById("timerDisplay");

const startTimerButton =
    document.getElementById("startTimerButton");

const pauseTimerButton =
    document.getElementById("pauseTimerButton");

const resetTimerButton =
    document.getElementById("resetTimerButton");

let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;


/* =========================================================
   PROGRESSO
========================================================= */

const totalGoalsElement =
    document.getElementById("totalGoals");

const completedGoalsElement =
    document.getElementById("completedGoals");

const activeGoalsElement =
    document.getElementById("activeGoals");

const chartCompleted =
    document.getElementById("chartCompleted");

const chartActive =
    document.getElementById("chartActive");

const shareProgressButton =
    document.getElementById("shareProgressButton");


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const settingsLockButton =
    document.getElementById("settingsLockButton");

const deleteAllButton =
    document.getElementById("deleteAllButton");

const visualizerButton =
    document.getElementById("visualizerButton");

const themeButton =
    document.getElementById("themeButton");

const changePasswordButton =
    document.getElementById("changePasswordButton");

const timeFormatButton =
    document.getElementById("timeFormatButton");

const aboutButton =
    document.getElementById("aboutButton");

const generalShareButton =
    document.getElementById("generalShareButton");


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    applyTheme();

    applyVisualizerMode();

    updateDateTime();

    setInterval(
        updateDateTime,
        1000
    );

    renderGoals();

    renderTasks();

    updateProgress();

    updateTimerDisplay();

    updateSettingsLabels();

    registerServiceWorker();

    passwordInput.focus();

});


/* =========================================================
   LOGIN
========================================================= */

loginButton.addEventListener(
    "click",
    login
);

passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            login();
        }

    }
);


function login() {

    const enteredPassword =
        passwordInput.value;

    if (enteredPassword === password) {

        loginMessage.textContent = "";

        passwordInput.value = "";

        showScreen("homeScreen");

        return;

    }

    loginMessage.textContent =
        "Senha incorreta.";

    passwordInput.value = "";

    passwordInput.focus();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

menuCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                const targetScreen =
                    card.dataset.screen;

                showScreen(
                    targetScreen
                );

            }
        );

    }
);


backButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const targetScreen =
                    button.dataset.back;

                if (targetScreen) {
                    showScreen(targetScreen);
                }

            }
        );

    }
);


function showScreen(screenId) {

    screens.forEach(
        (screen) => {

            screen.classList.add(
                "hidden"
            );

        }
    );

    const target =
        document.getElementById(screenId);

    if (target) {

        target.classList.remove(
            "hidden"
        );

    }

    if (
        screenId === "progressScreen"
    ) {

        updateProgress();

    }

}


/* =========================================================
   DATA E HORA
========================================================= */

function updateDateTime() {

    const now =
        new Date();

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const year =
        now.getFullYear();

    currentDate.textContent =
        `${day}/${month}/${year}`;

    currentTime.textContent =
        formatTimeFromDate(now);

}


function formatTimeFromDate(date) {

    let hours =
        date.getHours();

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            date.getSeconds()
        ).padStart(2, "0");


    if (timeFormat === "12") {

        const suffix =
            hours >= 12
                ? "PM"
                : "AM";

        hours =
            hours % 12;

        if (hours === 0) {
            hours = 12;
        }

        return (
            `${String(hours).padStart(2, "0")}:` +
            `${minutes}:${seconds} ${suffix}`
        );

    }


    return (
        `${String(hours).padStart(2, "0")}:` +
        `${minutes}:${seconds}`
    );

}


/* =========================================================
   METAS
========================================================= */

addGoalButton.addEventListener(
    "click",
    () => {

        if (visualizerMode) {
            return;
        }

        openGoalModal();

    }
);


goalSearchInput.addEventListener(
    "input",
    renderGoals
);


function openGoalModal(goal = null) {

    if (visualizerMode) {
        return;
    }

    const editing =
        goal !== null;

    const overlay =
        createModalOverlay();

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.innerHTML = `

        <h2>
            ${editing
                ? "✏️ Editar meta"
                : "🎯 Nova meta"}
        </h2>

        <label>
            Título
        </label>

        <input
            type="text"
            id="goalTitleInput"
            placeholder="Nome da meta"
            maxlength="100"
        >

        <label>
            Conteúdo
        </label>

        <textarea
            id="goalDescriptionInput"
            placeholder="Escreva o conteúdo da meta..."
            maxlength="2000"
        ></textarea>

        <div class="modal-buttons">

            <button
                id="cancelGoalButton"
                class="secondary-button"
            >
                Cancelar
            </button>

            <button
                id="saveGoalButton"
                class="primary-button"
            >
                ${editing
                    ? "Salvar"
                    : "Adicionar"}
            </button>

        </div>

    `;


    overlay.appendChild(modal);

    document.body.appendChild(
        overlay
    );


    const titleInput =
        document.getElementById(
            "goalTitleInput"
        );

    const descriptionInput =
        document.getElementById(
            "goalDescriptionInput"
        );


    if (editing) {

        titleInput.value =
            goal.title;

        descriptionInput.value =
            goal.description;

    }


    titleInput.focus();


    document
        .getElementById(
            "cancelGoalButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );


    document
        .getElementById(
            "saveGoalButton"
        )
        .addEventListener(
            "click",
            () => {

                const title =
                    titleInput.value.trim();

                const description =
                    descriptionInput.value.trim();


                if (!title) {

                    showAlert(
                        "Digite um título."
                    );

                    titleInput.focus();

                    return;

                }


                if (editing) {

                    goal.title =
                        title;

                    goal.description =
                        description;

                } else {

                    goals.push({

                        id: Date.now(),

                        title,

                        description,

                        completed: false,

                        createdAt:
                            new Date().toISOString()

                    });

                }


                saveData(
                    GOALS_STORAGE_KEY,
                    goals
                );

                renderGoals();

                updateProgress();

                overlay.remove();

            }
        );

    }


}


/* =========================================================
   EXIBIR METAS
========================================================= */

function renderGoals() {

    goalsList.innerHTML = "";

    const search =
        goalSearchInput.value
            .trim()
            .toLowerCase();

    const filtered =
        goals.filter(
            (goal) =>
                goal.title
                    .toLowerCase()
                    .includes(search)
        );


    if (filtered.length === 0) {

        const message =
            document.createElement("div");

        message.className =
            "empty-message";

        message.textContent =
            goals.length === 0
                ? "Você ainda não possui nenhuma meta."
                : "Nenhuma meta encontrada.";

        goalsList.appendChild(
            message
        );

        return;

    }


    filtered.forEach(
        (goal) => {

            const card =
                document.createElement("div");

            card.className =
                "item-card";


            if (goal.completed) {

                card.classList.add(
                    "completed"
                );

            }


            card.innerHTML = `

                <div class="item-main">

                    <input
                        type="checkbox"
                        class="item-checkbox"
                        ${goal.completed
                            ? "checked"
                            : ""}
                        aria-label="Concluir meta"
                    >

                    <div class="item-info">

                        <div class="item-title"></div>

                        <div class="item-date"></div>

                    </div>

                </div>


                <div class="item-actions">

                    <button
                        class="item-action-button edit-button"
                    >
                        ✏️
                    </button>

                    <button
                        class="item-action-button delete delete-button"
                    >
                        🗑️
                    </button>

                </div>

            `;


            const title =
                card.querySelector(
                    ".item-title"
                );

            const date =
                card.querySelector(
                    ".item-date"
                );

            const checkbox =
                card.querySelector(
                    ".item-checkbox"
                );

            const editButton =
                card.querySelector(
                    ".edit-button"
                );

            const deleteButton =
                card.querySelector(
                    ".delete-button"
                );


            title.textContent =
                goal.title;

            date.textContent =
                formatCreatedDate(
                    goal.createdAt
                );


            title.addEventListener(
                "click",
                () => {

                    openDetail(
                        "goal",
                        goal,
                        "goalsScreen"
                    );

                }
            );


            checkbox.addEventListener(
                "change",
                () => {

                    if (visualizerMode) {

                        checkbox.checked =
                            goal.completed;

                        return;

                    }

                    goal.completed =
                        checkbox.checked;

                    saveData(
                        GOALS_STORAGE_KEY,
                        goals
                    );

                    renderGoals();

                    updateProgress();

                }
            );


            editButton.addEventListener(
                "click",
                () => {

                    openGoalModal(
                        goal
                    );

                }
            );


            deleteButton.addEventListener(
                "click",
                () => {

                    confirmDelete(
                        "Excluir meta",
                        "Deseja realmente excluir esta meta?",
                        () => {

                            goals =
                                goals.filter(
                                    (item) =>
                                        item.id !== goal.id
                                );

                            saveData(
                                GOALS_STORAGE_KEY,
                                goals
                            );

                            renderGoals();

                            updateProgress();

                        }
                    );

                }
            );


            goalsList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   TAREFAS
========================================================= */

addTaskButton.addEventListener(
    "click",
    () => {

        if (visualizerMode) {
            return;
        }

        openTaskModal();

    }
);


taskSearchInput.addEventListener(
    "input",
    renderTasks
);


function openTaskModal(task = null) {

    if (visualizerMode) {
        return;
    }

    const editing =
        task !== null;

    const overlay =
        createModalOverlay();

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.innerHTML = `

        <h2>
            ${editing
                ? "✏️ Editar tarefa"
                : "📋 Nova tarefa"}
        </h2>

        <label>
            Título
        </label>

        <input
            type="text"
            id="taskTitleInput"
            placeholder="Nome da tarefa"
            maxlength="100"
        >

        <label>
            Conteúdo
        </label>

        <textarea
            id="taskDescriptionInput"
            placeholder="Escreva o conteúdo da tarefa..."
            maxlength="2000"
        ></textarea>

        <div class="modal-buttons">

            <button
                id="cancelTaskButton"
                class="secondary-button"
            >
                Cancelar
            </button>

            <button
                id="saveTaskButton"
                class="primary-button"
            >
                ${editing
                    ? "Salvar"
                    : "Adicionar"}
            </button>

        </div>

    `;


    overlay.appendChild(modal);

    document.body.appendChild(
        overlay
    );


    const titleInput =
        document.getElementById(
            "taskTitleInput"
        );

    const descriptionInput =
        document.getElementById(
            "taskDescriptionInput"
        );


    if (editing) {

        titleInput.value =
            task.title;

        descriptionInput.value =
            task.description;

    }


    titleInput.focus();


    document
        .getElementById(
            "cancelTaskButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );


    document
        .getElementById(
            "saveTaskButton"
        )
        .addEventListener(
            "click",
            () => {

                const title =
                    titleInput.value.trim();

                const description =
                    descriptionInput.value.trim();


                if (!title) {

                    showAlert(
                        "Digite um título."
                    );

                    titleInput.focus();

                    return;

                }


                if (editing) {

                    task.title =
                        title;

                    task.description =
                        description;

                } else {

                    tasks.push({

                        id: Date.now(),

                        title,

                        description,

                        completed: false,

                        createdAt:
                            new Date().toISOString()

                    });

                }


                saveData(
                    TASKS_STORAGE_KEY,
                    tasks
                );

                renderTasks();

                overlay.remove();

            }
        );

    }


}


/* =========================================================
   EXIBIR TAREFAS
========================================================= */

function renderTasks() {

    tasksList.innerHTML = "";

    const search =
        taskSearchInput.value
            .trim()
            .toLowerCase();

    const filtered =
        tasks.filter(
            (task) =>
                task.title
                    .toLowerCase()
                    .includes(search)
        );


    if (filtered.length === 0) {

        const message =
            document.createElement("div");

        message.className =
            "empty-message";

        message.textContent =
            tasks.length === 0
                ? "Você ainda não possui nenhuma tarefa."
                : "Nenhuma tarefa encontrada.";

        tasksList.appendChild(
            message
        );

        return;

    }


    filtered.forEach(
        (task) => {

            const card =
                document.createElement("div");

            card.className =
                "item-card";


            if (task.completed) {

                card.classList.add(
                    "completed"
                );

            }


            card.innerHTML = `

                <div class="item-main">

                    <input
                        type="checkbox"
                        class="item-checkbox"
                        ${task.completed
                            ? "checked"
                            : ""}
                        aria-label="Concluir tarefa"
                    >

                    <div class="item-info">

                        <div class="item-title"></div>

                        <div class="item-date"></div>

                    </div>

                </div>


                <div class="item-actions">

                    <button
                        class="item-action-button edit-button"
                    >
                        ✏️
                    </button>

                    <button
                        class="item-action-button delete delete-button"
                    >
                        🗑️
                    </button>

                </div>

            `;


            const title =
                card.querySelector(
                    ".item-title"
                );

            const date =
                card.querySelector(
                    ".item-date"
                );

            const checkbox =
                card.querySelector(
                    ".item-checkbox"
                );

            const editButton =
                card.querySelector(
                    ".edit-button"
                );

            const deleteButton =
                card.querySelector(
                    ".delete-button"
                );


            title.textContent =
                task.title;

            date.textContent =
                formatCreatedDate(
                    task.createdAt
                );


            title.addEventListener(
                "click",
                () => {

                    openDetail(
                        "task",
                        task,
                        "tasksScreen"
                    );

                }
            );


            checkbox.addEventListener(
                "change",
                () => {

                    if (visualizerMode) {

                        checkbox.checked =
                            task.completed;

                        return;

                    }

                    task.completed =
                        checkbox.checked;

                    saveData(
                        TASKS_STORAGE_KEY,
                        tasks
                    );

                    renderTasks();

                }
            );


            editButton.addEventListener(
                "click",
                () => {

                    openTaskModal(
                        task
                    );

                }
            );


            deleteButton.addEventListener(
                "click",
                () => {

                    confirmDelete(
                        "Excluir tarefa",
                        "Deseja realmente excluir esta tarefa?",
                        () => {

                            tasks =
                                tasks.filter(
                                    (item) =>
                                        item.id !== task.id
                                );

                            saveData(
                                TASKS_STORAGE_KEY,
                                tasks
                            );

                            renderTasks();

                        }
                    );

                }
            );


            tasksList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DETALHE
========================================================= */

function openDetail(
    type,
    item,
    previousScreen
) {

    currentDetailType =
        type;

    currentDetailItem =
        item;

    previousDetailScreen =
        previousScreen;


    detailHeaderTitle.textContent =
        type === "goal"
            ? "🎯 Meta"
            : "📋 Tarefa";


    detailHeaderType.textContent =
        type === "goal"
            ? "Detalhes da meta"
            : "Detalhes da tarefa";


    detailTitle.textContent =
        item.title;


    detailDescription.textContent =
        item.description ||
        "Sem conteúdo.";


    detailDate.textContent =
        `Criado em ${formatCreatedDate(
            item.createdAt
        )}`;


    detailCompleteButton.textContent =
        item.completed
            ? "↩️ Marcar como em andamento"
            : "✅ Marcar como concluído";


    applyVisualizerMode();


    showScreen(
        "detailScreen"
    );

}


detailBackButton.addEventListener(
    "click",
    () => {

        showScreen(
            previousDetailScreen
        );

    }
);


detailCompleteButton.addEventListener(
    "click",
    () => {

        if (visualizerMode) {
            return;
        }

        if (!currentDetailItem) {
            return;
        }

        currentDetailItem.completed =
            !currentDetailItem.completed;


        if (currentDetailType === "goal") {

            saveData(
                GOALS_STORAGE_KEY,
                goals
            );

            renderGoals();

            updateProgress();

        } else {

            saveData(
                TASKS_STORAGE_KEY,
                tasks
            );

            renderTasks();

        }


        openDetail(
            currentDetailType,
            currentDetailItem,
            previousDetailScreen
        );

    }
);


detailEditButton.addEventListener(
    "click",
    () => {

        if (visualizerMode) {
            return;
        }

        if (currentDetailType === "goal") {

            openGoalModal(
                currentDetailItem
            );

        } else {

            openTaskModal(
                currentDetailItem
            );

        }

    }
);


detailDeleteButton.addEventListener(
    "click",
    () => {

        if (visualizerMode) {
            return;
        }

        confirmDelete(
            currentDetailType === "goal"
                ? "Excluir meta"
                : "Excluir tarefa",

            currentDetailType === "goal"
                ? "Deseja realmente excluir esta meta?"
                : "Deseja realmente excluir esta tarefa?",

            () => {

                if (
                    currentDetailType === "goal"
                ) {

                    goals =
                        goals.filter(
                            (item) =>
                                item.id !==
                                currentDetailItem.id
                        );

                    saveData(
                        GOALS_STORAGE_KEY,
                        goals
                    );

                    renderGoals();

                    updateProgress();

                } else {

                    tasks =
                        tasks.filter(
                            (item) =>
                                item.id !==
                                currentDetailItem.id
                        );

                    saveData(
                        TASKS_STORAGE_KEY,
                        tasks
                    );

                    renderTasks();

                }


                showScreen(
                    previousDetailScreen
                );

            }
        );

    }
);


/* =========================================================
   PROGRESSO
========================================================= */

function updateProgress() {

    const total =
        goals.length;

    const completed =
        goals.filter(
            (goal) =>
                goal.completed
        ).length;

    const active =
        total - completed;


    totalGoalsElement.textContent =
        total;

    completedGoalsElement.textContent =
        completed;

    activeGoalsElement.textContent =
        active;


    updateCharts(
        total,
        completed,
        active
    );

}


function updateCharts(
    total,
    completed,
    active
) {

    if (total === 0) {

        chartCompleted.style.width =
            "90px";

        chartActive.style.width =
            "90px";

        chartCompleted.style.opacity =
            "0.4";

        chartActive.style.opacity =
            "0.4";

        return;

    }


    chartCompleted.style.opacity =
        "1";

    chartActive.style.opacity =
        "1";


    const completedPercentage =
        (completed / total) * 100;

    const activePercentage =
        (active / total) * 100;


    chartCompleted.style.width =
        `${Math.max(
            completedPercentage,
            15
        )}%`;


    chartActive.style.width =
        `${Math.max(
            activePercentage,
            15
        )}%`;

}


/* =========================================================
   COMPARTILHAMENTO
========================================================= */

shareGoalsButton.addEventListener(
    "click",
    () => {

        shareText(
            buildGoalsShareText()
        );

    }
);


shareTasksButton.addEventListener(
    "click",
    () => {

        shareText(
            buildTasksShareText()
        );

    }
);


shareProgressButton.addEventListener(
    "click",
    () => {

        shareText(
            buildProgressShareText()
        );

    }
);


shareDetailButton.addEventListener(
    "click",
    () => {

        if (!currentDetailItem) {
            return;
        }

        const typeName =
            currentDetailType === "goal"
                ? "Meta"
                : "Tarefa";

        const text =
            `${typeName}: ${currentDetailItem.title}\n\n` +
            `${currentDetailItem.description || "Sem conteúdo."}\n\n` +
            `Criado em: ${formatCreatedDate(
                currentDetailItem.createdAt
            )}\n` +
            `Status: ${
                currentDetailItem.completed
                    ? "Concluído"
                    : "Em andamento"
            }`;

        shareText(text);

    }
);


generalShareButton.addEventListener(
    "click",
    () => {

        shareText(
            buildGeneralShareText()
        );

    }
);


async function shareText(text) {

    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "Meu Espaço",

                text

            });

        } catch (error) {

            if (
                error.name !==
                "AbortError"
            ) {

                copyToClipboard(
                    text
                );

            }

        }

        return;

    }


    copyToClipboard(
        text
    );

}


function buildGoalsShareText() {

    let text =
        "🎯 MINHAS METAS\n\n";


    if (goals.length === 0) {

        return (
            text +
            "Nenhuma meta cadastrada."
        );

    }


    goals.forEach(
        (goal, index) => {

            text +=
                `${index + 1}. ${goal.title}\n`;

            text +=
                `Status: ${
                    goal.completed
                        ? "Concluída"
                        : "Em andamento"
                }\n`;

            text +=
                `Criada em: ${
                    formatCreatedDate(
                        goal.createdAt
                    )
                }\n\n`;

        }
    );


    return text.trim();

}


function buildTasksShareText() {

    let text =
        "📋 MINHAS TAREFAS\n\n";


    if (tasks.length === 0) {

        return (
            text +
            "Nenhuma tarefa cadastrada."
        );

    }


    tasks.forEach(
        (task, index) => {

            text +=
                `${index + 1}. ${task.title}\n`;

            text +=
                `Status: ${
                    task.completed
                        ? "Concluída"
                        : "Em andamento"
                }\n`;

            text +=
                `Criada em: ${
                    formatCreatedDate(
                        task.createdAt
                    )
                }\n\n`;

        }
    );


    return text.trim();

}


function buildProgressShareText() {

    const total =
        goals.length;

    const completed =
        goals.filter(
            (goal) =>
                goal.completed
        ).length;

    const active =
        total - completed;


    return (
        "📊 MEU PROGRESSO\n\n" +
        `🎯 Metas totais: ${total}\n` +
        `✅ Metas concluídas: ${completed}\n` +
        `🔄 Em andamento: ${active}\n\n` +
        "O gráfico representa visualmente " +
        "a proporção entre metas concluídas " +
        "e metas em andamento."
    );

}


function buildGeneralShareText() {

    const total =
        goals.length;

    const completed =
        goals.filter(
            (goal) =>
                goal.completed
        ).length;

    const active =
        total - completed;


    let text =
        "📱 MEU ESPAÇO\n\n";


    text +=
        "🎯 METAS\n";

    if (goals.length === 0) {

        text +=
            "Nenhuma meta cadastrada.\n\n";

    } else {

        goals.forEach(
            (goal, index) => {

                text +=
                    `${index + 1}. ${goal.title} — ` +
                    `${
                        goal.completed
                            ? "Concluída"
                            : "Em andamento"
                    }\n`;

            }
        );

        text += "\n";

    }


    text +=
        "📋 TAREFAS\n";

    if (tasks.length === 0) {

        text +=
            "Nenhuma tarefa cadastrada.\n\n";

    } else {

        tasks.forEach(
            (task, index) => {

                text +=
                    `${index + 1}. ${task.title} — ` +
                    `${
                        task.completed
                            ? "Concluída"
                            : "Em andamento"
                    }\n`;

            }
        );

        text += "\n";

    }


    text +=
        "⏱️ CRONÔMETRO\n";

    text +=
        `Tempo atual: ${
            formatTimerSeconds(
                timerSeconds
            )
        }\n\n`;


    text +=
        "📊 PROGRESSO\n";

    text +=
        `Metas totais: ${total}\n`;

    text +=
        `Metas concluídas: ${completed}\n`;

    text +=
        `Em andamento: ${active}`;


    return text;

}


function copyToClipboard(text) {

    if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(text)
            .then(
                () => {

                    showAlert(
                        "Conteúdo copiado para a área de transferência."
                    );

                }
            )
            .catch(
                () => {

                    showAlert(
                        text
                    );

                }
            );

        return;

    }


    showAlert(text);

}


/* =========================================================
   CRONÔMETRO
========================================================= */

startTimerButton.addEventListener(
    "click",
    startTimer
);

pauseTimerButton.addEventListener(
    "click",
    pauseTimer
);

resetTimerButton.addEventListener(
    "click",
    resetTimer
);


function startTimer() {

    if (timerRunning) {
        return;
    }


    timerRunning =
        true;


    timerInterval =
        setInterval(
            () => {

                timerSeconds++;

                updateTimerDisplay();

            },
            1000
        );

}


function pauseTimer() {

    if (!timerRunning) {
        return;
    }


    timerRunning =
        false;

    clearInterval(
        timerInterval
    );

    timerInterval =
        null;

}


function resetTimer() {

    timerRunning =
        false;

    clearInterval(
        timerInterval
    );

    timerInterval =
        null;

    timerSeconds =
        0;

    updateTimerDisplay();

}


function updateTimerDisplay() {

    timerDisplay.textContent =
        formatTimerSeconds(
            timerSeconds
        );

}


function formatTimerSeconds(
    totalSeconds
) {

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;


    return (
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`
    );

}


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

settingsLockButton.addEventListener(
    "click",
    lockSite
);


deleteAllButton.addEventListener(
    "click",
    deleteEverything
);


visualizerButton.addEventListener(
    "click",
    toggleVisualizer
);


themeButton.addEventListener(
    "click",
    toggleTheme
);


changePasswordButton.addEventListener(
    "click",
    changeAccessPassword
);


timeFormatButton.addEventListener(
    "click",
    toggleTimeFormat
);


aboutButton.addEventListener(
    "click",
    () => {

        showScreen(
            "aboutScreen"
        );

    }
);


/* =========================================================
   BLOQUEAR
========================================================= */

function lockSite() {

    pauseTimer();

    showScreen(
        "loginScreen"
    );

    passwordInput.value =
        "";

    loginMessage.textContent =
        "";

    passwordInput.focus();

}


/* =========================================================
   APAGAR GERAL
========================================================= */

function deleteEverything() {

    const overlay =
        createModalOverlay();

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.innerHTML = `

        <h2>
            🗑️ Apagar geral
        </h2>

        <p>
            Esta função apagará todas as metas
            e todas as tarefas.
            Esta ação não poderá ser desfeita.
        </p>

        <label>
            Senha para apagar geral
        </label>

        <input
            type="password"
            id="generalDeletePasswordInput"
            placeholder="Senha"
            autocomplete="off"
        >

        <div class="modal-buttons">

            <button
                id="cancelGeneralDeleteButton"
                class="secondary-button"
            >
                Cancelar
            </button>

            <button
                id="continueGeneralDeleteButton"
                class="danger-button"
            >
                Continuar
            </button>

        </div>

    `;


    overlay.appendChild(modal);

    document.body.appendChild(
        overlay
    );


    const passwordField =
        document.getElementById(
            "generalDeletePasswordInput"
        );


    passwordField.focus();


    document
        .getElementById(
            "cancelGeneralDeleteButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );


    document
        .getElementById(
            "continueGeneralDeleteButton"
        )
        .addEventListener(
            "click",
            () => {

                if (
                    passwordField.value !==
                    GENERAL_DELETE_PASSWORD
                ) {

                    showAlert(
                        "Senha incorreta."
                    );

                    passwordField.value =
                        "";

                    passwordField.focus();

                    return;

                }


                overlay.remove();


                confirmDelete(
                    "Confirmar apagamento geral",
                    "Tem certeza que deseja apagar todas as metas e tarefas?",
                    () => {

                        goals = [];

                        tasks = [];


                        saveData(
                            GOALS_STORAGE_KEY,
                            goals
                        );

                        saveData(
                            TASKS_STORAGE_KEY,
                            tasks
                        );


                        renderGoals();

                        renderTasks();

                        updateProgress();


                        showAlert(
                            "Tudo foi apagado."
                        );

                    }
                );

            }
        );

}


/* =========================================================
   MODO VISUALIZADOR
========================================================= */

function toggleVisualizer() {

    visualizerMode =
        !visualizerMode;


    localStorage.setItem(
        VISUALIZER_STORAGE_KEY,
        visualizerMode
    );


    applyVisualizerMode();


    showAlert(
        visualizerMode
            ? "Modo Visualizador ativado."
            : "Modo Visualizador desativado."
    );

}


function applyVisualizerMode() {

    document.body.classList.toggle(
        "visualizer-mode",
        visualizerMode
    );


    visualizerButton.textContent =
        visualizerMode
            ? "👁️ Visualizador: ativado"
            : "👁️ Modo Visualizador";

}


/* =========================================================
   TEMA
========================================================= */

function toggleTheme() {

    currentTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";


    localStorage.setItem(
        THEME_STORAGE_KEY,
        currentTheme
    );


    applyTheme();

}


function applyTheme() {

    document.body.classList.toggle(
        "light-theme",
        currentTheme === "light"
    );


    updateSettingsLabels();

}


function updateSettingsLabels() {

    themeButton.textContent =
        currentTheme === "light"
            ? "🌑 Tema: branco e vermelho"
            : "☀️ Tema: preto e vermelho";


    timeFormatButton.textContent =
        timeFormat === "24"
            ? "⏰ Formato da hora: 24 horas"
            : "⏰ Formato da hora: 12 horas";


    visualizerButton.textContent =
        visualizerMode
            ? "👁️ Visualizador: ativado"
            : "👁️ Modo Visualizador";

}


/* =========================================================
   ALTERAR SENHA
========================================================= */

function changeAccessPassword() {

    const overlay =
        createModalOverlay();

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.innerHTML = `

        <h2>
            🔑 Alterar senha
        </h2>

        <label>
            Senha atual
        </label>

        <input
            type="password"
            id="currentPasswordInput"
            autocomplete="off"
        >

        <label>
            Nova senha
        </label>

        <input
            type="password"
            id="newPasswordInput"
            autocomplete="off"
        >

        <label>
            Confirmar nova senha
        </label>

        <input
            type="password"
            id="confirmPasswordInput"
            autocomplete="off"
        >

        <div class="modal-buttons">

            <button
                id="cancelPasswordButton"
                class="secondary-button"
            >
                Cancelar
            </button>

            <button
                id="savePasswordButton"
                class="primary-button"
            >
                Salvar
            </button>

        </div>

    `;


    overlay.appendChild(modal);

    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "cancelPasswordButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );


    document
        .getElementById(
            "savePasswordButton"
        )
        .addEventListener(
            "click",
            () => {

                const current =
                    document
                        .getElementById(
                            "currentPasswordInput"
                        )
                        .value;

                const newPassword =
                    document
                        .getElementById(
                            "newPasswordInput"
                        )
                        .value;

                const confirmation =
                    document
                        .getElementById(
                            "confirmPasswordInput"
                        )
                        .value;


                if (
                    current !== password
                ) {

                    showAlert(
                        "A senha atual está incorreta."
                    );

                    return;

                }


                if (
                    newPassword.length < 1
                ) {

                    showAlert(
                        "Digite uma nova senha."
                    );

                    return;

                }


                if (
                    newPassword !==
                    confirmation
                ) {

                    showAlert(
                        "As novas senhas não coincidem."
                    );

                    return;

                }


                password =
                    newPassword;


                localStorage.setItem(
                    PASSWORD_STORAGE_KEY,
                    password
                );


                overlay.remove();


                showAlert(
                    "Senha alterada com sucesso."
                );

            }
        );

}


/* =========================================================
   FORMATO DA HORA
========================================================= */

function toggleTimeFormat() {

    timeFormat =
        timeFormat === "24"
            ? "12"
            : "24";


    localStorage.setItem(
        TIME_FORMAT_STORAGE_KEY,
        timeFormat
    );


    updateSettingsLabels();

    updateDateTime();

}


/* =========================================================
   CONFIRMAÇÃO PERSONALIZADA
========================================================= */

function confirmDelete(
    title,
    message,
    onConfirm
) {

    if (visualizerMode) {
        return;
    }


    const overlay =
        createModalOverlay();

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.innerHTML = `

        <h2>
            ⚠️ ${title}
        </h2>

        <p>
            ${message}
        </p>

        <div class="modal-buttons">

            <button
                id="cancelConfirmButton"
                class="secondary-button"
            >
                Cancelar
            </button>

            <button
                id="confirmDeleteButton"
                class="danger-button"
            >
                Excluir
            </button>

        </div>

    `;


    overlay.appendChild(modal);

    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "cancelConfirmButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );


    document
        .getElementById(
            "confirmDeleteButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

                onConfirm();

            }
        );

}


/* =========================================================
   MODAL BASE
========================================================= */

function createModalOverlay() {

    const overlay =
        document.createElement("div");

    overlay.className =
        "modal-overlay";


    overlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === overlay
            ) {

                overlay.remove();

            }

        }
    );


    return overlay;

}


function showAlert(message) {

    const overlay =
        createModalOverlay();

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.innerHTML = `

        <h2>
            ℹ️ Aviso
        </h2>

        <p></p>

        <button
            id="closeAlertButton"
            class="primary-button"
        >
            OK
        </button>

    `;


    modal.querySelector(
        "p"
    ).textContent =
        message;


    overlay.appendChild(modal);

    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "closeAlertButton"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

            }
        );

}


/* =========================================================
   DATAS
========================================================= */

function formatCreatedDate(
    dateString
) {

    if (!dateString) {
        return "Data desconhecida";
    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Data desconhecida";

    }


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();


    return (
        `${day}/${month}/${year} às ` +
        `${formatTimeFromDate(date)}`
    );

}


/* =========================================================
   LOCALSTORAGE
========================================================= */

function loadData(key) {

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        if (
            !Array.isArray(parsed)
        ) {

            return [];

        }

        return parsed;

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        return [];

    }

}


function saveData(
    key,
    data
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Erro ao salvar dados:",
            error
        );

        showAlert(
            "Não foi possível salvar os dados."
        );

    }

}


/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register("./sw.js")
                    .then(
                        (registration) => {

                            console.log(
                                "Service Worker registrado."
                            );


                            if (
                                registration.waiting
                            ) {

                                registration.waiting
                                    .postMessage(
                                        {
                                            type:
                                                "SKIP_WAITING"
                                        }
                                    );

                            }


                            registration.addEventListener(
                                "updatefound",
                                () => {

                                    const worker =
                                        registration.installing;

                                    if (!worker) {
                                        return;
                                    }


                                    worker.addEventListener(
                                        "statechange",
                                        () => {

                                            if (
                                                worker.state ===
                                                "installed" &&
                                                navigator.serviceWorker.controller
                                            ) {

                                                worker.postMessage(
                                                    {
                                                        type:
                                                            "SKIP_WAITING"
                                                    }
                                                );

                                            }

                                        }
                                    );

                                }
                            );

                        }
                    )
                    .catch(
                        (error) => {

                            console.error(
                                "Erro no Service Worker:",
                                error
                            );

                        }
                    );

            }
        );

    }

}


/* =========================================================
   SERVICE WORKER — RECARREGAR APÓS ATUALIZAÇÃO
========================================================= */

navigator.serviceWorker?.addEventListener(
    "controllerchange",
    () => {

        window.location.reload();

    }
);


/* =========================================================
   ESC
========================================================= */

window.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            const modal =
                document.querySelector(
                    ".modal-overlay"
                );

            if (modal) {

                modal.remove();

            }

        }

    }
);
