# NoteFlow 📝

A focused, distraction-free note-taking web application inspired by Simplenote. Crafted with vanilla web technologies for speed, resilience, and clean organization.

---

## ✨ Key Features

- 📌 **Pin Notes to Top**: Click the pushpin icon directly on any note card or in the editor toolbar to anchor priority notes to the top of your list. Pinned notes remain elevated above all unpinned notes regardless of sort order.
- ✍️ **Distraction-Free Editor**: Seamless, borderless title and body canvas designed for effortless writing.
- 🔍 **Live Search with Dynamic Counter**: Real-time searching across note titles and content. Features a live match counter (e.g., `2 found`) and dedicated feedback when no matching notes are found.
- 🗂️ **Smart Sorting**: Instantly order notes by *Created: Newest* or *Created: Oldest*, preserving pinned items at the top.
- 🌓 **Persistent Theme Modes**: Refined dark theme with an appearance switcher in the settings drawer. Theme preference is automatically remembered across browser sessions via `localStorage`.
- 📊 **Real-time Character Counters**: Live character counters in both the footer and the note information popover.
- 💡 **Daily Inspirational Quotes**: Fetches daily motivational quotes from DummyJSON upon launch.
- 💾 **Dual-Layer Persistence & Offline Fallback**: Synchronizes with a REST backend (`http://localhost:3000/notes`) if available, and seamlessly saves and retrieves from `localStorage` when running standalone or offline.
- 📱 **Collapsible Workspace & Drawer**: Toggle the notes sidebar to maximize editor space, and access settings via the slide-out navigation drawer.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic, accessible markup with modern SVG icon controls.
- **Vanilla CSS3**: Design system built on CSS custom properties, theme tokens, fluid transitions, and responsive layout.
- **Vanilla JavaScript (ES6+)**: Pure, modular JavaScript featuring:
  - Object-oriented note factory model (`NOTE_FACTORY`)
  - Clean async/await data synchronization
  - Fault-tolerant error handling and null-safety
  - Zero external runtime libraries or frameworks

---

## 📁 Project Structure

```
NoteFlow/
├── index.html       # Application layout, drawer, sidebar, and editor panes
├── script.js        # Core logic, pin management, search, storage, and event handlers
├── styles.css       # Simplenote-inspired theme tokens, layout, and animations
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

### 1. Direct Browser Launch (Standalone Mode)
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari). All features—including creating, pinning, editing, deleting, and searching notes—work out of the box with `localStorage` persistence.

### 2. Running with Local JSON Server (Optional)
If you wish to synchronize notes through a local REST API:

1. Install and launch `json-server`:
   ```bash
   npx json-server --watch db.json --port 3000
   ```
2. Open `index.html` in your browser. NoteFlow will automatically synchronize with your local REST server and continue to mirror to `localStorage` for offline protection.

---

## 📖 How to Use

| Action | How to Perform |
|---|---|
| **Create Note** | Click the **Compose (Pencil)** icon in the sidebar header. Type your title and body, then click **Save**. |
| **Pin / Unpin Note** | Hover over any note card and click the pushpin icon, or click the pushpin button in the editor toolbar while a note is active. |
| **Edit Note** | Simply click any note in the sidebar. It immediately opens in editable mode—make your changes and click **Save** to update in-place. |
| **Delete Note** | Select a note and click the **Trash** button in the toolbar. The editor automatically clears and unlocks for immediate writing. |
| **Search Notes** | Type in the search input above the notes list. The counter updates to show matching notes. |
| **Sort Notes** | Open the menu drawer (hamburger icon) and select *Created: Newest* or *Created: Oldest*. |
| **Toggle Theme** | Open the menu drawer and click the theme toggle button. Your mode is saved automatically. |
| **View Note Details** | Click the **(i)** icon in the top toolbar to view character length, creation timestamp, and details. |
| **Toggle Sidebar** | Click the sidebar toggle icon on the left of the editor toolbar to collapse or expand the notes pane. |
