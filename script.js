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
  const user = new NOTE_FACTORY(
    noteinput.value,
    Year,
    Month,
    Day,
    noteTitle.value || "Untitled"
  );
  NoteStorage.push(user);
  makeCard();
}

function makeCard() {
  const notesList = document.getElementById("notes-list");
  const noteCard = document.createElement("article");
  const noteContent = document.createElement("div");
  const title = document.createElement("h3");
  const noteMeta = document.createElement("div");
  const dateCreated = document.createElement("span");
  const dateEdited = document.createElement("span");
  const emptyState = document.getElementById("empty-state");
  const currentNoteObject = NoteStorage[NoteStorage.length - 1];
  dateCreated.textContent = `${currentNoteObject.year}-0${currentNoteObject.month}-${currentNoteObject.day}`;
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
}

function noteCounter() {
  noteCount.textContent = `${NoteStorage.length} notes`;
}

function noteSelector() {
  console.log(15);
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

function createNewNote() {
  noteinput.value = "";
  noteTitle.value = "";
}

const NoteStorage = [];
const wordCount = [];
const today = new Date();
const Year = today.getUTCFullYear();
const Month = today.getUTCMonth() + 1;
const Day = today.getUTCDate();

const noteCount = document.getElementById("notes-count");
const noteinput = document.getElementById("note-input");
const saveNotes = document.querySelector("#save-note-btn");
const changeTheme = document.getElementById("theme-toggle");
const CharCount = document.getElementById("character-count");
const noteTitle = document.getElementById("note-title");
const body = document.querySelector("body");
const newNoteBtn = document.getElementById("new-note-btn");

changeTheme.addEventListener("click", newTheme);
saveNotes.addEventListener("click", store);
noteinput.addEventListener("keyup", characterCounter);
newNoteBtn.addEventListener("click", createNewNote);
