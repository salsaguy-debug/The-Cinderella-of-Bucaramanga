const gameBoard = document.getElementById('game-board');
const totalImagePool = 34; // Total images available
const cardsToMatch = 8;    // 8 pairs = 16 cards (4x4)

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchesFound = 0;

function initGame() {
    gameBoard.innerHTML = ''; // Clear board
    matchesFound = 0;
    
    // 1. Generate list of images (skipping 6 and 30)
    let availableImages = [];
    for (let i = 1; i <= totalImagePool; i++) {
        if (i !== 6 && i !== 30) {
            // Check for jpg vs jpeg extensions if needed
            let ext = (i === 18 || i === 19) ? '.jpeg' : '.jpg';
            availableImages.push(`${i}${ext}`);
        }
    }

    // 2. Randomly pick 8 images from the pool
    availableImages.sort(() => Math.random() - 0.5);
    let selectedSet = availableImages.slice(0, cardsToMatch);

    // 3. Duplicate and Shuffle
    let deck = [...selectedSet, ...selectedSet];
    deck.sort(() => Math.random() - 0.5);

    // 4. Inject into HTML
    deck.forEach(imgName => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.framework = imgName;

        card.innerHTML = `
            <img class="front-face" src="img/${imgName}">
            <div class="back-face"></div>
        `;

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');
    document.getElementById('sound-flip').play();

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchesFound++;
    document.getElementById('sound-match').play();

    if (matchesFound === cardsToMatch) {
        victoryCelebration();
    }
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    document.getElementById('sound-mismatch').play();
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function victoryCelebration() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    document.getElementById('win-modal').style.display = 'flex';
}

// Start the sequence
document.addEventListener('DOMContentLoaded', () => {
    // Start your countdown and overlay logic here as per your original file
    initGame(); 
});
