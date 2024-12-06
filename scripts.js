let selectedOperations = []; // Store selected operations
let wrongAnswers = []; // Array to store incorrect problems

let allProblems = []; // Track all problems for worksheet generation
let currentProblem = 0;
let score = 0; // Track the number of correct answers
let results = []; // Array to store each problem and if it was answered correctly

let randomSeeded = null; // Global seeded random function

function generateRandomSeed() {
const seedLength = 16; // Adjust the length of the seed as needed
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let seed = '';

for (let i = 0; i < seedLength; i++) {
const randomIndex = Math.floor(Math.random() * characters.length);
seed += characters[randomIndex];
}

return seed;
}

function createSeededRandom(seed) {
// Convert the seed string into a number
let hash = 0;
for (let i = 0; i < seed.length; i++) {
hash = (hash << 5) - hash + seed.charCodeAt(i);
hash |= 0; // Convert to 32-bit integer
}

// Seeded random generator using the hash
return function () {
hash ^= hash << 13;
hash ^= hash >> 17;
hash ^= hash << 5;
return Math.abs(hash) / 0x7fffffff; // Normalize to [0, 1)
};
}

let currentSeed; // Global variable to store the seed

function initializeSeededRandom() {
currentSeed = generateRandomSeed(); // Store the generated seed
randomSeeded = createSeededRandom(currentSeed); // Initialize the seeded random function
}



function redirectToWorksheet() {
    initializeSeededRandom();
    if (!currentSeed) {
      alert("The current seed is not defined. Please generate problems first.");
      return;
    }
  
    // Get the number of problems (totalProblems)
    const num = totalProblems || 5; // Default to 5 if not set
  
    // Redirect with both the seed and number of problems
    window.location.href = `worksheet.html?answerSeed=${encodeURIComponent(currentSeed)}&num=${encodeURIComponent(num)}`;
  }
  
  

function generateWorksheet(seed) {
  console.log(`Generating worksheet with seed: ${seed}`);
  // Your logic to generate problems based on the seed
  // Example: Use the seed to set up random problem generation
}



// Add event listeners to operation buttons for toggle functionality
document.querySelectorAll('.operation-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const operation = button.getAttribute('data-operation');
    if (button.classList.contains('selected')) {
      // Remove selected state
      button.classList.remove('selected');
      selectedOperations = selectedOperations.filter((op) => op !== operation);
    } else {
      // Add selected state
      button.classList.add('selected');
      selectedOperations.push(operation);
    }
  });
});



function generateProblem() {
const operations = selectedOperations; // Use only selected operations
let num1, num2, operator;

operator = operations[Math.floor(randomSeeded() * operations.length)]; // Randomly pick an operation

if (operator === "×") {
  num1 = Math.floor(randomSeeded() * 12) + 1;
  num2 = Math.floor(randomSeeded() * 12) + 1;
} else if (operator === "÷") {
  num2 = Math.floor(randomSeeded() * 12) + 1;
  const quotient = Math.floor(randomSeeded() * 12) + 1;
  num1 = num2 * quotient;
} else if (operator === "-") {
  num1 = Math.floor(randomSeeded() * 20) + 1;
  num2 = Math.floor(randomSeeded() * 20) + 1;
  if (num2 > num1) [num1, num2] = [num2, num1];
} else if (operator === "+") {
  num1 = Math.floor(randomSeeded() * 20) + 1;
  num2 = Math.floor(randomSeeded() * 20) + 1;
}

// Save the problem for worksheet
allProblems.push({ num1, num2, operator });

// Update the HTML
document.getElementById("num1").textContent = num1;
document.getElementById("operator").textContent = operator;
document.getElementById("num2").textContent = num2;

// Save correct answer for validation
currentProblemAnswer = evaluateProblem(num1, num2, operator);
}

function evaluateProblem(num1, num2, operator) {
switch (operator) {
case '+':
  return num1 + num2;
case '-':
  return num1 - num2;
case '×':
  return num1 * num2;
case '÷':
  return num1 / num2;
}
}


let totalProblems = 5; // Default to 5 problems

function changeProblemCount(delta) {
const minProblems = 5;
const maxProblems = 50;

// Adjust problem count by delta, keeping it within bounds
totalProblems = Math.min(maxProblems, Math.max(minProblems, totalProblems + delta));

// Update the display
document.getElementById('problemCount').textContent = totalProblems;
}

function startProblems() {
// Validate that at least one operation is selected
document.getElementById('answer').value = '';
if (selectedOperations.length === 0) {
const operationDiv = document.getElementById('operation-selection');
operationDiv.classList.add('invalid'); // Flash the operation div red
setTimeout(() => operationDiv.classList.remove('invalid'), 300);
return; // Do not proceed if no operations are selected
}
initializeSeededRandom();
currentProblem = 0;

// Show the progress bar and problem box, hide the setup
document.querySelector('.setup-container').style.display = 'none';
document.querySelector('.progress-bar-container').style.display = 'block';
document.querySelector('.problem-box').style.display = 'flex';

updateProgressBar();
generateProblem();
document.getElementById('answer').focus();
}


function nextProblem() {
const answerInput = document.getElementById('answer');
const answer = answerInput.value.trim();

// Check if the answer is a whole number
if (!answer || !/^\d+$/.test(answer)) {
answerInput.classList.add('invalid');
setTimeout(() => answerInput.classList.remove('invalid'), 300);
answerInput.focus();
return;
}

const num1 = parseInt(document.getElementById('num1').textContent, 10);
const num2 = parseInt(document.getElementById('num2').textContent, 10);
const operator = document.getElementById('operator').textContent;
// Calculate the correct answer
let correctAnswer;
switch (operator) {
case '+':
  correctAnswer = num1 + num2;
  break;
case '-':
  correctAnswer = num1 - num2;
  break;
case '×':
  correctAnswer = num1 * num2;
  break;
case '÷':
  correctAnswer = Math.floor(num1 / num2); // Integer division
  break;
}
// Check if the user's answer is correct
if (parseInt(answer, 10) === correctAnswer) {
score++;
} else {
// Store the incorrect problem
wrongAnswers.push({
  num1,
  num2,
  operator,
  userAnswer: answer,
  correctAnswer,
});
}

currentProblem++;

if (currentProblem < totalProblems) {
updateProgressBar();
generateProblem();
answerInput.value = '';
answerInput.focus();
} else {
// Complete the progress bar before showing results
updateProgressBar();
setTimeout(() => {
  showResults(); // Show results after a delay
}, 500); // Delay to allow the progress bar to visually complete
}
}


function showResults() {
const resultsModal = document.getElementById('results-modal');
const resultsContent = document.getElementById('results-content');

// Calculate the grade percentage
const percentage = Math.round((score / totalProblems) * 100);

// Determine grade background color
let gradeColor;
if (percentage >= 90) {
gradeColor = 'green';
} else if (percentage >= 70) {
gradeColor = 'yellow';
} else {
gradeColor = 'red';
}

// Generate results content
let resultsHTML = `
<p>Total Problems: ${totalProblems}</p>
<p>Correct Answers: ${score}</p>
<p>Grade: <span style="background-color: ${gradeColor}; padding: 5px; border-radius: 5px;">${percentage}%</span></p>
`;

// Add incorrect problems to results
if (wrongAnswers.length > 0) {
resultsHTML += `<h3>Incorrect Problems:</h3><table>`;
wrongAnswers.forEach(problem => {
  resultsHTML += `
  <tr>
    <td style="text-alight:right;">${problem.num1}</td><td>${problem.operator}</td><td>${problem.num2}</td><td> = </td>
    <td><span style="color: green;">${problem.correctAnswer}</span></td>
    <td>(You answered: <span style="color: red;">${problem.userAnswer}</span>)</td>
    </tr>`;
});
resultsHTML += `</table>`;
}

// Populate and show the modal
resultsContent.innerHTML = resultsHTML;
resultsModal.style.display = 'flex';
}



function closeResultModal() {
// Hide the result modal
document.getElementById('result-modal').style.display = 'none';

// Reset quiz
resetQuiz();
}


function resetQuiz() {
score = 0;
results = [];
currentProblem = 0;

document.querySelector('.problem-box').style.display = 'none';
document.querySelector('.progress-bar-container').style.display = 'none';
document.querySelector('.setup-container').style.display = 'flex';

updateProgressBar();
}


function updateProgressBar() {
  const progress = (currentProblem / totalProblems) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

function confirmQuit() {
  if (confirm('Are you sure you want to quit?')) {
    stopSpeechRecognition(); // Stop the microphone if listening
    location.reload(); // Reload the page
  }
}

function closeModal() {
// Hide the modal
document.getElementById('quit-modal').style.display = 'none';
}

function restartQuiz() {
currentProblem = 0;
score = 0;
wrongAnswers = []; // Reset wrong answers
document.getElementById("results-modal").style.display = "none";
startProblems();
location.reload(); // Reload the page
}


function quit() {
// Hide the modal and reset to the start
closeModal();
document.querySelector('.problem-box').style.display = 'none';
document.querySelector('.progress-bar-container').style.display = 'none';
document.querySelector('.setup-container').style.display = 'flex';
currentProblem = 0;
updateProgressBar(); // Reset progress bar
}


let recognition; // Declare recognition globally
let isListening = false; // Track whether the microphone is actively listening
let isPaused = false; // Track whether recognition is "paused"

// Initialize Speech Recognition once
function initSpeechRecognition() {
if (!('webkitSpeechRecognition' in window)) {
alert('Speech recognition is not supported in this browser.');
return;
}

recognition = new webkitSpeechRecognition();
recognition.lang = 'en-US'; // Set language
recognition.interimResults = true; // Show interim results while speaking
recognition.maxAlternatives = 1; // Only one result

recognition.onresult = function (event) {
if (isPaused) return; // Ignore results when paused

const transcript = event.results[0][0].transcript; // Get the spoken text
let setAnswer = transcript.trim().toLowerCase();

// Convert words to digits
const wordToDigit = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};
setAnswer = wordToDigit[setAnswer] || setAnswer;

document.getElementById('answer').value = setAnswer; // Update answer input
};

recognition.onerror = function (event) {
console.error('Speech recognition error:', event.error);
};

recognition.onend = function () {
if (isListening) {
  recognition.start(); // Restart if the user is still in listening mode
}
};
}

// Toggle speech recognition
function toggleSpeechRecognition() {
const micButton = document.getElementById('microphone');

if (isListening) {
// Pause recognition
isPaused = true;
micButton.textContent = '🎤'; // Reset button icon
isListening = false;
} else {
// Resume recognition
isPaused = false;
recognition.start(); // Start recognition
micButton.textContent = '🔴'; // Change button icon to indicate listening
isListening = true;
}
}

// Stop speech recognition when quitting
function stopSpeechRecognition() {
if (recognition) {
recognition.stop(); // Stop recognition
isListening = false;
isPaused = false;
}
}

// Initialize recognition on page load
window.onload = initSpeechRecognition;

function generateAllProblems() {
initializeSeededRandom(); // Initialize the seeded random generator
allProblems = []; // Reset the problems array
for (let i = 0; i < totalProblems; i++) {
const operations = selectedOperations.length > 0 ? selectedOperations : ['+']; // Default to '+' if none selected
let num1, num2, operator;

operator = operations[Math.floor(randomSeeded() * operations.length)]; // Randomly pick an operation

if (operator === "×") {
  num1 = Math.floor(randomSeeded() * 12) + 1;
  num2 = Math.floor(randomSeeded() * 12) + 1;
} else if (operator === "÷") {
  num2 = Math.floor(randomSeeded() * 12) + 1;
  const quotient = Math.floor(randomSeeded() * 12) + 1;
  num1 = num2 * quotient;
} else if (operator === "-") {
  num1 = Math.floor(randomSeeded() * 20) + 1;
  num2 = Math.floor(randomSeeded() * 20) + 1;
  if (num2 > num1) [num1, num2] = [num2, num1];
} else if (operator === "+") {
  num1 = Math.floor(randomSeeded() * 20) + 1;
  num2 = Math.floor(randomSeeded() * 20) + 1;
}

allProblems.push({ num1, num2, operator });
}
}

function downloadWorksheetPDF() {
// Ensure problems are generated

totalProblems = document.getElementById('problemCount').textContent;


if (allProblems.length === 0) {
generateAllProblems();
}

// Generate the QR code URL
const qrCodeData = `https://1235media.com?answerSeed=${currentSeed}`;

// Generate the QR code using the qrcode library
QRCode.toDataURL(qrCodeData, { width: 100 }, function (err, qrCodeURL) {
if (err) {
  console.error("Error generating QR code:", err);
  return;
}

// Generate worksheet content
let worksheetHTML = `
  <h1 style="text-align: center;">Math Worksheet</h1>
  <div style="text-align: center;">
    <img src="${qrCodeURL}" alt="QR Code" style="margin-bottom: 20px;" />
  </div>
  <table style="width: 100%; border-spacing: 20px; text-align: center;">
`;

allProblems.forEach((problem, index) => {
  if (index % 5 === 0) worksheetHTML += "<tr>"; // Start a new row every 5 problems

  worksheetHTML += `
    <td style="vertical-align: top; text-align: center; width: 20%;">
      <div style="font-size: 24px; font-family: Arial, sans-serif; text-align: right; display: inline-block;">
        <div style="display: block;">${problem.num1}</div>
        <div style="display: block;">${problem.operator} ${problem.num2}</div>
        <div style="border-top: 2px solid black; margin-top: 2px; display: inline-block; width: 50px; height: 20px;"></div>
      </div>
    </td>
  `;

  if (index % 5 === 4) worksheetHTML += "</tr>"; // Close the row after 5 problems
});

// Close the table
worksheetHTML += "</table>";

// Create a new window for printing
const printWindow = window.open("", "_blank");
printWindow.document.open();

// Generate the full HTML content
const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Math Worksheet</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }
      h1, p {
        text-align: center;
      }
      table {
        width: 100%;
        border-spacing: 20px;
        text-align: center;
      }
      td {
        font-size: 24px;
        vertical-align: top;
        text-align: center;
        width: 20%;
      }
      .problem {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .line {
        border-top: 2px solid black;
        margin-top: 10px;
        width: 50px; /* Adjusted to align with the numbers */
        height: 20px;
      }
    </style>
  </head>
  <body>
    ${worksheetHTML}
  </body>
  </html>
`;

// Write the content to the new window
printWindow.document.write(htmlContent);
printWindow.document.close();

// Wait for the new window to load, then trigger the print dialog
printWindow.onload = () => {
  printWindow.print();
};
});
}


