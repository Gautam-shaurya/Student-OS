# 🎓 StudentOS

A clean, modern student productivity dashboard built with **HTML, CSS and vanilla JavaScript**. No frameworks, no backend, no install. Everything you create is saved in your browser with LocalStorage.

Live site: https://mystudentos.netlify.app

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

| Section | What you can do |
|---|---|
| **Dashboard** | Time-based greeting, current date, tasks due today, daily goals, upcoming assignments, quick-link cards, study progress bar |
| **My Tasks** | Add, edit, delete and complete tasks. Set priority (Low / Medium / High) and due date. Filter by All, Pending or Completed |
| **Study Planner** | Plan sessions with subject, topic, date and duration. Edit, delete and mark as done |
| **My Notes** | Create, edit and delete notes with a title and description. Live search |
| **Focus Timer** | 25-minute Pomodoro and 5-minute break with Start, Pause and Reset. Finished focus rounds are counted |
| **My Progress** | Completed vs pending tasks, sessions completed, focus rounds, donut chart and progress bars |

Also included:
- Input validation with friendly success and error messages
- Data stays after refreshing the page
- Responsive layout for desktop, tablet and mobile
- Single-page navigation: the sidebar switches sections without reloading

## 🚀 Getting Started

No build step is needed.

**Option 1: Run locally**
1. Clone or download this repository:
   ```bash
   git clone https://github.com/<your-username>/StudentOS.git
   ```
2. Open the `StudentOS` folder.
3. Double-click `index.html` to open it in your browser (Chrome, Edge or Firefox).

**Option 2: Host on GitHub Pages**
1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Source**, choose the `main` branch and the `/ (root)` folder, then save.
4. Your site will be live at `https://<your-username>.github.io/StudentOS/`.

## 📁 Project Structure

```
StudentOS/
├── index.html   # Page structure: sidebar and all six sections
├── style.css    # Colors, layout, cards, animations, responsive rules
├── script.js    # Navigation, CRUD, LocalStorage, timer, progress charts
└── README.md    # Project documentation
```

## 💾 How Data Is Stored

StudentOS saves data in your browser's LocalStorage under these keys:

| Key | Contents |
|---|---|
| `sos_tasks` | Your tasks |
| `sos_sessions` | Your study sessions |
| `sos_notes` | Your notes |
| `sos_goals` | Your daily goals |
| `sos_focus` | Number of completed focus rounds |

Data is stored per browser and per device. Clearing your browser's site data removes it.

## 🛠️ Built With

- HTML5
- CSS3 (custom properties, Grid, Flexbox, media queries)
- Vanilla JavaScript (ES6)
- Browser LocalStorage

## 🤝 Contributing

Suggestions and improvements are welcome:
1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

This project is released under the [MIT License](LICENSE).

---

Made with ❤️ by Shaurya
