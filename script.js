"use strict";

/* =========================================================
   SECRETO V3
   Projeto estático para GitHub Pages
========================================================= */


/* =========================================================
   CHAVES
========================================================= */

const KEYS = {
  accessPassword: "secreto_v3_access_password",
  goals: "secreto_v3_goals",
  tasks: "secreto_v3_tasks",
  notes: "secreto_v3_notes",
  clothes: "secreto_v3_clothes",
  trash: "secreto_v3_trash",
  theme: "secreto_v3_theme",
  viewer: "secreto_v3_viewer",
  timeFormat: "secreto_v3_time_format",
  timerSeconds: "secreto_v3_timer_seconds",
  loggedIn: "secreto_v3_logged_in",
  currentScreen: "secreto_v3_current_screen"
};

const MASTER_DELETE_PASSWORD = "Hg88";
const DEFAULT_ACCESS_PASSWORD = "Hg99";
const TRASH_DAYS = 50;


/* =========================================================
   ESTADO
========================================================= */

let goals = [];
let tasks = [];
let notes = [];
let clothes = [];
let trash = [];

let currentScreen = "dashboardScreen";
let detailReturnScreen = "dashboardScreen";

let timerSeconds = 0;
let timerInterval = null;
let timerRunning = false;

let modalCloseFunction = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   STORAGE
========================================================= */

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Erro ao ler storage:", key, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Erro ao salvar storage:", key, error);
  }
}

function loadData() {

  let storedPassword = localStorage.getItem(KEYS.accessPassword);

  if (!storedPassword) {
    storedPassword = DEFAULT_ACCESS_PASSWORD;
    localStorage.setItem(KEYS.accessPassword, storedPassword);
  }

  goals = readStorage(KEYS.goals, []);
  tasks = readStorage(KEYS.tasks, []);
  notes = readStorage(KEYS.notes, []);
  clothes = readStorage(KEYS.clothes, []);
  trash = readStorage(KEYS.trash, []);

  timerSeconds = Number(
    localStorage.getItem(KEYS.timerSeconds) || 0
  );

  pruneTrash();

  applyTheme();
  applyViewerMode();

  updateTimerDisplay();
}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
}

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTime(dateValue) {

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const format =
    localStorage.getItem(KEYS.timeFormat) || "24h";

  const time = date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: format === "12h"
    }
  );

  const dateText = date.toLocaleDateString(
    "pt-BR"
  );

  return `${dateText} • ${time}`;
}

function getAccessPassword() {
  return (
    localStorage.getItem(KEYS.accessPassword) ||
    DEFAULT_ACCESS_PASSWORD
  );
}

function isViewerMode() {
  return localStorage.getItem(KEYS.viewer) === "true";
}


/* =========================================================
   LOGIN / SESSÃO
========================================================= */

function isLoggedIn() {
  return localStorage.getItem(KEYS.loggedIn) === "true";
}

function setLoggedIn(value) {

  localStorage.setItem(
    KEYS.loggedIn,
    value ? "true" : "false"
  );
}

function login() {

  const input = $("accessPassword");
  const message = $("loginMessage");

  const password = input.value;

  if (password === getAccessPassword()) {

    setLoggedIn(true);

    message.textContent = "";

    input.value = "";

    const savedScreen =
      localStorage.getItem(KEYS.currentScreen) ||
      "dashboardScreen";

    showApp();

    if (
      savedScreen &&
      $(savedScreen) &&
      !$(savedScreen).classList.contains("login-screen")
    ) {
      showScreen(savedScreen);
    } else {
      showScreen("dashboardScreen");
    }

    showToast("Entrada liberada.");

  } else {

    message.textContent = "Senha incorreta.";
    input.value = "";
    input.focus();

  }
}

function lockSite() {

  setLoggedIn(false);

  localStorage.setItem(
    KEYS.currentScreen,
    "dashboardScreen"
  );

  stopTimer();

  $("appScreen").classList.add("hidden");
  $("loginScreen").classList.remove("hidden");

  $("accessPassword").value = "";
  $("loginMessage").textContent = "";

  window.scrollTo(0, 0);

  showToast("Site bloqueado.");
}

function showApp() {

  $("loginScreen").classList.add("hidden");
  $("appScreen").classList.remove("hidden");
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function getAllAppScreens() {

  return [
    "dashboardScreen",
    "goalsScreen",
    "tasksScreen",
    "notesScreen",
    "clothesScreen",
    "timerScreen",
    "progressScreen",
    "settingsScreen",
    "aboutScreen",
    "trashScreen",
    "detailScreen"
  ];
}

function showScreen(screenId) {

  const target = $(screenId);

  if (!target) {
    console.error(
      "Tela não encontrada:",
      screenId
    );
    return;
  }

  getAllAppScreens().forEach((id) => {

    const screen = $(id);

    if (screen) {
      screen.classList.add("hidden");
    }

  });

  target.classList.remove("hidden");

  currentScreen = screenId;

  localStorage.setItem(
    KEYS.currentScreen,
    screenId
  );

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

  if (screenId === "goalsScreen") {
    renderGoals();
  }

  if (screenId === "tasksScreen") {
    renderTasks();
  }

  if (screenId === "notesScreen") {
    renderNotes();
  }

  if (screenId === "clothesScreen") {
    renderClothes();
  }

  if (screenId === "progressScreen") {
    updateProgress();
  }

  if (screenId === "trashScreen") {
    pruneTrash();
    renderTrash();
  }

  updateClock();
}

function goBack(targetScreen = "dashboardScreen") {

  if (targetScreen === "dashboardScreen") {
    showScreen("dashboardScreen");
    return;
  }

  showScreen(targetScreen);
}


/* =========================================================
   RELÓGIO
========================================================= */

function updateClock() {

  const now = new Date();

  const format =
    localStorage.getItem(KEYS.timeFormat) || "24h";

  const dateText =
    now.toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );

  const timeText =
    now.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: format === "12h"
      }
    );

  $("clockDate").textContent = dateText;
  $("clockTime").textContent = timeText;
}


/* =========================================================
   MODAL
========================================================= */

function openModal(
  title,
  bodyHTML,
  actions = []
) {

  const overlay = $("appModal");
  const titleElement = $("modalTitle");
  const bodyElement = $("modalBody");
  const actionsElement = $("modalActions");

  titleElement.textContent = title;
  bodyElement.innerHTML = bodyHTML;

  actionsElement.innerHTML = "";

  actions.forEach((action) => {

    const button = document.createElement("button");

    button.textContent = action.label;

    button.className =
      action.className || "primary-button";

    button.addEventListener(
      "click",
      () => {

        if (typeof action.onClick === "function") {
          action.onClick();
        }

      }
    );

    actionsElement.appendChild(button);

  });

  overlay.classList.remove("hidden");
}

function closeModal() {

  $("appModal").classList.add("hidden");
  $("modalTitle").textContent = "";
  $("modalBody").innerHTML = "";
  $("modalActions").innerHTML = "";

  if (typeof modalCloseFunction === "function") {
    const callback = modalCloseFunction;
    modalCloseFunction = null;
    callback();
  }
}

function addModalCancelButton() {

  return {
    label: "Cancelar",
    className: "secondary-button",
    onClick: closeModal
  };
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

  const toast = $("toast");

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}


/* =========================================================
   METAS
========================================================= */

function openGoalForm(goal = null) {

  const isEditing = Boolean(goal);

  const title = isEditing
    ? "Editar meta"
    : "Adicionar meta";

  const body = `
    <div class="form-group">
      <label for="goalFormTitle">Título</label>
      <input
        id="goalFormTitle"
        type="text"
        value="${escapeHTML(goal?.title || "")}"
        placeholder="Título da meta"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="goalFormContent">Conteúdo</label>
      <textarea
        id="goalFormContent"
        placeholder="Escreva os detalhes da meta..."
      >${escapeHTML(goal?.content || "")}</textarea>
    </div>
  `;

  openModal(
    title,
    body,
    [
      {
        label: isEditing
          ? "Salvar alterações"
          : "Adicionar",
        className: "primary-button",
        onClick: () => {

          const titleInput =
            $("goalFormTitle");

          const contentInput =
            $("goalFormContent");

          const newTitle =
            titleInput.value.trim();

          const newContent =
            contentInput.value.trim();

          if (!newTitle) {
            showToast("Digite um título.");
            titleInput.focus();
            return;
          }

          if (isEditing) {

            goal.title = newTitle;
            goal.content = newContent;

            writeStorage(KEYS.goals, goals);

            closeModal();

            renderGoals();
            updateProgress();

            showToast("Meta atualizada.");

          } else {

            goals.push({
              id: generateId(),
              title: newTitle,
              content: newContent,
              completed: false,
              pinned: false,
              createdAt: new Date().toISOString()
            });

            writeStorage(KEYS.goals, goals);

            closeModal();

            renderGoals();
            updateProgress();

            showToast("Meta adicionada.");

          }

        }
      },

      addModalCancelButton()

    ]
  );
}

function sortItems(items) {

  return [...items].sort((a, b) => {

    if (a.pinned && !b.pinned) {
      return -1;
    }

    if (!a.pinned && b.pinned) {
      return 1;
    }

    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );

  });
}

function renderGoals() {

  const list = $("goalsList");

  const search =
    $("goalSearch").value
      .trim()
      .toLowerCase();

  let filtered =
    goals.filter((goal) =>
      goal.title
        .toLowerCase()
        .includes(search)
    );

  filtered = sortItems(filtered);

  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma meta encontrada.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  filtered.forEach((goal) => {

    const row =
      document.createElement("div");

    row.className = "item-row";

    if (goal.pinned) {
      row.classList.add("item-pinned");
    }

    if (goal.completed) {
      row.classList.add("item-completed");
    }

    const main =
      document.createElement("button");

    main.className = "item-main";
    main.innerHTML = `
      <span class="item-title">
        ${goal.pinned ? "📌 " : ""}
        ${escapeHTML(goal.title)}
      </span>
    `;

    main.addEventListener(
      "click",
      () => openGoalDetail(goal)
    );

    const actions =
      document.createElement("div");

    actions.className = "item-actions";

    const complete =
      document.createElement("button");

    complete.className =
      "item-action complete complete-only";

    complete.textContent =
      goal.completed ? "✓" : "○";

    complete.title =
      goal.completed
        ? "Marcar como pendente"
        : "Concluir";

    complete.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        goal.completed =
          !goal.completed;

        writeStorage(KEYS.goals, goals);

        renderGoals();
        updateProgress();

      }
    );

    const pin =
      document.createElement("button");

    pin.className =
      "item-action pin pin-only";

    pin.textContent =
      goal.pinned ? "📌" : "☆";

    pin.title = "Fixar";

    pin.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        goal.pinned =
          !goal.pinned;

        writeStorage(KEYS.goals, goals);

        renderGoals();

      }
    );

    const edit =
      document.createElement("button");

    edit.className =
      "item-action edit-only";

    edit.textContent = "✎";
    edit.title = "Editar";

    edit.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        openGoalForm(goal);

      }
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "item-action delete delete-only";

    deleteButton.textContent = "🗑";
    deleteButton.title = "Excluir";

    deleteButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        deleteGoal(goal);

      }
    );

    actions.appendChild(complete);
    actions.appendChild(pin);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);

    row.appendChild(main);
    row.appendChild(actions);

    list.appendChild(row);

  });

}

function openGoalDetail(goal) {

  detailReturnScreen = "goalsScreen";

  $("detailTitle").textContent =
    goal.title;

  $("detailMeta").textContent =
    goal.completed
      ? "Concluída"
      : "Em andamento";

  $("detailContent").innerHTML = `
    <div class="detail-content">
      ${escapeHTML(goal.content || "Sem conteúdo.")}
    </div>

    <div class="detail-created">
      Criado em ${formatDateTime(goal.createdAt)}
    </div>
  `;

  showScreen("detailScreen");
}

function deleteGoal(goal) {

  openModal(
    "Excluir meta",
    `
      <p>
        A meta <strong>${escapeHTML(goal.title)}</strong>
        será enviada para a lixeira.
      </p>
    `,
    [
      {
        label: "Enviar para lixeira",
        className: "danger-button",
        onClick: () => {

          trash.push({
            id: generateId(),
            type: "goal",
            original: { ...goal },
            deletedAt: new Date().toISOString()
          });

          goals =
            goals.filter(
              (item) => item.id !== goal.id
            );

          writeStorage(KEYS.goals, goals);
          writeStorage(KEYS.trash, trash);

          closeModal();

          renderGoals();
          updateProgress();

          showToast("Meta enviada para a lixeira.");

        }
      },

      addModalCancelButton()

    ]
  );
}


/* =========================================================
   TAREFAS
========================================================= */

function openTaskForm(task = null) {

  const isEditing = Boolean(task);

  const body = `
    <div class="form-group">
      <label for="taskFormTitle">Título</label>
      <input
        id="taskFormTitle"
        type="text"
        value="${escapeHTML(task?.title || "")}"
        placeholder="Título da tarefa"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="taskFormContent">Conteúdo</label>
      <textarea
        id="taskFormContent"
        placeholder="Detalhes da tarefa..."
      >${escapeHTML(task?.content || "")}</textarea>
    </div>
  `;

  openModal(
    isEditing
      ? "Editar tarefa"
      : "Adicionar tarefa",
    body,
    [
      {
        label: isEditing
          ? "Salvar alterações"
          : "Adicionar",
        className: "primary-button",
        onClick: () => {

          const titleInput =
            $("taskFormTitle");

          const contentInput =
            $("taskFormContent");

          const newTitle =
            titleInput.value.trim();

          const newContent =
            contentInput.value.trim();

          if (!newTitle) {
            showToast("Digite um título.");
            titleInput.focus();
            return;
          }

          if (isEditing) {

            task.title = newTitle;
            task.content = newContent;

            writeStorage(KEYS.tasks, tasks);

            closeModal();
            renderTasks();

            showToast("Tarefa atualizada.");

          } else {

            tasks.push({
              id: generateId(),
              title: newTitle,
              content: newContent,
              completed: false,
              pinned: false,
              createdAt: new Date().toISOString()
            });

            writeStorage(KEYS.tasks, tasks);

            closeModal();
            renderTasks();

            showToast("Tarefa adicionada.");

          }

        }
      },

      addModalCancelButton()

    ]
  );
}

function renderTasks() {

  const list = $("tasksList");

  const search =
    $("taskSearch").value
      .trim()
      .toLowerCase();

  let filtered =
    tasks.filter((task) =>
      task.title
        .toLowerCase()
        .includes(search)
    );

  filtered = sortItems(filtered);

  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma tarefa encontrada.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  filtered.forEach((task) => {

    const row =
      document.createElement("div");

    row.className = "item-row";

    if (task.pinned) {
      row.classList.add("item-pinned");
    }

    if (task.completed) {
      row.classList.add("item-completed");
    }

    const main =
      document.createElement("button");

    main.className = "item-main";

    main.innerHTML = `
      <span class="item-title">
        ${task.pinned ? "📌 " : ""}
        ${escapeHTML(task.title)}
      </span>
    `;

    main.addEventListener(
      "click",
      () => openTaskDetail(task)
    );

    const actions =
      document.createElement("div");

    actions.className =
      "item-actions";

    const complete =
      document.createElement("button");

    complete.className =
      "item-action complete complete-only";

    complete.textContent =
      task.completed ? "✓" : "○";

    complete.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        task.completed =
          !task.completed;

        writeStorage(KEYS.tasks, tasks);

        renderTasks();

      }
    );

    const pin =
      document.createElement("button");

    pin.className =
      "item-action pin pin-only";

    pin.textContent =
      task.pinned ? "📌" : "☆";

    pin.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        task.pinned =
          !task.pinned;

        writeStorage(KEYS.tasks, tasks);

        renderTasks();

      }
    );

    const edit =
      document.createElement("button");

    edit.className =
      "item-action edit-only";

    edit.textContent = "✎";

    edit.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        openTaskForm(task);

      }
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "item-action delete delete-only";

    deleteButton.textContent = "🗑";

    deleteButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        deleteTask(task);

      }
    );

    actions.appendChild(complete);
    actions.appendChild(pin);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);

    row.appendChild(main);
    row.appendChild(actions);

    list.appendChild(row);

  });

}

function openTaskDetail(task) {

  detailReturnScreen = "tasksScreen";

  $("detailTitle").textContent =
    task.title;

  $("detailMeta").textContent =
    task.completed
      ? "Concluída"
      : "Em andamento";

  $("detailContent").innerHTML = `
    <div class="detail-content">
      ${escapeHTML(task.content || "Sem conteúdo.")}
    </div>

    <div class="detail-created">
      Criado em ${formatDateTime(task.createdAt)}
    </div>
  `;

  showScreen("detailScreen");
}

function deleteTask(task) {

  openModal(
    "Excluir tarefa",
    `
      <p>
        A tarefa <strong>${escapeHTML(task.title)}</strong>
        será enviada para a lixeira.
      </p>
    `,
    [
      {
        label: "Enviar para lixeira",
        className: "danger-button",
        onClick: () => {

          trash.push({
            id: generateId(),
            type: "task",
            original: { ...task },
            deletedAt: new Date().toISOString()
          });

          tasks =
            tasks.filter(
              (item) => item.id !== task.id
            );

          writeStorage(KEYS.tasks, tasks);
          writeStorage(KEYS.trash, trash);

          closeModal();

          renderTasks();

          showToast("Tarefa enviada para a lixeira.");

        }
      },

      addModalCancelButton()

    ]
  );
}


/* =========================================================
   NOTAS
========================================================= */

function openNoteForm(note = null) {

  const isEditing = Boolean(note);

  const body = `
    <div class="form-group">
      <label for="noteFormTitle">Título</label>
      <input
        id="noteFormTitle"
        type="text"
        value="${escapeHTML(note?.title || "")}"
        placeholder="Título da nota"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="noteFormContent">Conteúdo</label>
      <textarea
        id="noteFormContent"
        placeholder="Escreva sua nota..."
      >${escapeHTML(note?.content || "")}</textarea>
    </div>
  `;

  openModal(
    isEditing
      ? "Editar nota"
      : "Adicionar nota",
    body,
    [
      {
        label: isEditing
          ? "Salvar alterações"
          : "Adicionar",
        className: "primary-button",
        onClick: () => {

          const titleInput =
            $("noteFormTitle");

          const contentInput =
            $("noteFormContent");

          const newTitle =
            titleInput.value.trim();

          const newContent =
            contentInput.value.trim();

          if (!newTitle) {
            showToast("Digite um título.");
            titleInput.focus();
            return;
          }

          if (isEditing) {

            note.title = newTitle;
            note.content = newContent;

            writeStorage(KEYS.notes, notes);

            closeModal();
            renderNotes();

            showToast("Nota atualizada.");

          } else {

            notes.push({
              id: generateId(),
              title: newTitle,
              content: newContent,
              pinned: false,
              createdAt: new Date().toISOString()
            });

            writeStorage(KEYS.notes, notes);

            closeModal();
            renderNotes();

            showToast("Nota adicionada.");

          }

        }
      },

      addModalCancelButton()

    ]
  );
}

function renderNotes() {

  const list = $("notesList");

  const search =
    $("noteSearch").value
      .trim()
      .toLowerCase();

  let filtered =
    notes.filter((note) =>
      note.title
        .toLowerCase()
        .includes(search)
    );

  filtered = sortItems(filtered);

  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma nota encontrada.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  filtered.forEach((note) => {

    const row =
      document.createElement("div");

    row.className = "item-row";

    if (note.pinned) {
      row.classList.add("item-pinned");
    }

    const main =
      document.createElement("button");

    main.className =
      "item-main";

    main.innerHTML = `
      <span class="item-title">
        ${note.pinned ? "📌 " : ""}
        ${escapeHTML(note.title)}
      </span>
    `;

    main.addEventListener(
      "click",
      () => openNoteDetail(note)
    );

    const actions =
      document.createElement("div");

    actions.className =
      "item-actions";

    const pin =
      document.createElement("button");

    pin.className =
      "item-action pin pin-only";

    pin.textContent =
      note.pinned ? "📌" : "☆";

    pin.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        note.pinned =
          !note.pinned;

        writeStorage(KEYS.notes, notes);

        renderNotes();

      }
    );

    const edit =
      document.createElement("button");

    edit.className =
      "item-action edit-only";

    edit.textContent = "✎";

    edit.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        openNoteForm(note);

      }
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "item-action delete delete-only";

    deleteButton.textContent = "🗑";

    deleteButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        deleteNote(note);

      }
    );

    actions.appendChild(pin);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);

    row.appendChild(main);
    row.appendChild(actions);

    list.appendChild(row);

  });

}

function openNoteDetail(note) {

  detailReturnScreen = "notesScreen";

  $("detailTitle").textContent =
    note.title;

  $("detailMeta").textContent =
    "";

  $("detailContent").innerHTML = `
    <div class="detail-content">
      ${escapeHTML(note.content || "Sem conteúdo.")}
    </div>

    <div class="detail-created">
      Criado em ${formatDateTime(note.createdAt)}
    </div>
  `;

  showScreen("detailScreen");
}

function deleteNote(note) {

  openModal(
    "Excluir nota",
    `
      <p>
        A nota <strong>${escapeHTML(note.title)}</strong>
        será enviada para a lixeira.
      </p>
    `,
    [
      {
        label: "Enviar para lixeira",
        className: "danger-button",
        onClick: () => {

          trash.push({
            id: generateId(),
            type: "note",
            original: { ...note },
            deletedAt: new Date().toISOString()
          });

          notes =
            notes.filter(
              (item) => item.id !== note.id
            );

          writeStorage(KEYS.notes, notes);
          writeStorage(KEYS.trash, trash);

          closeModal();

          renderNotes();

          showToast("Nota enviada para a lixeira.");

        }
      },

      addModalCancelButton()

    ]
  );
}


/* =========================================================
   ROUPAS SÍTIO
========================================================= */

function openClothingForm(clothing = null) {

  const isEditing =
    Boolean(clothing);

  const body = `
    <div class="form-group">
      <label for="clothingTitle">
        Título
      </label>

      <input
        id="clothingTitle"
        type="text"
        value="${escapeHTML(clothing?.title || "")}"
        placeholder="Ex.: Roupas 1"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="clothingTouca">
        Touca
      </label>

      <input
        id="clothingTouca"
        type="text"
        value="${escapeHTML(clothing?.touca || "")}"
        placeholder="Ex.: 1 touca"
      >
    </div>

    <div class="form-group">
      <label for="clothingCamiseta">
        Camiseta
      </label>

      <input
        id="clothingCamiseta"
        type="text"
        value="${escapeHTML(clothing?.camiseta || "")}"
        placeholder="Ex.: 2 camisetas"
      >
    </div>

    <div class="form-group">
      <label for="clothingBlusa">
        Blusa
      </label>

      <input
        id="clothingBlusa"
        type="text"
        value="${escapeHTML(clothing?.blusa || "")}"
        placeholder="Ex.: 1 blusa"
      >
    </div>

    <div class="form-group">
      <label for="clothingCalca">
        Calça
      </label>

      <input
        id="clothingCalca"
        type="text"
        value="${escapeHTML(clothing?.calca || "")}"
        placeholder="Ex.: 2 calças"
      >
    </div>

    <div class="form-group">
      <label for="clothingExtras">
        Adicionar extras
      </label>

      <textarea
        id="clothingExtras"
        placeholder="Ex.: meias, luvas, capa..."
      >${escapeHTML(clothing?.extras || "")}</textarea>
    </div>
  `;

  openModal(
    isEditing
      ? "Editar roupa"
      : "Adicionar roupa",
    body,
    [
      {
        label: isEditing
          ? "Salvar alterações"
          : "Adicionar",
        className: "primary-button",
        onClick: () => {

          const title =
            $("clothingTitle")
              .value
              .trim();

          const touca =
            $("clothingTouca")
              .value
              .trim();

          const camiseta =
            $("clothingCamiseta")
              .value
              .trim();

          const blusa =
            $("clothingBlusa")
              .value
              .trim();

          const calca =
            $("clothingCalca")
              .value
              .trim();

          const extras =
            $("clothingExtras")
              .value
              .trim();

          if (!title) {

            showToast(
              "Digite o título."
            );

            $("clothingTitle").focus();

            return;
          }

          if (isEditing) {

            clothing.title = title;
            clothing.touca = touca;
            clothing.camiseta = camiseta;
            clothing.blusa = blusa;
            clothing.calca = calca;
            clothing.extras = extras;

            writeStorage(
              KEYS.clothes,
              clothes
            );

            closeModal();

            renderClothes();

            showToast(
              "Roupa atualizada."
            );

          } else {

            clothes.push({

              id: generateId(),

              title,

              touca,

              camiseta,

              blusa,

              calca,

              extras,

              pinned: false,

              createdAt:
                new Date().toISOString()

            });

            writeStorage(
              KEYS.clothes,
              clothes
            );

            closeModal();

            renderClothes();

            showToast(
              "Roupa adicionada."
            );

          }

        }
      },

      addModalCancelButton()

    ]
  );
}

function renderClothes() {

  const list =
    $("clothesList");

  const sorted =
    sortItems(clothes);

  if (sorted.length === 0) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma roupa cadastrada.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  sorted.forEach((clothing) => {

    const row =
      document.createElement("div");

    row.className =
      "item-row";

    if (clothing.pinned) {
      row.classList.add(
        "item-pinned"
      );
    }

    const main =
      document.createElement("button");

    main.className =
      "item-main";

    main.innerHTML = `
      <span class="item-title">
        ${clothing.pinned ? "📌 " : ""}
        ${escapeHTML(clothing.title)}
      </span>
    `;

    main.addEventListener(
      "click",
      () =>
        openClothingDetail(
          clothing
        )
    );

    const actions =
      document.createElement("div");

    actions.className =
      "item-actions";

    const pin =
      document.createElement("button");

    pin.className =
      "item-action pin pin-only";

    pin.textContent =
      clothing.pinned
        ? "📌"
        : "☆";

    pin.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        clothing.pinned =
          !clothing.pinned;

        writeStorage(
          KEYS.clothes,
          clothes
        );

        renderClothes();

      }
    );

    const edit =
      document.createElement("button");

    edit.className =
      "item-action edit-only";

    edit.textContent = "✎";

    edit.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        openClothingForm(
          clothing
        );

      }
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "item-action delete delete-only";

    deleteButton.textContent =
      "🗑";

    deleteButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        if (isViewerMode()) {
          return;
        }

        deleteClothing(
          clothing
        );

      }
    );

    actions.appendChild(pin);
    actions.appendChild(edit);
    actions.appendChild(deleteButton);

    row.appendChild(main);
    row.appendChild(actions);

    list.appendChild(row);

  });

}

function openClothingDetail(
  clothing
) {

  detailReturnScreen =
    "clothesScreen";

  $("detailTitle").textContent =
    clothing.title;

  $("detailMeta").textContent =
    "";

  $("detailContent").innerHTML = `

    <div class="detail-field">

      <div class="detail-field-label">
        Touca
      </div>

      <div class="detail-field-value">
        ${escapeHTML(
          clothing.touca ||
          "Não informado"
        )}
      </div>

    </div>


    <div class="detail-field">

      <div class="detail-field-label">
        Camiseta
      </div>

      <div class="detail-field-value">
        ${escapeHTML(
          clothing.camiseta ||
          "Não informado"
        )}
      </div>

    </div>


    <div class="detail-field">

      <div class="detail-field-label">
        Blusa
      </div>

      <div class="detail-field-value">
        ${escapeHTML(
          clothing.blusa ||
          "Não informado"
        )}
      </div>

    </div>


    <div class="detail-field">

      <div class="detail-field-label">
        Calça
      </div>

      <div class="detail-field-value">
        ${escapeHTML(
          clothing.calca ||
          "Não informado"
        )}
      </div>

    </div>


    <div class="detail-field">

      <div class="detail-field-label">
        Extras
      </div>

      <div class="detail-field-value">
        ${escapeHTML(
          clothing.extras ||
          "Nenhum extra"
        )}
      </div>

    </div>


    <div class="detail-created">
      Criado em ${formatDateTime(
        clothing.createdAt
      )}
    </div>

  `;

  showScreen(
    "detailScreen"
  );
}

function deleteClothing(
  clothing
) {

  openModal(
    "Excluir roupa",

    `
      <p>
        Deseja excluir
        <strong>
          ${escapeHTML(
            clothing.title
          )}
        </strong>
        definitivamente?
      </p>

      <p>
        Roupas não utilizam a lixeira.
      </p>
    `,

    [

      {
        label: "Excluir definitivamente",
        className: "danger-button",

        onClick: () => {

          clothes =
            clothes.filter(
              (item) =>
                item.id !==
                clothing.id
            );

          writeStorage(
            KEYS.clothes,
            clothes
          );

          closeModal();

          renderClothes();

          showToast(
            "Roupa excluída."
          );

        }

      },

      addModalCancelButton()

    ]
  );

}


/* =========================================================
   DETALHES
========================================================= */

$("detailBackButton")?.addEventListener(
  "click",
  () => {
    showScreen(
      detailReturnScreen ||
      "dashboardScreen"
    );
  }
);


/* =========================================================
   LIXEIRA
========================================================= */

function pruneTrash() {

  const now =
    Date.now();

  const limit =
    TRASH_DAYS *
    24 *
    60 *
    60 *
    1000;

  const filtered =
    trash.filter(
      (item) => {

        const deletedAt =
          new Date(
            item.deletedAt
          ).getTime();

        return (
          now - deletedAt <
          limit
        );

      }
    );

  if (
    filtered.length !==
    trash.length
  ) {

    trash = filtered;

    writeStorage(
      KEYS.trash,
      trash
    );

  }

}

function trashTypeName(type) {

  if (type === "goal") {
    return "Meta";
  }

  if (type === "task") {
    return "Tarefa";
  }

  if (type === "note") {
    return "Nota";
  }

  return "Item";
}

function renderTrash() {

  pruneTrash();

  const list =
    $("trashList");

  if (trash.length === 0) {

    list.innerHTML = `
      <div class="empty-message">
        A lixeira está vazia.
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  [...trash]
    .sort(
      (a, b) =>
        new Date(b.deletedAt) -
        new Date(a.deletedAt)
    )
    .forEach((item) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "item-row";

      const main =
        document.createElement(
          "div"
        );

      main.className =
        "item-main";

      main.innerHTML = `

        <span class="item-title">
          ${escapeHTML(
            item.original.title
          )}
        </span>

        <div class="trash-meta">
          ${trashTypeName(
            item.type
          )}
          • Apagado em
          ${formatDateTime(
            item.deletedAt
          )}
        </div>

      `;

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "item-actions";

      const restore =
        document.createElement(
          "button"
        );

      restore.className =
        "item-action";

      restore.textContent =
        "↩";

      restore.title =
        "Restaurar";

      restore.addEventListener(
        "click",
        () => {

          if (isViewerMode()) {
            return;
          }

          restoreTrashItem(
            item
          );

        }
      );

      const permanentDelete =
        document.createElement(
          "button"
        );

      permanentDelete.className =
        "item-action delete";

      permanentDelete.textContent =
        "🗑";

      permanentDelete.title =
        "Excluir definitivamente";

      permanentDelete.addEventListener(
        "click",
        () => {

          if (isViewerMode()) {
            return;
          }

          permanentlyDeleteTrashItem(
            item
          );

        }
      );

      actions.appendChild(
        restore
      );

      actions.appendChild(
        permanentDelete
      );

      row.appendChild(main);
      row.appendChild(actions);

      list.appendChild(row);

    });

}

function restoreTrashItem(
  item
) {

  openModal(
    "Restaurar item",

    `
      <p>
        Restaurar
        <strong>
          ${escapeHTML(
            item.original.title
          )}
        </strong>?
      </p>
    `,

    [

      {
        label: "Restaurar",
        className: "primary-button",

        onClick: () => {

          if (item.type === "goal") {
            goals.push(
              item.original
            );

            writeStorage(
              KEYS.goals,
              goals
            );
          }

          if (item.type === "task") {
            tasks.push(
              item.original
            );

            writeStorage(
              KEYS.tasks,
              tasks
            );
          }

          if (item.type === "note") {
            notes.push(
              item.original
            );

            writeStorage(
              KEYS.notes,
              notes
            );
          }

          trash =
            trash.filter(
              (trashItem) =>
                trashItem.id !==
                item.id
            );

          writeStorage(
            KEYS.trash,
            trash
          );

          closeModal();

          renderTrash();

          updateProgress();

          showToast(
            "Item restaurado."
          );

        }

      },

      addModalCancelButton()

    ]
  );

}

function permanentlyDeleteTrashItem(
  item
) {

  openModal(
    "Excluir definitivamente",

    `
      <p>
        Este item será apagado
        definitivamente.
      </p>
    `,

    [

      {
        label: "Excluir definitivamente",
        className: "danger-button",

        onClick: () => {

          trash =
            trash.filter(
              (trashItem) =>
                trashItem.id !==
                item.id
            );

          writeStorage(
            KEYS.trash,
            trash
          );

          closeModal();

          renderTrash();

          showToast(
            "Item excluído definitivamente."
          );

        }

      },

      addModalCancelButton()

    ]
  );

}


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

  const pending =
    total - completed;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
          100
        );

  $("totalGoalsStat")
    .textContent = total;

  $("completedGoalsStat")
    .textContent = completed;

  $("pendingGoalsStat")
    .textContent = pending;

  $("goalPercentage")
    .textContent =
      `${percentage}%`;

  $("goalProgressBar")
    .style.width =
      `${percentage}%`;
}


/* =========================================================
   CRONÔMETRO
========================================================= */

function formatTimer(
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

  return [
    hours,
    minutes,
    secs
  ]
    .map(
      (value) =>
        String(value)
          .padStart(2, "0")
    )
    .join(":");
}

function updateTimerDisplay() {

  $("timerDisplay")
    .textContent =
      formatTimer(
        timerSeconds
      );
}

function startTimer() {

  if (timerRunning) {
    return;
  }

  timerRunning = true;

  timerInterval =
    setInterval(
      () => {

        timerSeconds++;

        localStorage.setItem(
          KEYS.timerSeconds,
          String(
            timerSeconds
          )
        );

        updateTimerDisplay();

      },
      1000
    );

}

function stopTimer() {

  timerRunning = false;

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }

}

function pauseTimer() {

  stopTimer();

}

function resetTimer() {

  openModal(
    "Zerar cronômetro",

    `
      <p>
        Deseja zerar o cronômetro?
      </p>
    `,

    [

      {
        label: "Zerar",
        className: "danger-button",

        onClick: () => {

          stopTimer();

          timerSeconds = 0;

          localStorage.setItem(
            KEYS.timerSeconds,
            "0"
          );

          updateTimerDisplay();

          closeModal();

          showToast(
            "Cronômetro zerado."
          );

        }

      },

      addModalCancelButton()

    ]
  );

}


/* =========================================================
   TEMA
========================================================= */

function applyTheme() {

  const theme =
    localStorage.getItem(
      KEYS.theme
    ) || "dark";

  document.body.classList.toggle(
    "light-theme",
    theme === "light"
  );
}

function toggleTheme() {

  const current =
    localStorage.getItem(
      KEYS.theme
    ) || "dark";

  const next =
    current === "dark"
      ? "light"
      : "dark";

  localStorage.setItem(
    KEYS.theme,
    next
  );

  applyTheme();

  showToast(
    next === "light"
      ? "Tema claro ativado."
      : "Tema escuro ativado."
  );
}


/* =========================================================
   MODO VISUALIZADOR
========================================================= */

function applyViewerMode() {

  const viewer =
    isViewerMode();

  document.body.classList.toggle(
    "viewer-mode",
    viewer
  );

  const button =
    $("viewerToggleButton");

  if (button) {

    button.textContent =
      viewer
        ? "👁️ Modo Visualizador: ligado"
        : "👁️ Modo Visualizador: desligado";

  }

}

function toggleViewerMode() {

  const next =
    !isViewerMode();

  localStorage.setItem(
    KEYS.viewer,
    next
      ? "true"
      : "false"
  );

  applyViewerMode();

  renderGoals();
  renderTasks();
  renderNotes();
  renderClothes();

  showToast(
    next
      ? "Modo Visualizador ativado."
      : "Modo Visualizador desativado."
  );
}


/* =========================================================
   ALTERAR SENHA
========================================================= */

function openChangePassword() {

  const body = `

    <div class="form-group">
      <label for="currentPassword">
        Senha atual
      </label>

      <input
        id="currentPassword"
        type="password"
        autocomplete="off"
      >
    </div>


    <div class="form-group">
      <label for="newPassword">
        Nova senha
      </label>

      <input
        id="newPassword"
        type="password"
        autocomplete="off"
      >
    </div>


    <div class="form-group">
      <label for="confirmPassword">
        Confirmar nova senha
      </label>

      <input
        id="confirmPassword"
        type="password"
        autocomplete="off"
      >
    </div>

  `;

  openModal(
    "Alterar senha",
    body,
    [

      {
        label: "Alterar senha",
        className: "primary-button",

        onClick: () => {

          const current =
            $("currentPassword")
              .value;

          const next =
            $("newPassword")
              .value
              .trim();

          const confirm =
            $("confirmPassword")
              .value
              .trim();

          if (
            current !==
            getAccessPassword()
          ) {

            showToast(
              "Senha atual incorreta."
            );

            return;
          }

          if (!next) {

            showToast(
              "Digite uma nova senha."
            );

            return;
          }

          if (next !== confirm) {

            showToast(
              "As senhas não coincidem."
            );

            return;
          }

          localStorage.setItem(
            KEYS.accessPassword,
            next
          );

          closeModal();

          showToast(
            "Senha alterada."
          );

        }

      },

      addModalCancelButton()

    ]
  );
}


/* =========================================================
   FORMATO DA HORA
========================================================= */

function changeTimeFormat() {

  const current =
    localStorage.getItem(
      KEYS.timeFormat
    ) || "24h";

  const next =
    current === "24h"
      ? "12h"
      : "24h";

  localStorage.setItem(
    KEYS.timeFormat,
    next
  );

  updateClock();

  showToast(
    `Formato alterado para ${next}.`
  );
}


/* =========================================================
   APAGAR GERAL
========================================================= */

function openDeleteAll() {

  const body = `

    <p>
      Esta função apagará metas, tarefas,
      notas, roupas, lixeira e o cronômetro.
    </p>

    <div class="form-group">

      <label for="masterDeletePassword">
        Senha de confirmação
      </label>

      <input
        id="masterDeletePassword"
        type="password"
        autocomplete="off"
        placeholder="Senha"
      >

    </div>

  `;

  openModal(
    "Apagar geral",
    body,
    [

      {
        label: "Continuar",
        className: "danger-button",

        onClick: () => {

          const password =
            $("masterDeletePassword")
              .value;

          if (
            password !==
            MASTER_DELETE_PASSWORD
          ) {

            showToast(
              "Senha de confirmação incorreta."
            );

            return;
          }

          openDeleteAllConfirmation();

        }

      },

      addModalCancelButton()

    ]
  );
}

function openDeleteAllConfirmation() {

  openModal(
    "Última confirmação",

    `
      <p>
        Tem certeza?
      </p>

      <p>
        Tudo será apagado e as
        configurações voltarão aos padrões.
      </p>
    `,

    [

      {
        label: "SIM, APAGAR TUDO",
        className: "danger-button",

        onClick: () => {

          localStorage.removeItem(
            KEYS.goals
          );

          localStorage.removeItem(
            KEYS.tasks
          );

          localStorage.removeItem(
            KEYS.notes
          );

          localStorage.removeItem(
            KEYS.clothes
          );

          localStorage.removeItem(
            KEYS.trash
          );

          localStorage.removeItem(
            KEYS.timerSeconds
          );

          localStorage.setItem(
            KEYS.accessPassword,
            DEFAULT_ACCESS_PASSWORD
          );

          localStorage.setItem(
            KEYS.theme,
            "dark"
          );

          localStorage.setItem(
            KEYS.viewer,
            "false"
          );

          localStorage.setItem(
            KEYS.timeFormat,
            "24h"
          );

          localStorage.setItem(
            KEYS.currentScreen,
            "dashboardScreen"
          );

          goals = [];
          tasks = [];
          notes = [];
          clothes = [];
          trash = [];
          timerSeconds = 0;

          stopTimer();

          closeModal();

          lockSite();

        }

      },

      addModalCancelButton()

    ]
  );

}


/* =========================================================
   COMPARTILHAMENTO
========================================================= */

async function shareOrFallback(
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
        error.name ===
        "AbortError"
      ) {
        return;
      }

    }

  }

  openModal(
    title,
    `
      <textarea
        id="shareFallbackText"
        readonly
      >${escapeHTML(text)}</textarea>
    `,
    [

      {
        label: "Copiar",
        className: "primary-button",

        onClick: async () => {

          const textArea =
            $("shareFallbackText");

          try {

            await navigator.clipboard.writeText(
              text
            );

            showToast(
              "Texto copiado."
            );

          } catch {

            textArea.select();

            document.execCommand(
              "copy"
            );

            showToast(
              "Texto copiado."
            );

          }

        }

      },

      addModalCancelButton()

    ]
  );
}

function buildGoalsShareText() {

  let text =
    "METAS — SECRETO V3\n\n";

  if (goals.length === 0) {
    text += "Nenhuma meta cadastrada.\n";
    return text;
  }

  sortItems(goals).forEach(
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
        `Conteúdo: ${
          goal.content || "Sem conteúdo"
        }\n`;

      text +=
        `Criado: ${
          formatDateTime(
            goal.createdAt
          )
        }\n\n`;

    }
  );

  return text;
}

function buildTasksShareText() {

  let text =
    "TAREFAS — SECRETO V3\n\n";

  if (tasks.length === 0) {
    text += "Nenhuma tarefa cadastrada.\n";
    return text;
  }

  sortItems(tasks).forEach(
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
        `Conteúdo: ${
          task.content || "Sem conteúdo"
        }\n`;

      text +=
        `Criado: ${
          formatDateTime(
            task.createdAt
          )
        }\n\n`;

    }
  );

  return text;
}

function buildNotesShareText() {

  let text =
    "NOTAS — SECRETO V3\n\n";

  if (notes.length === 0) {
    text += "Nenhuma nota cadastrada.\n";
    return text;
  }

  sortItems(notes).forEach(
    (note, index) => {

      text +=
        `${index + 1}. ${note.title}\n`;

      text +=
        `Conteúdo: ${
          note.content || "Sem conteúdo"
        }\n`;

      text +=
        `Criado: ${
          formatDateTime(
            note.createdAt
          )
        }\n\n`;

    }
  );

  return text;
}

function buildProgressShareText() {

  const total =
    goals.length;

  const completed =
    goals.filter(
      (goal) =>
        goal.completed
    ).length;

  const pending =
    total - completed;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
          100
        );

  return `
PROGRESSO — SECRETO V3

Total de metas: ${total}
Concluídas: ${completed}
Em andamento: ${pending}
Progresso: ${percentage}%
`.trim();
}

function buildGeneralShareText() {

  let text =
    "SECRETO V3 — COMPARTILHAMENTO GERAL\n\n";

  text +=
    "=== METAS ===\n";

  text +=
    buildGoalsShareText();

  text +=
    "\n=== TAREFAS ===\n";

  text +=
    buildTasksShareText();

  text +=
    "\n=== NOTAS ===\n";

  text +=
    buildNotesShareText();

  text +=
    "\n=== ROUPAS SÍTIO ===\n";

  if (clothes.length === 0) {

    text +=
      "Nenhuma roupa cadastrada.\n";

  } else {

    clothes.forEach(
      (clothing, index) => {

        text +=
          `${index + 1}. ${clothing.title}\n`;

        text +=
          `Touca: ${
            clothing.touca ||
            "Não informado"
          }\n`;

        text +=
          `Camiseta: ${
            clothing.camiseta ||
            "Não informado"
          }\n`;

        text +=
          `Blusa: ${
            clothing.blusa ||
            "Não informado"
          }\n`;

        text +=
          `Calça: ${
            clothing.calca ||
            "Não informado"
          }\n`;

        text +=
          `Extras: ${
            clothing.extras ||
            "Nenhum"
          }\n`;

        text +=
          `Criado: ${
            formatDateTime(
              clothing.createdAt
            )
          }\n\n`;

      }
    );

  }

  text +=
    "\n=== CRONÔMETRO ===\n";

  text +=
    formatTimer(
      timerSeconds
    );

  return text;
}


/* =========================================================
   EVENTOS
========================================================= */

function setupEvents() {

  /* LOGIN */

  $("loginButton")
    .addEventListener(
      "click",
      login
    );

  $("accessPassword")
    .addEventListener(
      "keydown",
      (event) => {

        if (
          event.key ===
          "Enter"
        ) {

          login();

        }

      }
    );


  /* DASHBOARD */

  $("openNotesButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "notesScreen"
        )
    );

  $("openGoalsButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "goalsScreen"
        )
    );

  $("openTasksButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "tasksScreen"
        )
    );

  $("openClothesButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "clothesScreen"
        )
    );

  $("openTimerButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "timerScreen"
        )
    );

  $("openProgressButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "progressScreen"
        )
    );

  $("openSettingsButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "settingsScreen"
        )
    );


  /* VOLTAR */

  $("goalsBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("tasksBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("notesBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("clothesBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("timerBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("progressBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("settingsBackButton")
    .addEventListener(
      "click",
      () =>
        goBack()
    );

  $("aboutBackButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "settingsScreen"
        )
    );

  $("trashBackButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "settingsScreen"
        )
    );


  /* ADICIONAR */

  $("addGoalButton")
    .addEventListener(
      "click",
      () => {

        if (isViewerMode()) {
          return;
        }

        openGoalForm();

      }
    );

  $("addTaskButton")
    .addEventListener(
      "click",
      () => {

        if (isViewerMode()) {
          return;
        }

        openTaskForm();

      }
    );

  $("addNoteButton")
    .addEventListener(
      "click",
      () => {

        if (isViewerMode()) {
          return;
        }

        openNoteForm();

      }
    );

  $("addClothingButton")
    .addEventListener(
      "click",
      () => {

        if (isViewerMode()) {
          return;
        }

        openClothingForm();

      }
    );


  /* PESQUISA */

  $("goalSearch")
    .addEventListener(
      "input",
      renderGoals
    );

  $("taskSearch")
    .addEventListener(
      "input",
      renderTasks
    );

  $("noteSearch")
    .addEventListener(
      "input",
      renderNotes
    );


  /* COMPARTILHAR */

  $("shareGoalsButton")
    .addEventListener(
      "click",
      () =>
        shareOrFallback(
          "Metas — Secreto V3",
          buildGoalsShareText()
        )
    );

  $("shareTasksButton")
    .addEventListener(
      "click",
      () =>
        shareOrFallback(
          "Tarefas — Secreto V3",
          buildTasksShareText()
        )
    );

  $("shareNotesButton")
    .addEventListener(
      "click",
      () =>
        shareOrFallback(
          "Notas — Secreto V3",
          buildNotesShareText()
        )
    );

  $("shareProgressButton")
    .addEventListener(
      "click",
      () =>
        shareOrFallback(
          "Progresso — Secreto V3",
          buildProgressShareText()
        )
    );


  /* CRONÔMETRO */

  $("timerStartButton")
    .addEventListener(
      "click",
      startTimer
    );

  $("timerPauseButton")
    .addEventListener(
      "click",
      pauseTimer
    );

  $("timerResetButton")
    .addEventListener(
      "click",
      resetTimer
    );


  /* CONFIGURAÇÕES */

  $("lockSiteButton")
    .addEventListener(
      "click",
      lockSite
    );

  $("deleteAllButton")
    .addEventListener(
      "click",
      () => {

        if (isViewerMode()) {
          showToast(
            "Desative o Modo Visualizador primeiro."
          );
          return;
        }

        openDeleteAll();

      }
    );

  $("viewerToggleButton")
    .addEventListener(
      "click",
      toggleViewerMode
    );

  $("themeButton")
    .addEventListener(
      "click",
      toggleTheme
    );

  $("changePasswordButton")
    .addEventListener(
      "click",
      () => {

        if (isViewerMode()) {
          showToast(
            "Desative o Modo Visualizador primeiro."
          );
          return;
        }

        openChangePassword();

      }
    );

  $("timeFormatButton")
    .addEventListener(
      "click",
      changeTimeFormat
    );

  $("trashButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "trashScreen"
        )
    );

  $("shareAllButton")
    .addEventListener(
      "click",
      () =>
        shareOrFallback(
          "Secreto V3",
          buildGeneralShareText()
        )
    );

  $("aboutButton")
    .addEventListener(
      "click",
      () =>
        showScreen(
          "aboutScreen"
        )
    );


  /* MODAL */

  $("appModal")
    .addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          $("appModal")
        ) {

          closeModal();

        }

      }
    );

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
      async () => {

        try {

          const registration =
            await navigator.serviceWorker.register(
              "./sw.js"
            );

          await registration.update();

        } catch (error) {

          console.error(
            "Erro no Service Worker:",
            error
          );

        }

      }
    );

  }

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function init() {

  loadData();

  setupEvents();

  updateClock();

  setInterval(
    updateClock,
    1000
  );

  updateProgress();

  renderGoals();
  renderTasks();
  renderNotes();
  renderClothes();
  renderTrash();

  applyTheme();
  applyViewerMode();

  if (isLoggedIn()) {

    showApp();

    const savedScreen =
      localStorage.getItem(
        KEYS.currentScreen
      ) || "dashboardScreen";

    if (
      $(savedScreen) &&
      savedScreen !== "loginScreen"
    ) {

      showScreen(
        savedScreen
      );

    } else {

      showScreen(
        "dashboardScreen"
      );

    }

  } else {

    $("appScreen")
      .classList
      .add("hidden");

    $("loginScreen")
      .classList
      .remove("hidden");

  }

  registerServiceWorker();

}


/* =========================================================
   INICIAR QUANDO DOM ESTIVER PRONTO
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

} else {

  init();

}
