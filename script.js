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
  const dateCreated = document.createElement("span");
  const dateEdited = document.createElement("span");

  const noteactions = document.createElement("div");

  const emptyState = document.getElementById("empty-state");
  const currentNoteObject = NoteStorage.pop();
  count++;
  dateCreated.textContent = `Date created: ${currentNoteObject.date}`;
  dateEdited.textContent = `Date edited: ${currentNoteObject.date}`;
  paragraph.textContent = currentNoteObject.note;

  if (!!emptyState) emptyState.remove();

  noteCard.classList.toggle("note-card");
  noteContent.classList.toggle("note-content");
  noteMeta.classList.toggle("note-meta");

  notesList.appendChild(noteCard);
  noteCard.appendChild(noteContent);
  noteContent.appendChild(paragraph);
  noteCard.appendChild(noteMeta);
  noteMeta.appendChild(dateCreated);
  noteMeta.appendChild(dateEdited);

  noteCounter(count);
}

function noteCounter(count) {
  noteCount.textContent = `${count} notes`;
}

function newTheme() {
  body.classList.toggle("dark-theme");

  changeTheme.textContent == "☀️"
    ? (changeTheme.textContent = "🌙")
    : changeTheme.textContent == "🌙"
    ? (changeTheme.textContent = "☀️")
    : (changeTheme.textContent = "☀️");
}

let count = 0;

const today = new Date();

const noteCount = document.getElementById("notes-count");
const noteinput = document.getElementById("note-input");
const saveNotes = document.querySelector("#save-note-btn");
const changeTheme = document.getElementById("theme-toggle");
const body = document.querySelector("body");

changeTheme.addEventListener("click", newTheme);
saveNotes.addEventListener("click", store);
