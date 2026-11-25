const STORAGE_INDEX = "before-the-subtitle:index";
const STORAGE_SOUND = "before-the-subtitle:sound";
const STORAGE_ORDER = "before-the-subtitle:order";

const elements = {
  questionView: document.querySelector("#questionView"),
  scenePanel: document.querySelector("#scenePanel"),
  writingPanel: document.querySelector("#writingPanel"),
  revealPanel: document.querySelector("#revealPanel"),
  finishPanel: document.querySelector("#finishPanel"),
  sceneCount: document.querySelector("#sceneCount"),
  sceneNumber: document.querySelector("#sceneNumber"),
  plotHint: document.querySelector("#plotHint"),
  filmTitle: document.querySelector("#filmTitle"),
  previousLines: document.querySelector("#previousLines"),
  blankMarker: document.querySelector("#blankMarker"),
  blankChinese: document.querySelector("#blankChinese"),
  answerInput: document.querySelector("#answerInput"),
  characterCount: document.querySelector("#characterCount"),
  inputError: document.querySelector("#inputError"),
  submitButton: document.querySelector("#submitButton"),
  revealPanel: document.querySelector("#revealPanel"),
  yourAnswer: document.querySelector("#yourAnswer"),
  englishReference: document.querySelector("#englishReference"),
  professionalZh: document.querySelector("#professionalZh"),
  continuationBlock: document.querySelector("#continuationBlock"),
  followingLines: document.querySelector("#followingLines"),
  sourceDetails: document.querySelector("#sourceDetails"),
  nextButton: document.querySelector("#nextButton"),
  restartButton: document.querySelector("#restartButton"),
  soundToggle: document.querySelector("#soundToggle"),
  soundLabel: document.querySelector("#soundLabel"),
};

const state = {
  questions: [],
  allQuestions: [],
  index: new URLSearchParams(window.location.search).has("start") ? 0 : readIndex(),
  revealed: false,
  soundEnabled: storageGet(STORAGE_SOUND) !== "off",
};

let audioContext = null;

function storageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Direct file opening may disable local storage in some browsers.
  }
}

function readIndex() {
  const saved = Number.parseInt(storageGet(STORAGE_INDEX) ?? "0", 10);
  return Number.isFinite(saved) && saved >= 0 ? saved : 0;
}

function randomIndex(max) {
  if (window.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return Math.floor((buffer[0] / 2 ** 32) * max);
  }
  return Math.floor(Math.random() * max);
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function loadOrderedQuestions(questions, forceNewOrder = false) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  if (!forceNewOrder) {
    try {
      const savedIds = JSON.parse(storageGet(STORAGE_ORDER) || "[]");
      if (
        Array.isArray(savedIds) &&
        savedIds.length === questions.length &&
        savedIds.every((id) => byId.has(id))
      ) {
        return savedIds.map((id) => byId.get(id));
      }
    } catch {
      // Create a fresh order below.
    }
  }

  const shuffled = shuffleQuestions(questions);
  storageSet(STORAGE_ORDER, JSON.stringify(shuffled.map((question) => question.id)));
  return shuffled;
}

function updateSoundButton() {
  elements.soundToggle.setAttribute(
    "aria-pressed",
    String(state.soundEnabled),
  );
  elements.soundLabel.textContent = state.soundEnabled ? "Sound on" : "Sound off";
}

function ensureAudio() {
  if (!state.soundEnabled) return null;
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    audioContext = new Context();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(frequencies, duration = 0.12, volume = 0.025) {
  const context = ensureAudio();
  if (!context) return;
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(volume, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.16);
  master.connect(context.destination);

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 1 / frequencies.length;
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now + index * 0.045);
    oscillator.stop(now + duration + index * 0.045);
  });
}

function playRevealSound() {
  playTone([523.25, 659.25, 783.99], 0.11, 0.02);
}

function playNextSound() {
  playTone([329.63, 392], 0.07, 0.015);
}

function playErrorSound() {
  playTone([196], 0.08, 0.012);
}

function updateProgress() {
  const total = state.questions.length;
  const current = Math.min(state.index + 1, total);
  elements.sceneCount.textContent = `Scene ${current} / ${total}`;
}

function renderDialogueLines(container, lines, fallback) {
  container.replaceChildren();
  const entries = lines?.length ? lines : [{ speaker: "", line: fallback }];
  for (const entry of entries) {
    const paragraph = document.createElement("p");
    paragraph.className = "dialogue-line";
    if (entry.speaker) {
      const speaker = document.createElement("span");
      speaker.className = "dialogue-speaker";
      speaker.textContent = entry.speaker;
      paragraph.append(speaker);
    }
    const text = document.createElement("span");
    text.className = "dialogue-text";
    text.textContent = entry.line;
    paragraph.append(text);
    container.append(paragraph);
  }
}

function renderQuestion() {
  if (state.index >= state.questions.length) {
    showFinish();
    return;
  }

  const question = state.questions[state.index];
  state.revealed = false;
  elements.questionView.hidden = false;
  elements.finishPanel.hidden = true;
  elements.scenePanel.hidden = false;
  elements.writingPanel.hidden = false;
  elements.revealPanel.hidden = true;
  elements.answerInput.disabled = false;
  elements.answerInput.value = "";
  elements.inputError.textContent = "";
  elements.characterCount.textContent = "0 characters";
  elements.submitButton.hidden = false;
  elements.sceneNumber.textContent = `SCENE ${String(state.index + 1).padStart(2, "0")}`;
  elements.plotHint.textContent = question.plotHint;
  elements.filmTitle.textContent = `${question.film} · ${question.year}`;
  renderDialogueLines(
    elements.previousLines,
    question.dialogueBefore,
    "Listen to the scene before answering.",
  );
  elements.blankMarker.textContent = question.blank || "______";
  elements.blankChinese.textContent = question.professionalZh;
  renderDialogueLines(elements.followingLines, question.dialogueAfter, "");
  elements.continuationBlock.hidden = !question.dialogueAfter?.length;

  updateProgress();
  window.setTimeout(() => elements.answerInput.focus(), 80);
}

function revealAnswer() {
  if (state.revealed) return;
  const answer = elements.answerInput.value.trim();
  if (!answer) {
    elements.inputError.textContent = "Write your version before revealing the subtitle.";
    elements.answerInput.focus();
    playErrorSound();
    return;
  }

  const question = state.questions[state.index];
  state.revealed = true;
  elements.inputError.textContent = "";
  elements.answerInput.disabled = true;
  elements.submitButton.hidden = true;
  elements.yourAnswer.textContent = answer;
  elements.englishReference.textContent = question.englishReference;
  elements.professionalZh.textContent = question.professionalZh;

  const source = question.subtitleSource;
  elements.sourceDetails.innerHTML = `
    <p>
      ${source.provider}; Chinese subtitle by
      <a href="${source.chinesePage}" target="_blank" rel="noreferrer">${source.chineseUploader}</a>
      (${source.chineseTimecode}); English subtitle by
      <a href="${source.englishPage}" target="_blank" rel="noreferrer">${source.englishUploader}</a>
      (${source.englishTimecode}).
    </p>
    <p>English reference: <a href="${source.scriptPage}" target="_blank" rel="noreferrer">screenplay page</a>.</p>
  `;

  elements.revealPanel.hidden = false;
  playRevealSound();
  elements.revealPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function nextQuestion() {
  if (!state.revealed) return;
  playNextSound();
  state.index += 1;
  storageSet(STORAGE_INDEX, String(state.index));
  if (state.index >= state.questions.length) {
    showFinish();
    return;
  }
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showFinish() {
  updateProgress();
  elements.questionView.hidden = true;
  elements.finishPanel.hidden = false;
}

function restart() {
  playNextSound();
  state.index = 0;
  storageSet(STORAGE_INDEX, "0");
  state.questions = loadOrderedQuestions(state.allQuestions, true);
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function initialize() {
  updateSoundButton();
  try {
    const data = window.BEFORE_THE_SUBTITLE_QUESTIONS;
    if (!Array.isArray(data) || data.length < 50) {
      throw new Error("Question data is incomplete.");
    }
    state.allQuestions = data;
    state.questions = loadOrderedQuestions(data);
    if (state.index >= state.questions.length) {
      state.index = 0;
      storageSet(STORAGE_INDEX, "0");
    }
    renderQuestion();
  } catch (error) {
    elements.plotHint.textContent = "The question data could not be loaded.";
    elements.filmTitle.textContent = "Run this project through a local web server.";
    elements.previousLine.textContent = error.message;
    elements.writingPanel.hidden = true;
  }
}

elements.answerInput.addEventListener("input", () => {
  const length = elements.answerInput.value.trim().length;
  elements.characterCount.textContent = `${length} character${length === 1 ? "" : "s"}`;
  if (elements.inputError.textContent) elements.inputError.textContent = "";
});

elements.answerInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    revealAnswer();
  }
});

elements.submitButton.addEventListener("click", revealAnswer);
elements.nextButton.addEventListener("click", nextQuestion);
elements.restartButton.addEventListener("click", restart);
elements.soundToggle.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  storageSet(STORAGE_SOUND, state.soundEnabled ? "on" : "off");
  updateSoundButton();
  if (state.soundEnabled) playNextSound();
});

initialize();
