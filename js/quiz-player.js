// URL Parameters parsing logic (?subject=...&branch=...&branchFolder=...&type=...&no=...)
const urlParams = new URLSearchParams(window.location.search);

// 🎯 Main Folder (e.g., "samanya_gyan")
const subject = urlParams.get('subject'); 
// 🎯 Gujarati Branch Name (e.g., "ગુજરાતનો ઇતિહાસ (Gujarat History)")
const branch = decodeURIComponent(urlParams.get('branch')) || ""; 
// 🎯 English Folder Name for GitHub path (e.g., "gujarat_history")
const branchFolder = urlParams.get('branchFolder') || ""; 
const type = urlParams.get('type') || "Quiz";
const quizNo = urlParams.get('no') || "1";

// 🚨 SAFETY CHECK: Agar koi bina subject ke direct page par aaye toh home par phenk do
if (!subject) {
    alert("કોઈ વિષય પસંદ કરેલ નથી! કૃપા કરીને ફરીથી પ્રયાસ કરો.");
    window.location.href = 'index.html';
}

// Header Title par sirf Gujarati naam set karne ke liye (English bracket hata diya)
const cleanBranchTitle = branch.split('(')[0].trim();
document.getElementById('quiz-title').innerText = `${cleanBranchTitle} - ${type} ${quizNo}`;

var quizData = []; // Khaali array jisme dynamic JSON data load hoga
var currentIdx = 0; var score = 0; var answered = false;
var timeLeft = 600; var isReview = false; var userChoices = [];
var isMuted = false; var timerInterval;

// 🌐 Dynamic Fetch Engine: Ek hi template se saare tests fetch karne ke liye
async function loadQuizDataset() {
    try {
        // 🎯 FIX: Path mein subject ke sath branchFolder ko bhi jod diya hai!
        const response = await fetch(`data/${subject}/${branchFolder}/${type}_${quizNo}.json?v=${new Date().getTime()}`);
        if(!response.ok) throw new Error("File not found");
        quizData = await response.json();
        
        // Data aate hi count down aur question load engine active hoga
        startCountdown();
        loadQuestion();
    } catch (err) {
        alert("Quiz data file load nahi ho saki! Path check kijiye.");
        window.location.href = 'index.html';
    }
}

function playSnd(id) { if (isMuted) return; var s = document.getElementById(id); s.currentTime = 0; s.play().catch(e => console.log("Blocked")); }
function toggleMute() { isMuted = !isMuted; document.getElementById('mute-toggle').innerText = isMuted ? "🔇" : "🔊"; }

function startCountdown() {
    timerInterval = setInterval(function() {
        if(isReview) return;
        timeLeft--;
        var mins = Math.floor(timeLeft / 60); var secs = timeLeft % 60;
        document.getElementById('timer-display').innerText = "⌛ " + (mins < 10 ? "0"+mins : mins) + ":" + (secs < 10 ? "0"+secs : secs);
        if (timeLeft <= 0) { clearInterval(timerInterval); showFinalPage(); }
    }, 1000);
}

function loadQuestion() {
    answered = false;
    document.getElementById('next-btn').style.display = isReview ? 'block' : 'none';
    document.getElementById('explain-btn').style.display = 'none';
    document.getElementById('review-tag').style.display = isReview ? 'block' : 'none';
    var lifelineBtn = document.getElementById('fifty-fifty');
    lifelineBtn.disabled = isReview; lifelineBtn.style.display = isReview ? 'none' : 'block';
    document.getElementById('progress-text').innerText = "Question " + (currentIdx + 1) + " of " + quizData.length;
    var data = quizData[currentIdx];
    document.getElementById('question').innerText = data.q;
    
    var imgBox = document.getElementById('image-container');

    if (data.img) {
        document.getElementById('q-image').src = data.img; 
        imgBox.style.display = 'block';
    } else { 
        imgBox.style.display = 'none'; 
    }
    
    var btns = document.querySelectorAll('.option-btn');
    btns.forEach(function(btn, i) {
        btn.textContent = data.options[i];
        btn.className = 'option-btn'; btn.style.visibility = 'visible'; btn.disabled = isReview;
        if(isReview) {
            if(i === data.correct) btn.classList.add('correct');
            if(userChoices[currentIdx] === i && i !== data.correct) btn.classList.add('wrong');
        }
    });
}

function handleChoice(idx) {
    if (answered || isReview) return;
    answered = true; userChoices[currentIdx] = idx;
    var correct = quizData[currentIdx].correct;
    var btns = document.querySelectorAll('.option-btn');
    document.getElementById('fifty-fifty').disabled = true;
    if(idx === correct) { btns[idx].classList.add('correct'); score++; playSnd('snd-correct'); } 
    else { btns[idx].classList.add('wrong'); btns[correct].classList.add('correct'); playSnd('snd-wrong'); }
    document.getElementById('score-display').innerText = "Score: " + score;
    if(quizData[currentIdx].explanation) { document.getElementById('explain-btn').style.display = 'block'; }
    document.getElementById('next-btn').style.display = 'block';
}

function openExplain() {
    playSnd('snd-click');
    var data = quizData[currentIdx];
    document.getElementById('explain-text').innerText = data.explanation || "No explanation available.";
    document.getElementById('explainModal').style.display = 'flex';
}
function closeExplain() { document.getElementById('explainModal').style.display = 'none'; }

function useFiftyFifty() {
    if(answered || isReview) return;
    playSnd('snd-click');
    document.getElementById('fifty-fifty').disabled = true;
    var correct = quizData[currentIdx].correct;
    var btns = document.querySelectorAll('.option-btn');
    var indices = [0, 1, 2, 3].filter(function(i) { return i !== correct; }).sort(function() { return Math.random() - 0.5; });
    btns[indices[0]].style.visibility = 'hidden'; btns[indices[1]].style.visibility = 'hidden';
}

function handleNext() {
    playSnd('snd-click');
    if(isReview && currentIdx === quizData.length - 1) { showFinalPage(); return; }
    currentIdx++;
    if (currentIdx < quizData.length) loadQuestion(); else { clearInterval(timerInterval); showFinalPage(); }
}

function showFinalPage() {
    playSnd('snd-finish');
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('final-ui').style.display = 'block';
    
    var percent = Math.round((score / quizData.length) * 100) || 0;
    var msg = ""; var color = "";
    if(percent === 100) { msg = "🌟 PERFECT! Brilliant Job!"; color = "#22c55e"; }
    else if(percent >= 70) { msg = "👏 Great Job! Almost there!"; color = "#2563eb"; }
    else if(percent >= 40) { msg = "📚 Good effort! Keep practicing!"; color = "#fbbf24"; }
    else { msg = "💪 Don't give up! Try again!"; color = "#ef4444"; }
    
    var msgDiv = document.getElementById('final-msg');
    msgDiv.innerText = msg; msgDiv.style.color = color;
    document.getElementById('final-score').innerText = "Result: " + score + "/" + quizData.length + " (" + percent + "%)";
}

// 🎯 Percentage Progress Tracker Memory Saver
function saveAndGoHome() {
    var finalPercent = Math.round((score / quizData.length) * 100) || 0;
    
    // 🔐 Score Key format dynamic sync: (subject_branch_type_quizNo_score)
    let scoreKey = `${subject}_${branch}_${type}_${quizNo}_score`;
    
    let existingScore = parseInt(localStorage.getItem(scoreKey)) || 0;
    if (finalPercent > existingScore) {
        localStorage.setItem(scoreKey, finalPercent);
    }
    
    // 🔀 Back routing state trackers: index.html direct screen-4 load karega
    localStorage.setItem('last_active_subject', subject);
    localStorage.setItem('last_active_branch', branch);
    localStorage.setItem('last_active_type', type);
    
    window.location.href = 'index.html';
}

function startReview() { playSnd('snd-click'); isReview = true; currentIdx = 0; document.getElementById('game-ui').style.display = 'block'; document.getElementById('final-ui').style.display = 'none'; loadQuestion(); }
function openZoom() { playSnd('snd-click'); document.getElementById('fullImg').src = document.getElementById('q-image').src; document.getElementById('zoomModal').style.display = 'flex'; }
function closeZoom() { document.getElementById('zoomModal').style.display = 'none'; }

// Init execute trigger on viewport startup
loadQuizDataset();
  
