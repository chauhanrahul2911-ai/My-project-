<script>
// 📁 1. MASTER DATA STRUCTURE (PRO MODEL)
const subjectData = {
  samanya_gyan: {
    gujName: "સામાન્ય જ્ઞાન",
    branches: {
      gujarat_history: { gujName: "ગુજરાતનો ઇતિહાસ", totalTests: 5 },
      gujarat_geography: { gujName: "ગુજરાતની ભૂગોળ", totalTests: 8 },
      constitution: { gujName: "ભારતનું બંધારણ", totalTests: 10 }
    }
  },
  computer_gyan: {
    gujName: "કમ્પ્યુટર જ્ઞાન",
    branches: {
      computer_intro: { gujName: "કમ્પ્યુટર પરિચય", totalTests: 5 },
      ms_office: { gujName: "એમ.એસ. ઓફિસ", totalTests: 6 }
    }
  },
  gujarati_vyakaran: {
    gujName: "ગુજરાતી વ્યાકરણ",
    branches: {
      grammar: { gujName: "જોડણી અને વ્યાકરણ", totalTests: 5 }
    }
  },
  english_grammar: {
    gujName: "અંગ્રેજી વ્યાકરણ",
    branches: {
      tenses: { gujName: "Tenses & Grammar", totalTests: 5 }
    }
  },
  maths_reasoning: {
    gujName: "એપ્ટિટ્યુડ અને રીઝનીંગ",
    branches: {
      maths_reasoning: { gujName: "ગણિત અને તાર્કિક કસોટી", totalTests: 5 }
    }
  },
  conductor_info: {
    gujName: "નિગમને લગતી માહિતી",
    branches: {
      conductor_duties: { gujName: "કંડક્ટર ફરજો અને ફર્સ્ટ એઇડ", totalTests: 5 }
    }
  },
  motor_vehicle_act: {
    gujName: "મોટર વ્હીકલ એક્ટ",
    branches: {
      traffic_rules: { gujName: "ટ્રાફિક નિયમો અને એક્ટ", totalTests: 5 }
    }
  },
  road_safety: {
    gujName: "રોડ સેફ્ટી",
    branches: {
      road_safety: { gujName: "રોડ સેફ્ટી અને ઓટોમોબાઈલ", totalTests: 5 }
    }
  }
};

// Automatic subjects array (English Keys) nikalne ke liye
const syllabusSubjects = Object.keys(subjectData);

let currentSubject = ""; // Stores English Key (e.g., "samanya_gyan")
let currentBranch = "";  // Stores English Key (e.g., "gujarat_history")
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
function getBranchProgress(subjectKey, branchKey, typeName) {
    let totalSum = 0;
    const totalTests = subjectData[subjectKey].branches[branchKey].totalTests;
    // Local storage mapping sync ke liye Gujarati naam uthao
    const branchGujName = subjectData[subjectKey].branches[branchKey].gujName;
    
    for(let i = 1; i <= totalTests; i++) {
        let storageKey = `${subjectKey}_${branchGujName}_${typeName}_${i}_score`;
        totalSum += parseInt(localStorage.getItem(storageKey)) || 0;
    }
    return Math.round(totalSum / totalTests) || 0;
}

function getSubjectProgress(subjectKey) {
    let totalPercentageSum = 0;
    const branches = Object.keys(subjectData[subjectKey].branches);
    
    if(branches.length === 0) return 0;

    branches.forEach(branchKey => {
        let qProg = getBranchProgress(subjectKey, branchKey, 'Quiz');
        let mProg = getBranchProgress(subjectKey, branchKey, 'Mock Test');
        totalPercentageSum += ((qProg + mProg) / 2);
    });
    
    return Math.round(totalPercentageSum / branches.length) || 0;
}

function getOverallAppProgress() {
    let totalSum = 0;
    syllabusSubjects.forEach(subKey => { totalSum += getSubjectProgress(subKey); });
    return Math.round(totalSum / syllabusSubjects.length) || 0;
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

    syllabusSubjects.forEach((subKey, index) => {
        let progress = getSubjectProgress(subKey);
        let gujSubjectName = subjectData[subKey].gujName; // Gujarati Text Display

        const card = document.createElement('div');
        card.className = "card";
        card.onclick = () => goToBranchSelect(subKey); 
        card.innerHTML = `
            <div>
                <div>${index + 1}. ${gujSubjectName}</div>
                <span class="sub-perc">કુલ પ્રગતિ: ${progress}%</span>
            </div>
            <span>➔</span>
        `;
        container.appendChild(card);
    });
}

// --- 🌿 BRANCH/CHAPTERS GRID GENERATOR (Screen 2) ---
function goToBranchSelect(subjectKey) {
    currentSubject = subjectKey;
    
    let cleanSubjectName = subjectData[subjectKey].gujName;
    document.getElementById('current-subject-title-branch').innerText = cleanSubjectName;
    
    const container = document.getElementById('branches-container');
    container.innerHTML = "";

    const branches = Object.keys(subjectData[subjectKey].branches);
    
    branches.forEach((branchKey, index) => {
        let qProg = getBranchProgress(subjectKey, branchKey, 'Quiz');
        let mProg = getBranchProgress(subjectKey, branchKey, 'Mock Test');
        let branchProgress = Math.round((qProg + mProg) / 2) || 0;

        let cleanBranchName = subjectData[subjectKey].branches[branchKey].gujName;

        const card = document.createElement('div');
        card.className = "card";
        card.onclick = () => goToTypeSelect(branchKey); 
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
function goToTypeSelect(branchKey) {
    currentBranch = branchKey;
    
    let cleanBranchName = subjectData[currentSubject].branches[branchKey].gujName;
    document.getElementById('current-subject-name').innerText = cleanBranchName;
    
    let quizProg = getBranchProgress(currentSubject, branchKey, 'Quiz');
    let mockProg = getBranchProgress(currentSubject, branchKey, 'Mock Test');
    
    document.getElementById('quiz-type-perc').innerText = `Progress: ${quizProg}%`;
    document.getElementById('mock-type-perc').innerText = `Progress: ${mockProg}%`;
    
    changeScreen('screen-type-select');
}

// --- 📋 DYNAMIC QUIZ ROWS GENERATOR (Screen 4) ---
function goToQuizList(type) {
    currentType = type;
    
    let cleanBranchName = subjectData[currentSubject].branches[currentBranch].gujName;
    document.getElementById('current-list-title').innerText = `${cleanBranchName} - ${type}`;
    
    buildQuizRows();
    changeScreen('screen-quiz-list');
}

function buildQuizRows() {
    const container = document.getElementById('dynamic-list-container');
    container.innerHTML = "";

    const totalTests = subjectData[currentSubject].branches[currentBranch].totalTests;
    const branchGujName = subjectData[currentSubject].branches[currentBranch].gujName;

    for (let i = 1; i <= totalTests; i++) {
        let isLocked = (i > 3 && !isPremiumUser); 
        let storageKey = `${currentSubject}_${branchGujName}_${currentType}_${i}_score`;
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
                // Session tracking variables sync back logic
                localStorage.setItem('last_active_subject', currentSubject);
                localStorage.setItem('last_active_branch', currentBranch);
                localStorage.setItem('last_active_type', currentType);

                // 🎯 100% SATEEK DATA EXTRACTION: Bina kisi mismatch ke English & Gujarati values separate bhejega
                let branchFolder = currentBranch; // English path parameter e.g., "gujarat_history"
                
                window.location.href = `quiz-player.html?subject=${currentSubject}&branch=${encodeURIComponent(branchGujName)}&branchFolder=${branchFolder}&type=${encodeURIComponent(currentType)}&no=${i}`;
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

// ENTRY STARTUP INITS (Smart Auto-Route Engine)
window.onload = function() {
    updateProfileUI();
    buildSubjectCards();

    const savedSubject = localStorage.getItem('last_active_subject');
    const savedBranch = localStorage.getItem('last_active_branch');
    const savedType = localStorage.getItem('last_active_type');

    if (savedSubject && savedBranch && savedType) {
        currentSubject = savedSubject;
        currentBranch = savedBranch;
        currentType = savedType;

        goToBranchSelect(currentSubject);
        goToTypeSelect(currentBranch);
        goToQuizList(currentType);

        localStorage.removeItem('last_active_subject');
        localStorage.removeItem('last_active_branch');
        localStorage.removeItem('last_active_type');
    }
};
</script>
