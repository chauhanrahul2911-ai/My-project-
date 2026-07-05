// 📁 Dynamic Subject, Branch aur Tests ka Structure
// Yahan aap jab chahein naye Chapters (Branches) aur unke tests ki sankhya badha sakte hain
const subjectData = {
    "સામાન્ય જ્ઞાન": {
        folder: "samanya_gyan",
        branches: {
            "ગુજરાતનો ઇતિહાસ (Gujarat History)": { totalTests: 5 },
            "ગુજરાતની ભૂગોળ (Geography)": { totalTests: 8 },
            "ભારતનું બંધારણ (Constitution)": { totalTests: 10 }
        }
    },
    "કમ્પ્યુટર જ્ઞાન": {
        folder: "computer_gyan",
        branches: {
            "કમ્પ્યુટર પરિચય": { totalTests: 5 },
            "એમ.એસ. ઓફિસ": { totalTests: 6 }
        }
    },
    "ગુજરાતી વ્યાકરણ": {
        folder: "gujarati_vyakaran",
        branches: {
            "જોડણી અને વ્યાકરણ": { totalTests: 5 }
        }
    },
    "અંગ્રેજી વ્યાકરણ": {
        folder: "english_grammar",
        branches: {
            "Tenses & Grammar": { totalTests: 5 }
        }
    },
    "એપ્ટિટ્યુડ અને રીઝનીંગ": {
        folder: "maths_reasoning",
        branches: {
            "ગણિત અને તાર્કિક કસોટી": { totalTests: 5 }
        }
    },
    "નિગમને લગતી માહિતી": {
        folder: "conductor_duties",
        branches: {
            "કંડક્ટર ફરજો અને ફર્સ્ટ એઇડ": { totalTests: 5 }
        }
    },
    "મોટર વ્હીકલ એક્ટ": {
        folder: "motor_vehicle_act",
        branches: {
            "ટ્રાફિક નિયમો અને એક્ટ": { totalTests: 5 }
        }
    },
    "રોડ સેફ્ટી": { 
        folder: "road_safety",
        branches: {
            "રોડ સેફ્ટી અને ઓટોમોબાઈલ": { totalTests: 5 }
        }
    }
};

// Automatic subjects array nikalne ke liye
const syllabusSubjects = Object.keys(subjectData);

let currentSubject = ""; 
let currentBranch = ""; // 🌟 Naya variable chapter track karne ke liye
let currentType = "";
let isPremiumUser = (localStorage.getItem('gsrtc_is_premium') === 'true');

// --- SIDEBAR TOGGLE FUNCTIONS ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('show');
}

function changeScreenFromSidebar(screenId) {
    changeScreen(screenId);
    toggleSidebar();
}

function changeScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0,0);
}

// --- 🧮 NEW DYNAMIC PROGRESS TRACKING ---
function getBranchProgress(subjectName, branchName, typeName) {
    let totalSum = 0;
    const totalTests = subjectData[subjectName].branches[branchName].totalTests;
    
    for(let i = 1; i <= totalTests; i++) {
        let storageKey = `${subjectName}_${branchName}_${typeName}_${i}_score`;
        totalSum += parseInt(localStorage.getItem(storageKey)) || 0;
    }
    return Math.round(totalSum / totalTests);
}

function getSubjectProgress(subjectName) {
    let totalPercentageSum = 0;
    const branches = Object.keys(subjectData[subjectName].branches);
    
    if(branches.length === 0) return 0;

    branches.forEach(branch => {
        let qProg = getBranchProgress(subjectName, branch, 'Quiz');
        let mProg = getBranchProgress(subjectName, branch, 'Mock Test');
        totalPercentageSum += ((qProg + mProg) / 2);
    });
    
    return Math.round(totalPercentageSum / branches.length);
}

function getOverallAppProgress() {
    let totalSum = 0;
    syllabusSubjects.forEach(sub => { totalSum += getSubjectProgress(sub); });
    return Math.round(totalSum / syllabusSubjects.length);
}

// --- 👤 DYNAMIC SIDEBAR PROFILE RENDER ---
function updateProfileUI() {
    const profileArea = document.getElementById('profile-area');
    const userName = localStorage.getItem('gsrtc_logged_user');
    const overallProgress = getOverallAppProgress();

    if (userName) {
        let firstLetter = userName.charAt(0);
        profileArea.innerHTML = `
            <div class="profile-left">
                <div class="avatar">${firstLetter}</div>
                <div class="profile-info">
                    <div class="profile-name">${userName}</div>
                    <div class="profile-status">${isPremiumUser ? '👑 Premium Account' : '📝 Free Account'}</div>
                </div>
            </div>
            <div class="user-total-badge">${overallProgress}%</div>
        `;
    } else {
        profileArea.innerHTML = `
            <div class="profile-left" style="width:100%; justify-content:space-between;">
                <span style="font-size:0.9rem; color:#9ca3af;">તૈયારી ટ્રેક કરવા માટે:</span>
                <button class="btn" style="padding:6px 15px; font-size:0.85rem;" onclick="loginWithGoogle()">Login</button>
            </div>
        `;
    }
}

// --- 🚀 SUBJECTS GRID DISPLAY GENERATOR (Screen 1) ---
function buildSubjectCards() {
    const container = document.getElementById('subjects-container');
    container.innerHTML = "";

    syllabusSubjects.forEach((sub, index) => {
        let progress = getSubjectProgress(sub);
        const card = document.createElement('div');
        card.className = "card";
        card.onclick = () => goToBranchSelect(sub); // Ab yeh direct branches par bhejega
        card.innerHTML = `
            <div>
                <div>${index + 1}. ${sub}</div>
                <span class="sub-perc">કુલ પ્રગતિ: ${progress}%</span>
            </div>
            <span>➔</span>
        `;
        container.appendChild(card);
    });
}

// --- 🌿 BRANCH/CHAPTERS GRID GENERATOR (Screen 2) ---
function goToBranchSelect(subjectName) {
    currentSubject = subjectName;
    
    // Header mein se English naam saaf karne ke liye split ka use kiya
    let cleanSubjectName = subjectName.split('(')[0].trim();
    document.getElementById('current-subject-title-branch').innerText = cleanSubjectName;
    
    const container = document.getElementById('branches-container');
    container.innerHTML = "";

    const branches = Object.keys(subjectData[subjectName].branches);
    
    branches.forEach((branch, index) => {
        // 🔄 1. Har branch ki alag progress nikaalo (Quiz + Mock dono ka average)
        let qProg = getBranchProgress(subjectName, branch, 'Quiz');
        let mProg = getBranchProgress(subjectName, branch, 'Mock Test');
        let branchProgress = Math.round((qProg + mProg) / 2);

        // 🔄 2. Card ke andar dikhane ke liye sirf Gujarati naam nikalo
        let cleanBranchName = branch.split('(')[0].trim();

        const card = document.createElement('div');
        card.className = "card";
        card.onclick = () => goToTypeSelect(branch); // Data linkage ke liye asli branch name hi pass hoga
        card.innerHTML = `
            <div>
                <div>${index + 1}. ${cleanBranchName}</div>
                <span class="sub-perc">કુલ પ્રગતિ: ${branchProgress}%</span>
            </div>
            <span>➔</span>
        `;
        container.appendChild(card);
    });

    changeScreen('screen-branches');
}

// --- ⚡ TYPE SELECT INTERMEDIARY (Screen 3) ---
function goToTypeSelect(branchName) {
    currentBranch = branchName;
    
    // Header mein sirf Gujarati naam dikhao
    let cleanBranchName = branchName.split('(')[0].trim();
    document.getElementById('current-subject-name').innerText = cleanBranchName;
    
    let quizProg = getBranchProgress(currentSubject, branchName, 'Quiz');
    let mockProg = getBranchProgress(currentSubject, branchName, 'Mock Test');
    
    document.getElementById('quiz-type-perc').innerText = `Progress: ${quizProg}%`;
    document.getElementById('mock-type-perc').innerText = `Progress: ${mockProg}%`;
    
    changeScreen('screen-type-select');
}

// --- 📋 DYNAMIC QUIZ ROWS GENERATOR (Screen 4) ---
function goToQuizList(type) {
    currentType = type;
    
    // Header mein se English hatakar sirf Gujarati naam set kiya
    let cleanBranchName = currentBranch.split('(')[0].trim();
    document.getElementById('current-list-title').innerText = `${cleanBranchName} - ${type}`;
    
    buildQuizRows();
    changeScreen('screen-quiz-list');
}

function buildQuizRows() {
    const container = document.getElementById('dynamic-list-container');
    container.innerHTML = "";

    // Automatic pata lagayega ki is branch mein kitne test hain
    const totalTests = subjectData[currentSubject].branches[currentBranch].totalTests;

    for (let i = 1; i <= totalTests; i++) {
        let isLocked = (i > 3 && !isPremiumUser); // Shuruat ke 3 test free, baaki locked
        let storageKey = `${currentSubject}_${currentBranch}_${currentType}_${i}_score`;
        let savedScore = localStorage.getItem(storageKey) || "0"; 

        const row = document.createElement('div');
        row.className = `list-item ${isLocked ? 'locked' : ''}`;
        row.innerHTML = `
            <div>
                <span style="margin-right:10px;">${isLocked ? '🔒' : '🔓'}</span>
                <span>${currentType} નંબર - ${i}</span>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="color:var(--secondary); font-weight:bold;">${savedScore}%</span>
                <span style="color:#bbb;">➔</span>
            </div>
        `;

        row.onclick = function() {
            if (isLocked) {
                if (!localStorage.getItem('gsrtc_logged_user')) {
                    alert("🔒 આગળના પ્રીમિયમ ટેસ્ટ માટે કૃપા કરીને પહેલા Google વડે લોગિન કરો.");
                    loginWithGoogle();
                } else { openPaywall(); }
            } else {
                // Mapping se English folder name niklega
                const englishFolder = subjectData[currentSubject].folder;
                
                // 🚀 URL parameters redirection with Branch Name included
                window.location.href = `quiz-player.html?subject=${englishFolder}&branch=${encodeURIComponent(currentBranch)}&type=${encodeURIComponent(currentType)}&no=${i}`;
            }
        };
        container.appendChild(row);
    }
}

// --- AUTH & PAYMENT LOGIC ---
function loginWithGoogle() {
    const dummyName = "રાહુલ કુમાર";
    localStorage.setItem('gsrtc_logged_user', dummyName);
    updateProfileUI();
    buildSubjectCards();
    alert("લોગિન સફળ રહ્યું!");
}

function openPaywall() { document.getElementById('paywall-modal').style.display = 'flex'; }
function closePaywall() { document.getElementById('paywall-modal').style.display = 'none'; }

function simulatePayment() {
    isPremiumUser = true;
    localStorage.setItem('gsrtc_is_premium', 'true');
    closePaywall();
    updateProfileUI();
    buildSubjectCards();
    if(currentType) buildQuizRows();
    alert("પેમેન્ટ સફળ રહ્યું! બધા લોક ખુલી ગયા છે.");
}

// ENTRY STARTUP INITS
window.onload = function() {
    updateProfileUI();
    buildSubjectCards();
};
