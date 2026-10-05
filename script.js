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

  /* Sessão */
  loggedIn: "secreto_v3_logged_in",
  sessionLocked: "secreto_v3_session_locked",

  /* Tela atual */
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

    const value =
      localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);

  } catch (error) {

    console.error(
      "Erro ao ler storage:",
      key,
      error
    );

    return fallback;

  }

}

function writeStorage(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  } catch (error) {

    console.error(
      "Erro ao salvar storage:",
      key,
      error
    );

  }

}


/* =========================================================
   INICIALIZAÇÃO DA SESSÃO
========================================================= */

function initializeSessionState() {

  const sessionLocked =
    localStorage.getItem(
      KEYS.sessionLocked
    );

  const legacyLoggedIn =
    localStorage.getItem(
      KEYS.loggedIn
    );

  /*
    Migração da versão anterior.

    Se a versão anterior tinha:
    loggedIn = true

    entendemos que o usuário já estava
    autenticado e mantemos a sessão aberta.

    Se não existia nenhuma informação de sessão,
    exigimos o login normalmente.
  */

  if (sessionLocked === null) {

    if (
      legacyLoggedIn === "true"
    ) {

      localStorage.setItem(
        KEYS.sessionLocked,
        "false"
      );

    } else {

      localStorage.setItem(
        KEYS.sessionLocked,
        "true"
      );

    }

  }

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

function loadData() {

  let storedPassword =
    localStorage.getItem(
      KEYS.accessPassword
    );

  if (!storedPassword) {

    storedPassword =
      DEFAULT_ACCESS_PASSWORD;

    localStorage.setItem(
      KEYS.accessPassword,
      storedPassword
    );

  }

  goals =
    readStorage(
      KEYS.goals,
      []
    );

  tasks =
    readStorage(
      KEYS.tasks,
      []
    );

  notes =
    readStorage(
      KEYS.notes,
      []
    );

  clothes =
    readStorage(
      KEYS.clothes,
      []
    );

  trash =
    readStorage(
      KEYS.trash,
      []
    );

  timerSeconds =
    Number(
      localStorage.getItem(
        KEYS.timerSeconds
      ) || 0
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
    Math.random()
      .toString(36)
      .substring(2, 8)
  );

}

function escapeHTML(value) {

  return String(value ?? "")
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

function formatDateTime(dateValue) {

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }

  const format =
    localStorage.getItem(
      KEYS.timeFormat
    ) || "24h";

  const time =
    date.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12:
          format === "12h"
      }
    );

  const dateText =
    date.toLocaleDateString(
      "pt-BR"
    );

  return `${dateText} • ${time}`;

}

function getAccessPassword() {

  return (
    localStorage.getItem(
      KEYS.accessPassword
    ) ||
    DEFAULT_ACCESS_PASSWORD
  );

}

function isViewerMode() {

  return (
    localStorage.getItem(
      KEYS.viewer
    ) === "true"
  );

}


/* =========================================================
   LOGIN / SESSÃO
========================================================= */

function isLoggedIn() {

  /*
    A sessão permanece aberta enquanto
    sessionLocked não estiver como "true".

    Isso é independente do valor antigo
    loggedIn, evitando que um reload faça
    o site voltar para a senha.
  */

  return (
    localStorage.getItem(
      KEYS.sessionLocked
    ) === "false"
  );

}

function setLoggedIn(value) {

  localStorage.setItem(
    KEYS.loggedIn,
    value
      ? "true"
      : "false"
  );

  /*
    Quando entra:
    sessionLocked = false

    Quando sai/bloqueia:
    sessionLocked = true
  */

  localStorage.setItem(
    KEYS.sessionLocked,
    value
      ? "false"
      : "true"
  );

}

function login() {

  const input =
    $("accessPassword");

  const message =
    $("loginMessage");

  const password =
    input.value;

  if (
    password ===
    getAccessPassword()
  ) {

    /*
      Marca a sessão como desbloqueada.
    */

    setLoggedIn(true);

    message.textContent = "";

    input.value = "";

    const savedScreen =
      localStorage.getItem(
        KEYS.currentScreen
      ) ||
      "dashboardScreen";

    showApp();

    if (
      savedScreen &&
      $(savedScreen) &&
      !$(savedScreen)
        .classList
        .contains("login-screen")
    ) {

      showScreen(
        savedScreen
      );

    } else {

      showScreen(
        "dashboardScreen"
      );

    }

    showToast(
      "Entrada liberada."
    );

  } else {

    message.textContent =
      "Senha incorreta.";

    input.value = "";

    input.focus();

  }

}

function lockSite() {

  /*
    Aqui é o único momento em que
    a sessão é realmente bloqueada.
  */

  setLoggedIn(false);

  localStorage.setItem(
    KEYS.currentScreen,
    "dashboardScreen"
  );

  stopTimer();

  $("appScreen")
    .classList
    .add("hidden");

  $("loginScreen")
    .classList
    .remove("hidden");

  $("accessPassword")
    .value = "";

  $("loginMessage")
    .textContent = "";

  window.scrollTo(
    0,
    0
  );

  showToast(
    "Site bloqueado."
  );

}

function showApp() {

  $("loginScreen")
    .classList
    .add("hidden");

  $("appScreen")
    .classList
    .remove("hidden");

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

  const target =
    $(screenId);

  if (!target) {

    console.error(
      "Tela não encontrada:",
      screenId
    );

    return;

  }

  getAllAppScreens()
    .forEach(
      (id) => {

        const screen =
          $(id);

        if (screen) {

          screen.classList
            .add("hidden");

        }

      }
    );

  target.classList
    .remove("hidden");

  currentScreen =
    screenId;

  localStorage.setItem(
    KEYS.currentScreen,
    screenId
  );

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

  if (
    screenId ===
    "goalsScreen"
  ) {

    renderGoals();

  }

  if (
    screenId ===
    "tasksScreen"
  ) {

    renderTasks();

  }

  if (
    screenId ===
    "notesScreen"
  ) {

    renderNotes();

  }

  if (
    screenId ===
    "clothesScreen"
  ) {

    renderClothes();

  }

  if (
    screenId ===
    "progressScreen"
  ) {

    updateProgress();

  }

  if (
    screenId ===
    "trashScreen"
  ) {

    pruneTrash();

    renderTrash();

  }

  updateClock();

}

function goBack(
  targetScreen = "dashboardScreen"
) {

  if (
    targetScreen ===
    "dashboardScreen"
  ) {

    showScreen(
      "dashboardScreen"
    );

    return;

  }

  showScreen(
    targetScreen
  );

}


/* =========================================================
   RELÓGIO
========================================================= */

function updateClock() {

  const now =
    new Date();

  const format =
    localStorage.getItem(
      KEYS.timeFormat
    ) || "24h";

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
        hour12:
          format === "12h"
      }
    );

  $("clockDate")
    .textContent =
    dateText;

  $("clockTime")
    .textContent =
    timeText;

}


/* =========================================================
   MODAL
========================================================= */

function openModal(
  title,
  bodyHTML,
  actions = []
) {

  const overlay =
    $("appModal");

  const titleElement =
    $("modalTitle");

  const bodyElement =
    $("modalBody");

  const actionsElement =
    $("modalActions");

  titleElement.textContent =
    title;

  bodyElement.innerHTML =
    bodyHTML;

  actionsElement.innerHTML =
    "";

  actions.forEach(
    (action) => {

      const button =
        document.createElement(
          "button"
        );

      button.textContent =
        action.label;

      button.className =
        action.className ||
        "primary-button";

      button.addEventListener(
        "click",
        () => {

          if (
            typeof action.onClick ===
            "function"
          ) {

            action.onClick();

          }

        }
      );

      actionsElement.appendChild(
        button
      );

    }
  );

  overlay.classList
    .remove("hidden");

}

function closeModal() {

  $("appModal")
    .classList
    .add("hidden");

  $("modalTitle")
    .textContent = "";

  $("modalBody")
    .innerHTML = "";

  $("modalActions")
    .innerHTML = "";

  if (
    typeof modalCloseFunction ===
    "function"
  ) {

    const callback =
      modalCloseFunction;

    modalCloseFunction =
      null;

    callback();

  }

}

function addModalCancelButton() {

  return {
    label: "Cancelar",
    className:
      "secondary-button",
    onClick:
      closeModal
  };

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(
  message
) {

  const toast =
    $("toast");

  toast.textContent =
    message;

  toast.classList
    .remove("hidden");

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () => {

        toast.classList
          .add("hidden");

      },
      2200
    );

}


/* =========================================================
   METAS
========================================================= */

function openGoalForm(
  goal = null
) {

  const isEditing =
    Boolean(goal);

  const title =
    isEditing
      ? "Editar meta"
      : "Adicionar meta";

  const body = `
    <div class="form-group">
      <label for="goalFormTitle">Título</label>
      <input
        id="goalFormTitle"
        type="text"
        value="${escapeHTML(
          goal?.title || ""
        )}"
        placeholder="Título da meta"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="goalFormContent">Conteúdo</label>
      <textarea
        id="goalFormContent"
        placeholder="Escreva os detalhes da meta..."
      >${escapeHTML(
        goal?.content || ""
      )}</textarea>
    </div>
  `;

  openModal(
    title,
    body,
    [
      {
        label:
          isEditing
            ? "Salvar alterações"
            : "Adicionar",

        className:
          "primary-button",

        onClick: () => {

          const titleInput =
            $("goalFormTitle");

          const contentInput =
            $("goalFormContent");

          const newTitle =
            titleInput.value
              .trim();

          const newContent =
            contentInput.value
              .trim();

          if (!newTitle) {

            showToast(
              "Digite um título."
            );

            titleInput.focus();

            return;

          }

          if (isEditing) {

            goal.title =
              newTitle;

            goal.content =
              newContent;

            writeStorage(
              KEYS.goals,
              goals
            );

            closeModal();

            renderGoals();

            updateProgress();

            showToast(
              "Meta atualizada."
            );

          } else {

            goals.push({

              id:
                generateId(),

              title:
                newTitle,

              content:
                newContent,

              completed:
                false,

              pinned:
                false,

              createdAt:
                new Date()
                  .toISOString()

            });

            writeStorage(
              KEYS.goals,
              goals
            );

            closeModal();

            renderGoals();

            updateProgress();

            showToast(
              "Meta adicionada."
            );

          }

        }

      },

      addModalCancelButton()

    ]
  );

}

function sortItems(
  items
) {

  return [...items]
    .sort(
      (a, b) => {

        if (
          a.pinned &&
          !b.pinned
        ) {

          return -1;

        }

        if (
          !a.pinned &&
          b.pinned
        ) {

          return 1;

        }

        return (
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
        );

      }
    );

}

function renderGoals() {

  const list =
    $("goalsList");

  const search =
    $("goalSearch")
      .value
      .trim()
      .toLowerCase();

  let filtered =
    goals.filter(
      (goal) =>
        goal.title
          .toLowerCase()
          .includes(search)
    );

  filtered =
    sortItems(
      filtered
    );

  if (
    filtered.length === 0
  ) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma meta encontrada.
      </div>
    `;

    return;

  }

  list.innerHTML = "";

  filtered.forEach(
    (goal) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "item-row";

      if (goal.pinned) {

        row.classList
          .add(
            "item-pinned"
          );

      }

      if (goal.completed) {

        row.classList
          .add(
            "item-completed"
          );

      }

      const main =
        document.createElement(
          "button"
        );

      main.className =
        "item-main";

      main.innerHTML = `
        <span class="item-title">
          ${
            goal.pinned
              ? "📌 "
              : ""
          }
          ${escapeHTML(
            goal.title
          )}
        </span>
      `;

      main.addEventListener(
        "click",
        () =>
          openGoalDetail(
            goal
          )
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "item-actions";

      const complete =
        document.createElement(
          "button"
        );

      complete.className =
        "item-action complete complete-only";

      complete.textContent =
        goal.completed
          ? "✓"
          : "○";

      complete.title =
        goal.completed
          ? "Marcar como pendente"
          : "Concluir";

      complete.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          goal.completed =
            !goal.completed;

          writeStorage(
            KEYS.goals,
            goals
          );

          renderGoals();

          updateProgress();

        }
      );

      const pin =
        document.createElement(
          "button"
        );

      pin.className =
        "item-action pin pin-only";

      pin.textContent =
        goal.pinned
          ? "📌"
          : "☆";

      pin.title =
        "Fixar";

      pin.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          goal.pinned =
            !goal.pinned;

          writeStorage(
            KEYS.goals,
            goals
          );

          renderGoals();

        }
      );

      const edit =
        document.createElement(
          "button"
        );

      edit.className =
        "item-action edit-only";

      edit.textContent =
        "✎";

      edit.title =
        "Editar";

      edit.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          openGoalForm(
            goal
          );

        }
      );

      const deleteButton =
        document.createElement(
          "button"
        );

      deleteButton.className =
        "item-action delete delete-only";

      deleteButton.textContent =
        "🗑";

      deleteButton.title =
        "Excluir";

      deleteButton.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          deleteGoal(
            goal
          );

        }
      );

      actions.appendChild(
        complete
      );

      actions.appendChild(
        pin
      );

      actions.appendChild(
        edit
      );

      actions.appendChild(
        deleteButton
      );

      row.appendChild(
        main
      );

      row.appendChild(
        actions
      );

      list.appendChild(
        row
      );

    }
  );

}

function openGoalDetail(
  goal
) {

  detailReturnScreen =
    "goalsScreen";

  $("detailTitle")
    .textContent =
    goal.title;

  $("detailMeta")
    .textContent =
    goal.completed
      ? "Concluída"
      : "Em andamento";

  $("detailContent")
    .innerHTML = `
      <div class="detail-content">
        ${escapeHTML(
          goal.content ||
          "Sem conteúdo."
        )}
      </div>

      <div class="detail-created">
        Criado em ${
          formatDateTime(
            goal.createdAt
          )
        }
      </div>
    `;

  showScreen(
    "detailScreen"
  );

}

function deleteGoal(
  goal
) {

  openModal(
    "Excluir meta",

    `
      <p>
        A meta
        <strong>
          ${escapeHTML(
            goal.title
          )}
        </strong>
        será enviada para a lixeira.
      </p>
    `,

    [
      {
        label:
          "Enviar para lixeira",

        className:
          "danger-button",

        onClick: () => {

          trash.push({

            id:
              generateId(),

            type:
              "goal",

            original:
              { ...goal },

            deletedAt:
              new Date()
                .toISOString()

          });

          goals =
            goals.filter(
              (item) =>
                item.id !==
                goal.id
            );

          writeStorage(
            KEYS.goals,
            goals
          );

          writeStorage(
            KEYS.trash,
            trash
          );

          closeModal();

          renderGoals();

          updateProgress();

          showToast(
            "Meta enviada para a lixeira."
          );

        }

      },

      addModalCancelButton()

    ]
  );

}


/* =========================================================
   TAREFAS
========================================================= */

function openTaskForm(
  task = null
) {

  const isEditing =
    Boolean(task);

  const body = `
    <div class="form-group">
      <label for="taskFormTitle">Título</label>

      <input
        id="taskFormTitle"
        type="text"
        value="${escapeHTML(
          task?.title || ""
        )}"
        placeholder="Título da tarefa"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="taskFormContent">Conteúdo</label>

      <textarea
        id="taskFormContent"
        placeholder="Detalhes da tarefa..."
      >${escapeHTML(
        task?.content || ""
      )}</textarea>
    </div>
  `;

  openModal(
    isEditing
      ? "Editar tarefa"
      : "Adicionar tarefa",

    body,

    [
      {
        label:
          isEditing
            ? "Salvar alterações"
            : "Adicionar",

        className:
          "primary-button",

        onClick: () => {

          const titleInput =
            $("taskFormTitle");

          const contentInput =
            $("taskFormContent");

          const newTitle =
            titleInput.value
              .trim();

          const newContent =
            contentInput.value
              .trim();

          if (!newTitle) {

            showToast(
              "Digite um título."
            );

            titleInput.focus();

            return;

          }

          if (isEditing) {

            task.title =
              newTitle;

            task.content =
              newContent;

            writeStorage(
              KEYS.tasks,
              tasks
            );

            closeModal();

            renderTasks();

            showToast(
              "Tarefa atualizada."
            );

          } else {

            tasks.push({

              id:
                generateId(),

              title:
                newTitle,

              content:
                newContent,

              completed:
                false,

              pinned:
                false,

              createdAt:
                new Date()
                  .toISOString()

            });

            writeStorage(
              KEYS.tasks,
              tasks
            );

            closeModal();

            renderTasks();

            showToast(
              "Tarefa adicionada."
            );

          }

        }

      },

      addModalCancelButton()

    ]
  );

}

function renderTasks() {

  const list =
    $("tasksList");

  const search =
    $("taskSearch")
      .value
      .trim()
      .toLowerCase();

  let filtered =
    tasks.filter(
      (task) =>
        task.title
          .toLowerCase()
          .includes(search)
    );

  filtered =
    sortItems(
      filtered
    );

  if (
    filtered.length === 0
  ) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma tarefa encontrada.
      </div>
    `;

    return;

  }

  list.innerHTML = "";

  filtered.forEach(
    (task) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "item-row";

      if (task.pinned) {

        row.classList
          .add(
            "item-pinned"
          );

      }

      if (task.completed) {

        row.classList
          .add(
            "item-completed"
          );

      }

      const main =
        document.createElement(
          "button"
        );

      main.className =
        "item-main";

      main.innerHTML = `
        <span class="item-title">
          ${
            task.pinned
              ? "📌 "
              : ""
          }
          ${escapeHTML(
            task.title
          )}
        </span>
      `;

      main.addEventListener(
        "click",
        () =>
          openTaskDetail(
            task
          )
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "item-actions";

      const complete =
        document.createElement(
          "button"
        );

      complete.className =
        "item-action complete complete-only";

      complete.textContent =
        task.completed
          ? "✓"
          : "○";

      complete.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          task.completed =
            !task.completed;

          writeStorage(
            KEYS.tasks,
            tasks
          );

          renderTasks();

        }
      );

      const pin =
        document.createElement(
          "button"
        );

      pin.className =
        "item-action pin pin-only";

      pin.textContent =
        task.pinned
          ? "📌"
          : "☆";

      pin.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          task.pinned =
            !task.pinned;

          writeStorage(
            KEYS.tasks,
            tasks
          );

          renderTasks();

        }
      );

      const edit =
        document.createElement(
          "button"
        );

      edit.className =
        "item-action edit-only";

      edit.textContent =
        "✎";

      edit.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          openTaskForm(
            task
          );

        }
      );

      const deleteButton =
        document.createElement(
          "button"
        );

      deleteButton.className =
        "item-action delete delete-only";

      deleteButton.textContent =
        "🗑";

      deleteButton.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          if (
            isViewerMode()
          ) {

            return;

          }

          deleteTask(
            task
          );

        }
      );

      actions.appendChild(
        complete
      );

      actions.appendChild(
        pin
      );

      actions.appendChild(
        edit
      );

      actions.appendChild(
        deleteButton
      );

      row.appendChild(
        main
      );

      row.appendChild(
        actions
      );

      list.appendChild(
        row
      );

    }
  );

}

function openTaskDetail(
  task
) {

  detailReturnScreen =
    "tasksScreen";

  $("detailTitle")
    .textContent =
    task.title;

  $("detailMeta")
    .textContent =
    task.completed
      ? "Concluída"
      : "Em andamento";

  $("detailContent")
    .innerHTML = `
      <div class="detail-content">
        ${escapeHTML(
          task.content ||
          "Sem conteúdo."
        )}
      </div>

      <div class="detail-created">
        Criado em ${
          formatDateTime(
            task.createdAt
          )
        }
      </div>
    `;

  showScreen(
    "detailScreen"
  );

}

function deleteTask(
  task
) {

  openModal(
    "Excluir tarefa",

    `
      <p>
        A tarefa
        <strong>
          ${escapeHTML(
            task.title
          )}
        </strong>
        será enviada para a lixeira.
      </p>
    `,

    [
      {
        label:
          "Enviar para lixeira",

        className:
          "danger-button",

        onClick: () => {

          trash.push({

            id:
              generateId(),

            type:
              "task",

            original:
              { ...task },

            deletedAt:
              new Date()
                .toISOString()

          });

          tasks =
            tasks.filter(
              (item) =>
                item.id !==
                task.id
            );

          writeStorage(
            KEYS.tasks,
            tasks
          );

          writeStorage(
            KEYS.trash,
            trash
          );

          closeModal();

          renderTasks();

          showToast(
            "Tarefa enviada para a lixeira."
          );

        }

      },

      addModalCancelButton()

    ]
  );

}


/* =========================================================
   NOTAS
========================================================= */

function openNoteForm(
  note = null
) {

  const isEditing =
    Boolean(note);

  const body = `
    <div class="form-group">
      <label for="noteFormTitle">Título</label>

      <input
        id="noteFormTitle"
        type="text"
        value="${escapeHTML(
          note?.title || ""
        )}"
        placeholder="Título da nota"
        autocomplete="off"
      >
    </div>

    <div class="form-group">
      <label for="noteFormContent">Conteúdo</label>

      <textarea
        id="noteFormContent"
        placeholder="Escreva sua nota..."
      >${escapeHTML(
        note?.content || ""
      )}</textarea>
    </div>
  `;

  openModal(
    isEditing
      ? "Editar nota"
      : "Adicionar nota",

    body,

    [
      {
        label:
          isEditing
            ? "Salvar alterações"
            : "Adicionar",

        className:
          "primary-button",

        onClick: () => {

          const titleInput =
            $("noteFormTitle");

          const contentInput =
            $("noteFormContent");

          const newTitle =
            titleInput.value
              .trim();

          const newContent =
            contentInput.value
              .trim();

          if (!newTitle) {

            showToast(
              "Digite um título."
            );

            titleInput.focus();

            return;

          }

          if (isEditing) {

            note.title =
              newTitle;

            note.content =
              newContent;

            writeStorage(
              KEYS.notes,
              notes
            );

            closeModal();

            renderNotes();

            showToast(
              "Nota atualizada."
            );

          } else {

            notes.push({

              id:
                generateId(),

              title:
                newTitle,

              content:
                newContent,

              pinned:
                false,

              createdAt:
                new Date()
                  .toISOString()

            });

            writeStorage(
              KEYS.notes,
              notes
            );

            closeModal();

            renderNotes();

            showToast(
              "Nota adicionada."
            );

          }

        }

      },

      addModalCancelButton()

    ]
  );

}

function renderNotes() {

  const list =
    $("notesList");

  const search =
    $("noteSearch")
      .value
      .trim()
      .toLowerCase();

  let filtered =
    notes.filter(
      (note) =>
        note.title
          .toLowerCase()
          .includes(search)
    );

  filtered =
    sortItems(
      filtered
    );

  if (
    filtered.length === 0
  ) {

    list.innerHTML = `
      <div class="empty-message">
        Nenhuma nota encontrada.
      </div>
    `;

    return;

  }

  list.innerHTML = "";

  filtered.forEach(
    (note) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "item-row";

      if (note.pinned) {

        row.classList
          .add(
            "item-pinned"
          );

      }

      const main =
        document.createElement(
          "button"
        );

      main.className =
        "item-main";

      main.innerHTML = `
        <span class="item-title">
          ${
            note.pinned
              ? "📌 "
              : ""
          }
          ${escapeHTML(
            note.title
          )}
        </span>
      `;

      main.addEventListener(
        "click",
        () =>
          openNoteDetail(
            note
          )
      );

      const actions =
        document.createElement(
          "div"
        );

      actions.className =
        "item-actions";

      const pin =
        document.createElement(
          "button"
        );

      pin.className =
        "item-action pin pin-only";

      pin.textContent =
        note.pinned
          ? "📌"
          : "☆";

      pin.addEventListener(
        "click",
        (event) => {

          event.stopPropagation
