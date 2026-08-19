class NOTE_FACTORY {
  note;
  year;
  month;
  day;
  title;
  id;
  constructor(note, year, month, day, title = "Untitled", id = 1) {
    this.note = note;
    this.day = day;
    this.title = title;
    this.month = month;
    this.year = year;
    this.id = id;
  }
}

function store() {
  cardCounter++;
  const user = new NOTE_FACTORY(
    noteinput.value,
    Year,
    Month,
    Day,
    noteTitle.value || "Untitled",
    cardCounter
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
  noteCard.id = `${cardCounter}`;
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
  const noteC = document.querySelectorAll(".note-card");
  noteC.forEach((element) => {
    element.addEventListener("click", () => {
      noteinput.disabled = true;
      noteTitle.disabled = true;
      noteTitle.value = NoteStorage[element.id - 1].title;
      noteinput.value = NoteStorage[element.id - 1].note;
      deleteNoteBtn.addEventListener("click", () => {
        const goneCard = document.getElementById(`${element.id}`);
        clearSession();
        let arr = [];
        for (let i = 0; i <= element.id - 1; i++) {
          if (NoteStorage[i].id != element.id) {
            arr.push(NoteStorage.shift());
          } else {
            delete NoteStorage[i];
            for (let j = 0; j < arr.length; j++) {
              NoteStorage.unshift(arr.reverse.shift());
            }
            goneCard.remove();
          }
        }
      });
    });
  });
}

function clearSession() {
  noteinput.value = "";
  noteTitle.value = "";
}

const NoteStorage = [];
const wordCount = [];
const today = new Date();
const Year = today.getUTCFullYear();
const Month = today.getUTCMonth() + 1;
const Day = today.getUTCDate();
let cardCounter = 0;

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

changeTheme.addEventListener("click", newTheme);
saveNotes.addEventListener("click", store);
noteinput.addEventListener("keyup", characterCounter);
