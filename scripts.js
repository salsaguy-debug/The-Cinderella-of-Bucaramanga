const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const moveDisplay = document.getElementById('move-counter');
const bestDisplay = document.getElementById('best-score');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 35; 
const pairsCount = 8; 
let firstCard, secondCard, hasFlipped, lockBoard, matches, moves = 0;
let timer = 5;
let audioState = { master: 0.5, bg: 0.5, sfx: 0.5, muted: false };

// --- CRITICAL AUDIO ENGINE FIX ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Update Best Score on load
const best = localStorage.getItem('memoryGameBest');
bestDisplay.innerText = best ? best : '--';

// Trigger music/context on ANY click
document.addEventListener('click', () => {
    initAudioContext();
    forcePlayMusic();
}, { once: false });

function forcePlayMusic() {
    applyVolumes();
    if (bgMusic.paused) {
        bgMusic.play()
            .then(() => console.log("OGG Music Playing Successfully"))
            .catch(err => console.log("Playback pending user interaction..."));
    }
}

function applyVolumes() {
    if (audioState.muted) {
        bgMusic.volume = 0;
        Object.values(sfx).forEach(s => s.volume = 0);
    } else {
        bgMusic.volume = audioState.bg * audioState.master;
        Object.values(sfx).forEach(s => s.volume = audioState.sfx * audioState.master);
    }
}

// --- Game Logic ---
function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    hasFlipped = false; lockBoard = false;
    moveDisplay.innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    let images = [];
    for (let i = 1; i <= totalPool; i++) {
        if (i === 3 || i === 30 || i === 40) continue; 
        images.push(`${i}.png`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name;
        card.innerHTML = `<div class="front-face"><img src="img/${name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div><div class="back-face"></div>`;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    
    // Attempt to wake up audio on every flip
    initAudioContext();
    forcePlayMusic();

    this.classList.add('flip');
    if (sfx.flip) sfx.flip.play();

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    moveDisplay.innerText = moves;
    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.id === secondCard.dataset.id) {
        matches++;
        if (sfx.match) sfx.match.play();
        if (matches === pairsCount) handleWin();
        resetTurn();
    } else {
        lockBoard = true;
        if (sfx.mismatch) sfx.mismatch.play();
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function handleWin() {
    confetti({ particleCount: 150, spread: 70 });
    const currentBest = localStorage.getItem('memoryGameBest');
    if (!currentBest || moves < parseInt(currentBest)) {
        localStorage.setItem('memoryGameBest', moves);
        bestDisplay.innerText = moves;
    }
    setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 600);
}

function resetTurn() { [hasFlipped, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }

document.getElementById('new-game-btn').addEventListener('click', () => { initGame(); forcePlayMusic(); });
document.getElementById('play-again-btn').addEventListener('click', () => { initGame(); forcePlayMusic(); });

// Countdown
const countdown = setInterval(() => {
    timer--;
    if (document.getElementById('count-num')) document.getElementById('count-num').innerText = timer;
    if (timer <= 0) {
        clearInterval(countdown);
        document.getElementById('intro-overlay').style.display = 'none';
        initGame();
    }
}, 1000);

// Audio Modal Toggles
function toggleAudioModal() {
    const modal = document.getElementById('audio-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}
function toggleMute() {
    audioState.muted = !audioState.muted;
    document.getElementById('mute-btn').innerText = audioState.muted ? 'Mute All: ON' : 'Mute All: OFF';
    applyVolumes();
}

// Listeners for Sliders
document.getElementById('master-slider').addEventListener('input', (e) => { audioState.master = e.target.value; applyVolumes(); });
document.getElementById('bg-music-slider').addEventListener('input', (e) => { audioState.bg = e.target.value; applyVolumes(); });
document.getElementById('sfx-slider').addEventListener('input', (e) => { audioState.sfx = e.target.value; applyVolumes(); });
