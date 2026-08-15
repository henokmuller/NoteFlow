class NOTE_FACTORY {
  note;
  date;
  constructor(note = "12 days ago", date) {
    this.note = note;
    this.date = date;
  }
}

function store() {
  const today = new Date();
  const user = new NOTE_FACTORY(noteinput.value, today.getFullYear);
  console.log(user.date);
}

function updatenote() {
  console.log(noteinput.value);
}

const noteinput = document.getElementById("note-input");

const saveNotes = document.querySelector("#save-note-btn");

document.addEventListener("click", store(saveNotes));
document.addEventListener("focusout", updatenote(noteinput));
