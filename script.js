/* =========================================================
   MINHAS METAS — PROJETO #016
   Sistema pessoal de metas, tarefas e progresso
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const PASSWORD = "Hg99";

const GOALS_STORAGE_KEY = "metas016_goals";
const TASKS_STORAGE_KEY = "metas016_tasks";


/* =========================================================
   ELEMENTOS PRINCIPAIS
========================================================= */

const loginScreen = document.getElementById("loginScreen");
const homeScreen = document.getElementById("homeScreen");

const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");


/* =========================================================
   TELAS
========================================================= */

const screens = document.querySelectorAll(".screen");

const menuCards = document.querySelectorAll(".menu-card");
const backButtons = document.querySelectorAll(".back-button");


/* =========================================================
   METAS
========================================================= */

const addGoalButton = document.getElementById("addGoalButton");
const goalsList = document.getElementById("goalsList");


/* =========================================================
   TAREFAS
========================================================= */

const addTaskButton = document.getElementById("addTaskButton");
const tasksList = document.getElementById("tasksList");


/* =========================================================
   CRONÔMETRO
========================================================= */

const timerDisplay = document.getElementById("timerDisplay");
const startTimerButton = document.getElementById("startTimerButton");
const pauseTimerButton = document.getElementById("pauseTimerButton");
const resetTimerButton = document.getElementById("resetTimerButton");


let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;


/* =========================================================
   PROGRESSO
========================================================= */

const totalGoalsElement = document.getElementById("totalGoals");
const completedGoalsElement = document.getElementById("completedGoals");
const activeGoalsElement = document.getElementById("activeGoals");

const chartCompleted = document.getElementById("chartCompleted");
const chartActive = document.getElementById("chartActive");


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const lockButton = document.getElementById("lockButton");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const importFile = document.getElementById("importFile");


/* =========================================================
   DADOS
========================================================= */

let goals = loadData(GOALS_STORAGE_KEY);
let tasks = loadData(TASKS_STORAGE_KEY);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateDateTime();

    setInterval(updateDateTime, 1000);

    renderGoals();
    renderTasks();
    updateProgress();

    registerServiceWorker();

    passwordInput.focus();

});


/* =========================================================
   LOGIN
========================================================= */

loginButton.addEventListener("click", login);

passwordInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        login();
    }

});


function login() {

    const enteredPassword = passwordInput.value;

    if (enteredPassword === PASSWORD) {

        loginMessage.textContent = "";

        passwordInput.value = "";

        showScreen("homeScreen");

    } else {

        loginMessage.textContent = "Senha incorreta.";

        passwordInput.value = "";

        passwordInput.focus();

    }

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

menuCards.forEach((card) => {

    card.addEventListener("click", () => {

        const targetScreen = card.dataset.screen;

        if (targetScreen) {
            showScreen(targetScreen);
        }

    });

});


backButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const targetScreen = button.dataset.back;

        if (targetScreen) {
            showScreen(targetScreen);
        }

    });

});


function showScreen(screenId) {

    screens.forEach((screen) => {
        screen.classList.add("hidden");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.remove("hidden");
    }

    if (screenId === "progressScreen") {
        updateProgress();
    }

}


/* =========================================================
   DATA E HORA
========================================================= */

function updateDateTime() {

    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    currentDate.textContent = `${day}/${month}/${year}`;

    currentTime.textContent = `${hours}:${minutes}:${seconds}`;

}


/* =========================================================
   METAS — ADICIONAR
========================================================= */

addGoalButton.addEventListener("click", () => {

    openGoalModal();

});


function openGoalModal(goal = null) {

    const editing = goal !== null;

    const modalOverlay = createModalOverlay();

    const modal = document.createElement("div");

    modal.className = "modal";

    modal.innerHTML = `
        <h2>${editing ? "✏️ Editar meta" : "🎯 Nova meta"}</h2>

        <label for="goalTitleInput">
            Nome da meta
        </label>

        <input
            type="text"
            id="goalTitleInput"
            placeholder="Ex.: Ler 5 livros"
            maxlength="100"
        >

        <label for="goalDescriptionInput">
            Descrição
        </label>

        <textarea
            id="goalDescriptionInput"
            placeholder="Descreva sua meta..."
            maxlength="500"
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
                ${editing ? "Salvar" : "Adicionar"}
            </button>

        </div>
    `;

    modalOverlay.appendChild(modal);

    document.body.appendChild(modalOverlay);

    const titleInput = document.getElementById("goalTitleInput");
    const descriptionInput = document.getElementById("goalDescriptionInput");

    if (editing) {

        titleInput.value = goal.title;
        descriptionInput.value = goal.description;

    }

    titleInput.focus();


    document
        .getElementById("cancelGoalButton")
        .addEventListener("click", () => {

            modalOverlay.remove();

        });


    document
        .getElementById("saveGoalButton")
        .addEventListener("click", () => {

            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();

            if (!title) {

                alert("Digite um nome para a meta.");

                titleInput.focus();

                return;

            }


            if (editing) {

                goal.title = title;
                goal.description = description;

            } else {

                const newGoal = {

                    id: Date.now(),

                    title: title,

                    description: description,

                    completed: false,

                    createdAt: new Date().toISOString()

                };

                goals.push(newGoal);

            }


            saveData(GOALS_STORAGE_KEY, goals);

            renderGoals();

            updateProgress();

            modalOverlay.remove();

        });

}


/* =========================================================
   METAS — EXIBIR
========================================================= */

function renderGoals() {

    goalsList.innerHTML = "";

    if (goals.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "Você ainda não possui nenhuma meta.";

        goalsList.appendChild(emptyMessage);

        return;

    }


    goals.forEach((goal) => {

        const card = document.createElement("div");

        card.className = "item-card";

        if (goal.completed) {
            card.classList.add("completed");
        }


        card.innerHTML = `
            <div class="item-main">

                <input
                    type="checkbox"
                    class="item-checkbox"
                    ${goal.completed ? "checked" : ""}
                    aria-label="Concluir meta"
                >

                <div class="item-info">

                    <div class="item-title"></div>

                    <div class="item-description"></div>

                    <div class="item-date">
                        Criada em ${formatDate(goal.createdAt)}
                    </div>

                </div>

            </div>

            <div class="item-actions">

                <button
                    class="item-action-button edit-button"
                    aria-label="Editar meta"
                >
                    ✏️
                </button>

                <button
                    class="item-action-button delete delete-button"
                    aria-label="Excluir meta"
                >
                    🗑️
                </button>

            </div>
        `;


        const titleElement =
            card.querySelector(".item-title");

        const descriptionElement =
            card.querySelector(".item-description");

        const checkbox =
            card.querySelector(".item-checkbox");

        const editButton =
            card.querySelector(".edit-button");

        const deleteButton =
            card.querySelector(".delete-button");


        titleElement.textContent = goal.title;

        descriptionElement.textContent =
            goal.description || "Sem descrição.";


        checkbox.addEventListener("change", () => {

            goal.completed = checkbox.checked;

            saveData(GOALS_STORAGE_KEY, goals);

            renderGoals();

            updateProgress();

        });


        editButton.addEventListener("click", () => {

            openGoalModal(goal);

        });


        deleteButton.addEventListener("click", () => {

            const confirmed = confirm(
                "Deseja excluir esta meta?"
            );

            if (!confirmed) {
                return;
            }

            goals = goals.filter(
                (item) => item.id !== goal.id
            );

            saveData(GOALS_STORAGE_KEY, goals);

            renderGoals();

            updateProgress();

        });


        goalsList.appendChild(card);

    });

}


/* =========================================================
   TAREFAS — ADICIONAR
========================================================= */

addTaskButton.addEventListener("click", () => {

    openTaskModal();

});


function openTaskModal(task = null) {

    const editing = task !== null;

    const modalOverlay = createModalOverlay();

    const modal = document.createElement("div");

    modal.className = "modal";

    modal.innerHTML = `
        <h2>${editing ? "✏️ Editar tarefa" : "📋 Nova tarefa"}</h2>

        <label for="taskTitleInput">
            Nome da tarefa
        </label>

        <input
            type="text"
            id="taskTitleInput"
            placeholder="Ex.: Estudar matemática"
            maxlength="100"
        >

        <label for="taskDescriptionInput">
            Detalhes
        </label>

        <textarea
            id="taskDescriptionInput"
            placeholder="Descreva a tarefa..."
            maxlength="500"
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
                ${editing ? "Salvar" : "Adicionar"}
            </button>

        </div>
    `;

    modalOverlay.appendChild(modal);

    document.body.appendChild(modalOverlay);

    const titleInput =
        document.getElementById("taskTitleInput");

    const descriptionInput =
        document.getElementById("taskDescriptionInput");


    if (editing) {

        titleInput.value = task.title;

        descriptionInput.value =
            task.description;

    }


    titleInput.focus();


    document
        .getElementById("cancelTaskButton")
        .addEventListener("click", () => {

            modalOverlay.remove();

        });


    document
        .getElementById("saveTaskButton")
        .addEventListener("click", () => {

            const title = titleInput.value.trim();

            const description =
                descriptionInput.value.trim();


            if (!title) {

                alert("Digite um nome para a tarefa.");

                titleInput.focus();

                return;

            }


            if (editing) {

                task.title = title;

                task.description = description;

            } else {

                const newTask = {

                    id: Date.now(),

                    title: title,

                    description: description,

                    completed: false,

                    createdAt: new Date().toISOString()

                };

                tasks.push(newTask);

            }


            saveData(TASKS_STORAGE_KEY, tasks);

            renderTasks();

            modalOverlay.remove();

        });

}


/* =========================================================
   TAREFAS — EXIBIR
========================================================= */

function renderTasks() {

    tasksList.innerHTML = "";

    if (tasks.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "Você ainda não possui nenhuma tarefa.";

        tasksList.appendChild(emptyMessage);

        return;

    }


    tasks.forEach((task) => {

        const card = document.createElement("div");

        card.className = "item-card";

        if (task.completed) {
            card.classList.add("completed");
        }


        card.innerHTML = `
            <div class="item-main">

                <input
                    type="checkbox"
                    class="item-checkbox"
                    ${task.completed ? "checked" : ""}
                    aria-label="Concluir tarefa"
                >

                <div class="item-info">

                    <div class="item-title"></div>

                    <div class="item-description"></div>

                    <div class="item-date">
                        Criada em ${formatDate(task.createdAt)}
                    </div>

                </div>

            </div>

            <div class="item-actions">

                <button
                    class="item-action-button edit-button"
                    aria-label="Editar tarefa"
                >
                    ✏️
                </button>

                <button
                    class="item-action-button delete delete-button"
                    aria-label="Excluir tarefa"
                >
                    🗑️
                </button>

            </div>
        `;


        const titleElement =
            card.querySelector(".item-title");

        const descriptionElement =
            card.querySelector(".item-description");

        const checkbox =
            card.querySelector(".item-checkbox");

        const editButton =
            card.querySelector(".edit-button");

        const deleteButton =
            card.querySelector(".delete-button");


        titleElement.textContent = task.title;

        descriptionElement.textContent =
            task.description || "Sem detalhes.";


        checkbox.addEventListener("change", () => {

            task.completed = checkbox.checked;

            saveData(TASKS_STORAGE_KEY, tasks);

            renderTasks();

        });


        editButton.addEventListener("click", () => {

            openTaskModal(task);

        });


        deleteButton.addEventListener("click", () => {

            const confirmed = confirm(
                "Deseja excluir esta tarefa?"
            );

            if (!confirmed) {
                return;
            }


            tasks = tasks.filter(
                (item) => item.id !== task.id
            );

            saveData(TASKS_STORAGE_KEY, tasks);

            renderTasks();

        });


        tasksList.appendChild(card);

    });

}


/* =========================================================
   PROGRESSO
========================================================= */

function updateProgress() {

    const total = goals.length;

    const completed =
        goals.filter(
            (goal) => goal.completed
        ).length;

    const active =
        total - completed;


    totalGoalsElement.textContent = total;

    completedGoalsElement.textContent = completed;

    activeGoalsElement.textContent = active;


    updateCharts(total, completed, active);

}


function updateCharts(total, completed, active) {

    if (total === 0) {

        chartCompleted.style.width = "90px";

        chartActive.style.width = "90px";

        chartCompleted.style.opacity = "0.4";

        chartActive.style.opacity = "0.4";

        return;

    }


    chartCompleted.style.opacity = "1";

    chartActive.style.opacity = "1";


    const completedPercentage =
        (completed / total) * 100;

    const activePercentage =
        (active / total) * 100;


    chartCompleted.style.width =
        `${Math.max(completedPercentage, 15)}%`;

    chartActive.style.width =
        `${Math.max(activePercentage, 15)}%`;

}


/* =========================================================
   CRONÔMETRO
========================================================= */

startTimerButton.addEventListener("click", startTimer);

pauseTimerButton.addEventListener("click", pauseTimer);

resetTimerButton.addEventListener("click", resetTimer);


function startTimer() {

    if (timerRunning) {
        return;
    }


    timerRunning = true;


    timerInterval = setInterval(() => {

        timerSeconds++;

        updateTimerDisplay();

    }, 1000);

}


function pauseTimer() {

    if (!timerRunning) {
        return;
    }


    timerRunning = false;

    clearInterval(timerInterval);

    timerInterval = null;

}


function resetTimer() {

    timerRunning = false;

    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds = 0;

    updateTimerDisplay();

}


function updateTimerDisplay() {

    const hours =
        Math.floor(timerSeconds / 3600);

    const minutes =
        Math.floor(
            (timerSeconds % 3600) / 60
        );

    const seconds =
        timerSeconds % 60;


    timerDisplay.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

}


/* =========================================================
   BLOQUEAR
========================================================= */

lockButton.addEventListener("click", () => {

    lockSite();

});


function lockSite() {

    pauseTimer();

    showScreen("loginScreen");

    passwordInput.value = "";

    loginMessage.textContent = "";

    passwordInput.focus();

}


/* =========================================================
   EXPORTAÇÃO DE DADOS
========================================================= */

exportButton.addEventListener("click", exportData);


function exportData() {

    const backup = {

        version: 1,

        exportedAt: new Date().toISOString(),

        goals: goals,

        tasks: tasks

    };


    const json =
        JSON.stringify(
            backup,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    link.href = url;

    link.download =
        `backup-metas-${date}.json`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


/* =========================================================
   IMPORTAÇÃO DE DADOS
========================================================= */

importButton.addEventListener("click", () => {

    importFile.click();

});


importFile.addEventListener("change", () => {

    const file = importFile.files[0];

    if (!file) {
        return;
    }


    const reader = new FileReader();


    reader.onload = (event) => {

        try {

            const backup =
                JSON.parse(
                    event.target.result
                );


            if (
                !backup ||
                !Array.isArray(backup.goals) ||
                !Array.isArray(backup.tasks)
            ) {

                throw new Error(
                    "Formato inválido."
                );

            }


            const confirmed = confirm(
                "Importar este backup substituirá os dados atuais. Continuar?"
            );


            if (!confirmed) {

                importFile.value = "";

                return;

            }


            goals = backup.goals;

            tasks = backup.tasks;


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


            alert(
                "Backup importado com sucesso!"
            );


        } catch (error) {

            alert(
                "Não foi possível importar este arquivo."
            );

        }


        importFile.value = "";

    };


    reader.readAsText(file);

});


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


        if (!Array.isArray(parsed)) {
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


function saveData(key, data) {

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

        alert(
            "Não foi possível salvar os dados."
        );

    }

}


/* =========================================================
   MODAL
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


/* =========================================================
   FORMATAÇÃO DE DATA
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "Data desconhecida";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
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


    return `${day}/${month}/${year}`;

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
                    .then(() => {

                        console.log(
                            "Service Worker registrado."
                        );

                    })
                    .catch((error) => {

                        console.error(
                            "Erro ao registrar Service Worker:",
                            error
                        );

                    });

            }
        );

    }

}


/* =========================================================
   PROTEÇÃO CONTRA FECHAMENTO ACIDENTAL DO MODAL
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


/* =========================================================
   FINALIZAÇÃO
========================================================= */

updateTimerDisplay();
