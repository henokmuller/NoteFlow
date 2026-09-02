const NoteStorage = [];

const today = new Date();
const Year = today.getUTCFullYear();
const Month = today.getUTCMonth() + 1;
const Day = today.getUTCDate();

let cardID = null;
let pinStatus = null;
let currentTags = [];

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

function formatDate(day, month, year) {
  const d = String(day || 1).padStart(2, "0");
  const m = String(month || 1).padStart(2, "0");
  const y = String(year || Year);
  return `${d}-${m}-${y}`;
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
      tagsContainer.insertBefore(pill, tagInput);
    });
  } catch (err) {
    console.error("Error rendering tags:", err.message);
  }
}

function addTag(rawTag) {
  try {
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

async function fetchData() {
  try {
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

async function togglePinNote(id) {
  try {
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

    if (cardID === null) {
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

function noteCounter() {
  try {
    if (noteCount) {
      noteCount.textContent = `${NoteStorage.length} ${NoteStorage.length === 1 ? "note" : "notes"}`;
    }
  } catch (err) {
    console.error("Error updating note counter:", err.message);
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
      noteinput.disabled = false;
    }
    if (noteTitle) {
      noteTitle.value = "";
      noteTitle.disabled = false;
    }
    if (tagInput) {
      tagInput.value = "";
    }
    currentTags = [];
    renderTags();
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
    if (cardID === null) {
      const hasDraft = (noteinput && noteinput.value.trim()) || (noteTitle && noteTitle.value.trim()) || currentTags.length > 0;
      if (hasDraft) {
        if (!confirm("Discard this draft?")) return;
        clearSession();
      }
      return;
    }

    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    const idToDelete = cardID;
    await deleteData(idToDelete);

    const currentNoteIndex = NoteStorage.findIndex(
      (num) => String(num.id) === String(idToDelete)
    );

    if (currentNoteIndex !== -1) {
      NoteStorage.splice(currentNoteIndex, 1);
    }

    const el = document.getElementById(String(idToDelete));
    if (el) el.remove();

    clearSession();
    if (noteinput) noteinput.disabled = false;
    if (noteTitle) noteTitle.disabled = false;
    cardID = null;
    pinStatus = null;
    setActiveCard(null);
    updateToolbarPinState();
    noteCounter();
    saveToLocalStorage();

    if (NoteStorage.length === 0 && notesList) {
      if (!document.getElementById("empty-state")) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.id = "empty-state";
        empty.innerHTML = `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <h3>No notes yet</h3>
          <p>Click the compose button to create your first note.</p>
        `;
        notesList.appendChild(empty);
      }
    }
  } catch (err) {
    console.error("Error deleting note:", err.message);
  }
}

function addNewNote() {
  try {
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

    const cards = document.querySelectorAll(".note-card");
    cards.forEach((element) => {
      const note = NoteStorage.find((n) => String(n.id) === String(element.id));
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
    if (query && matchCount === 0 && NoteStorage.length > 0) {
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

if (changeTheme) changeTheme.addEventListener("click", newTheme);
if (saveNotes) saveNotes.addEventListener("click", store);
if (noteinput) noteinput.addEventListener("input", characterCounter);
if (deleteNoteBtn) deleteNoteBtn.addEventListener("click", deleteNote);
if (newNoteBtn) newNoteBtn.addEventListener("click", addNewNote);
if (searchInput) searchInput.addEventListener("input", searchNotes);
if (sortSelect) sortSelect.addEventListener("change", reorderCards);

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
