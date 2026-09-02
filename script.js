class NOTE_FACTORY {
  id;
  note;
  year;
  month;
  day;
  title;
  createdAt;

  constructor(
    note,
    year,
    month,
    day,
    title = "Untitled",
    id = null,
    createdAt = Date.now()
  ) {
    this.id = id;
    this.note = note;
    this.day = day;
    this.title = title;
    this.month = month;
    this.year = year;
    this.createdAt = createdAt;
  }
}

async function fetchData() {
  const response = await fetch("http://localhost:3000/notes/");
  const data = await response.json();
  initialDataVis(data);
}

fetchData();

async function store() {
  if (editStatus === 1) {
    await editData(noteinput.value, noteTitle.value || "Untitled", cardID);

    const currentNote = NoteStorage.find(
      (num) => String(num.id) === String(cardID)
    );

    currentNote.note = noteinput.value;
    currentNote.title = noteTitle.value || "Untitled";

    document.querySelector(
      `#${CSS.escape(cardID)} .note-content h3`
    ).textContent = noteTitle.value || "Untitled";

    noteinput.disabled = false;
    noteTitle.disabled = false;

    clearSession();
    removeCardHighlight();
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

  const response = await postData(user);

  NoteStorage.push(response);
  makeCard();
  clearSession();
  removeCardHighlight();
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

  if (emptyState) emptyState.remove();

  noteCard.classList.add("note-card");
  noteContent.classList.add("note-content");
  noteMeta.classList.add("note-meta");

  notesList.appendChild(noteCard);
  noteCard.appendChild(noteContent);
  noteContent.appendChild(title);
  noteCard.appendChild(noteMeta);
  noteMeta.appendChild(dateCreated);

  noteCard.id = `${NoteStorage[NoteStorage.length - 1].id}`;

  noteCard.addEventListener("click", () => {
    cardID = noteCard.id;

    const currentNote = NoteStorage.find(
      (num) => String(num.id) === String(cardID)
    );

    noteinput.disabled = true;
    noteTitle.disabled = true;

    noteTitle.value = currentNote.title;
    noteinput.value = currentNote.note;

    characterCounter();
    setActiveCard(noteCard);
  });
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

function setActiveCard(activeElement) {
  document.querySelectorAll(".note-card.active").forEach((el) => {
    el.classList.remove("active");
  });

  if (activeElement) activeElement.classList.add("active");
}

function clearSession() {
  noteinput.value = "";
  noteTitle.value = "";
  characterCounter();
}

async function deleteNote() {
  if (cardID === null) return;

  await deleteData(cardID);

  document.getElementById(`${cardID}`).remove();
  clearSession();

  const currentNote = NoteStorage.find(
    (num) => String(num.id) === String(cardID)
  );

  NoteStorage.splice(NoteStorage.indexOf(currentNote), 1);

  cardID = null;
  setActiveCard(null);
  noteCounter();
}

function addNewNote() {
  editStatus = null;
  setActiveCard(null);
  cardID = null;

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

async function editData(note, title, cardID) {
  await fetch(`http://localhost:3000/notes/${cardID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      note,
      title,
    }),
  });
}

function searchNotes() {
  document.querySelectorAll(".note-card").forEach((element) => {
    if (
      element.textContent
        .toLowerCase()
        .includes(searchInput.value.toLowerCase())
    ) {
      element.style.display = "";
    } else {
      element.style.display = "none";
    }
  });
}

function initialDataVis(data) {
  const tempStore = [];

  for (const item of data) {
    const user = new NOTE_FACTORY(
      item.note,
      item.year,
      item.month,
      item.day,
      item.title,
      item.id,
      item.createdAt
    );

    tempStore.push(user);
  }

  initialState(tempStore);
}

function initialState(tempStore) {
  for (const item of tempStore) {
    NoteStorage.push(item);
    makeCard();
  }

  noteCounter();
}

function removeCardHighlight() {
  if (cardID === null) return;

  document.getElementById(`${cardID}`).classList.remove("active");
}

async function postData(user) {
  const response = await fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  return await response.json();
}

async function deleteData(cardID) {
  await fetch(`http://localhost:3000/notes/${cardID}`, {
    method: "DELETE",
  });
}

const NoteStorage = [];

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
      const A = NoteStorage.find((num) => num.id == a.id);
      const B = NoteStorage.find((num) => num.id == b.id);

      return A.createdAt - B.createdAt;
    });
  } else if (optionval.target.value == "created-newest") {
    cards.sort((a, b) => {
      const A = NoteStorage.find((num) => num.id == a.id);
      const B = NoteStorage.find((num) => num.id == b.id);

      return B.createdAt - A.createdAt;
    });
  }

  cards.forEach((card) => {
    notesList.appendChild(card);
  });
});
