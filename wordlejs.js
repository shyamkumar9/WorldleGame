const inputLetters = document.querySelectorAll(".letter-input");
const loadEle = document.querySelector(".loading");

const WordOfDay = "https://words.dev-apis.com/word-of-the-day?random=1";
const WordLength = 5;
let WordGuess = "";
let currentRow = 0;
let todaysWord = "";
let done = false;
let load = true;

async function GetwordOfDay() {
  fetch(WordOfDay)
    .then((res) => res.json())
    .then(async (res) => {
      todaysWord = res.word.toUpperCase();
    });
}
GetwordOfDay();
load = false;
LoadingEvent(load);

// the below function tells us whether the input is a singe letter input or not
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// Displaying the letters in the input boxes
function AddLettertoBox(letter) {
  if (WordGuess.length < WordLength) {
    // appending the letter to the end
    WordGuess += letter;
  } else {
    // replace the last letter
    WordGuess = WordGuess.slice(0, WordGuess.length - 1) + letter;
  }
  // display the letter in the boxes
  WordGuess = WordGuess.toUpperCase();
  inputLetters[WordLength * currentRow + WordGuess.length - 1].innerText =
    letter;
}

// On Pressing the BackSpace Key
function backspace(letter) {
  if (WordGuess.length > 0) {
    WordGuess = WordGuess.slice(0, WordGuess.length - 1);
  } else {
    // do nothing, if wordguess length is zero
  }
  inputLetters[WordLength * currentRow + WordGuess.length].innerText = "";
}

// On Pressing the Enter Key
async function enter(letter) {
  let winFlag = 0;
  let todaysWordMap = CreateMap(todaysWord);

  if (WordGuess.length != WordLength) {
    // do nothing
    return;
  }

  load = true;
  LoadingEvent(load);
  // if the word is Invalid, do nothing -> Run the function inside and return
  if ((await ValidateWord(WordGuess)) === false) {
    markInvalid();
    alert("Word not Found");
    load = false;
    LoadingEvent(load);
    return;
  }
  load = false;
  LoadingEvent(load);

  // If the letters guessed is correct, to paint the boxes Green
  for (let i = 0; i < WordLength; i++) {
    if (todaysWord[i] === WordGuess[i]) {
      inputLetters[WordLength * currentRow + i].classList.add("correct");
      todaysWordMap[WordGuess[i]]--;
      winFlag += 1;
    }
  }

  // After Painting the boxes Green, paiting the other boxes with respective colors.
  for (let i = 0; i < WordLength; i++) {
    if (todaysWord[i] === WordGuess[i]) {
      // do nothing, it's already done above.
    } else if (
      //  For example, if the player guesses "SPOOL" and the word is "OVERT", one "O" is shown as yellow and the second one is not. Green squares count too.
      todaysWord.includes(WordGuess[i]) &&
      todaysWordMap[WordGuess[i]] > 0
    ) {
      inputLetters[WordLength * currentRow + i].classList.add("close");
      todaysWordMap[WordGuess[i]]--;
    } else {
      inputLetters[WordLength * currentRow + i].classList.add("incorrect");
    }
  }
  // after guessing the word incorrectly, move to the next row.
  currentRow += 1;
  WordGuess = "";

  // Handling win or lose -> to alert the user.
  if (winFlag === 5) {
    // you win
    alert("You Win! 🎉🎊");
    document.querySelector(".word-masters").classList.add("winning");
    done = true;
  } else if (currentRow === 6) {
    // you lose
    alert(`You Lose, The Word was ${todaysWord}`);
    done = true;
  }
}

// validate the word
async function ValidateWord(Inputword) {
  const wordValid = fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      word: Inputword,
    }),
  })
    .then((res) => res.json())
    .then((res) => res.validWord)
    .catch((error) => console.log(error));
  return wordValid;
}

// creating an dictionary or map for each word guessed.
function CreateMap(word) {
  const dict = {};
  for (let i = 0; i < word.length; i++) {
    // if letter is already present just update the count
    if (dict[word[i]]) {
      dict[word[i]]++;
    }
    // else, initialise the count of the letter with 1
    else {
      dict[word[i]] = 1;
    }
  }
  return dict;
}

// loading function
function LoadingEvent(load) {
  loadEle.classList.toggle("hidden", !load);
}

function markInvalid() {
  for (let i = 0; i < WordLength; i++) {
    inputLetters[WordLength * currentRow + i].classList.remove("invalidWord");
    setTimeout(function () {
      inputLetters[WordLength * currentRow + i].classList.add("invalidWord");
    }, 8);
  }
}

// Event Listener -> on Key Press
document.addEventListener("keydown", function OnkeyPress(event) {
  if (done) {
    return;
  }

  const letterinput = event.key;

  if (letterinput === "Enter") {
    enter(letterinput);
  } else if (letterinput === "Backspace") {
    backspace(letterinput);
  } else if (isLetter(letterinput)) {
    // if it is a letter, then add the letter to the boxes
    AddLettertoBox(letterinput);
  } else {
    // do nothing
  }
});
