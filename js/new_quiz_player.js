// URL Parameters parsing logic
const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get('subject'); 
const branch = decodeURIComponent(urlParams.get('branch')) || ""; 
const branchFolder = urlParams.get('branchFolder') || ""; 
const type = urlParams.get('type') || "Quiz";
const quizNo = urlParams.get('no') || "1";

if (!subject) {
    alert("કોઈ વિષય પસંદ કરેલ નથી! કૃપા કરીને ફરીથી પ્રયાસ કરો.");
    window.location.href = 'index.html';
}

const cleanBranchTitle = branch.split('(')[0].trim();
document.getElementById('quiz-title').innerText = `${cleanBranchTitle} - ${type} ${quizNo}`;

var quizData = []; 
var currentIdx = 0; 
var score = 0; 
var answered = false;
var timeLeft = 600; 
var isReview = false; 
var userChoices = [];
var isMuted = false; 
var timerInterval;

// Audio System Wrapper
function playSnd(id) { 
    if (isMuted) return; 
    var s = document.getElementById(id); 
    if(s) {
        s.currentTime = 0; 
        s.play().catch(e => console.log("Audio block mechanism handled")); 
    }
}

function toggleMute() { 
    isMuted = !isMuted; 
    document.getElementById('mute-toggle').innerText = isMuted ? "🔇" : "🔊"; 
}

// Countdown Engine
function startCountdown() {
    clearInterval(timerInterval);
    timerInterval = setInterval(function() {
        if(isReview) return;
        timeLeft--;
        var mins = Math.floor(timeLeft / 60); 
        var secs = timeLeft % 60;
        document.getElementById('timer-display').innerText = "⌛ " + (mins < 10 ? "0"+mins : mins) + ":" + (secs < 10 ? "0"+secs : secs);
        if (timeLeft <= 0) { 
            clearInterval(timerInterval); 
            autoSaveScore(); 
            showFinalPage(); 
        }
    }, 1000);
}

// Core Question Loader Block
function loadQuestion() {
    answered = false;
    window.scrollTo(0, 0);

    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const explainBtn = document.getElementById('explain-btn');
    
    nextBtn.style.display = isReview ? 'block' : 'none';
    explainBtn.style.display = 'none';
    document.getElementById('review-tag').style.display = isReview ? 'block' : 'none';
    
    // Back navigation visual lock rules
    if (backBtn) {
        backBtn.style.display = (currentIdx > 0 && !isReview) ? 'block' : 'none';
    }

    if (currentIdx === quizData.length - 1) {
        nextBtn.innerText = "Submit";
    } else {
        nextBtn.innerText = "Next ➔";
    }

    // 🎯 DYNAMIC LIFELINE ENGINE: Har question par check karega aur strict state maintain karega
    var lifelineBtn = document.getElementById('fifty-fifty');
    if (lifelineBtn) {
        lifelineBtn.style.display = isReview ? 'none' : 'block';
        
        // 🔒 Back button protection: Agar jawab pehle se saved hai ya review hai, toh locked, warna hamesha free active!
        if (isReview || userChoices[currentIdx] !== undefined) {
            lifelineBtn.disabled = true;
        } else {
            lifelineBtn.disabled = false; 
        }
    }

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
    
    // Options grid alignment processor
    var btns = document.querySelectorAll('.option-btn');
    btns.forEach(function(btn, i) {
        btn.textContent = data.options[i];
        btn.className = 'option-btn'; 
        btn.style.display = 'block'; 
        btn.disabled = isReview;
        
        if(!isReview && userChoices[currentIdx] !== undefined) {
            answered = true;
            nextBtn.style.display = 'block';
            if(quizData[currentIdx].explanation) explainBtn.style.display = 'block';
            if(i === data.correct) btn.classList.add('correct');
            if(userChoices[currentIdx] === i && i !== data.correct) btn.classList.add('wrong');
            btn.disabled = true;
        }

        if(isReview) {
            if(i === data.correct) btn.classList.add('correct');
            if(userChoices[currentIdx] === i && i !== data.correct) btn.classList.add('wrong');
        }
    });
}

// Back Navigation Processor
function handleBackQuestion() {
    if (currentIdx > 0 && !isReview) {
        playSnd('snd-click');
        var correct = quizData[currentIdx - 1].correct;
        if(userChoices[currentIdx - 1] === correct && score > 0) {
            score--;
        }
        currentIdx--;
        loadQuestion();
        document.getElementById('score-display').innerText = "Score: " + score;
    }
}

// User Answer Handler
function handleChoice(idx) {
    if (answered || isReview) return;
    answered = true; 
    userChoices[currentIdx] = idx;
    var correct = quizData[currentIdx].correct;
    var btns = document.querySelectorAll('.option-btn');
    
    // Answer dete hi lifeline immediate disabled ho jani chahiye
    var lifelineBtn = document.getElementById('fifty-fifty');
    if(lifelineBtn) lifelineBtn.disabled = true;
    
    if(idx === correct) { 
        btns[idx].classList.add('correct'); 
        score++; 
        playSnd('snd-correct'); 
    } else { 
        btns[idx].classList.add('wrong'); 
        btns[correct].classList.add('correct'); 
        playSnd('snd-wrong'); 
    }
    
    document.getElementById('score-display').innerText = "Score: " + score;
    if(quizData[currentIdx].explanation) { 
        document.getElementById('explain-btn').style.display = 'block'; 
    }
    document.getElementById('next-btn').style.display = 'block';
}

// Explanations View Trigger
function openExplain() {
    playSnd('snd-click');
    var data = quizData[currentIdx];
    document.getElementById('explain-text').innerText = data.explanation || "No explanation available.";
    document.getElementById('explainModal').style.display = 'flex';
}
function closeExplain() { 
    document.getElementById('explainModal').style.display = 'none'; 
}

// 🎭 50:50 Lifeline Calculation (Works on single questions independently)
function useFiftyFifty() {
    if(answered || isReview || userChoices[currentIdx] !== undefined) return;
    playSnd('snd-click');
    
    var lifelineBtn = document.getElementById('fifty-fifty');
    if(lifelineBtn) lifelineBtn.disabled = true; // Lock immediately for current question
    
    var correct = quizData[currentIdx].correct;
    var btns = document.querySelectorAll('.option-btn');
    var indices = [0, 1, 2, 3].filter(function(i) { return i !== correct; }).sort(function() { return Math.random() - 0.5; });
    
    btns[indices[0]].style.display = 'none'; 
    btns[indices[1]].style.display = 'none';
}

// Next Step Action Route
function handleNext() {
    playSnd('snd-click');
    if(currentIdx === quizData.length - 1) { 
        clearInterval(timerInterval); 
        if(!isReview) { autoSaveScore(); } 
        showFinalPage(); 
        return; 
    }
    currentIdx++;
    loadQuestion();
}

// 🔒 CRITICAL FIX: Har baar naya score overwrite save karega bina kisi max-condition ke!
function autoSaveScore() {
    var finalPercent = Math.round((score / quizData.length) * 100) || 0;
    let scoreKey = `${subject}_${branch}_${type}_${quizNo}_score`;
    localStorage.setItem(scoreKey, finalPercent);
}

// Show Final Performance Screen
function showFinalPage() {
    playSnd('snd-finish');
    document.getElementById('game-ui').style.display = 'none';
    
    const finalUi = document.getElementById('final-ui');
    finalUi.style.display = 'flex';
    finalUi.style.flexDirection = 'column';
    finalUi.style.justifyContent = 'center';
    finalUi.style.alignItems = 'center';
    finalUi.style.minHeight = '60vh'; 

    var percent = Math.round((score / quizData.length) * 100) || 0;
    var msg = ""; 
    var color = "";
    if(percent === 100) { msg = "🌟 PERFECT! Brilliant Job!"; color = "#22c55e"; }
    else if(percent >= 70) { msg = "👏 Great Job! Almost there!"; color = "#2563eb"; }
    else if(percent >= 40) { msg = "📚 Good effort! Keep practicing!"; color = "#fbbf24"; }
    else { msg = "💪 Don't give up! Try again!"; color = "#ef4444"; }
    
    var msgDiv = document.getElementById('final-msg');
    msgDiv.innerText = msg; 
    msgDiv.style.color = color;
    document.getElementById('final-score').innerText = "Result: " + score + "/" + quizData.length + " (" + percent + "%)";
}

function saveAndGoHome() {
    localStorage.setItem('last_active_subject', subject);
    localStorage.setItem('last_active_branch', branch);
    localStorage.setItem('last_active_type', type);
    window.location.href = 'index.html';
}

// Absolute Restart Machine
function restartQuizFresh() {
    playSnd('snd-click');
    currentIdx = 0; 
    score = 0; 
    answered = false; 
    timeLeft = 600; 
    isReview = false; 
    userChoices = [];
    
    document.getElementById('score-display').innerText = "Score: 0";
    document.getElementById('game-ui').style.display = 'block';
    document.getElementById('final-ui').style.display = 'none';
    
    startCountdown();
    loadQuestion();
}

function startReview() { 
    playSnd('snd-click'); 
    isReview = true; 
    currentIdx = 0; 
    document.getElementById('game-ui').style.display = 'block'; 
    document.getElementById('final-ui').style.display = 'none'; 
    loadQuestion(); 
}

function openZoom() { 
    playSnd('snd-click'); 
    document.getElementById('fullImg').src = document.getElementById('q-image').src; 
    document.getElementById('zoomModal').style.display = 'flex'; 
}
function closeZoom() { 
    document.getElementById('zoomModal').style.display = 'none'; 
}

// Initial Kickstart
async function loadQuizDataset() {
    try {
        const response = await fetch(`data/${subject}/${branchFolder}/${type}_${quizNo}.json?v=${new Date().getTime()}`);
        if(!response.ok) throw new Error("File not found");
        quizData = await response.json();
        
        startCountdown();
        loadQuestion();
    } catch (err) {
        alert("Quiz data file load nahi ho saki! Path check kijiye.");
        window.location.href = 'index.html';
    }
}

loadQuizDataset();
