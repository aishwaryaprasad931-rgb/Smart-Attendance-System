
// Get HTML elements
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentRoll = document.getElementById("studentRoll");
const studentTable = document.getElementById("studentTable");
const reportTable = document.getElementById("reportTable");
const attendanceDate = document.getElementById("attendanceDate");

// Load saved data
let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

// Get today's date
function getToday() {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000)
        .toISOString().split("T")[0];
}

attendanceDate.value = getToday();

// Save data
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

// Add new student
studentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = studentName.value.trim();
    const roll = studentRoll.value.trim();

    if (!name || !roll) {
        alert("Please enter all details.");
        return;
    }

    const exists = students.some(
        student => student.roll.toLowerCase() === roll.toLowerCase()
    );

    if (exists) {
        alert("Roll number already exists!");
        return;
    }

    students.push({
        name: name,
        roll: roll
    });

    saveData();
    studentForm.reset();
    renderAll();

    alert("Student added successfully!");
});

// Mark attendance
function markAttendance(roll, status) {
    const date = attendanceDate.value;

    if (!date) {
        alert("Please select a date.");
        return;
    }

    if (!attendance[date]) {
        attendance[date] = {};
    }

    attendance[date][roll] = status;

    saveData();
    renderAll();
}

// Display students
function renderStudents() {
    studentTable.innerHTML = "";

    const date = attendanceDate.value;

    students.forEach(student => {
        const status = attendance[date]?.[student.roll] || "Not Marked";

        const row = document.createElement("tr");

        const rollCell = document.createElement("td");
        rollCell.textContent = student.roll;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const statusCell = document.createElement("td");
        statusCell.textContent = status;
        statusCell.className = "status";

        if (status === "Present") {
            statusCell.classList.add("present-text");
        } else if (status === "Absent") {
            statusCell.classList.add("absent-text");
        }

        const actionCell = document.createElement("td");

        const presentButton = document.createElement("button");
        presentButton.textContent = "Present";
        presentButton.className = "present-btn";
        presentButton.addEventListener("click", () => {
            markAttendance(student.roll, "Present");
        });

        const absentButton = document.createElement("button");
        absentButton.textContent = "Absent";
        absentButton.className = "absent-btn";
        absentButton.addEventListener("click", () => {
            markAttendance(student.roll, "Absent");
        });

        actionCell.append(presentButton, absentButton);

        row.append(
            rollCell,
            nameCell,
            statusCell,
            actionCell
        );

        studentTable.appendChild(row);
    });
}

// Update dashboard cards
function updateDashboard() {
    const date = attendanceDate.value;
    const todayAttendance = attendance[date] || {};

    let present = 0;
    let absent = 0;

    students.forEach(student => {
        const status = todayAttendance[student.roll];

        if (status === "Present") present++;
        if (status === "Absent") absent++;
    });

    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("presentCount").textContent =
        present;

    document.getElementById("absentCount").textContent =
        absent;
}

// Generate attendance report
function renderReport() {
    reportTable.innerHTML = "";

    students.forEach(student => {
        let presentDays = 0;
        let totalDays = 0;

        Object.values(attendance).forEach(day => {
            const status = day[student.roll];

            if (status === "Present" || status === "Absent") {
                totalDays++;

                if (status === "Present") {
                    presentDays++;
                }
            }
        });

        const percentage = totalDays > 0
            ? (presentDays / totalDays) * 100
            : 0;

        const row = document.createElement("tr");

        const values = [
            student.name,
            presentDays,
            totalDays,
            percentage.toFixed(1) + "%"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");

        if (totalDays === 0) {
            statusCell.textContent = "No Records";
        } else if (percentage < 75) {
            statusCell.textContent = "Low Attendance";
            statusCell.className = "warning";
        } else {
            statusCell.textContent = "Good Attendance";
            statusCell.className = "safe";
        }

        row.appendChild(statusCell);
        reportTable.appendChild(row);
    });
}

// Render everything
function renderAll() {
    renderStudents();
    updateDashboard();
    renderReport();
}

// Change attendance date
attendanceDate.addEventListener("change", renderAll);

// Initial display
renderAll();
