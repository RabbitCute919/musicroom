const API_URL = "https://script.google.com/macros/s/AKfycby4qeT6oapO4VkLvAdSlhLqqkjvq7i10rond4rfY0NdMlJaoPvRMhI7DFkfM3cMJEvF/exec"; 

let currentUser = "";
let currentRole = "";

// --------- ระบบ Login & UI Navigation ---------
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('loginStatus').innerText = "กำลังตรวจสอบ...";
    
    let payload = {
        action: "login",
        username: document.getElementById('loginUser').value,
        password: document.getElementById('loginPass').value
    };

    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json()).then(data => {
        if(data.status === "success") {
            currentUser = data.username;
            currentRole = data.role;
            showMainPage();
        } else {
            document.getElementById('loginStatus').innerText = data.message;
        }
    });
});

document.getElementById('btnLogout').addEventListener('click', () => {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('navBar').classList.add('hidden');
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('adminPage').classList.add('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('loginStatus').innerText = "";
});

document.getElementById('btnAdmin').addEventListener('click', showAdminPage);
document.getElementById('btnHome').addEventListener('click', showMainPage);

function showMainPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminPage').classList.add('hidden');
    document.getElementById('navBar').classList.remove('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
    document.getElementById('mainPage').style.display = "flex";
    
    document.getElementById('welcomeText').innerText = "ผู้ใช้: " + currentUser;
    document.getElementById('username').value = currentUser; // ล็อคชื่อคนจอง
    
    if(currentRole === 'admin') {
        document.getElementById('btnAdmin').classList.remove('hidden');
    }
    document.getElementById('btnHome').classList.add('hidden');
    fetchBookings();
}

function showAdminPage() {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('mainPage').style.display = "none";
    document.getElementById('adminPage').classList.remove('hidden');
    document.getElementById('btnAdmin').classList.add('hidden');
    document.getElementById('btnHome').classList.remove('hidden');
    
    loadSettings();
    loadHistory();
}

// --------- ระบบหน้าจองห้อง ---------
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('statusMessage').innerHTML = "กำลังบันทึก...";
    let payload = {
        action: "bookRoom",
        username: currentUser,
        room: document.getElementById('room').value,
        startTime: document.getElementById('startTime').value
    };
    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json()).then(data => {
        document.getElementById('statusMessage').innerHTML = "<span style='color:green;'>จองสำเร็จ!</span>";
        fetchBookings();
    });
});

function fetchBookings() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            let listDiv = document.getElementById('bookingList');
            if (data.data.length === 0) return listDiv.innerHTML = "ไม่มีรายการค้างอยู่";
            
            listDiv.innerHTML = ""; 
            data.data.forEach(booking => {
                let time = new Date(booking.startTime).toLocaleString('th-TH');
                let item = document.createElement('div');
                item.className = "booking-item";
                
                let info = `<div><strong>${booking.room}</strong> - ${booking.username}<br><small>${time}</small><br>สถานะ: <b>${booking.status}</b></div>`;
                
                let actionBtn = "";
                // User กดเช็คอินเช็คเอาท์ได้เฉพาะห้องของตัวเอง (หรือถ้าเป็นแอดมินกดได้หมด)
                if(booking.username === currentUser || currentRole === 'admin') {
                    if (booking.status === "รอใช้งาน") {
                        actionBtn = `<button class="action-btn btn-success" onclick="updateStatus('${booking.id}', 'checkIn')">Check-in</button>`;
                    } else if (booking.status === "กำลังใช้งาน") {
                        actionBtn = `<button class="action-btn btn-danger" onclick="updateStatus('${booking.id}', 'checkOut')">Check-out</button>`;
                    }
                }
                item.innerHTML = info + actionBtn;
                listDiv.appendChild(item);
            });
        });
}

function updateStatus(id, action) {
    if (!confirm(action === 'checkIn' ? "ยืนยัน Check-in?" : "ยืนยัน Check-out?")) return;
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: action, id: id }) })
    .then(res => res.json()).then(data => { fetchBookings(); });
}

// --------- ระบบหน้า Admin ---------
function loadSettings() {
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "getSettings" }) })
    .then(res => res.json()).then(data => { document.getElementById('adminEmailInput').value = data.email || ""; });
}

function saveSettings() {
    let newEmail = document.getElementById('adminEmailInput').value;
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "updateSettings", email: newEmail }) })
    .then(res => res.json()).then(data => { alert(data.message); });
}

function loadHistory() {
    fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "getHistory" }) })
    .then(res => res.json()).then(data => {
        let tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = "";
        data.data.forEach(row => {
            let tr = `<tr>
                <td>${row.name}</td><td>${row.room}</td>
                <td>${row.status}</td>
                <td>${new Date(row.time).toLocaleString('th-TH')}</td>
                <td>${row.in ? new Date(row.in).toLocaleTimeString('th-TH') : "-"}</td>
                <td>${row.out ? new Date(row.out).toLocaleTimeString('th-TH') : "-"}</td>
            </tr>`;
            tbody.innerHTML += tr;
        });
    });
}
