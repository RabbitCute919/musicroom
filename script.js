// เอา URL เว็บแอปใหม่ล่าสุดจาก Google Apps Script มาวางที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycbyI4hCxhAYb0wbpXMDQGBib1pmE5lOyUDZgpFgUobuMSaCbB2d94G-MKlpgXSSbV3dn/exec"; 

// ดึงข้อมูลเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", fetchBookings);

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('statusMessage').innerHTML = "กำลังบันทึกข้อมูล...";

    let payload = {
        action: "bookRoom",
        username: document.getElementById('username').value,
        room: document.getElementById('room').value,
        startTime: document.getElementById('startTime').value
    };

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
        document.getElementById('statusMessage').innerHTML = "<span style='color:green;'>จองสำเร็จ!</span>";
        document.getElementById('bookingForm').reset();
        fetchBookings(); // รีเฟรชรายการด้านล่าง
    });
});

// ฟังก์ชันดึงรายการจองมาแสดง
function fetchBookings() {
    let listDiv = document.getElementById('bookingList');
    listDiv.innerHTML = "กำลังโหลดข้อมูล...";

    fetch(API_URL) // เรียก GET
        .then(res => res.json())
        .then(data => {
            if (data.data.length === 0) {
                listDiv.innerHTML = "ไม่มีรายการจองค้างอยู่";
                return;
            }
            
            listDiv.innerHTML = ""; // ล้างข้อมูลเก่า
            data.data.forEach(booking => {
                let formattedTime = new Date(booking.startTime).toLocaleString('th-TH');
                
                // สร้างกล่องรายการจอง
                let item = document.createElement('div');
                item.className = "booking-item";
                
                let info = `<div><strong>${booking.room}</strong> - ${booking.username}<br><small>${formattedTime}</small><br>สถานะ: <b>${booking.status}</b></div>`;
                
                // ตรรกะแสดงปุ่ม: ถ้ารอใช้งานให้โชว์ Check-in, ถ้ากำลังใช้งานให้โชว์ Check-out
                let actionBtn = "";
                if (booking.status === "รอใช้งาน") {
                    actionBtn = `<button class="btn-checkin" onclick="updateStatus('${booking.id}', 'checkIn')">Check-in</button>`;
                } else if (booking.status === "กำลังใช้งาน") {
                    actionBtn = `<button class="btn-checkout" onclick="updateStatus('${booking.id}', 'checkOut')">Check-out</button>`;
                }

                item.innerHTML = info + actionBtn;
                listDiv.appendChild(item);
            });
        });
}

// ฟังก์ชันสำหรับกดปุ่ม Check-in / Check-out
function updateStatus(id, action) {
    if (!confirm(action === 'checkIn' ? "ยืนยันการ Check-in?" : "ยืนยันการ Check-out?")) return;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: action, id: id })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        fetchBookings(); // รีเฟรชรายการหลังเปลี่ยนสถานะสำเร็จ
    });
}
