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

// Audio Objects
const correctAnswerSound = new Audio("./audio/correctAnswer.wav");
const wrongAnswerSound = new Audio("./audio/wrongAnswer.wav");
const ctx = new AudioContext();

// Game Settings
const maxRounds = 3;
let roundCount = 1;
let score = 0;

function initiateRound() {
  startGameButton.disabled = true;
  waveform.style.display = "block";
  if (roundCount <= maxRounds) {
    updateRoundDisplay();
    roundCount++;
    const { correctAnswer, wrongAnswer, randomGainVal } = generateAnswers();
    displayAnswers(correctAnswer, wrongAnswer);
    playAudio("audio/pop.mp3", randomGainVal, 2);
  } else {
    waveform.style.display = "none";
    playAgainButton.style.visibility = "visible";
    playAgainButton.addEventListener("click", resetGame);
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
  gainNode.gain.setValueAtTime(randomGainVal, ctx.currentTime + 4);
  audioSource.play();
  audioStream.connect(gainNode);
  gainNode.connect(ctx.destination);

  const answerButtonClickHandler = (e: MouseEvent) => {
    waveform.style.display = "none";
    const clickedButton = e.target as HTMLButtonElement;
    if (clickedButton.dataset.answer === "correct") {
      clickedButton.style.backgroundColor = "green";
      score += 1;
      scoreElem.textContent = score.toString();
      correctAnswerSound.play();
    } else {
      clickedButton.style.backgroundColor = "red";
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
  answerButtons.forEach((btn) => {
    btn.style.backgroundColor = "";
    startGameButton.disabled = false;
    roundCount = 1;
    score = 0;
    scoreElem.textContent = score.toString();
  });
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
    this.instructionsContainer.style.display = "none";
    initiateRound();
  }
}

new Instructions();
