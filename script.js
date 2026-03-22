const clockBody = document.getElementById('clockBody');
for (let i = 1; i <= 12; i++) {
    const num = document.createElement('div');
    num.className = 'number';
    num.style.transform = `rotate(${i * 30}deg)`;
    num.innerHTML = `<span style="display:inline-block; transform:rotate(-${i * 30}deg)">${i}</span>`;
    clockBody.appendChild(num);
}

let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
let editIndex = null;
// Replace your old alarmSound and selectedRingtone lines with these:
let selectedRingtone = localStorage.getItem('alarmSound') || "classic-alarm.wav";
let alarmSound = new Audio(selectedRingtone);
let currentSolution = 0;

function validateTime(input, max) {
    let value = parseInt(input.value);

    if (isNaN(value)) return;

    if (value > max) {
        input.value = max;
    }

    if (value < 0) {
        input.value = 0;
    }
}
let currentPreview = new Audio();


function previewSound(fileName, event, imgElement) {
    event.stopPropagation(); // Prevents selecting the row when clicking play

    // If clicking the same sound that is already playing
    if (!currentPreview.paused && currentPreview.src.includes(fileName)) {
        currentPreview.pause();
        imgElement.src = "play.svg";
    } else {
        // Stop any currently playing sound
        currentPreview.pause();
        
        // Reset all icons to play.svg
        document.querySelectorAll('.play-icon').forEach(img => img.src = "play.svg");

        // Play new sound
        currentPreview.src = fileName;
        currentPreview.play();
        imgElement.src = "pause.svg";

        // When sound ends, reset icon
        currentPreview.onended = () => { imgElement.src = "play.svg"; };
    }
}

function selectTone(fileName, element) {
    selectedRingtone = fileName;
    // UI highlight
    document.querySelectorAll('.rt-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
}

function saveRingtone() {
    currentPreview.pause(); 
    localStorage.setItem('alarmSound', selectedRingtone);
    
    // ADD THIS LINE: Update the actual alarm object's source
    alarmSound.src = selectedRingtone; 
    
    closeRingtone();
    alert("Ringtone Changed!");
}

function closeRingtone() {
    currentPreview.pause();
    document.getElementById('ringtonePopup').style.display = 'none';
}

function toggleFabMenu() {
    const menu = document.getElementById('fabOptions');
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}

// Update your existing openForm to also hide the menu
function openForm() {
    document.getElementById('formPopup').style.display = 'flex';
    document.getElementById('fabOptions').style.display = 'none'; // Hide menu
}

function openRingtoneMenu() {
    document.getElementById('ringtonePopup').style.display = 'flex';
    document.getElementById('fabOptions').style.display = 'none'; // Hide menu
}

function closeRingtone() {
    document.getElementById('ringtonePopup').style.display = 'none';
}
function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    const secDeg = (s * 6) + (ms * 0.006);
    const minDeg = (m * 6) + (s * 0.1);
    const hourDeg = (h * 30) + (m * 0.5);

    document.getElementById('hourHand').style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    document.getElementById('minHand').style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    document.getElementById('secHand').style.transform = `translateX(-50%) rotate(${secDeg}deg)`;

    // Check alarms
    if (s === 0 && ms < 100) {
        let curAMPM = h >= 12 ? "PM" : "AM";
        let displayH = h % 12 || 12;
        alarms.forEach(a => {
            if (a.active && a.h == displayH && a.m == m && a.ampm == curAMPM) {
                triggerAlarm();
            }
        });
    }
}
setInterval(updateClock, 50);

function triggerAlarm() {
    // Optional: double check the sound is what's in storage
    alarmSound.src = localStorage.getItem('alarmSound') || "classic-alarm.wav";
    
    alarmSound.loop = true;
    alarmSound.play();

    correctCount = 0; 
    document.getElementById('mathPopup').style.display = 'flex';
    generateQuestion(); 
}
let correctCount = 0; // track correct answers
function generateQuestion() {
    const operators = ['+', '-', '*', '/'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let n1, n2, question, answer;

    switch (op) {
        case '+':
            n1 = Math.floor(Math.random() * 10) + 5;
            n2 = Math.floor(Math.random() * 10) + 5;
            question = `${n1} + ${n2}`;
            answer = n1 + n2;
            break;

        case '-':
            n1 = Math.floor(Math.random() * 15) + 5;
            n2 = Math.floor(Math.random() * 10);
            question = `${n1} - ${n2}`;
            answer = n1 - n2;
            break;

        case '*':
            n1 = Math.floor(Math.random() * 10) + 2;
            n2 = Math.floor(Math.random() * 10) + 2;
            question = `${n1} × ${n2}`;
            answer = n1 * n2;
            break;

        case '/':
            n2 = Math.floor(Math.random() * 9) + 1;
            answer = Math.floor(Math.random() * 10) + 1;
            n1 = n2 * answer; // clean division
            question = `${n1} ÷ ${n2}`;
            break;
    }

    currentSolution = answer;
    document.getElementById('mathQuestion').innerText = question;
}

function verifyMath() {
    const userAns = parseInt(document.getElementById('mathAnswer').value);

    if (userAns === currentSolution) {
        correctCount++;

        if (correctCount >= 3) {
            // ✅ Stop alarm after 2 correct answers
            alarmSound.pause();
            alarmSound.currentTime = 0;
            document.getElementById('mathPopup').style.display = 'none';
            document.getElementById('mathAnswer').value = '';
        } else {
            document.getElementById('mathAnswer').value = '';
            generateQuestion(); // next question
        }

    } else {
        alert("Wrong! New question");
        document.getElementById('mathAnswer').value = '';
        generateQuestion(); // new question on wrong
    }
}

function renderAlarms() {
    const list = document.getElementById('alarmList');
    list.innerHTML = alarms.length === 0 ? '<p style="text-align:center; opacity:0.5">No alarms active</p>' : '';

    alarms.forEach((a, i) => {
        const div = document.createElement('div');
        div.className = 'alarm-card';
        div.innerHTML = `
                <div>
                    <h2 style="margin:0">${a.h}:${a.m.toString().padStart(2, '0')} <small style="color:var(--accent)">${a.ampm}</small></h2>
                </div>
                <div class="actions">
                    <button onclick="editAlarm(${i})">Edit</button>
                    <button onclick="deleteAlarm(${i})" style="color:var(--delete)">Delete</button>
                </div>`;
        list.appendChild(div);
    });
}

function saveAlarm() {
    const h = parseInt(document.getElementById('hIn').value) || 12;
    const m = parseInt(document.getElementById('mIn').value) || 0;
    const ampm = document.getElementById('ampmIn').value;

    if (editIndex !== null) {
        alarms[editIndex] = { h, m, ampm, active: true };
        editIndex = null;
    } else {
        alarms.push({ h, m, ampm, active: true });
    }

    localStorage.setItem("alarms", JSON.stringify(alarms));
    renderAlarms();
    closeForm();
}

function editAlarm(i) {
    editIndex = i;
    document.getElementById('hIn').value = alarms[i].h;
    document.getElementById('mIn').value = alarms[i].m;
    document.getElementById('ampmIn').value = alarms[i].ampm;
    openForm();
}

function deleteAlarm(i) {
    alarms.splice(i, 1);
    localStorage.setItem("alarms", JSON.stringify(alarms));
    renderAlarms();
}
function setQuickNap(minutes) {
    const now = new Date();
    // Add the nap duration to the current time
    const napTime = new Date(now.getTime() + minutes * 60000);

    let hours24 = napTime.getHours();
    let mins = napTime.getMinutes();
    let ampm = hours24 >= 12 ? 'PM' : 'AM';

    // Convert 24h to 12h format to match your manual alarm structure
    let hours12 = hours24 % 12;
    hours12 = hours12 ? hours12 : 12; 

    // Create the alarm object using 'h' and 'm' to match your renderAlarms/check logic
    const newAlarm = {
        h: hours12,
        m: mins,
        ampm: ampm,
        active: true,
        id: Date.now() // Unique ID for storage
    };

    // Push to your existing alarms array
    alarms.push(newAlarm);
    
    // Save to localStorage so it stays if you refresh
    localStorage.setItem("alarms", JSON.stringify(alarms));
    
    // Refresh the list on screen
    renderAlarms(); 
    
    // Format minutes for the alert message
    const displayMins = mins.toString().padStart(2, '0');
    alert(`Quick Nap set for ${hours12}:${displayMins} ${ampm}`);
}

function openForm() { document.getElementById('formPopup').style.display = 'flex'; }
function closeForm() { document.getElementById('formPopup').style.display = 'none'; editIndex = null; }

renderAlarms();