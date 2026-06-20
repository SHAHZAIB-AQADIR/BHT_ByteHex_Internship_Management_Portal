// ================= STATE MANAGEMENT (Local Storage Initialization) =================
let interns = JSON.parse(localStorage.getItem('bytehex_interns')) || [
    { id: "1", name: "Hamza Ahmed", email: "hamza@example.com", department: "Frontend Development", performance: 85 },
    { id: "2", name: "Ayesha Khan", email: "ayesha@example.com", department: "UI/UX Design", performance: 92 }
];

let tasks = JSON.parse(localStorage.getItem('bytehex_tasks')) || [
    { id: "101", title: "Build Landing Page UI", internId: "1", date: "2026-07-10", status: "In Progress" },
    { id: "102", title: "Create User Persona Maps", internId: "2", date: "2026-07-05", status: "Completed" }
];

let attendance = JSON.parse(localStorage.getItem('bytehex_attendance')) || {};

// Save back helper
function saveData() {
    localStorage.setItem('bytehex_interns', JSON.stringify(interns));
    localStorage.setItem('bytehex_tasks', JSON.stringify(tasks));
    localStorage.setItem('bytehex_attendance', JSON.stringify(attendance));
    updateDashboardStats();
}

// ================= AUTHENTICATION SIMULATION =================
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    if(email === "admin@bytehex.com" && pass === "admin123") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        initApp();
    } else {
        alert("Invalid credentials! Try admin@bytehex.com & admin123");
    }
});

function logout() {
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}
document.getElementById('logout-btn').addEventListener('click', logout);

// ================= NAVIGATION SYSTEM =================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    // Active class state updating on buttons
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-slate-400', 'hover:bg-slate-800');
    });
    event.currentTarget.classList.add('bg-blue-600', 'text-white');
    event.currentTarget.classList.remove('text-slate-400', 'hover:bg-slate-800');
}

// ================= APPLICATION INITIALIZATION =================
function initApp() {
    // Current date for attendance select
    document.getElementById('attendance-date').valueAsDate = new Date();
    updateDashboardStats();
    renderInterns();
    renderTasks();
    renderAttendance();
}

// ================= DASHBOARD CORE LOGIC =================
function updateDashboardStats() {
    document.getElementById('stat-total').innerText = interns.length;
    document.getElementById('stat-tasks').innerText = tasks.filter(t => t.status !== 'Completed').length;
    document.getElementById('stat-completed').innerText = tasks.filter(t => t.status === 'Completed').length;
    
    let totalPerf = interns.reduce((sum, intern) => sum + Number(intern.performance), 0);
    let avg = interns.length ? Math.round(totalPerf / interns.length) : 0;
    document.getElementById('stat-perf').innerText = `${avg}%`;
}

// ================= INTERN CRUD OPERATIONS =================
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if(show) modal.classList.remove('hidden');
    else {
        modal.classList.add('hidden');
        document.getElementById('intern-form').reset();
        document.getElementById('intern-id').value = '';
    }
}

document.getElementById('intern-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('intern-id').value;
    const name = document.getElementById('intern-name').value;
    const email = document.getElementById('intern-email').value;
    const department = document.getElementById('intern-dept').value;
    const performance = document.getElementById('intern-performance').value;

    if(id) { // Edit mode
        let objIndex = interns.findIndex(obj => obj.id == id);
        interns[objIndex] = { id, name, email, department, performance };
    } else { // Create mode
        interns.push({ id: Date.now().toString(), name, email, department, performance });
    }
    saveData();
    renderInterns();
    toggleModal('intern-modal', false);
});

function renderInterns() {
    const query = document.getElementById('search-intern').value.toLowerCase();
    const tbody = document.getElementById('interns-table-body');
    tbody.innerHTML = '';

    const filtered = interns.filter(i => i.name.toLowerCase().includes(query) || i.department.toLowerCase().includes(query));

    filtered.forEach(intern => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="p-4 font-medium text-gray-800">${intern.name}</td>
                <td class="p-4 text-gray-600">${intern.email}</td>
                <td class="p-4 text-gray-600">${intern.department}</td>
                <td class="p-4"><span class="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold rounded-full text-xs">${intern.performance}%</span></td>
                <td class="p-4 text-center space-x-2">
                    <button onclick="editIntern('${intern.id}')" class="text-amber-500 hover:text-amber-700 transition"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteIntern('${intern.id}')" class="text-red-500 hover:text-red-700 transition"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    });
}

function editIntern(id) {
    const intern = interns.find(i => i.id === id);
    document.getElementById('modal-title').innerText = "Edit Intern Profile";
    document.getElementById('intern-id').value = intern.id;
    document.getElementById('intern-name').value = intern.name;
    document.getElementById('intern-email').value = intern.email;
    document.getElementById('intern-dept').value = intern.department;
    document.getElementById('intern-performance').value = intern.performance;
    toggleModal('intern-modal', true);
}

function deleteIntern(id) {
    if(confirm("Are you sure you want to delete this intern? All records will clear.")) {
        interns = interns.filter(i => i.id !== id);
        tasks = tasks.filter(t => t.internId !== id); // delete tasks connected
        saveData();
        renderInterns();
    }
}

// ================= TASK ASSIGNMENT SYSTEM =================
function openTaskModal() {
    const select = document.getElementById('task-assignee');
    select.innerHTML = '';
    interns.forEach(i => select.innerHTML += `<option value="${i.id}">${i.name}</option>`);
    toggleModal('task-modal', true);
}

document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newTask = {
        id: Date.now().toString(),
        title: document.getElementById('task-title').value,
        internId: document.getElementById('task-assignee').value,
        date: document.getElementById('task-date').value,
        status: 'Pending'
    };
    tasks.push(newTask);
    saveData();
    renderTasks();
    toggleModal('task-modal', false);
    document.getElementById('task-form').reset();
});

function renderTasks() {
    const container = document.getElementById('tasks-list');
    container.innerHTML = '';

    tasks.forEach(task => {
        const currentIntern = interns.find(i => i.id === task.internId) || { name: 'Unknown Intern' };
        let badgeColor = task.status === 'Completed' ? 'bg-green-100 text-green-700' : task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700';
        
        container.innerHTML += `
            <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}">${task.status}</span>
                    <h3 class="text-lg font-bold text-gray-800 mt-2">${task.title}</h3>
                    <p class="text-sm text-gray-500 mt-1"><i class="fas fa-user-circle mr-1"></i> Assignee: <b>${currentIntern.name}</b></p>
                    <p class="text-xs text-red-400 mt-2"><i class="fas fa-calendar-alt mr-1"></i> Due: ${task.date}</p>
                </div>
                <div class="flex space-x-2 pt-2 border-t border-gray-50">
                    <button onclick="changeTaskStatus('${task.id}', 'In Progress')" class="text-xs flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded transition">Progress</button>
                    <button onclick="changeTaskStatus('${task.id}', 'Completed')" class="text-xs flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded transition">Complete</button>
                </div>
            </div>
        `;
    });
}

function changeTaskStatus(id, nextStatus) {
    let task = tasks.find(t => t.id === id);
    if(task) {
        task.status = nextStatus;
        saveData();
        renderTasks();
    }
}

// ================= ATTENDANCE SYSTEM =================
document.getElementById('attendance-date').addEventListener('change', renderAttendance);

function renderAttendance() {
    const date = document.getElementById('attendance-date').value;
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '';

    if(!attendance[date]) attendance[date] = {};

    interns.forEach(intern => {
        const currentStatus = attendance[date][intern.id] || 'Absent';
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="p-4 font-medium text-gray-800">${intern.name}</td>
                <td class="p-4 text-center space-x-2">
                    <button onclick="markAttendance('${date}', '${intern.id}', 'Present')" class="px-3 py-1 text-xs rounded-lg font-semibold transition ${currentStatus === 'Present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Present</button>
                    <button onclick="markAttendance('${date}', '${intern.id}', 'Absent')" class="px-3 py-1 text-xs rounded-lg font-semibold transition ${currentStatus === 'Absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">Absent</button>
                </td>
            </tr>
        `;
    });
}

function markAttendance(date, internId, status) {
    if(!attendance[date]) attendance[date] = {};
    attendance[date][internId] = status;
    saveData();
    renderAttendance();
}