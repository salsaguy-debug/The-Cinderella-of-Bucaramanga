const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 35; 
const pairsCount = 8;
let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard, matches, moves;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    document.getElementById('move-counter').innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    let images = [];
    const version = new Date().getTime(); 

    for (let i = 1; i <= totalPool; i++) {
        // Skip 6 (Back) and 30 (Logo)
        if (i === 6 || i === 30) continue; 
        images.push(`${i}.png?v=${version}`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name.split('?')[0]; 
        card.innerHTML = `
            <div class="front-face">
                <img src="img/${name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    sfx.flip.play().catch(() => {});

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    document.getElementById('move-counter').innerText = moves;
    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.id === secondCard.dataset.id) {
        matches++;
        sfx.match.play().catch(() => {});
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        sfx.mismatch.play().catch(() => {});
        setTimeout(() => {
            if(firstCard) firstCard.classList.remove('flip');
            if(secondCard) secondCard.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetGame() { initGame(); }

function updateVolume(val) {
    bgMusic.volume = val;
    Object.values(sfx).forEach(s => s.volume = val);
}

function toggleMute() {
    const isMuted = !bgMusic.muted;
    bgMusic.muted = isMuted;
    Object.values(sfx).forEach(s => s.muted = isMuted);
    document.getElementById('mute-btn').innerText = isMuted ? '🔇' : '🔊';
}

// FIX: Improved Startup Sequence
let timer = 5;
const countNum = document.getElementById('count-num');
const introOverlay = document.getElementById('intro-overlay');

const startCounter = setInterval(() => {
    timer--;
    if (countNum) countNum.innerText = timer;
    
    if (timer <= 0) {
        clearInterval(startCounter);
        if (introOverlay) introOverlay.style.display = 'none';
        bgMusic.play().catch(() => {
            console.log("Audio waiting for user interaction");
        });
        initGame();
    }
}, 1000);
