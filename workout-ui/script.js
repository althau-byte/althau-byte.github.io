// --- URL PARAMS -------------------------------------------------------------

const params = new URLSearchParams(window.location.search);
const duration = parseInt(params.get("duration")) || 300;
const routineJSON = params.get("routine");
const musicEnabled = params.get("music") === "true";

let routine = null;

try {
  routine = JSON.parse(routineJSON);
} catch (e) {
  console.error("Invalid routine JSON", e);
}

// --- DOM ELEMENTS -----------------------------------------------------------

const routineText = document.getElementById("routine-text");
const exerciseName = document.getElementById("exercise-name");
const nextExercise = document.getElementById("next-exercise");
const timeDisplay = document.getElementById("time-display");
const progress = document.getElementById("progress");
const startBtn = document.getElementById("start-btn");
const musicBtn = document.getElementById("music-btn");

// --- INITIAL STATE ----------------------------------------------------------

let currentIndex = 0;
let currentTime = 0;
let interval = null;

// Show intro / formatted text if present
if (routine?.formatted) {
  routineText.textContent = routine.formatted;
} else {
  routineText.textContent = "Get ready for your workout!";
}

// Music toggle (Spotify handled by your bot; this is just UI state)
let musicOn = musicEnabled;
musicBtn.textContent = musicOn ? "Music: ON" : "Music: OFF";

musicBtn.onclick = () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? "Music: ON" : "Music: OFF";
  // If you later wire this to your bot, you can postMessage or call an API here.
};

// --- HELPERS ----------------------------------------------------------------

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function updateNextExerciseLabel() {
  if (!routine || !routine.routine) {
    nextExercise.textContent = "";
    return;
  }

  if (currentIndex + 1 < routine.routine.length) {
    const next = routine.routine[currentIndex + 1];
    nextExercise.textContent = "Next: " + next.name;
  } else {
    nextExercise.textContent = "Next: —";
  }
}

// --- WORKOUT FLOW -----------------------------------------------------------

startBtn.onclick = () => {
  startBtn.style.display = "none";
  startExercise();
};

function startExercise() {
  if (!routine || !routine.routine || routine.routine.length === 0) {
    exerciseName.textContent = "No routine data.";
    nextExercise.textContent = "";
    return;
  }

  const exercise = routine.routine[currentIndex];
  exerciseName.textContent = exercise.name;

  // Next exercise preview
  updateNextExerciseLabel();

  currentTime = exercise.duration;

  // Initialize display for this exercise
  timeDisplay.textContent = formatTime(currentTime);
  progress.style.width = "0%";

  interval = setInterval(() => {
    currentTime--;
    timeDisplay.textContent = formatTime(currentTime);

    const total = exercise.duration;
    const pct = ((total - currentTime) / total) * 100;
    progress.style.width = pct + "%";

    if (currentTime <= 0) {
      clearInterval(interval);
      currentIndex++;

      if (currentIndex < routine.routine.length) {
        startExercise();
      } else {
        // Workout complete
        exerciseName.textContent = "Workout Complete!";
        nextExercise.textContent = "";
        timeDisplay.textContent = "0:00";
        progress.style.width = "100%";
      }
    }
  }, 1000);
}
