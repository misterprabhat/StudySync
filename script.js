let subjects = [
  { name: "C Programming", icon: "s-c", color: "#3f74e0" },
  { name: "Java", icon: "s-java", color: "#e0743a" },
  { name: "Python", icon: "s-py", color: "#2a9d78" },
  { name: "JavaScript", icon: "s-js", color: "#d49a14" },
  { name: "DSA", icon: "s-dsa", color: "#7c5ce0" },
  { name: "System Design", icon: "s-sd", color: "#d4528a" },
  { name: "OS", icon: "s-os", color: "#2a9fb0" },
  { name: "DBMS", icon: "s-db", color: "#7d9a2a" },
  { name: "CN", icon: "s-cn", color: "#5d7a99" },
  { name: "SQL", icon: "s-sql", color: "#d9473f" },
];

let pageTitles = {
  dashboard: "Dashboard",
  tasks: "My tasks",
  subjects: "Subjects",
};

// ---------- Tasks (loaded from LocalStorage) ----------

let tasks = JSON.parse(localStorage.getItem("studyTasks_v3")) || [
  {
    name: "Learn variables and data types",
    subject: "C Programming",
    priority: "High",
    date: "2026-10-06",
    completed: true,
  },
  {
    name: "Practice pointers and arrays",
    subject: "C Programming",
    priority: "Medium",
    date: "2026-10-12",
    completed: false,
  },
  {
    name: "Solve 5 array problems",
    subject: "DSA",
    priority: "High",
    date: "2026-10-07",
    completed: false,
  },
  {
    name: "Revise linked lists",
    subject: "DSA",
    priority: "Medium",
    date: "2026-10-14",
    completed: false,
  },
  {
    name: "Normalization (1NF to BCNF)",
    subject: "DBMS",
    priority: "High",
    date: "2026-10-11",
    completed: true,
  },
  {
    name: "ER diagram practice",
    subject: "DBMS",
    priority: "Low",
    date: "2026-10-16",
    completed: false,
  },
  {
    name: "Practice JOIN queries",
    subject: "SQL",
    priority: "Medium",
    date: "2026-10-09",
    completed: false,
  },
];

// ---------- Helper functions ----------

function saveTasks() {
  localStorage.setItem("studyTasks_v3", JSON.stringify(tasks));
}

function getSubject(name) {
  for (let i = 0; i < subjects.length; i++) {
    if (subjects[i].name === name) {
      return subjects[i];
    }
  }
  return { name: name, icon: "s-c", color: "#5d7a99" };
}

// Date object -> "YYYY-MM-DD" (local time)
function toDateString(d) {
  let month = String(d.getMonth() + 1).padStart(2, "0");
  let day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

function todayString() {
  return toDateString(new Date());
}

// "2026-10-10" -> "10 Oct"
function formatDate(dateString) {
  let d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Stops task names from breaking the page if they contain < or >
function safeText(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Total, done and percentage for one subject
function getSubjectStats(subjectName) {
  let total = 0;
  let done = 0;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].subject === subjectName) {
      total++;
      if (tasks[i].completed) {
        done++;
      }
    }
  }

  let percent = 0;
  if (total > 0) {
    percent = Math.round((done / total) * 100);
  }

  return { total: total, done: done, percent: percent };
}

// Earliest deadline among the pending tasks of a subject ("" if none)
function getNextDue(subjectName) {
  let next = "";

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].subject === subjectName && !tasks[i].completed) {
      if (next === "" || tasks[i].date < next) {
        next = tasks[i].date;
      }
    }
  }

  return next;
}

// Circular progress indicator (SVG). Circle length = 2 * 3.14 * 18 = 113.1
function ringHTML(percent) {
  let length = ((percent * 113.1) / 100).toFixed(1);
  let fill = "";

  if (percent > 0) {
    fill = `<circle class="ring-fill" cx="22" cy="22" r="18" stroke-dasharray="${length} 113.1"/>`;
  }

  return `
        <svg class="ring" viewBox="0 0 44 44">
            <circle class="ring-track" cx="22" cy="22" r="18"/>
            ${fill}
            <text x="22" y="26" text-anchor="middle">${percent}%</text>
        </svg>
    `;
}

// ---------- Top Bar Date and dropdowns ----------

function setDate() {
  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
}

function fillSubjectDropdowns() {
  let filter = document.getElementById("subjectFilter");
  let form = document.getElementById("taskSubject");

  for (let i = 0; i < subjects.length; i++) {
    filter.innerHTML += `<option value="${subjects[i].name}">${subjects[i].name}</option>`;
    form.innerHTML += `<option value="${subjects[i].name}">${subjects[i].name}</option>`;
  }
}

// ---------- Dashboard ----------

function updateDashboard() {
  let total = tasks.length;
  let completed = 0;
  let overdue = 0;
  let today = todayString();
  let nextTask = null;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].completed) {
      completed++;
    } else {
      if (tasks[i].date < today) {
        overdue++;
      }
      if (nextTask === null || tasks[i].date < nextTask.date) {
        nextTask = tasks[i];
      }
    }
  }

  let pending = total - completed;
  let progress = 0;

  if (total > 0) {
    progress = Math.round((completed / total) * 100);
  }

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;
  document.getElementById("overdueTasks").textContent = overdue;

  // Captions under the numbers
  let activeSubjects = 0;
  for (let i = 0; i < subjects.length; i++) {
    if (getSubjectStats(subjects[i].name).total > 0) {
      activeSubjects++;
    }
  }

  let weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 6);
  let weekEndText = toDateString(weekEnd);
  let dueThisWeek = 0;

  for (let i = 0; i < tasks.length; i++) {
    if (
      !tasks[i].completed &&
      tasks[i].date >= today &&
      tasks[i].date <= weekEndText
    ) {
      dueThisWeek++;
    }
  }

  document.getElementById("totalSub").textContent =
    "Across " + activeSubjects + " subject" + (activeSubjects === 1 ? "" : "s");
  document.getElementById("completedSub").textContent =
    progress + "% of your plan";
  document.getElementById("pendingSub").textContent =
    dueThisWeek + " due in the next 7 days";
  document.getElementById("overdueSub").textContent =
    overdue > 0 ? "Needs your attention" : "You are all caught up";

  displaySubjectProgress();
  displayUpNext();
  displaySubjectCards();
}

// Only subjects that have at least one task are shown here
function displaySubjectProgress() {
  let html = "";
  let activeCount = 0;

  for (let i = 0; i < subjects.length; i++) {
    let s = subjects[i];
    let stats = getSubjectStats(s.name);

    if (stats.total === 0) {
      continue;
    }

    activeCount++;

    html += `
            <div class="sp-row" style="--c: ${s.color}">
                <div class="sp-icon"><svg class="sico"><use href="#${s.icon}"/></svg></div>

                <div class="sp-info">
                    <div class="sp-name">${s.name}</div>
                    <div class="sp-sub">${stats.done} of ${stats.total} tasks done</div>
                </div>

                ${ringHTML(stats.percent)}
            </div>
        `;
  }

  if (activeCount === 0) {
    html =
      '<p class="empty">No subjects in progress yet. Add a task to start tracking a subject.</p>';
  }

  document.getElementById("activeCount").textContent =
    activeCount + " of " + subjects.length + " subjects in progress";

  document.getElementById("subjectProgress").innerHTML = html;
}

// Pending tasks sorted by deadline (earliest first), top 5
function displayUpNext() {
  let pendingTasks = [];

  for (let i = 0; i < tasks.length; i++) {
    if (!tasks[i].completed) {
      pendingTasks.push(tasks[i]);
    }
  }

  pendingTasks.sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });

  let container = document.getElementById("upNext");

  if (pendingTasks.length === 0) {
    container.innerHTML =
      '<p class="empty">Nothing pending. Add a task to plan your next session.</p>';
    return;
  }

  let html = "";

  for (let i = 0; i < pendingTasks.length && i < 5; i++) {
    html += createTaskHTML(pendingTasks[i], tasks.indexOf(pendingTasks[i]));
  }

  container.innerHTML = html;
}

// ---------- Tasks ----------

function createTaskHTML(task, index) {
  let subject = getSubject(task.subject);

  let completedClass = task.completed ? "completed" : "";
  let textClass = task.completed ? "completed-text" : "";

  let dateText = "Due " + formatDate(task.date);
  let dateClass = "";

  if (!task.completed && task.date < todayString()) {
    dateText = "Overdue since " + formatDate(task.date);
    dateClass = "overdue";
  }

  return `
        <div class="task" style="--c: ${subject.color}">

            <button class="check-button ${completedClass}"
                    onclick="toggleTask(${index})"
                    aria-label="Toggle complete">
                <svg class="icon"><use href="#i-tick"/></svg>
            </button>

            <div class="task-icon"><svg class="sico"><use href="#${subject.icon}"/></svg></div>

            <div class="task-info">
                <div class="task-name ${textClass}">${safeText(task.name)}</div>

                <div class="task-meta">
                    <span>${subject.name}</span>
                    <span class="due ${dateClass}">
                        <svg class="icon sm"><use href="#i-calendar"/></svg>${dateText}
                    </span>
                </div>
            </div>

            <span class="priority ${task.priority}">${task.priority}</span>

            <button class="delete-button"
                    onclick="deleteTask(${index})"
                    aria-label="Delete task">
                <svg class="icon"><use href="#i-trash"/></svg>
            </button>

        </div>
    `;
}

function displayTasks() {
  let search = document.getElementById("searchInput").value.toLowerCase();
  let subject = document.getElementById("subjectFilter").value;
  let status = document.getElementById("statusFilter").value;

  let html = "";

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];

    let matchesSearch = task.name.toLowerCase().includes(search);

    let matchesSubject = subject === "all" || task.subject === subject;

    let matchesStatus =
      status === "all" ||
      (status === "completed" && task.completed) ||
      (status === "pending" && !task.completed);

    if (matchesSearch && matchesSubject && matchesStatus) {
      html += createTaskHTML(task, i);
    }
  }

  if (html === "") {
    html =
      '<div class="card"><p class="empty">No matching tasks. Try a different search or filter.</p></div>';
  }

  document.getElementById("taskList").innerHTML = html;
}

function addTask(event) {
  event.preventDefault();

  let newTask = {
    name: document.getElementById("taskName").value.trim(),
    subject: document.getElementById("taskSubject").value,
    priority: document.getElementById("taskPriority").value,
    date: document.getElementById("taskDate").value,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();

  closeForm();
  updateDashboard();
  displayTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  updateDashboard();
  displayTasks();
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    updateDashboard();
    displayTasks();
  }
}

// ---------- Subject cards (all 10 subjects, active ones first) ----------

function createSubjectCard(s, stats) {
  let idle = stats.total === 0;

  let topRight = "";
  let subtitle = "";
  let footer = "";

  if (idle) {
    topRight = `<span class="sc-start"><svg class="icon sm"><use href="#i-plus"/></svg>Start</span>`;
    subtitle = "No tasks yet";
    footer = "Select to plan the first task";
  } else {
    topRight = ringHTML(stats.percent);
    subtitle = stats.done + " of " + stats.total + " tasks done";

    let next = getNextDue(s.name);

    if (next === "") {
      footer = "All tasks completed";
    } else {
      footer = "Next deadline: " + formatDate(next);
    }
  }

  return `
        <button class="subject-card ${idle ? "idle" : ""}" style="--c: ${s.color}"
                onclick="openSubject('${s.name}')">

            <div class="sc-top">
                <div class="sc-icon"><svg class="sico"><use href="#${s.icon}"/></svg></div>
                ${topRight}
            </div>

            <div class="sc-body">
                <h2>${s.name}</h2>
                <p>${subtitle}</p>
                <div class="sc-next">
                    <svg class="icon sm"><use href="#i-calendar"/></svg>${footer}
                </div>
            </div>

        </button>
    `;
}

function displaySubjectCards() {
  let activeHTML = "";
  let idleHTML = "";

  for (let i = 0; i < subjects.length; i++) {
    let stats = getSubjectStats(subjects[i].name);

    if (stats.total > 0) {
      activeHTML += createSubjectCard(subjects[i], stats);
    } else {
      idleHTML += createSubjectCard(subjects[i], stats);
    }
  }

  document.getElementById("subjectCards").innerHTML = activeHTML + idleHTML;
}

// Subject with tasks -> show its tasks. Empty subject -> open the form for it.
function openSubject(name) {
  if (getSubjectStats(name).total === 0) {
    openForm(name);
    return;
  }

  document.getElementById("subjectFilter").value = name;
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "all";
  showSection("tasks");
}

// ---------- Modal form ----------

function openForm(subjectName) {
  document.getElementById("taskDate").value = todayString();

  if (subjectName) {
    document.getElementById("taskSubject").value = subjectName;
  }

  document.getElementById("taskModal").style.display = "flex";
  document.getElementById("taskName").focus();
}

function closeForm() {
  document.getElementById("taskModal").style.display = "none";
  document.getElementById("taskForm").reset();
}

// Close when clicking outside the form, or pressing Esc
document.getElementById("taskModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeForm();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeForm();
  }
});

// ---------- Navigation ----------

function showSection(sectionName) {
  let sections = document.querySelectorAll(".section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.add("hidden");
  }

  document.getElementById(sectionName).classList.remove("hidden");
  document.getElementById("pageTitle").textContent = pageTitles[sectionName];

  if (sectionName === "tasks") {
    displayTasks();
  }

  let names = ["dashboard", "tasks", "subjects"];
  let buttons = document.querySelectorAll("nav .nav-item");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");

    if (names[i] === sectionName) {
      buttons[i].classList.add("active");
    }
  }
}

// ---------- Dark mode ----------

function applyTheme() {
  let isDark = document.body.classList.contains("dark");

  document.getElementById("themeLabel").textContent = isDark
    ? "Light mode"
    : "Dark mode";
  document
    .getElementById("themeIcon")
    .setAttribute("href", isDark ? "#i-sun" : "#i-moon");
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "true");
  } else {
    localStorage.setItem("darkMode", "false");
  }

  applyTheme();
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// ---------- Start the app ----------

setDate();
fillSubjectDropdowns();
updateDashboard();
applyTheme();
