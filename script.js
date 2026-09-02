const NoteStorage = [];
const TrashStorage = [];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const today = new Date();
const Year = today.getUTCFullYear();
const Month = today.getUTCMonth() + 1;
const Day = today.getUTCDate();

let cardID = null;
let pinStatus = null;
let currentTags = [];
let currentView = "notes";

const notesList = document.getElementById("notes-list");
const noteCount = document.getElementById("notes-count");
const noteinput = document.getElementById("note-input");
const saveNotes = document.querySelector("#save-note-btn");
const changeTheme = document.getElementById("theme-toggle");
const CharCount = document.getElementById("character-count");
const miniCharIndicator = document.getElementById("mini-char-indicator");
const noteTitle = document.getElementById("note-title");
const body = document.querySelector("body");
const newNoteBtn = document.getElementById("new-note-btn");
const deleteNoteBtn = document.getElementById("delete-note-btn");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");
const pinNoteBtn = document.getElementById("pin-note-btn");
const createdDateEl = document.getElementById("created-date");
const editedDateEl = document.getElementById("edited-date");
const tagInput = document.getElementById("tag-input");
const tagsContainer = document.getElementById("tags-container");

const viewAllNotesBtn = document.getElementById("view-all-notes-btn");
const viewTrashBtn = document.getElementById("view-trash-btn");
const allNotesCountEl = document.getElementById("all-notes-count");
const trashNotesCountEl = document.getElementById("trash-notes-count");
const sidebarViewTitle = document.getElementById("sidebar-view-title");
const emptyTrashBtn = document.getElementById("empty-trash-btn");
const trashNoticeBanner = document.getElementById("trash-notice-banner");
const restoreNoteBtn = document.getElementById("restore-note-btn");
const deletePermanentBtn = document.getElementById("delete-permanent-btn");
const drawer = document.getElementById("menu-drawer");
const overlay = document.getElementById("menu-overlay");

function formatDate(day, month, year) {
  const d = String(day || 1).padStart(2, "0");
  const m = String(month || 1).padStart(2, "0");
  const y = String(year || Year);
  return `${d}-${m}-${y}`;
}

function getDaysRemainingInTrash(deletedAt) {
  const elapsed = Date.now() - (Number(deletedAt) || Date.now());
  const remainingMs = THIRTY_DAYS_MS - elapsed;
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  if (remainingDays <= 0) return "Expires today";
  if (remainingDays === 1) return "1 day left";
  return `${remainingDays} days left`;
}

function cleanupExpiredTrash() {
  try {
    const now = Date.now();
    const unexpired = [];
    const expiredIds = [];

    for (const item of TrashStorage) {
      const deletedTime = Number(item.deletedAt) || now;
      if (now - deletedTime >= THIRTY_DAYS_MS) {
        expiredIds.push(item.id);
      } else {
        unexpired.push(item);
      }
    }

    if (expiredIds.length > 0) {
      for (const id of expiredIds) {
        deleteData(id);
      }
      TrashStorage.length = 0;
      TrashStorage.push(...unexpired);
      saveTrashToLocalStorage();
      noteCounter();
    }
  } catch (err) {
    console.error("Error cleaning up expired trash:", err.message);
  }
}

function applyStoredTheme() {
  try {
    const savedTheme = localStorage.getItem("noteflow_theme");
    if (savedTheme === "light") {
      body.classList.remove("dark-theme");
    } else {
      body.classList.add("dark-theme");
    }
    const isDark = body.classList.contains("dark-theme");
    if (changeTheme) {
      changeTheme.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
      changeTheme.setAttribute(
        "title",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  } catch (err) {
    console.warn("Theme retrieval failed:", err.message);
  }
}
applyStoredTheme();

function renderTags() {
  try {
    if (!tagsContainer || !tagInput) return;
    const existingPills = tagsContainer.querySelectorAll(".tag-pill");
    existingPills.forEach((p) => p.remove());

    currentTags.forEach((tag, index) => {
      const pill = document.createElement("span");
      pill.className = "tag-pill";
      pill.textContent = `#${tag}`;

      if (currentView !== "trash") {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "tag-remove-btn";
        removeBtn.setAttribute("aria-label", `Remove tag ${tag}`);
        removeBtn.innerHTML = "&times;";

        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeTag(index);
        });

        pill.appendChild(removeBtn);
      }

      tagsContainer.insertBefore(pill, tagInput);
    });
  } catch (err) {
    console.error("Error rendering tags:", err.message);
  }
}

function addTag(rawTag) {
  try {
    if (currentView === "trash") return;
    if (!rawTag) return;
    const clean = String(rawTag).trim().toLowerCase().replace(/^#+/, "").replace(/,+$/, "").trim();
    if (!clean) return;
    if (currentTags.includes(clean)) return;

    currentTags.push(clean);
    renderTags();

    if (cardID !== null) {
      const currentNote = NoteStorage.find(
        (num) => String(num.id) === String(cardID)
      );
      if (currentNote) {
        currentNote.tags = [...currentTags];
        updateCardTagsDisplay(cardID, currentTags);
        saveToLocalStorage();
        updateTagData(cardID, currentTags);
      }
    }
  } catch (err) {
    console.error("Error adding tag:", err.message);
  }
}

function removeTag(index) {
  try {
    if (currentView === "trash") return;
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    renderTags();

    if (cardID !== null) {
      const currentNote = NoteStorage.find(
        (num) => String(num.id) === String(cardID)
      );
      if (currentNote) {
        currentNote.tags = [...currentTags];
        updateCardTagsDisplay(cardID, currentTags);
        saveToLocalStorage();
        updateTagData(cardID, currentTags);
      }
    }
  } catch (err) {
    console.error("Error removing tag:", err.message);
  }
}

function updateCardTagsDisplay(id, tags) {
  try {
    const card = document.getElementById(String(id));
    if (!card) return;
    const noteMeta = card.querySelector(".note-meta");
    if (!noteMeta) return;

    let tagsSpan = noteMeta.querySelector(".note-tags");
    if (Array.isArray(tags) && tags.length > 0) {
      if (!tagsSpan) {
        tagsSpan = document.createElement("span");
        tagsSpan.className = "note-tags";
        noteMeta.appendChild(tagsSpan);
      }
      tagsSpan.textContent = tags.map((t) => `#${t}`).join(" ");
    } else if (tagsSpan) {
      tagsSpan.remove();
    }
  } catch (err) {
    console.error("Error updating card tags display:", err.message);
  }
}

class NOTE_FACTORY {
  id;
  note;
  year;
  month;
  day;
  title;
  createdAt;
  isPinned;
  tags;

  constructor(
    note = "",
    year = Year,
    month = Month,
    day = Day,
    title = "Untitled",
    id = null,
    createdAt = Date.now(),
    isPinned = false,
    tags = []
  ) {
    this.id = id !== null && id !== undefined ? String(id) : String(Date.now());
    this.note = typeof note === "string" ? note : "";
    this.day = Number(day) || Day;
    this.title = typeof title === "string" && title.trim() ? title.trim() : "Untitled";
    this.month = Number(month) || Month;
    this.year = Number(year) || Year;
    this.createdAt = Number(createdAt) || Date.now();
    this.isPinned = Boolean(isPinned);
    this.tags = Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase().replace(/^#+/, "")).filter(Boolean) : [];
  }
}

function noteCounter() {
  try {
    if (allNotesCountEl) {
      allNotesCountEl.textContent = String(NoteStorage.length);
    }
    if (trashNotesCountEl) {
      trashNotesCountEl.textContent = String(TrashStorage.length);
    }
    if (noteCount) {
      const count = currentView === "trash" ? TrashStorage.length : NoteStorage.length;
      noteCount.textContent = `${count} ${count === 1 ? "note" : "notes"}`;
    }
  } catch (err) {
    console.error("Error updating note counter:", err.message);
  }
}

async function fetchData() {
  try {
    const localTrash = loadTrashFromLocalStorage();
    TrashStorage.length = 0;
    if (Array.isArray(localTrash)) {
      TrashStorage.push(...localTrash);
    }
    cleanupExpiredTrash();

    const response = await fetch("http://localhost:3000/notes/");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid notes data format from server");
    }
    initialDataVis(data);
    saveToLocalStorage();
  } catch (err) {
    console.warn("Server unavailable or returned error. Falling back to local storage:", err.message);
    const localData = loadFromLocalStorage();
    if (Array.isArray(localData) && localData.length > 0) {
      initialDataVis(localData);
    } else {
      const defaultNote = new NOTE_FACTORY(
        "Welcome to NoteFlow!\n\nClick any note to immediately edit it. Add tags at the bottom to organize your notes. Use the pin icon to keep important notes anchored at the top.",
        Year,
        Month,
        Day,
        "Welcome to NoteFlow 📌",
        "1",
        Date.now(),
        true,
        ["getting-started", "features"]
      );
      initialDataVis([defaultNote]);
      saveToLocalStorage();
    }
  }
}

fetchData();

async function getQuotes() {
  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");
    if (quoteText && data && data.quote) {
      quoteText.textContent = `"${data.quote}"`;
    }
    if (quoteAuthor && data && data.author) {
      quoteAuthor.textContent = `— ${data.author}`;
    }
  } catch (err) {
    console.warn("Quote fetch error:", err.message);
  }
}
getQuotes();

async function store() {
  try {
    if (currentView === "trash") return;
    if (!noteinput || !noteTitle) return;

    const noteContent = noteinput.value ? noteinput.value.trim() : "";
    const titleContent = noteTitle.value && noteTitle.value.trim() ? noteTitle.value.trim() : "Untitled";

    if (cardID !== null) {
      await editData(noteinput.value, titleContent, cardID, currentTags);

      const currentNote = NoteStorage.find(
        (num) => String(num.id) === String(cardID)
      );

      if (currentNote) {
        currentNote.note = noteinput.value;
        currentNote.title = titleContent;
        currentNote.tags = [...currentTags];

        const card = document.getElementById(String(cardID));
        if (card) {
          const cardTitleEl = card.querySelector(".note-content h3");
          if (cardTitleEl) {
            cardTitleEl.textContent = titleContent;
          }
          updateCardTagsDisplay(cardID, currentTags);
        }
      }

      if (saveNotes) {
        const saveSpan = saveNotes.querySelector("span");
        if (saveSpan) {
          const prevText = saveSpan.textContent;
          saveSpan.textContent = "Saved!";
          setTimeout(() => {
            saveSpan.textContent = prevText;
          }, 1200);
        }
      }

      saveToLocalStorage();
      return;
    }

    if (!noteContent && !noteTitle.value.trim()) {
      return;
    }

    const user = new NOTE_FACTORY(
      noteinput.value,
      Year,
      Month,
      Day,
      titleContent,
      null,
      Date.now(),
      Boolean(pinStatus),
      [...currentTags]
    );

    const response = await postData(user);
    const newNote = response && response.id ? response : { ...user, id: String(Date.now()) };

    NoteStorage.push(newNote);
    makeCard(newNote);
    reorderCards();
    noteCounter();

    cardID = String(newNote.id);
    const createdCard = document.getElementById(String(newNote.id));
    if (createdCard) {
      setActiveCard(createdCard);
    }
    pinStatus = newNote.isPinned;
    updateToolbarPinState();
    saveToLocalStorage();

    if (saveNotes) {
      const saveSpan = saveNotes.querySelector("span");
      if (saveSpan) {
        const prevText = saveSpan.textContent;
        saveSpan.textContent = "Saved!";
        setTimeout(() => {
          saveSpan.textContent = prevText;
        }, 1200);
      }
    }
  } catch (err) {
    console.error("Error storing note:", err.message);
  }
}

function makeCard(noteObj = NoteStorage[NoteStorage.length - 1]) {
  try {
    if (!noteObj || !notesList) return;

    const noteCard = document.createElement("article");
    const noteContent = document.createElement("div");
    const title = document.createElement("h3");
    const noteMeta = document.createElement("div");
    const dateCreated = document.createElement("span");
    dateCreated.className = "note-date";
    const emptyState = document.getElementById("empty-state");

    const currentNoteObject = noteObj;
    const formattedDate = formatDate(
      currentNoteObject.day,
      currentNoteObject.month,
      currentNoteObject.year
    );

    dateCreated.textContent = formattedDate;
    title.textContent = currentNoteObject.title || "Untitled";

    if (emptyState) emptyState.remove();

    noteCard.classList.add("note-card");
    noteCard.id = String(currentNoteObject.id);

    if (currentNoteObject.isPinned) {
      noteCard.classList.add("pinned");
    }

    const pinBtn = document.createElement("button");
    pinBtn.classList.add("pin-btn");
    if (currentNoteObject.isPinned) {
      pinBtn.classList.add("pinned");
    }
    pinBtn.type = "button";
    pinBtn.setAttribute(
      "aria-label",
      currentNoteObject.isPinned ? "Unpin note" : "Pin note to top"
    );
    pinBtn.setAttribute(
      "title",
      currentNoteObject.isPinned ? "Unpin note" : "Pin note to top"
    );
    pinBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="17" x2="12" y2="22"></line>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
      </svg>
    `;

    pinBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePinNote(currentNoteObject.id);
    });

    noteContent.classList.add("note-content");
    noteMeta.classList.add("note-meta");

    noteCard.appendChild(pinBtn);
    noteCard.appendChild(noteContent);
    noteContent.appendChild(title);
    noteCard.appendChild(noteMeta);
    noteMeta.appendChild(dateCreated);

    if (Array.isArray(currentNoteObject.tags) && currentNoteObject.tags.length > 0) {
      const noteTagsSpan = document.createElement("span");
      noteTagsSpan.className = "note-tags";
      noteTagsSpan.textContent = currentNoteObject.tags.map((t) => `#${t}`).join(" ");
      noteMeta.appendChild(noteTagsSpan);
    }

    notesList.appendChild(noteCard);

    noteCard.addEventListener("click", () => {
      try {
        cardID = noteCard.id;

        const currentNote = NoteStorage.find(
          (num) => String(num.id) === String(cardID)
        );

        if (!currentNote || !noteinput || !noteTitle) return;

        noteinput.disabled = false;
        noteTitle.disabled = false;

        noteTitle.value = currentNote.title || "";
        noteinput.value = currentNote.note || "";

        currentTags = Array.isArray(currentNote.tags) ? [...currentNote.tags] : [];
        renderTags();

        characterCounter();
        setActiveCard(noteCard);
        updateToolbarPinState();

        if (trashNoticeBanner) trashNoticeBanner.style.display = "none";

        if (createdDateEl) {
          createdDateEl.textContent = formattedDate;
        }
      } catch (err) {
        console.error("Error activating note card:", err.message);
      }
    });
  } catch (err) {
    console.error("Error creating note card:", err.message);
  }
}

function makeTrashCard(trashObj) {
  try {
    if (!trashObj || !notesList) return;

    const noteCard = document.createElement("article");
    const noteContent = document.createElement("div");
    const title = document.createElement("h3");
    const noteMeta = document.createElement("div");
    const dateCreated = document.createElement("span");
    dateCreated.className = "note-date";
    const emptyState = document.getElementById("empty-state");

    const formattedDate = formatDate(trashObj.day, trashObj.month, trashObj.year);

    dateCreated.textContent = formattedDate;
    title.textContent = trashObj.title || "Untitled";

    if (emptyState) emptyState.remove();

    noteCard.classList.add("note-card");
    noteCard.id = String(trashObj.id);

    noteContent.classList.add("note-content");
    noteMeta.classList.add("note-meta");

    noteCard.appendChild(noteContent);
    noteContent.appendChild(title);
    noteCard.appendChild(noteMeta);
    noteMeta.appendChild(dateCreated);

    const expiryBadge = document.createElement("span");
    expiryBadge.className = "trash-expiry";
    expiryBadge.textContent = getDaysRemainingInTrash(trashObj.deletedAt);
    noteMeta.appendChild(expiryBadge);

    if (Array.isArray(trashObj.tags) && trashObj.tags.length > 0) {
      const noteTagsSpan = document.createElement("span");
      noteTagsSpan.className = "note-tags";
      noteTagsSpan.textContent = trashObj.tags.map((t) => `#${t}`).join(" ");
      noteMeta.appendChild(noteTagsSpan);
    }

    notesList.appendChild(noteCard);

    noteCard.addEventListener("click", () => {
      try {
        cardID = trashObj.id;

        if (noteinput) {
          noteinput.value = trashObj.note || "";
          noteinput.disabled = true;
        }
        if (noteTitle) {
          noteTitle.value = trashObj.title || "";
          noteTitle.disabled = true;
        }

        currentTags = Array.isArray(trashObj.tags) ? [...trashObj.tags] : [];
        renderTags();

        characterCounter();
        setActiveCard(noteCard);

        if (trashNoticeBanner) {
          trashNoticeBanner.style.display = "flex";
          const descSpan = document.getElementById("trash-notice-desc");
          if (descSpan) {
            descSpan.textContent = `This note is in the Trash (${getDaysRemainingInTrash(trashObj.deletedAt)}).`;
          }
        }

        if (createdDateEl) {
          createdDateEl.textContent = formattedDate;
        }
      } catch (err) {
        console.error("Error activating trash note card:", err.message);
      }
    });
  } catch (err) {
    console.error("Error creating trash card:", err.message);
  }
}

async function togglePinNote(id) {
  try {
    if (currentView === "trash") return;
    if (id === null || id === undefined) return;

    const currentNote = NoteStorage.find(
      (num) => String(num.id) === String(id)
    );
    if (!currentNote) return;

    currentNote.isPinned = !currentNote.isPinned;

    if (String(cardID) === String(id)) {
      pinStatus = currentNote.isPinned;
    }

    const card = document.getElementById(String(id));
    if (card) {
      card.classList.toggle("pinned", currentNote.isPinned);
      const pinBtn = card.querySelector(".pin-btn");
      if (pinBtn) {
        pinBtn.classList.toggle("pinned", currentNote.isPinned);
        pinBtn.setAttribute(
          "aria-label",
          currentNote.isPinned ? "Unpin note" : "Pin note to top"
        );
        pinBtn.setAttribute(
          "title",
          currentNote.isPinned ? "Unpin note" : "Pin note to top"
        );
      }
    }

    updateToolbarPinState();
    reorderCards();
    saveToLocalStorage();
    await updatePinData(id, currentNote.isPinned);
  } catch (err) {
    console.error("Error toggling pin note:", err.message);
  }
}

function reorderCards() {
  try {
    if (!notesList) return;
    const cards = [...document.querySelectorAll(".note-card")];
    if (cards.length === 0) return;

    const sortMode = sortSelect ? sortSelect.value : "created-newest";

    cards.sort((a, b) => {
      const noteA = NoteStorage.find((n) => String(n.id) === String(a.id));
      const noteB = NoteStorage.find((n) => String(n.id) === String(b.id));

      if (!noteA && !noteB) return 0;
      if (!noteA) return 1;
      if (!noteB) return -1;

      const aPinned = Boolean(noteA.isPinned);
      const bPinned = Boolean(noteB.isPinned);

      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }

      const timeA = Number(noteA.createdAt) || 0;
      const timeB = Number(noteB.createdAt) || 0;

      if (sortMode === "created-oldest") {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });

    cards.forEach((card) => {
      notesList.appendChild(card);
    });
  } catch (err) {
    console.error("Error reordering cards:", err.message);
  }
}

function updateToolbarPinState() {
  try {
    if (!pinNoteBtn) return;

    if (currentView === "trash" || cardID === null) {
      pinNoteBtn.classList.toggle("pinned", Boolean(pinStatus));
      pinNoteBtn.classList.toggle("active", Boolean(pinStatus));
      pinNoteBtn.setAttribute(
        "title",
        pinStatus ? "Unpin note" : "Pin note to top"
      );
      pinNoteBtn.setAttribute(
        "aria-label",
        pinStatus ? "Unpin note" : "Pin note to top"
      );
      return;
    }

    const currentNote = NoteStorage.find(
      (num) => String(num.id) === String(cardID)
    );

    const isPinned = currentNote ? Boolean(currentNote.isPinned) : false;
    pinNoteBtn.classList.toggle("pinned", isPinned);
    pinNoteBtn.classList.toggle("active", isPinned);
    pinNoteBtn.setAttribute("title", isPinned ? "Unpin note" : "Pin note to top");
    pinNoteBtn.setAttribute("aria-label", isPinned ? "Unpin note" : "Pin note to top");
  } catch (err) {
    console.error("Error updating toolbar pin state:", err.message);
  }
}

function newTheme() {
  try {
    if (!body || !changeTheme) return;
    body.classList.toggle("dark-theme");
    const isDark = body.classList.contains("dark-theme");
    changeTheme.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
    changeTheme.setAttribute(
      "title",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
    localStorage.setItem("noteflow_theme", isDark ? "dark" : "light");
  } catch (err) {
    console.error("Error toggling theme:", err.message);
  }
}

function characterCounter() {
  try {
    const textLen = noteinput && noteinput.value ? noteinput.value.length : 0;
    if (CharCount) {
      CharCount.textContent = `${textLen} characters`;
    }
    if (miniCharIndicator) {
      miniCharIndicator.textContent = `${textLen} chars`;
    }
  } catch (err) {
    console.error("Error updating character counter:", err.message);
  }
}

function setActiveCard(activeElement) {
  try {
    document.querySelectorAll(".note-card.active").forEach((el) => {
      el.classList.remove("active");
    });

    if (activeElement && activeElement.classList) {
      activeElement.classList.add("active");
    }
  } catch (err) {
    console.error("Error setting active card:", err.message);
  }
}

function clearSession() {
  try {
    if (noteinput) {
      noteinput.value = "";
      noteinput.disabled = currentView === "trash";
    }
    if (noteTitle) {
      noteTitle.value = "";
      noteTitle.disabled = currentView === "trash";
    }
    if (tagInput) {
      tagInput.value = "";
    }
    currentTags = [];
    renderTags();
    if (trashNoticeBanner) trashNoticeBanner.style.display = "none";
    if (createdDateEl) createdDateEl.textContent = "—";
    if (editedDateEl) editedDateEl.textContent = "—";
    characterCounter();
  } catch (err) {
    console.error("Error clearing session:", err.message);
  }
}

function removeCardHighlight() {
  try {
    if (cardID === null) return;
    const card = document.getElementById(String(cardID));
    if (card) card.classList.remove("active");
  } catch (err) {
    console.error("Error removing card highlight:", err.message);
  }
}

async function deleteNote() {
  try {
    if (currentView === "trash") return;

    if (cardID === null) {
      const hasDraft = (noteinput && noteinput.value.trim()) || (noteTitle && noteTitle.value.trim()) || currentTags.length > 0;
      if (hasDraft) {
        clearSession();
      }
      return;
    }

    const idToDelete = cardID;
    const currentNoteIndex = NoteStorage.findIndex(
      (num) => String(num.id) === String(idToDelete)
    );

    if (currentNoteIndex !== -1) {
      const deletedNote = NoteStorage.splice(currentNoteIndex, 1)[0];
      deletedNote.deletedAt = Date.now();
      TrashStorage.unshift(deletedNote);
      saveTrashToLocalStorage();
    }

    await deleteData(idToDelete);

    const el = document.getElementById(String(idToDelete));
    if (el) el.remove();

    clearSession();
    cardID = null;
    pinStatus = null;
    setActiveCard(null);
    updateToolbarPinState();
    noteCounter();
    saveToLocalStorage();

    if (NoteStorage.length === 0 && notesList) {
      renderEmptyState("No notes yet", "Click the compose button to create your first note.");
    }
  } catch (err) {
    console.error("Error deleting note:", err.message);
  }
}

function renderEmptyState(heading, message) {
  try {
    if (!notesList) return;
    const existing = document.getElementById("empty-state");
    if (existing) existing.remove();

    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.id = "empty-state";
    empty.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      <h3>${heading}</h3>
      <p>${message}</p>
    `;
    notesList.appendChild(empty);
  } catch (err) {
    console.error("Error rendering empty state:", err.message);
  }
}

function addNewNote() {
  try {
    if (currentView === "trash") {
      switchView("notes");
    }

    setActiveCard(null);
    cardID = null;
    pinStatus = null;

    clearSession();
    if (noteinput) noteinput.disabled = false;
    if (noteTitle) noteTitle.disabled = false;

    updateToolbarPinState();
    if (noteTitle) noteTitle.focus();
  } catch (err) {
    console.error("Error creating new note:", err.message);
  }
}

function searchNotes() {
  try {
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    const cleanTagQuery = query.replace(/^#+/, "");
    let matchCount = 0;

    const source = currentView === "trash" ? TrashStorage : NoteStorage;
    const cards = document.querySelectorAll(".note-card");

    cards.forEach((element) => {
      const note = source.find((n) => String(n.id) === String(element.id));
      if (!note) return;

      const titleMatch = (note.title || "").toLowerCase().includes(query);
      const contentMatch = (note.note || "").toLowerCase().includes(query);
      const tagMatch = Array.isArray(note.tags) && note.tags.some((tag) =>
        tag.toLowerCase().includes(cleanTagQuery)
      );

      if (!query || titleMatch || contentMatch || tagMatch) {
        element.style.display = "";
        matchCount++;
      } else {
        element.style.display = "none";
      }
    });

    const searchEmpty = document.getElementById("search-empty-state");
    if (query && matchCount === 0 && source.length > 0) {
      if (!searchEmpty && notesList) {
        const msg = document.createElement("div");
        msg.id = "search-empty-state";
        msg.style.padding = "32px 16px";
        msg.style.textAlign = "center";
        msg.style.color = "var(--text-muted)";
        msg.style.fontSize = "13px";
        msg.textContent = `No notes found matching "${query}"`;
        notesList.appendChild(msg);
      }
    } else if (searchEmpty) {
      searchEmpty.remove();
    }

    if (noteCount) {
      if (query) {
        noteCount.textContent = `${matchCount} found`;
      } else {
        noteCounter();
      }
    }
  } catch (err) {
    console.error("Error searching notes:", err.message);
  }
}

function renderNotesList() {
  try {
    if (!notesList) return;
    notesList.querySelectorAll(".note-card, .empty-state, #search-empty-state").forEach((c) => c.remove());

    if (NoteStorage.length === 0) {
      renderEmptyState("No notes yet", "Click the compose button to create your first note.");
    } else {
      for (const item of NoteStorage) {
        makeCard(item);
      }
      reorderCards();
      const first = notesList.querySelector(".note-card");
      if (first) first.click();
    }
  } catch (err) {
    console.error("Error rendering notes list:", err.message);
  }
}

function renderTrashList() {
  try {
    if (!notesList) return;
    notesList.querySelectorAll(".note-card, .empty-state, #search-empty-state").forEach((c) => c.remove());

    if (TrashStorage.length === 0) {
      renderEmptyState("Trash is empty", "Deleted notes will appear here.");
    } else {
      for (const item of TrashStorage) {
        makeTrashCard(item);
      }
      const first = notesList.querySelector(".note-card");
      if (first) first.click();
    }
  } catch (err) {
    console.error("Error rendering trash list:", err.message);
  }
}

function switchView(view) {
  try {
    currentView = view;
    cardID = null;
    clearSession();
    setActiveCard(null);

    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    if (searchInput) searchInput.value = "";

    if (currentView === "trash") {
      if (viewTrashBtn) viewTrashBtn.classList.add("active");
      if (viewAllNotesBtn) viewAllNotesBtn.classList.remove("active");
      if (sidebarViewTitle) sidebarViewTitle.textContent = "Trash";
      if (newNoteBtn) newNoteBtn.style.display = "none";
      if (emptyTrashBtn) emptyTrashBtn.style.display = "flex";
      if (saveNotes) saveNotes.style.display = "none";
      if (deleteNoteBtn) deleteNoteBtn.style.display = "none";
      if (pinNoteBtn) pinNoteBtn.style.display = "none";

      cleanupExpiredTrash();
      renderTrashList();
    } else {
      if (viewAllNotesBtn) viewAllNotesBtn.classList.add("active");
      if (viewTrashBtn) viewTrashBtn.classList.remove("active");
      if (sidebarViewTitle) sidebarViewTitle.textContent = "All Notes";
      if (newNoteBtn) newNoteBtn.style.display = "flex";
      if (emptyTrashBtn) emptyTrashBtn.style.display = "none";
      if (saveNotes) saveNotes.style.display = "inline-flex";
      if (deleteNoteBtn) deleteNoteBtn.style.display = "inline-flex";
      if (pinNoteBtn) pinNoteBtn.style.display = "inline-flex";

      renderNotesList();
    }

    noteCounter();
  } catch (err) {
    console.error("Error switching view:", err.message);
  }
}

async function restoreActiveTrashNote() {
  try {
    if (cardID === null) return;
    const index = TrashStorage.findIndex((num) => String(num.id) === String(cardID));
    if (index === -1) return;

    const restoredNote = TrashStorage.splice(index, 1)[0];
    delete restoredNote.deletedAt;

    NoteStorage.push(restoredNote);
    saveTrashToLocalStorage();
    saveToLocalStorage();
    await postData(restoredNote);

    cardID = null;
    clearSession();
    renderTrashList();
    noteCounter();
  } catch (err) {
    console.error("Error restoring trash note:", err.message);
  }
}

async function deletePermanentActiveTrashNote() {
  try {
    if (cardID === null) return;
    if (!confirm("Permanently delete this note? This action cannot be undone.")) return;

    const index = TrashStorage.findIndex((num) => String(num.id) === String(cardID));
    if (index === -1) return;

    TrashStorage.splice(index, 1);
    saveTrashToLocalStorage();
    await deleteData(cardID);

    cardID = null;
    clearSession();
    renderTrashList();
    noteCounter();
  } catch (err) {
    console.error("Error permanently deleting trash note:", err.message);
  }
}

async function emptyTrash() {
  try {
    if (TrashStorage.length === 0) return;
    if (!confirm("Are you sure you want to permanently delete all notes in the Trash?")) return;

    for (const item of TrashStorage) {
      await deleteData(item.id);
    }

    TrashStorage.length = 0;
    saveTrashToLocalStorage();

    cardID = null;
    clearSession();
    renderTrashList();
    noteCounter();
  } catch (err) {
    console.error("Error emptying trash:", err.message);
  }
}

function initialDataVis(data) {
  try {
    if (!Array.isArray(data)) return;
    const tempStore = [];

    for (const item of data) {
      if (!item) continue;
      const user = new NOTE_FACTORY(
        item.note,
        item.year,
        item.month,
        item.day,
        item.title,
        item.id,
        item.createdAt || Date.now(),
        Boolean(item.isPinned ?? item.pinned ?? false),
        Array.isArray(item.tags) ? item.tags : []
      );

      tempStore.push(user);
    }

    initialState(tempStore);
  } catch (err) {
    console.error("Error visualizing initial data:", err.message);
  }
}

function initialState(tempStore) {
  try {
    if (!notesList) return;
    notesList.querySelectorAll(".note-card").forEach((c) => c.remove());
    NoteStorage.length = 0;

    if (Array.isArray(tempStore)) {
      for (const item of tempStore) {
        NoteStorage.push(item);
        makeCard(item);
      }
    }

    reorderCards();
    noteCounter();

    const firstCard = notesList.querySelector(".note-card");
    if (firstCard) {
      firstCard.click();
    }
  } catch (err) {
    console.error("Error initializing state:", err.message);
  }
}

async function editData(note, title, cardID, tags = []) {
  try {
    const response = await fetch(`http://localhost:3000/notes/${cardID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note,
        title,
        tags,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.warn("Server unavailable for edit:", err.message);
  }
}

async function updateTagData(cardID, tags) {
  try {
    const response = await fetch(`http://localhost:3000/notes/${cardID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.warn("Server unavailable for tag update:", err.message);
  }
}

async function updatePinData(cardID, isPinned) {
  try {
    const response = await fetch(`http://localhost:3000/notes/${cardID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPinned,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.warn("Server unavailable for pin update:", err.message);
  }
}

async function postData(user) {
  try {
    const response = await fetch("http://localhost:3000/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn("Server unavailable for post:", err.message);
    return { ...user, id: user.id || String(Date.now()) };
  }
}

async function deleteData(cardID) {
  try {
    const response = await fetch(`http://localhost:3000/notes/${cardID}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.warn("Server unavailable for delete:", err.message);
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem("noteflow_notes", JSON.stringify(NoteStorage));
  } catch (err) {
    console.warn("Local storage write failed:", err.message);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem("noteflow_notes");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Local storage read failed:", err.message);
  }
  return null;
}

function saveTrashToLocalStorage() {
  try {
    localStorage.setItem("noteflow_trash", JSON.stringify(TrashStorage));
  } catch (err) {
    console.warn("Trash storage write failed:", err.message);
  }
}

function loadTrashFromLocalStorage() {
  try {
    const saved = localStorage.getItem("noteflow_trash");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Trash storage read failed:", err.message);
  }
  return [];
}

if (changeTheme) changeTheme.addEventListener("click", newTheme);
if (saveNotes) saveNotes.addEventListener("click", store);
if (noteinput) noteinput.addEventListener("input", characterCounter);
if (deleteNoteBtn) deleteNoteBtn.addEventListener("click", deleteNote);
if (newNoteBtn) newNoteBtn.addEventListener("click", addNewNote);
if (searchInput) searchInput.addEventListener("input", searchNotes);
if (sortSelect) sortSelect.addEventListener("change", reorderCards);

if (viewAllNotesBtn) viewAllNotesBtn.addEventListener("click", () => switchView("notes"));
if (viewTrashBtn) viewTrashBtn.addEventListener("click", () => switchView("trash"));
if (emptyTrashBtn) emptyTrashBtn.addEventListener("click", emptyTrash);
if (restoreNoteBtn) restoreNoteBtn.addEventListener("click", restoreActiveTrashNote);
if (deletePermanentBtn) deletePermanentBtn.addEventListener("click", deletePermanentActiveTrashNote);

if (pinNoteBtn) {
  pinNoteBtn.addEventListener("click", () => {
    try {
      if (cardID !== null) {
        togglePinNote(cardID);
      } else {
        pinStatus = !pinStatus;
        updateToolbarPinState();
      }
    } catch (err) {
      console.error("Error handling pin toolbar button click:", err.message);
    }
  });
}

if (tagInput) {
  tagInput.addEventListener("keydown", (e) => {
    try {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(tagInput.value);
        tagInput.value = "";
      } else if (e.key === "Backspace" && tagInput.value === "" && currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    } catch (err) {
      console.error("Error handling tag input keydown:", err.message);
    }
  });

  tagInput.addEventListener("blur", () => {
    try {
      if (tagInput.value.trim()) {
        addTag(tagInput.value);
        tagInput.value = "";
      }
    } catch (err) {
      console.error("Error handling tag input blur:", err.message);
    }
  });
}
