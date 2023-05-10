import { generateRandomGainVal } from "./utilities";
("use strict");
// DOM Elements
const startGameButton = document.querySelector(
  "#start-game-btn"
) as HTMLButtonElement;
const answerButtonContainer = document.querySelector(
  "#answer-buttons"
) as HTMLDivElement;
const answerButtons = document.querySelectorAll(
  ".answer-buttons__btn"
) as NodeListOf<HTMLButtonElement>;
const currentRoundElem = document.querySelector(
  "#current-round"
) as HTMLSpanElement;
const totalRoundsElem = document.querySelector(
  "#total-rounds"
) as HTMLSpanElement;
const scoreElem = document.querySelector("#score") as HTMLParagraphElement;
const playAgainButton = document.querySelector(
  "#play-again-btn"
) as HTMLButtonElement;
const muteButton = document.querySelector("#mute-btn") as HTMLImageElement;
const waveform = document.getElementById("waveform") as HTMLImageElement;
const beforeGainBtn = document.getElementById(
  "before-gain-btn"
) as HTMLButtonElement;
const afterGainBtn = document.getElementById(
  "after-gain-btn"
) as HTMLButtonElement;
const playAgainContainer = document.getElementById(
  "play-again-container"
) as HTMLDivElement;
const finalScoreDisplay = document.getElementById(
  "final-score-display"
) as HTMLSpanElement;

// Audio Objects
const correctAnswerSound = new Audio("./audio/correctAnswer.wav");
const wrongAnswerSound = new Audio("./audio/wrongAnswer.wav");
const ctx = new AudioContext();

// Game Settings
const maxRounds = 5;
let roundCount = 1;
let score = 0;

function initiateRound() {
  startGameButton.disabled = true;
  waveform.style.display = "block";
  waveform.style.visibility = "visible";
  if (roundCount <= maxRounds) {
    muteButton.style.display = "block";
    beforeGainBtn.style.display = "block";
    afterGainBtn.style.display = "block";
    answerButtons.forEach((btn) => {
      btn.style.display = "block";
    });
    updateRoundDisplay();
    roundCount++;
    const { correctAnswer, wrongAnswer, randomGainVal } = generateAnswers();
    displayAnswers(correctAnswer, wrongAnswer);
    playAudio("audio/pop.mp3", randomGainVal, 2);
  } else {
    muteButton.style.display = "none";
    finalScoreDisplay.textContent = score.toString();
    waveform.style.visibility = "hidden";
    playAgainButton.style.visibility = "visible";
    playAgainContainer.style.visibility = "visible";
    playAgainButton.addEventListener("click", resetGame);
    beforeGainBtn.style.display = "none";
    afterGainBtn.style.display = "none";
    answerButtons.forEach((btn) => {
      btn.style.display = "none";
    });
  }
}

function updateRoundDisplay() {
  currentRoundElem.textContent = roundCount.toString();
  totalRoundsElem.textContent = maxRounds.toString();
}

function generateAnswers() {
  const randomGainVal = generateRandomGainVal();
  const correctAnswer = parseFloat((1 - randomGainVal).toFixed(1));
  let wrongAnswer = generateRandomGainVal();
  while (wrongAnswer === correctAnswer) {
    wrongAnswer = generateRandomGainVal();
  }
  return { correctAnswer, wrongAnswer, randomGainVal };
}

function displayAnswers(correctAnswer: number, wrongAnswer: number) {
  const correctButtonIndex = Math.round(Math.random());
  answerButtons.forEach((button, index) => {
    button.style.backgroundColor = "";
    button.style.color = "#000";
    if (index === correctButtonIndex) {
      button.textContent = correctAnswer.toString();
      button.dataset.answer = "correct";
    } else {
      button.textContent = wrongAnswer.toString();
      button.dataset.answer = "wrong";
    }
  });
}

function playAudio(audioSrc: string, randomGainVal: number, duration: number) {
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const audioSource = new Audio(audioSrc);
  const audioStream = ctx.createMediaElementSource(audioSource);
  const gainNode = ctx.createGain();
  gainNode.gain.value = 1;
  toggleGainChange(gainNode, randomGainVal, ctx.currentTime);
  beforeGainBtn.style.color = "#fff";
  beforeGainBtn.style.textDecoration = "underline";
  afterGainBtn.style.color = "#c6c0c0";
  audioSource.play();
  audioStream.connect(gainNode);
  gainNode.connect(ctx.destination);

  const answerButtonClickHandler = (e: MouseEvent) => {
    waveform.style.visibility = "hidden";
    const clickedButton = e.target as HTMLButtonElement;
    if (clickedButton.dataset.answer === "correct") {
      clickedButton.style.backgroundColor = "green";
      clickedButton.style.color = "#fff";
      score += 1;
      scoreElem.textContent = score.toString();
      correctAnswerSound.play();
    } else {
      clickedButton.style.backgroundColor = "red";
      clickedButton.style.color = "#fff";
      wrongAnswerSound.play();
    }
    audioSource.pause();
    answerButtonContainer.removeEventListener(
      "click",
      answerButtonClickHandler
    );
    setTimeout(initiateRound, duration * 1000);
  };

  const toggleSound = () => {
    audioSource.muted = !audioSource.muted;
    if (audioSource.muted) {
      muteButton.src = "images/mute.svg";
    } else {
      muteButton.src = "images/speaker.svg";
    }
  };

  answerButtonContainer.addEventListener("click", answerButtonClickHandler);

  muteButton.removeEventListener("click", toggleSound);
  muteButton.addEventListener("click", toggleSound);
}

function resetGame() {
  playAgainButton.style.visibility = "hidden";
  playAgainContainer.style.visibility = "hidden";

  answerButtons.forEach((btn) => {
    btn.style.backgroundColor = "";
  });
  roundCount = 1;
  score = 0;
  scoreElem.textContent = score.toString();
  initiateRound();
}

class Instructions {
  private startButton: HTMLButtonElement;
  private instructionsContainer: HTMLDivElement;

  constructor() {
    this.startButton = document.getElementById(
      "start-game-btn"
    ) as HTMLButtonElement;

    this.instructionsContainer = document.getElementById(
      "instructions-container"
    ) as HTMLDivElement;

    this.startButton.addEventListener("click", this.startGame.bind(this));
  }

  private startGame(): void {
    this.instructionsContainer.style.transition = "all 0.5s ease";
    setTimeout(() => {
      this.instructionsContainer.style.opacity = "0";
      setTimeout(() => {
        this.instructionsContainer.style.display = "none";
        this.instructionsContainer.style.opacity = "1";
      }, 500);
    }, 0);
    initiateRound();
  }
}

new Instructions();

function toggleGainChange(
  gainNode: GainNode,
  randomGainVal: number,
  currTime: number
) {
  afterGainBtn.addEventListener("click", () => {
    if (gainNode.gain.value === 1) {
      gainNode.gain.setValueAtTime(randomGainVal, currTime);
    }

    afterGainBtn.style.color = "#fff";
    afterGainBtn.style.textDecoration = "underline";
    beforeGainBtn.style.color = "#c6c0c0";
    beforeGainBtn.style.textDecoration = "none";
  });
  beforeGainBtn.addEventListener("click", () => {
    if (gainNode.gain.value !== 1) {
      gainNode.gain.setValueAtTime(1, currTime);
    }
    afterGainBtn.style.color = "#c6c0c0";
    afterGainBtn.style.textDecoration = "none";
    beforeGainBtn.style.color = "#fff";
    beforeGainBtn.style.textDecoration = "underline";
  });
}
