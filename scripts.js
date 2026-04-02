const gameBoard = document.getElementById('game-board');
const totalPool = 34;
const pairsCount = 8; // For a 4x4 grid

let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard;
let matches = 0;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0;

    // Build image list based on your actual GitHub file extensions
    let images = [];
    for (let i = 1; i <= totalPool; i++) {
        if (i === 6 || i === 30) continue; // Skip logo and back card

        let ext = '.jpg'; // Default
        if ([1, 31, 32, 33, 34, 18].includes(i)) ext = '.jpeg';
        if ([29, 3, 7, 8, 9].includes(i)) ext = '.png';
        
        images.push(`${i}${ext}`);
    }

    // Shuffle and pick 8 pairs
    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name;
        card.innerHTML = `
            <img class="front-face" src="img/${name}">
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    document.getElementById('sound-flip').play();

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.id === secondCard.dataset.id;
    if (isMatch) {
        matches++;
        document.getElementById('sound-match').play();
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        document.getElementById('sound-mismatch').play();
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Countdown to Start
let timer = 5;
const startCounter = setInterval(() => {
    timer--;
    document.getElementById('count-num').innerText = timer;
    if (timer === 0) {
        clearInterval(startCounter);
        document.getElementById('intro-overlay').style.display = 'none';
        document.getElementById('bg-music').play();
        initGame();
    }
}, 1000);
