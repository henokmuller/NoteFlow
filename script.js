class NOTE_FACTORY {
  note;
  date;
  constructor(note, date) {
    this.note = note;
    this.date = date;
  }
}

const NoteStorage = [];

function store() {
  const user = new NOTE_FACTORY(noteinput.value, today);
  NoteStorage.push(user);
  makeCard();
}

function makeCard() {
  const notesList = document.getElementById("notes-list");
  const noteCard = document.createElement("article");
  const noteContent = document.createElement("div");
  const paragraph = document.createElement("p");
  const noteMeta = document.createElement("div");
  const noteactions = document.createElement("div");

  const emptyState = document.getElementById("empty-state");
  paragraph.textContent = NoteStorage.pop().note;

  if (!!emptyState) emptyState.remove();

  noteCard.classList.add("note-card");
  noteContent.classList.add("note-content");
  noteMeta.classList.add("note-meta");

  notesList.appendChild(noteCard);
  noteCard.appendChild(noteContent);
  noteContent.appendChild(paragraph);
}

function newTheme() {
  body.classList.toggle("dark-theme");

  changeTheme.textContent == "☀️"
    ? (changeTheme.textContent = "🌙")
    : changeTheme.textContent == "🌙"
    ? (changeTheme.textContent = "☀️")
    : (changeTheme.textContent = "☀️");
}

const today = new Date();
const noteinput = document.getElementById("note-input");
const saveNotes = document.querySelector("#save-note-btn");
const changeTheme = document.getElementById("theme-toggle");
const body = document.querySelector("body");

changeTheme.addEventListener("click", newTheme);
saveNotes.addEventListener("click", store);
