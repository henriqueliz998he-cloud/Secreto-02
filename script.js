/* =========================================================
   SECRETO V3
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const KEYS = {

  accessPassword:
    "secreto_v3_access_password",

  goals:
    "secreto_v3_goals",

  tasks:
    "secreto_v3_tasks",

  notes:
    "secreto_v3_notes",

  clothes:
    "secreto_v3_clothes",

  trash:
    "secreto_v3_trash",

  theme:
    "secreto_v3_theme",

  viewer:
    "secreto_v3_viewer",

  timeFormat:
    "secreto_v3_time_format",

  timerSeconds:
    "secreto_v3_timer_seconds",

  loggedIn:
    "secreto_v3_logged_in",

  currentScreen:
    "secreto_v3_current_screen"

};


/* =========================================================
   VARIÁVEIS
========================================================= */

let goals = [];
let tasks = [];
let notes = [];
let clothes = [];
let trash = [];

let currentGoalFilter = "all";
let currentTaskFilter = "all";

let timerInterval = null;
let timerSeconds = 0;

let previousScreen = "dashboardScreen";

let toastTimeout = null;


/* =========================================================
   ATALHO PARA ELEMENTOS
========================================================= */

function $(id) {

  return document.getElementById(id);

}


/* =========================================================
   LOCALSTORAGE
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
      "Erro ao ler armazenamento:",
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
      "Erro ao salvar armazenamento:",
      key,
      error
    );

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   DATA E HORA
========================================================= */

function formatDateTime(dateValue) {

  if (!dateValue) {

    return "Não informado";

  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "Não informado";

  }

  const format =
    localStorage.getItem(
      KEYS.timeFormat
    ) || "24h";

  const options = {

    day: "2-digit",
    month: "2-digit",
    year: "numeric",

    hour: "2-digit",
    minute: "2-digit"

  };

  if (format === "12h") {

    options.hour12 = true;

  } else {

    options.hour12 = false;

  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    options
  ).format(date);

}


function getNowISO() {

  return new Date()
    .toISOString();

}


/* =========================================================
   CARREGAMENTO DOS DADOS
========================================================= */

function loadData() {

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

  removeExpiredTrash();

  renderTimer();

}


/* =========================================================
   SENHA INICIAL
========================================================= */

function initializePassword() {

  if (
    localStorage.getItem(
      KEYS.accessPassword
    ) === null
  ) {

    localStorage.setItem(
      KEYS.accessPassword,
      "Hg99"
    );

  }

}


/* =========================================================
   SESSÃO
========================================================= */

function initializeSessionState() {

  if (
    localStorage.getItem(
      KEYS.loggedIn
    ) === null
  ) {

    localStorage.setItem(
      KEYS.loggedIn,
      "false"
    );

  }

}


function isLoggedIn() {

  return (
    localStorage.getItem(
      KEYS.loggedIn
    ) === "true"
  );

}


function setLoggedIn(value) {

  localStorage.setItem(
    KEYS.loggedIn,
    value
      ? "true"
      : "false"
  );

}


/* =========================================================
   LOGIN
========================================================= */

function login() {

  const input =
    $("accessPassword");

  const message =
    $("loginMessage");

  const password =
    input.value;

  const correctPassword =
    localStorage.getItem(
      KEYS.accessPassword
    ) || "Hg99";

  if (
    password ===
    correctPassword
  ) {

    setLoggedIn(true);

    message.textContent = "";

    input.value = "";

    showApp();

    showScreen(
      localStorage.getItem(
        KEYS.currentScreen
      ) || "dashboardScreen"
    );

    showToast(
      "Acesso liberado."
    );

  } else {

    message.textContent =
      "Senha incorreta.";

    input.value = "";

    input.focus();

  }

}


/* =========================================================
   MOSTRAR APLICATIVO
========================================================= */

function showApp() {

  $("loginScreen")
    .classList
    .add("hidden");

  $("appScreen")
    .classList
    .remove("hidden");

}


/* =========================================================
   BLOQUEAR
========================================================= */

function lockSite() {

  setLoggedIn(false);

  localStorage.setItem(
    KEYS.currentScreen,
    "dashboardScreen"
  );

  $("appScreen")
    .classList
    .add("hidden");

  $("loginScreen")
    .classList
    .remove("hidden");

  $("accessPassword")
    .value = "";

  $("accessPassword")
    .focus();

  showToast(
    "Aplicativo bloqueado."
  );

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showScreen(screenId) {

  const screens =
    document.querySelectorAll(
      "#appScreen > .screen"
    );

  screens.forEach(
    (screen) => {

      screen.classList.add(
        "hidden"
      );

    }
  );

  const target =
    $(screenId);

  if (!target) {

    return;

  }

  target.classList.remove(
    "hidden"
  );

  if (
    screenId !==
    "dashboardScreen"
  ) {

    previousScreen =
      screenId;

  }

  localStorage.setItem(
    KEYS.currentScreen,
    screenId
  );

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

    renderTrash();

  }

}


function goBack() {

  showScreen(
    "dashboardScreen"
  );

}


function setupDetailBackButton() {

  /*
    As telas de detalhes usam o próprio
    botão criado dentro do modal.
  */

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  const toast =
    $("toast");

  if (!toast) {

    return;

  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimeout
  );

  toastTimeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   MODAL
========================================================= */

function openModal(title, content) {

  const modal =
    $("appModal");

  const modalContent =
    $("modalContent");

  modalContent.innerHTML = `

    <div class="modal-form">

      <h3>
        ${escapeHtml(title)}
      </h3>

      ${content}

    </div>

  `;

  modal.classList.remove(
    "hidden"
  );

}


function closeModal() {

  $("appModal")
    .classList
    .add("hidden");

  $("modalContent")
    .innerHTML = "";

}


/* =========================================================
   MODO VISUALIZADOR
========================================================= */

function isViewerMode() {

  return (
    localStorage.getItem(
      KEYS.viewer
    ) === "true"
  );

}


function applyViewerMode() {

  if (
    isViewerMode()
  ) {

    document.body.classList.add(
      "viewer-mode"
    );

  } else {

    document.body.classList.remove(
      "viewer-mode"
    );

  }

}


function toggleViewerMode() {

  const current =
    isViewerMode();

  localStorage.setItem(
    KEYS.viewer,
    current
      ? "false"
      : "true"
  );

  applyViewerMode();

  showToast(
    current
      ? "Modo Visualizador desativado."
      : "Modo Visualizador ativado."
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

  if (
    theme === "light"
  ) {

    document.body.classList.add(
      "light-theme"
    );

  } else {

    document.body.classList.remove(
      "light-theme"
    );

  }

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
    next === "dark"
      ? "Tema escuro ativado."
      : "Tema claro ativado."
  );

}


/* =========================================================
   FORMATO DE HORÁRIO
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

  renderGoals();
  renderTasks();
  renderNotes();
  renderClothes();
  renderTrash();

  showToast(
    `Formato alterado para ${next}.`
  );

}


/* =========================================================
   RELÓGIO
========================================================= */

function updateClock() {

  const clock =
    $("dashboardClock");

  if (!clock) {

    return;

  }

  const now =
    new Date();

  const format =
    localStorage.getItem(
      KEYS.timeFormat
    ) || "24h";

  const options = {

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"

  };

  options.hour12 =
    format === "12h";

  clock.textContent =
    new Intl.DateTimeFormat(
      "pt-BR",
      options
    ).format(now);

}


/* =========================================================
   METAS
========================================================= */

function openGoalForm(goal = null) {

  const editing =
    !!goal;

  openModal(
    editing
      ? "Editar meta"
      : "Adicionar meta",
    `

      <label>Título</label>

      <input
        id="goalTitle"
        type="text"
        value="${escapeHtml(
          goal?.title || ""
        )}"
        placeholder="Título da meta"
      >

      <label>Descrição</label>

      <textarea
        id="goalDescription"
        placeholder="Descrição da meta"
      >${escapeHtml(
        goal?.description || ""
      )}</textarea>

      <button
        id="saveGoalButton"
        class="primary-button"
      >
        ${editing
          ? "Salvar alterações"
          : "Adicionar meta"}
      </button>

    `
  );

  $("saveGoalButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          closeModal();

          return;

        }

        const title =
          $("goalTitle")
            .value
            .trim();

        const description =
          $("goalDescription")
            .value
            .trim();

        if (!title) {

          showToast(
            "Digite um título."
          );

          return;

        }

        if (editing) {

          goal.title =
            title;

          goal.description =
            description;

        } else {

          goals.unshift({

            id:
              Date.now(),

            title,

            description,

            completed:
              false,

            pinned:
              false,

            createdAt:
              getNowISO()

          });

        }

        writeStorage(
          KEYS.goals,
          goals
        );

        renderGoals();

        updateProgress();

        closeModal();

      }
    );

}


function renderGoals() {

  const container =
    $("goalsList");

  if (!container) {

    return;

  }

  const search =
    (
      $("goalSearch")?.value ||
      ""
    )
    .trim()
    .toLowerCase();

  let filtered =
    goals.filter(
      (goal) => {

        const matchesSearch =
          goal.title
            .toLowerCase()
            .includes(search);

        if (
          !matchesSearch
        ) {

          return false;

        }

        if (
          currentGoalFilter ===
          "pending"
        ) {

          return !goal.completed;

        }

        if (
          currentGoalFilter ===
          "completed"
        ) {

          return goal.completed;

        }

        return true;

      }
    );

  if (
    filtered.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-message">
        Nenhuma meta encontrada.
      </div>
    `;

    return;

  }

  container.innerHTML =
    filtered
      .map(
        (goal) =>
          renderGoalCard(goal)
      )
      .join("");

}


function renderGoalCard(goal) {

  return `

    <article
      class="
        item-card
        ${goal.pinned ? "pinned" : ""}
        ${goal.completed ? "completed" : ""}
      "
    >

      <div class="item-main">

        <button
          class="item-title-button"
          data-action="view-goal"
          data-id="${goal.id}"
        >

          <div class="item-title">
            ${escapeHtml(
              goal.title
            )}
          </div>

          <div class="item-meta">
            Criado em:
            ${formatDateTime(
              goal.createdAt
            )}
          </div>

        </button>


        <div class="item-actions">

          <button
            class="icon-button"
            data-action="toggle-goal"
            data-id="${goal.id}"
            title="Concluir"
          >
            ${goal.completed
              ? "↩️"
              : "✓"}
          </button>

          <button
            class="icon-button"
            data-action="pin-goal"
            data-id="${goal.id}"
            title="Fixar"
          >
            ${goal.pinned
              ? "📌"
              : "📍"}
          </button>

          <button
            class="icon-button"
            data-action="edit-goal"
            data-id="${goal.id}"
            title="Editar"
          >
            ✏️
          </button>

          <button
            class="icon-button danger"
            data-action="delete-goal"
            data-id="${goal.id}"
            title="Excluir"
          >
            🗑️
          </button>

        </div>

      </div>

    </article>

  `;

}


function showGoalDetail(goal) {

  openModal(
    "Detalhes da meta",
    `

      <div class="detail-container">

        <div class="detail-title">
          ${escapeHtml(
            goal.title
          )}
        </div>

        <div class="detail-content">

          ${
            escapeHtml(
              goal.description ||
              "Sem descrição."
            )
          }

        </div>

        <div class="detail-date">

          Criado em:
          ${formatDateTime(
            goal.createdAt
          )}

        </div>

      </div>

      <button
        id="closeGoalDetail"
        class="secondary-button"
      >
        Fechar
      </button>

    `
  );

  $("closeGoalDetail")
    .addEventListener(
      "click",
      closeModal
    );

}


/* =========================================================
   TAREFAS
========================================================= */

function openTaskForm(task = null) {

  const editing =
    !!task;

  openModal(
    editing
      ? "Editar tarefa"
      : "Adicionar tarefa",
    `

      <label>Título</label>

      <input
        id="taskTitle"
        type="text"
        value="${escapeHtml(
          task?.title || ""
        )}"
        placeholder="Título da tarefa"
      >

      <label>Descrição</label>

      <textarea
        id="taskDescription"
        placeholder="Descrição da tarefa"
      >${escapeHtml(
        task?.description || ""
      )}</textarea>

      <button
        id="saveTaskButton"
        class="primary-button"
      >
        ${editing
          ? "Salvar alterações"
          : "Adicionar tarefa"}
      </button>

    `
  );

  $("saveTaskButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          closeModal();

          return;

        }

        const title =
          $("taskTitle")
            .value
            .trim();

        const description =
          $("taskDescription")
            .value
            .trim();

        if (!title) {

          showToast(
            "Digite um título."
          );

          return;

        }

        if (editing) {

          task.title =
            title;

          task.description =
            description;

        } else {

          tasks.unshift({

            id:
              Date.now(),

            title,

            description,

            completed:
              false,

            pinned:
              false,

            createdAt:
              getNowISO()

          });

        }

        writeStorage(
          KEYS.tasks,
          tasks
        );

        renderTasks();

        updateProgress();

        closeModal();

      }
    );

}


function renderTasks() {

  const container =
    $("tasksList");

  if (!container) {

    return;

  }

  const search =
    (
      $("taskSearch")?.value ||
      ""
    )
    .trim()
    .toLowerCase();

  const filtered =
    tasks.filter(
      (task) => {

        if (
          !task.title
            .toLowerCase()
            .includes(search)
        ) {

          return false;

        }

        if (
          currentTaskFilter ===
          "pending"
        ) {

          return !task.completed;

        }

        if (
          currentTaskFilter ===
          "completed"
        ) {

          return task.completed;

        }

        return true;

      }
    );

  if (
    filtered.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-message">
        Nenhuma tarefa encontrada.
      </div>
    `;

    return;

  }

  container.innerHTML =
    filtered
      .map(
        (task) =>
          renderTaskCard(task)
      )
      .join("");

}


function renderTaskCard(task) {

  return `

    <article
      class="
        item-card
        ${task.pinned ? "pinned" : ""}
        ${task.completed ? "completed" : ""}
      "
    >

      <div class="item-main">

        <button
          class="item-title-button"
          data-action="view-task"
          data-id="${task.id}"
        >

          <div class="item-title">
            ${escapeHtml(
              task.title
            )}
          </div>

          <div class="item-meta">
            Criado em:
            ${formatDateTime(
            task.createdAt
          )}

        </div>

      </div>

      <button
        id="closeTaskDetail"
        class="secondary-button"
      >
        Fechar
      </button>

    `
  );

  $("closeTaskDetail")
    .addEventListener(
      "click",
      closeModal
    );

}


/* =========================================================
   NOTAS
========================================================= */

function openNoteForm(note = null) {

  const editing =
    !!note;

  openModal(
    editing
      ? "Editar nota"
      : "Adicionar nota",
    `

      <label>Título</label>

      <input
        id="noteTitle"
        type="text"
        value="${escapeHtml(
          note?.title || ""
        )}"
        placeholder="Título da nota"
      >

      <label>Conteúdo</label>

      <textarea
        id="noteContent"
        placeholder="Escreva sua nota..."
      >${escapeHtml(
        note?.content || ""
      )}</textarea>

      <button
        id="saveNoteButton"
        class="primary-button"
      >
        ${editing
          ? "Salvar alterações"
          : "Adicionar nota"}
      </button>

    `
  );

  $("saveNoteButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          closeModal();

          return;

        }

        const title =
          $("noteTitle")
            .value
            .trim();

        const content =
          $("noteContent")
            .value
            .trim();

        if (!title) {

          showToast(
            "Digite um título."
          );

          return;

        }

        if (editing) {

          note.title =
            title;

          note.content =
            content;

        } else {

          notes.unshift({

            id:
              Date.now(),

            title,

            content,

            pinned:
              false,

            createdAt:
              getNowISO()

          });

        }

        writeStorage(
          KEYS.notes,
          notes
        );

        renderNotes();

        closeModal();

      }
    );

}


function renderNotes() {

  const container =
    $("notesList");

  if (!container) {

    return;

  }

  const search =
    (
      $("noteSearch")?.value ||
      ""
    )
    .trim()
    .toLowerCase();

  const filtered =
    notes.filter(
      (note) =>
        note.title
          .toLowerCase()
          .includes(search)
    );

  if (
    filtered.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-message">
        Nenhuma nota encontrada.
      </div>
    `;

    return;

  }

  container.innerHTML =
    filtered
      .map(
        (note) =>
          renderNoteCard(note)
      )
      .join("");

}


function renderNoteCard(note) {

  return `

    <article
      class="
        item-card
        ${note.pinned ? "pinned" : ""}
      "
    >

      <div class="item-main">

        <button
          class="item-title-button"
          data-action="view-note"
          data-id="${note.id}"
        >

          <div class="item-title">
            ${escapeHtml(
              note.title
            )}
          </div>

          <div class="item-meta">
            Criado em:
            ${formatDateTime(
              note.createdAt
            )}
          </div>

        </button>


        <div class="item-actions">

          <button
            class="icon-button"
            data-action="pin-note"
            data-id="${note.id}"
            title="Fixar"
          >
            ${note.pinned
              ? "📌"
              : "📍"}
          </button>

          <button
            class="icon-button"
            data-action="edit-note"
            data-id="${note.id}"
            title="Editar"
          >
            ✏️
          </button>

          <button
            class="icon-button danger"
            data-action="delete-note"
            data-id="${note.id}"
            title="Excluir"
          >
            🗑️
          </button>

        </div>

      </div>

    </article>

  `;

}


function showNoteDetail(note) {

  openModal(
    "Detalhes da nota",
    `

      <div class="detail-container">

        <div class="detail-title">
          ${escapeHtml(
            note.title
          )}
        </div>

        <div class="detail-content">
          ${escapeHtml(
            note.content ||
            "Sem conteúdo."
          )}
        </div>

        <div class="detail-date">

          Criado em:
          ${formatDateTime(
            note.createdAt
          )}

        </div>

      </div>

      <button
        id="closeNoteDetail"
        class="secondary-button"
      >
        Fechar
      </button>

    `
  );

  $("closeNoteDetail")
    .addEventListener(
      "click",
      closeModal
    );

}


/* =========================================================
   ROUPAS SÍTIO
========================================================= */

function openClothingForm(
  clothing = null
) {

  const editing =
    !!clothing;

  openModal(
    editing
      ? "Editar roupa"
      : "Adicionar roupa",
    `

      <label>Título</label>

      <input
        id="clothingTitle"
        type="text"
        value="${escapeHtml(
          clothing?.title || ""
        )}"
        placeholder="Ex.: Roupa para o sítio"
      >

      <label>Na cabeça</label>

      <input
        id="clothingNaCabeca"
        type="text"
        value="${escapeHtml(
          clothing?.naCabeca || ""
        )}"
      >

      <label>No corpo 1</label>

      <input
        id="clothingCorpo1"
        type="text"
        value="${escapeHtml(
          clothing?.corpo1 || ""
        )}"
      >

      <label>No corpo 2</label>

      <input
        id="clothingCorpo2"
        type="text"
        value="${escapeHtml(
          clothing?.corpo2 || ""
        )}"
      >

      <label>Calça</label>

      <input
        id="clothingCalca"
        type="text"
        value="${escapeHtml(
          clothing?.calca || ""
        )}"
      >

      <label>Meia</label>

      <input
        id="clothingMeia"
        type="text"
        value="${escapeHtml(
          clothing?.meia || ""
        )}"
      >

      <label>Sapato</label>

      <input
        id="clothingSapato"
        type="text"
        value="${escapeHtml(
          clothing?.sapato || ""
        )}"
      >

      <label>Adicionar extras</label>

      <textarea
        id="clothingExtras"
      >${escapeHtml(
        clothing?.extras || ""
      )}</textarea>

      <button
        id="saveClothingButton"
        class="primary-button"
      >
        ${editing
          ? "Salvar alterações"
          : "Adicionar roupa"}
      </button>

    `
  );

  $("saveClothingButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          closeModal();

          return;

        }

        const title =
          $("clothingTitle")
            .value
            .trim();

        const naCabeca =
          $("clothingNaCabeca")
            .value
            .trim();

        const corpo1 =
          $("clothingCorpo1")
            .value
            .trim();

        const corpo2 =
          $("clothingCorpo2")
            .value
            .trim();

        const calca =
          $("clothingCalca")
            .value
            .trim();

        const meia =
          $("clothingMeia")
            .value
            .trim();

        const sapato =
          $("clothingSapato")
            .value
            .trim();

        const extras =
          $("clothingExtras")
            .value
            .trim();

        if (!title) {

          showToast(
            "Digite um título."
          );

          return;

        }

        if (editing) {

          clothing.title =
            title;

          clothing.naCabeca =
            naCabeca;

          clothing.corpo1 =
            corpo1;

          clothing.corpo2 =
            corpo2;

          clothing.calca =
            calca;

          clothing.meia =
            meia;

          clothing.sapato =
            sapato;

          clothing.extras =
            extras;

        } else {

          clothes.unshift({

            id:
              Date.now(),

            title,

            naCabeca,

            corpo1,

            corpo2,

            calca,

            meia,

            sapato,

            extras,

            pinned:
              false,

            createdAt:
              getNowISO()

          });

        }

        writeStorage(
          KEYS.clothes,
          clothes
        );

        renderClothes();

        closeModal();

      }
    );

}


function renderClothes() {

  const container =
    $("clothesList");

  if (!container) {

    return;

  }

  if (
    clothes.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-message">
        Nenhuma roupa cadastrada.
      </div>
    `;

    return;

  }

  const ordered =
    [...clothes]
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

          return 0;

        }
      );

  container.innerHTML =
    ordered
      .map(
        (clothing) =>
          renderClothingCard(
            clothing
          )
      )
      .join("");

}


function renderClothingCard(
  clothing
) {

  return `

    <article
      class="
        item-card
        ${clothing.pinned
          ? "pinned"
          : ""}
      "
    >

      <div class="item-main">

        <button
          class="item-title-button"
          data-action="view-clothing"
          data-id="${clothing.id}"
        >

          <div class="item-title">

            ${escapeHtml(
              clothing.title
            )}

          </div>

          <div class="item-meta">

            Criado em:
            ${formatDateTime(
              clothing.createdAt
            )}

          </div>

        </button>


        <div class="item-actions">

          <button
            class="icon-button"
            data-action="pin-clothing"
            data-id="${clothing.id}"
            title="Fixar"
          >
            ${clothing.pinned
              ? "📌"
              : "📍"}
          </button>

          <button
            class="icon-button"
            data-action="edit-clothing"
            data-id="${clothing.id}"
            title="Editar"
          >
            ✏️
          </button>

          <button
            class="icon-button danger"
            data-action="delete-clothing"
            data-id="${clothing.id}"
            title="Excluir"
          >
            🗑️
          </button>

        </div>

      </div>

    </article>

  `;

}


function showClothingDetail(
  clothing
) {

  openModal(
    "Detalhes da roupa",
    `

      <div class="detail-container">

        <div class="detail-title">

          ${escapeHtml(
            clothing.title
          )}

        </div>


        <div class="detail-content">

          <div class="detail-item">

            <strong>
              Na cabeça
            </strong>

            <span>
              ${escapeHtml(
                clothing.naCabeca ||
                "Não informado"
              )}
            </span>

          </div>


          <div class="detail-item">

            <strong>
              No corpo 1
            </strong>

            <span>
              ${escapeHtml(
                clothing.corpo1 ||
                "Não informado"
              )}
            </span>

          </div>


          <div class="detail-item">

            <strong>
              No corpo 2
            </strong>

            <span>
              ${escapeHtml(
                clothing.corpo2 ||
                "Não informado"
              )}
            </span>

          </div>


          <div class="detail-item">

            <strong>
              Calça
            </strong>

            <span>
              ${escapeHtml(
                clothing.calca ||
                "Não informado"
              )}
            </span>

          </div>


          <div class="detail-item">

            <strong>
              Meia
            </strong>

            <span>
              ${escapeHtml(
                clothing.meia ||
                "Não informado"
              )}
            </span>

          </div>


          <div class="detail-item">

            <strong>
              Sapato
            </strong>

            <span>
              ${escapeHtml(
                clothing.sapato ||
                "Não informado"
              )}
            </span>

          </div>


          <div class="detail-item">

            <strong>
              Extras
            </strong>

            <span>
              ${escapeHtml(
                clothing.extras ||
                "Nenhum"
              )}
            </span>

          </div>

        </div>


        <div class="detail-date">

          Criado em:
          ${formatDateTime(
            clothing.createdAt
          )}

        </div>

      </div>


      <button
        id="closeClothingDetail"
        class="secondary-button"
      >
        Fechar
      </button>

    `
  );

  $("closeClothingDetail")
    .addEventListener(
      "click",
      closeModal
    );

}


/* =========================================================
   LIXEIRA
========================================================= */

function addToTrash(
  type,
  item
) {

  trash.unshift({

    id:
      Date.now(),

    type,

    originalId:
      item.id,

    item:
      JSON.parse(
        JSON.stringify(item)
      ),

    deletedAt:
      getNowISO()

  });

  writeStorage(
    KEYS.trash,
    trash
  );

}


function removeExpiredTrash() {

  const now =
    Date.now();

  const fiftyDays =
    50 *
    24 *
    60 *
    60 *
    1000;

  const filtered =
    trash.filter(
      (entry) => {

        const deleted =
          new Date(
            entry.deletedAt
          ).getTime();

        return (
          now - deleted <
          fiftyDays
        );

      }
    );

  if (
    filtered.length !==
    trash.length
  ) {

    trash =
      filtered;

    writeStorage(
      KEYS.trash,
      trash
    );

  }

}


function renderTrash() {

  const container =
    $("trashList");

  if (!container) {

    return;

  }

  removeExpiredTrash();

  if (
    trash.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-message">
        A lixeira está vazia.
      </div>
    `;

    return;

  }

  container.innerHTML =
    trash
      .map(
        (entry) =>
          renderTrashCard(
            entry
          )
      )
      .join("");

}


function renderTrashCard(
  entry
) {

  const item =
    entry.item;

  const typeNames = {

    note:
      "Nota",

    goal:
      "Meta",

    task:
      "Tarefa"

  };

  return `

    <article class="trash-card">

      <div class="trash-type">

        ${escapeHtml(
          typeNames[
            entry.type
          ] ||
          "Item"
        )}

      </div>


      <strong>

        ${escapeHtml(
          item.title ||
          "Sem título"
        )}

      </strong>


      <div class="trash-date">

        Excluído em:
        ${formatDateTime(
          entry.deletedAt
        )}

      </div>


      <div class="item-actions">

        <button
          class="icon-button"
          data-action="restore-trash"
          data-id="${entry.id}"
          title="Restaurar"
        >
          ♻️
        </button>

        <button
          class="icon-button danger"
          data-action="delete-trash"
          data-id="${entry.id}"
          title="Excluir definitivamente"
        >
          🗑️
        </button>

      </div>

    </article>

  `;

}


function restoreTrashItem(
  entry
) {

  if (
    isViewerMode()
  ) {

    return;

  }

  const item =
    entry.item;

  if (
    entry.type ===
    "note"
  ) {

    notes.unshift(item);

    writeStorage(
      KEYS.notes,
      notes
    );

  }

  if (
    entry.type ===
    "goal"
  ) {

    goals.unshift(item);

    writeStorage(
      KEYS.goals,
      goals
    );

  }

  if (
    entry.type ===
    "task"
  ) {

    tasks.unshift(item);

    writeStorage(
      KEYS.tasks,
      tasks
    );

  }

  trash =
    trash.filter(
      (trashItem) =>
        trashItem.id !==
        entry.id
    );

  writeStorage(
    KEYS.trash,
    trash
  );

  renderTrash();

  renderNotes();
  renderGoals();
  renderTasks();

  updateProgress();

  showToast(
    "Item restaurado."
  );

}


function permanentlyDeleteTrash(
  entry
) {

  if (
    isViewerMode()
  ) {

    return;

  }

  trash =
    trash.filter(
      (trashItem) =>
        trashItem.id !==
        entry.id
    );

  writeStorage(
    KEYS.trash,
    trash
  );

  renderTrash();

  showToast(
    "Item excluído definitivamente."
  );

}


/* =========================================================
   APAGAR GERAL
========================================================= */

function openDeleteAll() {

  openModal(
    "Apagar geral",
    `

      <p>
        Esta ação apagará todos os dados
        do aplicativo.
      </p>

      <p>
        Digite a senha de confirmação:
        <strong>Hg88</strong>
      </p>

      <input
        id="deleteAllPassword"
        type="password"
        placeholder="Senha de confirmação"
      >

      <button
        id="confirmDeleteAllButton"
        class="danger-button"
      >
        Continuar
      </button>

    `
  );

  $("confirmDeleteAllButton")
    .addEventListener(
      "click",
      () => {

        const password =
          $("deleteAllPassword")
            .value;

        if (
          password !==
          "Hg88"
        ) {

          showToast(
            "Senha de confirmação incorreta."
          );

          return;

        }

        closeModal();

        openFinalDeleteConfirmation();

      }
    );

}


function openFinalDeleteConfirmation() {

  openModal(
    "Confirmar exclusão",
    `

      <p>
        Tem certeza que deseja apagar
        absolutamente todos os dados?
      </p>

      <button
        id="finalDeleteButton"
        class="danger-button"
      >
        SIM, APAGAR TUDO
      </button>

      <button
        id="cancelFinalDeleteButton"
        class="secondary-button"
      >
        Cancelar
      </button>

    `
  );

  $("cancelFinalDeleteButton")
    .addEventListener(
      "click",
      closeModal
    );

  $("finalDeleteButton")
    .addEventListener(
      "click",
      performDeleteAll
    );

}


function performDeleteAll() {

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
    "Hg99"
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

  clearInterval(
    timerInterval
  );

  timerInterval =
    null;

  renderTimer();

  renderGoals();
  renderTasks();
  renderNotes();
  renderClothes();
  renderTrash();

  updateProgress();

  applyTheme();

  applyViewerMode();

  closeModal();

  lockSite();

}


/* =========================================================
   CRONÔMETRO
========================================================= */

function renderTimer() {

  const display =
    $("timerDisplay");

  if (!display) {

    return;

  }

  const hours =
    Math.floor(
      timerSeconds / 3600
    );

  const minutes =
    Math.floor(
      (timerSeconds % 3600) /
      60
    );

  const seconds =
    timerSeconds % 60;

  display.textContent =
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;

}


function startTimer() {

  if (
    timerInterval !== null
  ) {

    return;

  }

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

        renderTimer();

      },
      1000
    );

  showToast(
    "Cronômetro iniciado."
  );

}


function pauseTimer() {

  clearInterval(
    timerInterval
  );

  timerInterval =
    null;

  showToast(
    "Cronômetro pausado."
  );

}


function resetTimer() {

  clearInterval(
    timerInterval
  );

  timerInterval =
    null;

  timerSeconds =
    0;

  localStorage.setItem(
    KEYS.timerSeconds,
    "0"
  );

  renderTimer();

  showToast(
    "Cronômetro zerado."
  );

}


/* =========================================================
   PROGRESSO
========================================================= */

function updateProgress() {

  const container =
    $("progressContent");

  if (!container) {

    return;

  }

  const totalGoals =
    goals.length;

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.completed
    ).length;

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.completed
    ).length;

  const goalPercent =
    totalGoals === 0
      ? 0
      : Math.round(
          (
            completedGoals /
            totalGoals
          ) *
          100
        );

  const taskPercent =
    totalTasks === 0
      ? 0
      : Math.round(
          (
            completedTasks /
            totalTasks
          ) *
          100
        );

  const totalItems =
    totalGoals +
    totalTasks;

  const completedItems =
    completedGoals +
    completedTasks;

  const totalPercent =
    totalItems === 0
      ? 0
      : Math.round(
          (
            completedItems /
            totalItems
          ) *
          100
        );

  container.innerHTML = `

    <div class="progress-card">

      <h3>
        Metas
      </h3>

      <div class="progress-number">

        ${completedGoals}
        /
        ${totalGoals}

      </div>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width: ${goalPercent}%"
        ></div>

      </div>

      <p>
        ${goalPercent}% concluído
      </p>

    </div>


    <div class="progress-card">

      <h3>
        Tarefas
      </h3>

      <div class="progress-number">

        ${completedTasks}
        /
        ${totalTasks}

      </div>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width: ${taskPercent}%"
        ></div>

      </div>

      <p>
        ${taskPercent}% concluído
      </p>

    </div>


    <div class="progress-card">

      <h3>
        Progresso geral
      </h3>

      <div class="progress-number">

        ${totalPercent}%

      </div>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width: ${totalPercent}%"
        ></div>

      </div>

    </div>

  `;

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
    "Compartilhar",
    `

      <textarea
        id="shareText"
        readonly
      >${escapeHtml(
        text
      )}</textarea>

      <button
        id="copyShareButton"
        class="primary-button"
      >
        📋 Copiar texto
      </button>

    `
  );

  $("copyShareButton")
    .addEventListener(
      "click",
      async () => {

        try {

          await navigator.clipboard
            .writeText(text);

          showToast(
            "Texto copiado."
          );

        } catch (error) {

          const textarea =
            $("shareText");

          textarea.select();

          document.execCommand(
            "copy"
          );

          showToast(
            "Texto copiado."
          );

        }

      }
    );

}


function buildGoalsShareText() {

  let text =
    "=== METAS — SECRETO V3 ===\n";

  if (
    goals.length === 0
  ) {

    text +=
      "\nNenhuma meta cadastrada.";

    return text;

  }

  goals.forEach(
    (goal, index) => {

      text +=
        `\n${index + 1}. ${goal.title}\n`;

      text +=
        `Status: ${
          goal.completed
            ? "Concluída"
            : "Pendente"
        }\n`;

      text +=
        `Descrição: ${
          goal.description ||
          "Nenhuma"
        }\n`;

      text +=
        `Criado em: ${
          formatDateTime(
            goal.createdAt
          )
        }\n`;

    }
  );

  return text;

}


function buildTasksShareText() {

  let text =
    "=== TAREFAS — SECRETO V3 ===\n";

  if (
    tasks.length === 0
  ) {

    text +=
      "\nNenhuma tarefa cadastrada.";

    return text;

  }

  tasks.forEach(
    (task, index) => {

      text +=
        `\n${index + 1}. ${task.title}\n`;

      text +=
        `Status: ${
          task.completed
            ? "Concluída"
            : "Pendente"
        }\n`;

      text +=
        `Descrição: ${
          task.description ||
          "Nenhuma"
        }\n`;

      text +=
        `Criado em: ${
          formatDateTime(
            task.createdAt
          )
        }\n`;

    }
  );

  return text;

}


function buildNotesShareText() {

  let text =
    "=== NOTAS — SECRETO V3 ===\n";

  if (
    notes.length === 0
  ) {

    text +=
      "\nNenhuma nota cadastrada.";

    return text;

  }

  notes.forEach(
    (note, index) => {

      text +=
        `\n${index + 1}. ${note.title}\n`;

      text +=
        `Conteúdo:\n${
          note.content ||
          "Nenhum"
        }\n`;

      text +=
        `Criado em: ${
          formatDateTime(
            note.createdAt
          )
        }\n`;

    }
  );

  return text;

}


function buildProgressShareText() {

  const totalGoals =
    goals.length;

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.completed
    ).length;

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.completed
    ).length;

  const total =
    totalGoals +
    totalTasks;

  const completed =
    completedGoals +
    completedTasks;

  const percent =
    total === 0
      ? 0
      : Math.round(
          (
            completed /
            total
          ) *
          100
        );

  return `

=== PROGRESSO — SECRETO V3 ===

Metas:
${completedGoals}/${totalGoals} concluídas

Tarefas:
${completedTasks}/${totalTasks} concluídas

Progresso geral:
${percent}%

  `.trim();

}


function buildGeneralShareText() {

  let text =
    "=== SECRETO V3 ===\n";


  text +=
    "\n=== METAS ===\n";

  if (
    goals.length === 0
  ) {

    text +=
      "Nenhuma meta cadastrada.\n";

  } else {

    goals.forEach(
      (goal, index) => {

        text +=
          `${index + 1}. ${goal.title}\n`;

        text +=
          `Status: ${
            goal.completed
              ? "Concluída"
              : "Pendente"
          }\n`;

        text +=
          `Descrição: ${
            goal.description ||
            "Nenhuma"
          }\n`;

        text +=
          `Criado: ${
            formatDateTime(
              goal.createdAt
            )
          }\n\n`;

      }
    );

  }


  text +=
    "\n=== TAREFAS ===\n";

  if (
    tasks.length === 0
  ) {

    text +=
      "Nenhuma tarefa cadastrada.\n";

  } else {

    tasks.forEach(
      (task, index) => {

        text +=
          `${index + 1}. ${task.title}\n`;

        text +=
          `Status: ${
            task.completed
              ? "Concluída"
              : "Pendente"
          }\n`;

        text +=
          `Descrição: ${
            task.description ||
            "Nenhuma"
          }\n`;

        text +=
          `Criado: ${
            formatDateTime(
              task.createdAt
            )
          }\n\n`;

      }
    );

  }


  text +=
    "\n=== NOTAS ===\n";

  if (
    notes.length === 0
  ) {

    text +=
      "Nenhuma nota cadastrada.\n";

  } else {

    notes.forEach(
      (note, index) => {

        text +=
          `${index + 1}. ${note.title}\n`;

        text +=
          `Conteúdo: ${
            note.content ||
            "Nenhum"
          }\n`;

        text +=
          `Criado: ${
            formatDateTime(
              note.createdAt
            )
          }\n\n`;

      }
    );

  }


  text +=
    "\n=== ROUPAS SÍTIO ===\n";

  if (
    clothes.length === 0
  ) {

    text +=
      "Nenhuma roupa cadastrada.\n";

  } else {

    clothes.forEach(
      (clothing, index) => {

        text +=
          `${index + 1}. ${clothing.title}\n`;

        text +=
          `Na cabeça: ${
            clothing.naCabeca ||
            "Não informado"
          }\n`;

        text +=
          `No corpo 1: ${
            clothing.corpo1 ||
            "Não informado"
          }\n`;

        text +=
          `No corpo 2: ${
            clothing.corpo2 ||
            "Não informado"
          }\n`;

        text +=
          `Calça: ${
            clothing.calca ||
            "Não informado"
          }\n`;

        text +=
          `Meia: ${
            clothing.meia ||
            "Não informado"
          }\n`;

        text +=
          `Sapato: ${
            clothing.sapato ||
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
    "\n=== PROGRESSO ===\n";

  text +=
    buildProgressShareText();


  text +=
    "\n\n=== CONFIGURAÇÕES ===\n";

  text +=
    `Tema: ${
      (
        localStorage.getItem(
          KEYS.theme
        ) || "dark"
      ) === "dark"
        ? "Escuro"
        : "Claro"
    }\n`;

  text +=
    `Modo Visualizador: ${
      isViewerMode()
        ? "Ativado"
        : "Desativado"
    }\n`;

  text +=
    `Formato de horário: ${
      localStorage.getItem(
        KEYS.timeFormat
      ) || "24h"
    }\n`;

  return text;

}


/* =========================================================
   AÇÕES DOS ITENS
========================================================= */

function findById(
  array,
  id
) {

  return array.find(
    (item) =>
      String(item.id) ===
      String(id)
  );

}


/* =========================================================
   EVENTOS DE METAS
========================================================= */

function handleGoalAction(
  action,
  id
) {

  const goal =
    findById(
      goals,
      id
    );

  if (!goal) {

    return;

  }

  if (
    action ===
    "view-goal"
  ) {

    showGoalDetail(
      goal
    );

    return;

  }

  if (
    isViewerMode()
  ) {

    return;

  }

  if (
    action ===
    "toggle-goal"
  ) {

    goal.completed =
      !goal.completed;

    writeStorage(
      KEYS.goals,
      goals
    );

    renderGoals();

    updateProgress();

    return;

  }

  if (
    action ===
    "pin-goal"
  ) {

    goal.pinned =
      !goal.pinned;

    writeStorage(
      KEYS.goals,
      goals
    );

    renderGoals();

    return;

  }

  if (
    action ===
    "edit-goal"
  ) {

    openGoalForm(
      goal
    );

    return;

  }

  if (
    action ===
    "delete-goal"
  ) {

    addToTrash(
      "goal",
      goal
    );

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

    renderGoals();

    renderTrash();

    updateProgress();

    showToast(
      "Meta enviada para a lixeira."
    );

  }

}


/* =========================================================
   EVENTOS DE TAREFAS
========================================================= */

function handleTaskAction(
  action,
  id
) {

  const task =
    findById(
      tasks,
      id
    );

  if (!task) {

    return;

  }

  if (
    action ===
    "view-task"
  ) {

    showTaskDetail(
      task
    );

    return;

  }

  if (
    isViewerMode()
  ) {

    return;

  }

  if (
    action ===
    "toggle-task"
  ) {

    task.completed =
      !task.completed;

    writeStorage(
      KEYS.tasks,
      tasks
    );

    renderTasks();

    updateProgress();

    return;

  }

  if (
    action ===
    "pin-task"
  ) {

    task.pinned =
      !task.pinned;

    writeStorage(
      KEYS.tasks,
      tasks
    );

    renderTasks();

    return;

  }

  if (
    action ===
    "edit-task"
  ) {

    openTaskForm(
      task
    );

    return;

  }

  if (
    action ===
    "delete-task"
  ) {

    addToTrash(
      "task",
      task
    );

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

    renderTasks();

    renderTrash();

    updateProgress();

    showToast(
      "Tarefa enviada para a lixeira."
    );

  }

}


/* =========================================================
   EVENTOS DE NOTAS
========================================================= */

function handleNoteAction(
  action,
  id
) {

  const note =
    findById(
      notes,
      id
    );

  if (!note) {

    return;

  }

  if (
    action ===
    "view-note"
  ) {

    showNoteDetail(
      note
    );

    return;

  }

  if (
    isViewerMode()
  ) {

    return;

  }

  if (
    action ===
    "pin-note"
  ) {

    note.pinned =
      !note.pinned;

    writeStorage(
      KEYS.notes,
      notes
    );

    renderNotes();

    return;

  }

  if (
    action ===
    "edit-note"
  ) {

    openNoteForm(
      note
    );

    return;

  }

  if (
    action ===
    "delete-note"
  ) {

    addToTrash(
      "note",
      note
    );

    notes =
      notes.filter(
        (item) =>
          item.id !==
          note.id
      );

    writeStorage(
      KEYS.notes,
      notes
    );

    renderNotes();

    renderTrash();

    showToast(
      "Nota enviada para a lixeira."
    );

  }

}


/* =========================================================
   EVENTOS DE ROUPAS
========================================================= */

function handleClothingAction(
  action,
  id
) {

  const clothing =
    findById(
      clothes,
      id
    );

  if (!clothing) {

    return;

  }

  if (
    action ===
    "view-clothing"
  ) {

    showClothingDetail(
      clothing
    );

    return;

  }

  if (
    isViewerMode()
  ) {

    return;

  }

  if (
    action ===
    "pin-clothing"
  ) {

    clothing.pinned =
      !clothing.pinned;

    writeStorage(
      KEYS.clothes,
      clothes
    );

    renderClothes();

    return;

  }

  if (
    action ===
    "edit-clothing"
  ) {

    openClothingForm(
      clothing
    );

    return;

  }

  if (
    action ===
    "delete-clothing"
  ) {

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

    renderClothes();

    showToast(
      "Roupa excluída."
    );

  }

}


/* =========================================================
   EVENTOS DA LIXEIRA
========================================================= */

function handleTrashAction(
  action,
  id
) {

  const entry =
    findById(
      trash,
      id
    );

  if (!entry) {

    return;

  }

  if (
    action ===
    "restore-trash"
  ) {

    restoreTrashItem(
      entry
    );

    return;

  }

  if (
    action ===
    "delete-trash"
  ) {

    permanentlyDeleteTrash(
      entry
    );

  }

}


/* =========================================================
   DELEGAÇÃO DE EVENTOS
========================================================= */

function setupListEvents() {

  $("goalsList")
    .addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) {

          return;

        }

        handleGoalAction(
          button.dataset.action,
          button.dataset.id
        );

      }
    );


  $("tasksList")
    .addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) {

          return;

        }

        handleTaskAction(
          button.dataset.action,
          button.dataset.id
        );

      }
    );


  $("notesList")
    .addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) {

          return;

        }

        handleNoteAction(
          button.dataset.action,
          button.dataset.id
        );

      }
    );


  $("clothesList")
    .addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) {

          return;

        }

        handleClothingAction(
          button.dataset.action,
          button.dataset.id
        );

      }
    );


  $("trashList")
    .addEventListener(
      "click",
      (event) => {

        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) {

          return;

        }

        handleTrashAction(
          button.dataset.action,
          button.dataset.id
        );

      }
    );

}


/* =========================================================
   EVENTOS PRINCIPAIS
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


  $("togglePasswordButton")
    .addEventListener(
      "click",
      () => {

        const input =
          $("accessPassword");

        input.type =
          input.type ===
          "password"
            ? "text"
            : "password";

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
      goBack
    );


  $("tasksBackButton")
    .addEventListener(
      "click",
      goBack
    );


  $("notesBackButton")
    .addEventListener(
      "click",
      goBack
    );


  $("clothesBackButton")
    .addEventListener(
      "click",
      goBack
    );


  $("timerBackButton")
    .addEventListener(
      "click",
      goBack
    );


  $("progressBackButton")
    .addEventListener(
      "click",
      goBack
    );


  $("settingsBackButton")
    .addEventListener(
      "click",
      goBack
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

        if (
          isViewerMode()
        ) {

          showToast(
            "Desative o Modo Visualizador primeiro."
          );

          return;

        }

        openGoalForm();

      }
    );


  $("addTaskButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          showToast(
            "Desative o Modo Visualizador primeiro."
          );

          return;

        }

        openTaskForm();

      }
    );


  $("addNoteButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          showToast(
            "Desative o Modo Visualizador primeiro."
          );

          return;

        }

        openNoteForm();

      }
    );


  $("addClothingButton")
    .addEventListener(
      "click",
      () => {

        if (
          isViewerMode()
        ) {

          showToast(
            "Desative o Modo Visualizador primeiro."
          );

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


  /* FILTROS METAS */

  $("goalFilterAll")
    .addEventListener(
      "click",
      () => {

        currentGoalFilter =
          "all";

        updateGoalFilterButtons();

        renderGoals();

      }
    );


  $("goalFilterPending")
    .addEventListener(
      "click",
      () => {

        currentGoalFilter =
          "pending";

        updateGoalFilterButtons();

        renderGoals();

      }
    );


  $("goalFilterCompleted")
    .addEventListener(
      "click",
      () => {

        currentGoalFilter =
          "completed";

        updateGoalFilterButtons();

        renderGoals();

      }
    );


  /* FILTROS TAREFAS */

  $("taskFilterAll")
    .addEventListener(
      "click",
      () => {

        currentTaskFilter =
          "all";

        updateTaskFilterButtons();

        renderTasks();

      }
    );


  $("taskFilterPending")
    .addEventListener(
      "click",
      () => {

        currentTaskFilter =
          "pending";

        updateTaskFilterButtons();

        renderTasks();

      }
    );


  $("taskFilterCompleted")
    .addEventListener(
      "click",
      () => {

        currentTaskFilter =
          "completed";

        updateTaskFilterButtons();

        renderTasks();

      }
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

        if (
          isViewerMode()
        ) {

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

        if (
          isViewerMode()
        ) {

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


  setupListEvents();

}


/* =========================================================
   ALTERAR SENHA
========================================================= */

function openChangePassword() {

  openModal(
    "Alterar senha",
    `

      <label>
        Senha atual
      </label>

      <input
        id="currentPassword"
        type="password"
        placeholder="Senha atual"
      >


      <label>
        Nova senha
      </label>

      <input
        id="newPassword"
        type="password"
        placeholder="Nova senha"
      >


      <label>
        Confirmar nova senha
      </label>

      <input
        id="confirmPassword"
        type="password"
        placeholder="Confirmar nova senha"
      >


      <button
        id="savePasswordButton"
        class="primary-button"
      >
        Alterar senha
      </button>

    `
  );

  $("savePasswordButton")
    .addEventListener(
      "click",
      () => {

        const current =
          $("currentPassword")
            .value;

        const next =
          $("newPassword")
            .value;

        const confirm =
          $("confirmPassword")
            .value;

        const saved =
          localStorage.getItem(
            KEYS.accessPassword
          ) || "Hg99";

        if (
          current !==
          saved
        ) {

          showToast(
            "Senha atual incorreta."
          );

          return;

        }

        if (
          !next
        ) {

          showToast(
            "Digite a nova senha."
          );

          return;

        }

        if (
          next !==
          confirm
        ) {

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
    );

}


/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {

  if (
    "serviceWorker" in
    navigator
  ) {

    window.addEventListener(
      "load",
      async () => {

        try {

          const registration =
            await navigator.serviceWorker
              .register(
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

  initializePassword();

  initializeSessionState();

  loadData();

  setupEvents();

  setupDetailBackButton();

  applyTheme();

  applyViewerMode();

  updateClock();

  setInterval(
    updateClock,
    1000
  );

  renderGoals();

  renderTasks();

  renderNotes();

  renderClothes();

  renderTrash();

  renderTimer();

  updateProgress();


  if (
    isLoggedIn()
  ) {

    showApp();

    const savedScreen =
      localStorage.getItem(
        KEYS.currentScreen
      ) ||
      "dashboardScreen";

    if (
      $(savedScreen) &&
      savedScreen !==
        "loginScreen"
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
   INICIAR
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
