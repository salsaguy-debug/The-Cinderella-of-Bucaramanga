const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const moveDisplay = document.getElementById('move-counter');
const bestDisplay = document.getElementById('best-score');
const startBtn = document.getElementById('start-btn');

const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 56; 
const pairsCount = 8; 
let firstCard, secondCard, hasFlipped, lockBoard, matches, moves = 0;
let audioState = { bg: 0.5, sfx: 0.5, muted: false };

bestDisplay.innerText = localStorage.getItem('memoryGameBest') || '--';

function applyVolumes() {
    bgMusic.volume = audioState.muted ? 0 : audioState.bg;
    Object.values(sfx).forEach(s => { 
        if(s) s.volume = audioState.muted ? 0 : audioState.sfx; 
    });
}

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
        card.innerHTML = `
            <div class="front-face">
                <img src="img/${name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            </div>
            <div class="back-face"></div>`;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    if (bgMusic.paused) bgMusic.play().catch(()=>{});
    
    this.classList.add('flip');
    if (sfx.flip) { sfx.flip.currentTime = 0; sfx.flip.play(); }

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
        if (sfx.match) { sfx.match.currentTime = 0; sfx.match.play(); }
        if (matches === pairsCount) handleWin();
        resetTurn();
    } else {
        lockBoard = true;
        if (sfx.mismatch) { sfx.mismatch.currentTime = 0; sfx.mismatch.play(); }
        firstCard.classList.add('shake');
        secondCard.classList.add('shake');

        setTimeout(() => {
            firstCard.classList.remove('shake', 'flip');
            secondCard.classList.remove('shake', 'flip');
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

function toggleAudioModal() {
    const modal = document.getElementById('audio-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

function toggleMute() {
    audioState.muted = !audioState.muted;
    document.getElementById('mute-btn').innerText = audioState.muted ? 'Mute: ON' : 'Mute: OFF';
    applyVolumes();
}

let timer = 5;
const countdown = setInterval(() => {
    timer--;
    document.getElementById('count-num').innerText = timer;
    if (timer <= 0) {
        clearInterval(countdown);
        document.getElementById('timer-text').style.display = 'none';
        startBtn.style.display = 'inline-block';
    }
}, 1000);

startBtn.addEventListener('click', () => {
    document.getElementById('intro-overlay').style.display = 'none';
    applyVolumes();
    bgMusic.play().catch(() => {});
    initGame();
});

// Settings Listeners
document.getElementById('bg-music-slider').addEventListener('input', (e) => { 
    audioState.bg = e.target.value; 
    applyVolumes(); 
});
document.getElementById('sfx-slider').addEventListener('input', (e) => { 
    audioState.sfx = e.target.value; 
    applyVolumes(); 
});
document.getElementById('new-game-btn').addEventListener('click', initGame);
document.getElementById('play-again-btn').addEventListener('click', initGame);
