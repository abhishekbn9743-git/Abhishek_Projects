// script.js - main application logic for TypePulse

// ------ helpers ------
function $(selector) {
    return document.querySelector(selector);
}
function $all(selector) {
    return document.querySelectorAll(selector);
}

// tab navigation
$all('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $all('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $all('.module').forEach(m => m.classList.remove('active'));
        const id = tab.id.replace('tab-','');
        document.getElementById(id === 'meter' ? 'speedometer-module' : id).classList.add('active');
    });
});

// ----------------- MODULE 1: Typing Speed Test -----------------
const paragraphs = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing speed tests are a great way to practice your keyboard skills.",
    "Consistency and practice lead to improvement over time.",
    "Javascript makes it possible to add interactivity to web pages.",
    "A modern UI with glassmorphism feels sleek and futuristic."
];
let testTimer;
let timeLeft = 60;
let testDuration = 60;
let testStarted = false;
let totalTyped = 0;
let correctTyped = 0;
let mistakes = 0;
let highWpm = localStorage.getItem('tp-high-wpm') || 0; // store high score

// apply high score display
document.addEventListener('DOMContentLoaded', () => {
    $('#hs-wpm').textContent = highWpm;
});

function loadParagraph() {
    const para = paragraphs[Math.floor(Math.random()*paragraphs.length)];
    const container = $('#paragraph-container');
    container.innerHTML = '';
    para.split('').forEach(ch => {
        const span = document.createElement('span');
        span.textContent = ch;
        container.appendChild(span);
    });
}

function animateValue(el, start, end, duration=500) {
    const range = end - start;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        el.textContent = Math.round(start + range * progress);
        if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}

function updateTestStats() {
    const elapsed = testDuration - timeLeft;
    const minutes = elapsed / 60;
    const wpm = minutes > 0 ? Math.round((correctTyped/5)/minutes) : 0;
    const cpm = minutes > 0 ? Math.round(correctTyped/minutes) : 0;
    const accuracy = totalTyped > 0 ? Math.round((correctTyped/totalTyped)*100) : 0;
    animateValue($('#wpm'), parseInt($('#wpm').textContent,10), wpm);
    animateValue($('#cpm'), parseInt($('#cpm').textContent,10), cpm);
    animateValue($('#accuracy'), parseInt($('#accuracy').textContent,10), accuracy);
}

function endTest() {
    clearInterval(testTimer);
    $('#test-input').disabled = true;
    $('#restart-test').disabled = false;
    $('#result-card').classList.remove('hidden');
    const finalWpm = parseInt($('#wpm').textContent,10);
    $('#res-wpm').textContent = finalWpm;
    $('#res-accuracy').textContent = $('#accuracy').textContent;
    $('#res-chars').textContent = totalTyped;
    $('#res-mistakes').textContent = mistakes;
    // high score update
    if (finalWpm > highWpm) {
        highWpm = finalWpm;
        localStorage.setItem('tp-high-wpm', highWpm);
        $('#hs-wpm').textContent = highWpm;
        flashHighscore();
    }
    showConfetti();
}

function flashHighscore() {
    const el = $('#hs-wpm');
    el.classList.add('flash');
    setTimeout(()=>el.classList.remove('flash'),1000);
}

function showConfetti() {
    const container = $('#confetti-container');
    for (let i=0;i<100;i++) {
        const div = document.createElement('div');
        div.className='confetti';
        div.style.left=Math.random()*100+'%';
        div.style.background=['#f87171','#4ade80','#3b82f6','#fbbf24','#a78bfa'][Math.floor(Math.random()*5)];
        container.appendChild(div);
        setTimeout(()=>div.remove(),3000);
    }
}

$('#duration-select').addEventListener('change', (e) => {
    testDuration = parseInt(e.target.value, 10);
    timeLeft = testDuration;
    $('#time').textContent = timeLeft;
});

$('#start-test').addEventListener('click', () => {
    if (testStarted) return;
    testStarted = true;
    totalTyped = 0;
    correctTyped = 0;
    mistakes = 0;
    timeLeft = testDuration;
    $('#time').textContent = timeLeft;
    $('#test-input').value = '';
    $('#test-input').disabled = false;
    $('#test-input').focus();
    $('#restart-test').disabled = true;
    $('#result-card').classList.add('hidden');
    loadParagraph();

    // reset progress bar
    $('#time-bar').style.width = '100%';

    testTimer = setInterval(() => {
        timeLeft--;
        $('#time').textContent = timeLeft;
        $('#time-bar').style.width = (timeLeft / testDuration * 100) + '%';
        updateTestStats();
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
});

$('#restart-test').addEventListener('click', () => {
    testStarted = false;
    $('#start-test').click();
});

$('#test-input').addEventListener('input', () => {
    const input = $('#test-input').value;
    const spans = $all('#paragraph-container span');
    totalTyped = input.length;
    correctTyped = 0;
    mistakes = 0;
    spans.forEach((span, idx) => {
        const char = input[idx];
        if (char == null) {
            span.className = '';
        } else if (char === span.textContent) {
            span.className = 'correct';
            correctTyped++;
        } else {
            span.className = 'incorrect';
            mistakes++;
        }
    });
    updateTestStats();
});

// ----------------- MODULE 2: Typing Speed Checker -----------------
let checkerStart = null;
let checkerKeystrokes = 0;
let checkerCorrect = 0; // assume all keystrokes correct for simplicity (no target text)
let checkerTotals = [];

$('#checker-input').addEventListener('input', (e) => {
    if (!checkerStart) checkerStart = Date.now();
    checkerKeystrokes++;
    const elapsed = (Date.now() - checkerStart) / 1000; // seconds
    const minutes = elapsed/60;
    const chars = $('#checker-input').value.length;
    const wpm = minutes>0 ? Math.round((chars/5)/minutes) : 0;
    const cpm = minutes>0 ? Math.round(chars/minutes) : 0;
    const accuracy = Math.round((chars>0? (chars/chars):1)*100);
    $('#ks-count').textContent = checkerKeystrokes;
    $('#ck-wpm').textContent = wpm;
    $('#ck-cpm').textContent = cpm;
    $('#ck-accuracy').textContent = accuracy;
    // record for chart
    checkerTotals.push({t:elapsed, wpm});
    drawChart();
});

// add clear button feature
function addCheckerClear() {
    const btn = document.createElement('button');
    btn.textContent = 'Reset';
    btn.className = 'controls';
    btn.addEventListener('click', () => {
        $('#checker-input').value = '';
        checkerStart = null;
        checkerKeystrokes = 0;
        checkerTotals = [];
        drawChart();
        $('#ks-count').textContent = 0;
        $('#ck-wpm').textContent = 0;
        $('#ck-cpm').textContent = 0;
        $('#ck-accuracy').textContent = 0;
    });
    document.getElementById('speed-checker').appendChild(btn);
}

addCheckerClear();

window.addEventListener('resize', drawChart);


function drawChart() {
    const canvas = $('#speed-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (checkerTotals.length < 2) return;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const maxTime = checkerTotals[checkerTotals.length-1].t;
    const maxWpm = Math.max(...checkerTotals.map(o=>o.wpm),10);
    checkerTotals.forEach((pt,i)=>{
        const x = (pt.t/maxTime)*(canvas.width-10)+5;
        const y = canvas.height - ((pt.wpm/maxWpm)*(canvas.height-10)+5);
        if (i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    });
    ctx.stroke();
}

// ----------------- MODULE 3: Live Typing Speedometer -----------------
let globalChars = 0;
let globalStart = null;
let lastActivity = 0;

function animateMeter(canvas, targetWpm) {
    const start = canvas._lastWpm || 0;
    const stepCount = 20;
    let step=0;
    function draw(current) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0,0,w,h);
        const radius = w/2 - 10;
        // background
        ctx.beginPath();
        ctx.arc(w/2, h/2, radius, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
        const ang = Math.min(current/100,1) * Math.PI;
        ctx.beginPath();
        ctx.arc(w/2, h/2, radius, Math.PI, Math.PI + ang, false);
        const grad = ctx.createLinearGradient(0,0,w,0);
        grad.addColorStop(0,'#f97316');
        grad.addColorStop(0.5,'#f59e0b');
        grad.addColorStop(0.75,'#4ade80');
        grad.addColorStop(1,'#3b82f6');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.fillStyle = '#e5e7eb';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(current) + ' WPM', w/2, h/2);
    }
    function animate() {
        step++;
        const progress = step/stepCount;
        const current = start + (targetWpm - start)*progress;
        draw(current);
        if (step < stepCount) requestAnimationFrame(animate);
        else canvas._lastWpm = targetWpm;
    }
    animate();
}


function globalKeyHandler() {
    if (!globalStart) globalStart = Date.now();
    globalChars++;
    lastActivity = Date.now();
    updateActivityIndicator();
    const elapsed = (Date.now() - globalStart) / 1000;
    const minutes = elapsed/60;
    const wpm = minutes>0 ? Math.round((globalChars/5)/minutes) : 0;
    // update both meters
    animateMeter($('#meter-canvas'), wpm);
    animateMeter($('#float-meter'), wpm);
    $('#float-wpm').textContent = wpm;
}

document.addEventListener('keydown', globalKeyHandler);

document.addEventListener('mousedown', () => { /* placeholder */ });

function updateActivityIndicator() {
    const now = Date.now();
    if (now - lastActivity < 1000) {
        $('#activity-indicator').classList.add('active');
        $('#float-activity').classList.add('active');
    } else {
        $('#activity-indicator').classList.remove('active');
        $('#float-activity').classList.remove('active');
    }
}
setInterval(updateActivityIndicator, 500);

// toggle floating widget
$('#toggle-floating').addEventListener('click', () => {
    $('#floating-widget').classList.toggle('hidden');
});

// draggable widget
(function() {
    const widget = $('#floating-widget');
    let isDragging = false;
    let startX, startY, origX, origY;
    widget.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = widget.getBoundingClientRect();
        origX = rect.left;
        origY = rect.top;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        widget.style.left = (origX + dx) + 'px';
        widget.style.top = (origY + dy) + 'px';
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
    // touch
    widget.addEventListener('touchstart', (e) => {
        isDragging = true;
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        const rect = widget.getBoundingClientRect();
        origX = rect.left;
        origY = rect.top;
    });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        let dx = t.clientX - startX;
        let dy = t.clientY - startY;
        widget.style.left = (origX + dx) + 'px';
        widget.style.top = (origY + dy) + 'px';
    });
    document.addEventListener('touchend', () => { isDragging = false; });
})();

// close floating
$('#close-widget').addEventListener('click', () => {
    $('#floating-widget').classList.add('hidden');
});

// initialize on load
// theme setup
function setTheme(mode) {
    if (mode==='light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
    localStorage.setItem('tp-theme', mode);
}

document.addEventListener('DOMContentLoaded', () => {
    // initial components
    loadParagraph();
    animateMeter($('#meter-canvas'),0);
    animateMeter($('#float-meter'),0);
    // load theme
    const saved = localStorage.getItem('tp-theme') || 'dark';
    setTheme(saved);
    $('#theme-toggle').addEventListener('click', () => {
        const newMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        setTheme(newMode);
    });
});
