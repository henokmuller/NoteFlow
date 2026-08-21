class NOTE_FACTORY {
  note;
  year;
  month;
  day;
  title;
  constructor(note, year, month, day, title = "Untitled") {
    this.note = note;
    this.day = day;
    this.title = title;
    this.month = month;
    this.year = year;
  }
}

function store() {
  if (editStatus === 1) {
    NoteStorage[cardID].note = noteinput.value;
    NoteStorage[cardID].title = noteTitle.value || "untitled";
    document.querySelector(
      `#${CSS.escape(cardID)} .note-content h3`
    ).textContent = noteTitle.value || "Untitled";
    noteinput.disabled = false;
    noteTitle.disabled = false;
    clearSession();
    editStatus = null;
    return;
  }

  const user = new NOTE_FACTORY(
    noteinput.value,
    Year,
    Month,
    Day,
    noteTitle.value || "Untitled"
  );
  NoteStorage.push(user);
  makeCard();
  clearSession();
  enableCardSelection();
  noteCounter();
}

function makeCard() {
  const noteCard = document.createElement("article");
  const noteContent = document.createElement("div");
  const title = document.createElement("h3");
  const noteMeta = document.createElement("div");
  const dateCreated = document.createElement("span");
  const dateEdited = document.createElement("span");
  const emptyState = document.getElementById("empty-state");
  const currentNoteObject = NoteStorage[NoteStorage.length - 1];
  dateCreated.textContent = `${currentNoteObject.day}-0${currentNoteObject.month}-${currentNoteObject.year}`;
  title.textContent = currentNoteObject.title;

  if (!!emptyState) emptyState.remove();

  noteCard.classList.toggle("note-card");
  noteContent.classList.toggle("note-content");
  noteMeta.classList.toggle("note-meta");

  notesList.appendChild(noteCard);
  noteCard.appendChild(noteContent);
  noteContent.appendChild(title);
  noteCard.appendChild(noteMeta);
  noteMeta.appendChild(dateCreated);
  noteCard.id = `${NoteStorage.length - 1}`;
}

function noteCounter() {
  noteCount.textContent = `${NoteStorage.length} notes`;
}

function newTheme() {
  body.classList.toggle("dark-theme");

  changeTheme.textContent == "☀️"
    ? (changeTheme.textContent = "🌙")
    : changeTheme.textContent == "🌙"
    ? (changeTheme.textContent = "☀️")
    : (changeTheme.textContent = "☀️");
}

function characterCounter() {
  CharCount.textContent = `${noteinput.value.length} characters`;
}

function enableCardSelection() {
  const enabledCards = document.querySelectorAll(".note-card");
  enabledCards.forEach((element) => {
    element.addEventListener("click", () => {
      cardID = Number(element.id);
      noteinput.disabled = true;
      noteTitle.disabled = true;
      noteTitle.value = NoteStorage[element.id].title;
      noteinput.value = NoteStorage[element.id].note;
    });
  });
}

function clearSession() {
  noteinput.value = "";
  noteTitle.value = "";
}

function deleteNote() {
  if (cardID === null) return;
  document.getElementById(`${cardID}`).remove();
  clearSession();
  NoteStorage.splice(cardID, 1);

  document.querySelectorAll(".note-card").forEach((element, index) => {
    element.id = index;
  });

  cardID = null;
  noteCounter();
}

function addNewNote() {
  if (editStatus === 1) {
    NoteStorage[cardID].note = noteinput.value;
    NoteStorage[cardID].title = noteTitle.value || "untitled";
    document.querySelector(
      `#${CSS.escape(cardID)} .note-content h3`
    ).textContent = noteTitle.value || "Untitled";
    noteinput.disabled = false;
    noteTitle.disabled = false;
    clearSession();
    editStatus = null;
    return;
  }
  noteinput.disabled = false;
  noteTitle.disabled = false;
  clearSession();
}

function editNote() {
  if (cardID === null) return;
  if (noteinput.value === "" && noteTitle.value === "") {
    return;
  }
  editStatus = 1;
  noteinput.disabled = false;
  noteTitle.disabled = false;
}

function searchNotes() {
  document.querySelectorAll(".note-card").forEach((element) => {
    if (
      element.textContent
        .toLowerCase()
        .includes(searchInput.value.toLowerCase())
    ) {
      element.style.display = "";
    } else element.style.display = "none";
  });
}

const NoteStorage = [];
const wordCount = [];
const today = new Date();
const Year = today.getUTCFullYear();
const Month = today.getUTCMonth() + 1;
const Day = today.getUTCDate();
let cardID = null;
let editStatus = null;

const notesList = document.getElementById("notes-list");
const noteCount = document.getElementById("notes-count");
const noteinput = document.getElementById("note-input");
const saveNotes = document.querySelector("#save-note-btn");
const changeTheme = document.getElementById("theme-toggle");
const CharCount = document.getElementById("character-count");
const noteTitle = document.getElementById("note-title");
const body = document.querySelector("body");
const newNoteBtn = document.getElementById("new-note-btn");
const deleteNoteBtn = document.getElementById("delete-note-btn");
const editNoteBtn = document.getElementById("edit-note-btn");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");

changeTheme.addEventListener("click", newTheme);
saveNotes.addEventListener("click", store);
noteinput.addEventListener("keyup", characterCounter);
deleteNoteBtn.addEventListener("click", deleteNote);
newNoteBtn.addEventListener("click", addNewNote);
editNoteBtn.addEventListener("click", editNote);

searchInput.addEventListener("keyup", searchNotes);
sortSelect.addEventListener("change", (optionval) => {
  const cards = [...document.querySelectorAll(".note-card")];

  if (optionval.target.value == "created-oldest") {
    cards.sort((a, b) => {
      return Number(a.id) - Number(b.id);
    });
  } else if (optionval.target.value == "created-newest") {
    cards.sort((a, b) => {
      return Number(b.id) - Number(a.id);
    });
  }

  cards.forEach((card) => {
    notesList.appendChild(card);
  });
});
