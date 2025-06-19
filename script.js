const taskPoints = [
  1, 1, 1, 1, 1, 1, 5, 1, 1, 1,  // Задания 1–10
  1, 1, 1, 1, 1, 1, 1, 1         // Задания 11–18
];


const children = ["Глеб", "Серафима", "Коля"];
const numTasks = 18;
const password = "parent123";

function authorize() {
  const input = prompt("Введите пароль родителя:");
  if (input === password) {
    document.body.dataset.auth = "true";
    alert("Доступ разрешён.");
    renderTable();
  } else {
    alert("Неверный пароль.");
  }
}

function getKey(dateStr, name) {
  return `tasks-${dateStr}-${name}`;
}

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

function loadTasks(dateStr, name) {
  const key = getKey(dateStr, name);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : Array(numTasks).fill(false);
}

function saveTasks(dateStr, name, tasks) {
  const key = getKey(dateStr, name);
  localStorage.setItem(key, JSON.stringify(tasks));
}

function renderTable() {
  const body = document.getElementById("taskBody");
  body.innerHTML = "";
  const date = getCurrentDate();

  children.forEach(name => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = name;
    row.appendChild(nameCell);

    const tasks = loadTasks(date, name);

    for (let i = 0; i < numTasks; i++) {
      const cell = document.createElement("td");
      if (document.body.dataset.auth === "true") {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tasks[i];
        checkbox.onchange = () => {
          tasks[i] = checkbox.checked;
          saveTasks(date, name, tasks);
          updateChart();
        };
        cell.appendChild(checkbox);
      } else {
        cell.textContent = tasks[i] ? "✔" : "";
      }
      row.appendChild(cell);
    }

    body.appendChild(row);
  });

  updateChart();
}

function updateChart() {
  const monthlyScores = {};
  const selectedDate = getCurrentDate();
  const selectedMonth = selectedDate.substring(0, 7);

  children.forEach(name => {
    monthlyScores[name] = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`tasks-${selectedMonth}`) && key.includes(`-${name}`)) {
        const tasks = JSON.parse(localStorage.getItem(key));
        monthlyScores[name] += tasks.reduce((sum, done, index) => {
  return sum + (done ? taskPoints[index] : 0);
}, 0);
      }
    }
  });

  const ctx = document.getElementById('ratingChart').getContext('2d');
  if (window.myChart) {
    window.myChart.destroy();
  }

  const names = Object.keys(monthlyScores);
  const scores = Object.values(monthlyScores);

  const backgroundColors = names.map(name => {
    if (name === 'Коля') return 'green';
    if (name === 'Серафима') return '#2b9ad6';
    if (name === 'Глеб') return '#8F00FF';
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
            label: function (context) {
              return `${context.raw} баллов`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          precision: 0
        }
      }
    }
  });
}

function saveWeekToArchive() {
  const weeklyScores = {};
  const currentDate = getCurrentDate();
  const weekStart = getWeekStart(currentDate);
  const key = `week-${weekStart}`;

  children.forEach(name => {
    weeklyScores[name] = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);

      if (k.startsWith("tasks-") && k.endsWith(`-${name}`)) {
        const match = k.match(/^tasks-(\d{4}-\d{2}-\d{2})-/);
        if (match) {
          const datePart = match[1];
          if (getWeekStart(datePart) === weekStart) {
            const tasks = JSON.parse(localStorage.getItem(k));
            // Теперь правильно считаем баллы с учётом веса заданий
            weeklyScores[name] += tasks.reduce((sum, done, index) => {
              return sum + (done ? taskPoints[index] : 0);
            }, 0);
          }
        }
      }
    }
  });

  localStorage.setItem(key, JSON.stringify(weeklyScores));
  alert(`Архив за неделю ${weekStart} сохранён.`);
}



// Инициализация
document.getElementById("datePicker").addEventListener("change", renderTable);
document.getElementById("datePicker").value = new Date().toISOString().slice(0, 10);
renderTable();
