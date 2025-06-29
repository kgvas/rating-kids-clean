import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";

import {
  doc, setDoc, getDoc, getDocs, collection
} from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";

const children = ["Глеб", "Серафима", "Коля"];
const numTasks = 18;
const taskPoints = [1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

// Авторизация
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = prompt("Email:");
  const password = prompt("Пароль:");
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert("Ошибка входа: " + e.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, user => {
  const saveBtn = document.getElementById("saveWeekBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    document.body.dataset.auth = "true";
    logoutBtn.style.display = "inline";
    saveBtn.disabled = false;
    renderTable();
  } else {
    document.body.dataset.auth = "false";
    logoutBtn.style.display = "none";
    saveBtn.disabled = true;
    renderTable();
  }
});

function getCurrentDate() {
  return document.getElementById("datePicker").value || new Date().toISOString().slice(0, 10);
}

function getWeekStart(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

async function loadTasks(dateStr, name) {
  const key = `tasks-${dateStr}-${name}`;
  const snap = await getDoc(doc(db, "tasks", key));
  return snap.exists() ? snap.data().tasks : Array(numTasks).fill(false);
}

async function saveTasks(dateStr, name, tasks) {
  const key = `tasks-${dateStr}-${name}`;
  await setDoc(doc(db, "tasks", key), { tasks });
}

async function renderTable() {
  const body = document.getElementById("taskBody");
  body.innerHTML = "";
  const date = getCurrentDate();

  for (const name of children) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = name;
    row.appendChild(nameCell);

    const tasks = await loadTasks(date, name);

    for (let i = 0; i < numTasks; i++) {
      const cell = document.createElement("td");
      if (document.body.dataset.auth === "true") {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tasks[i];
        checkbox.onchange = async () => {
          tasks[i] = checkbox.checked;
          await saveTasks(date, name, tasks);
          await updateChart();
        };
        cell.appendChild(checkbox);
      } else {
        cell.textContent = tasks[i] ? "✔" : "";
      }
      row.appendChild(cell);
    }

    body.appendChild(row);
  }

  await updateChart();
}

async function updateChart() {
  const selectedMonth = getCurrentDate().slice(0, 7);
  const monthlyScores = Object.fromEntries(children.map(c => [c, 0]));

  const snapshot = await getDocs(collection(db, "tasks"));
  snapshot.forEach(docSnap => {
    const { tasks } = docSnap.data();
    const key = docSnap.id;
    const match = key.match(/^tasks-(\d{4}-\d{2})-\d{2}-(.+)$/) || key.match(/^tasks-(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (!match) return;

    const date = match[1];
    const name = match[2];
    if (date.startsWith(selectedMonth) && monthlyScores[name] !== undefined) {
      tasks.forEach((done, i) => {
        if (done) monthlyScores[name] += taskPoints[i];
      });
    }
  });

  const ctx = document.getElementById('ratingChart').getContext('2d');
  if (window.myChart) window.myChart.destroy();

  const names = Object.keys(monthlyScores);
  const scores = Object.values(monthlyScores);
  const backgroundColors = names.map(name => {
    if (name === 'Коля') return 'green';
    if (name === 'Серафима') return '#2b9ad6';
    if (name === 'Глеб') return '#8F00FF';
    return 'gray';
  });

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        data: scores,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw} баллов`
          }
        }
      },
      scales: {
        y: { beginAtZero: true, precision: 0 }
      }
    }
  });
}

document.getElementById("datePicker").addEventListener("change", renderTable);
document.getElementById("saveWeekBtn").addEventListener("click", saveWeekToArchive);
document.getElementById("datePicker").value = new Date().toISOString().slice(0, 10);

async function saveWeekToArchive() {
  const currentDate = getCurrentDate();
  const weekStart = getWeekStart(currentDate);
  const weeklyScores = Object.fromEntries(children.map(c => [c, 0]));

  const snapshot = await getDocs(collection(db, "tasks"));
  snapshot.forEach(docSnap => {
    const { tasks } = docSnap.data();
    const key = docSnap.id;
    const match = key.match(/^tasks-(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (!match) return;

    const date = match[1];
    const name = match[2];
    if (getWeekStart(date) === weekStart && weeklyScores[name] !== undefined) {
      tasks.forEach((done, i) => {
        if (done) weeklyScores[name] += taskPoints[i];
      });
    }
  });

  await setDoc(doc(db, "weeks", weekStart), weeklyScores);
  alert(`Архив за неделю ${weekStart} сохранён.`);
}

renderTable();
