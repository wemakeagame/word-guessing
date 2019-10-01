const config = {
  MAX_HINTS: 3,
  MAX_CHANGES: 9,
  URL: "https://api.predic8.de:443/shop/products/",
  MOCK_FRUITS: ["Apple", "Orange", "WaterMellon", "Mellon"]
};

let totalHints;
let totalChances;
let currentWord;
let fruits;

const hintButton = document.getElementById("hintButton");
const newWordButton = document.getElementById("newWordButton");
hintButton.addEventListener("click", showHint.bind(this));
newWordButton.addEventListener("click", getNewWord);

(function() {
  getNewWord();
})();

function getNewWord() {
  if (fruits) {
    setupGame();
  } else {
    const Http = new XMLHttpRequest();
    currentWord = null;
    Http.open("GET", config.URL);
    Http.send();

    Http.onreadystatechange = function() {
      if (Http.responseText && !currentWord) {
        const data = JSON.parse(Http.responseText);
        fruits = data.products.map(p => p.name);
      } else {
        fruits = config.MOCK_FRUITS;
      }
      setupGame();
    };
  }
}

function setupGame() {
  currentWord = fruits[Math.floor(Math.random() * fruits.length)].toUpperCase();

  totalHints = config.MAX_HINTS;
  totalChances = config.MAX_CHANGES;

  createInputs.bind(this)();
  setupUI(totalChances, totalHints);
}

function createInputs() {
  const inputs = document.getElementsByClassName("inputs")[0];
  const guessed = document.getElementsByClassName("guessed-letters")[0];

  inputs.innerHTML = "";
  guessed.innerHTML = "";
  setEndGameMessage("");

  if (!currentWord) return;

  console.log(currentWord);

  for (let i = 0; i < currentWord.length; i++) {
    const input = document.createElement("input");
    const span = document.createElement("span");

    input.data = { position: i, correctSpan: span };
    input.addEventListener("keyup", validateInput.bind(this));
    inputs.appendChild(input);

    span.textContent = " ";
    guessed.appendChild(span);

    if (currentWord[i] === " ") {
      input.value = " ";
      input.disabled = true;
    }
  }

  hintButton.disabled = false;
}

function setupUI(chances, hints) {
  const chancesNode = document.getElementById("chances");
  const hintsNode = document.getElementById("hints");
  chancesNode.textContent = chances;
  hintsNode.textContent = hints;
}

function validateInput(event) {
  const pattern = /[a-zA-Z]/;
  const input = event.target;

  if (!event.key.match(pattern)) {
    input.value = "";
  }

  if (input.value.length > 1) {
    input.value = event.key;
  }

  checkInput(input);
}

function checkInput(input) {
  const value = input.value.toUpperCase();
  const index = input.data.position;
  if (value === currentWord[index]) {
    input.className = "correct";
    input.disabled = true;
    input.data.correctSpan.textContent = value;
  } else if (currentWord.indexOf(value) === -1 && value) {
    input.className = "wrong";
    totalChances--;
  } else {
    if (value) {
      input.className = "almost";
      totalChances--;
    }
  }

  verifyEndGame();

  setupUI(totalChances, totalHints);
}

function verifyEndGame() {
  const inputs = document.getElementsByClassName("inputs")[0].childNodes;
  let hasFinished = true;

  //losing
  if (totalChances === 0) {
    inputs.forEach(i => (i.disabled = true));
    setEndGameMessage(
      "You are out of chances, Game Over. fruit: " + currentWord
    );
    hintButton.disabled = true;
  }

  //winning
  inputs.forEach(i => {
    const index = i.data.position;
    if (i.value.toUpperCase() !== currentWord[index]) {
      hasFinished = false;
    }
  });

  if (hasFinished) {
    setEndGameMessage("Congratulations you guessed corrected");
    hintButton.disabled = true;
  }
}

function setEndGameMessage(message) {
  const msg = document.getElementById("end-game-message");
  msg.textContent = message;
}

function showHint() {
  if (totalHints > 0) {
    totalHints--;
    setupUI(totalChances, totalHints);

    setHintLetter();
  }

  if (totalHints === 0) {
    hintButton.disabled = true;
  }
}

function setHintLetter() {
  const inputs = document.getElementsByClassName("inputs")[0].childNodes;

  let letter = null;
  let pos = null;

  while (!letter) {
    pos = Math.floor(Math.random() * currentWord.length);
    if (currentWord[pos] !== " " && inputs[pos].value !== currentWord[pos]) {
      letter = currentWord[pos];
    }
  }

  inputs[pos].value = letter;
  checkInput(inputs[pos]);
}
