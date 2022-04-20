const totalTime = 2; // in s
const cursor = "&nbsp;&lt;?&gt;";
const cursorDelay = 500; // in ms
const wordDelay = 300;
const prefix = "&gt;&gt;&nbsp;";
const specialRemoves = ["<br/>&nbsp;&nbsp;&nbsp;", "<br>&nbsp;&nbsp;&nbsp;", "<br>", "<br/>", "&nbsp;", "&gt;", "&lt;", ];
const otherAllowedChars = ["'", ".", ",", "?", "!"];
let questions;
fetch("./questions.json").then(res => res.json()).then(json => {
	questions = json.questions;
	showStart();
});

const startButton = document.getElementById("start");
const timer = document.getElementById("timer");
let timerStarted = false;
const formatOptions = { minimumIntegerDigits: 2, useGrouping: false };
timer.innerHTML = `${Math.floor(totalTime / 60).toLocaleString('en-US', formatOptions)}:${(totalTime % 60).toLocaleString('en-US', formatOptions)}`;
let timeRemaining = totalTime;
sendTime(totalTime);

let nextQuestionIndex = 0;
let nextCorrectAnswers = [];
let sayingSomething = false;
let toSayQueue = [];
let currentQuestionObj = questions?.[nextQuestionIndex];
const textArea = document.getElementById("textarea");
let typingAreaBegin = 0;
let cursorNeeded = false;
let cursorEnabled = false;
let typingAllowed = false;

let wordDelayMultiplier = 1;

let cursorInterval = setInterval(toggleCursor, cursorDelay);

document.onkeydown = e => {
	scrollToBottom();
	if (!typingAllowed) return;
	const key = e.key;
	switch (key) {
		case " ":
			add("&nbsp;");
			break;
		case "Enter":
			if (nextCorrectAnswers) {
				checkByAdmin(textArea.innerHTML.substring(typingAreaBegin, getLengthWithoutCursor()), checkAnswer());
				checkAnswer() ? nextQuestion(true) : answerIncorrect();
			}
			break;
		case "Backspace":
			if (typingAreaBegin < getLengthWithoutCursor()) remove(1);
			break;
		default:
			if (isLetter(key) || otherAllowedChars.includes(key) || !isNaN(key)) add(key.toUpperCase());
			break;
	}
}

startButton.onclick = begin;

function showStart() {
	textArea.innerHTML = "";
	startButton.hidden = false;
}

const explosionsAudio = new Audio("./explosion.wav");

function startTimer() {
	timerStarted = true;
	timerInterval = setInterval(() => {
		timeRemaining -= 1;
		timer.innerHTML = `${Math.floor(timeRemaining / 60).toLocaleString('en-US', formatOptions)}:${(timeRemaining % 60).toLocaleString('en-US', formatOptions)}`;
		sendTime(timeRemaining);
		if (timeRemaining <= 0) {
			clearInterval(timerInterval);
			say([["Gefaald!", " Precies", " zoals", " ik", " verwacht", " had."], ["Nu...", "", "", " BOEM!!!"]], false, true, true);
			explosionsAudio.play();
		}
	}, 1000);
}
function stopTimer() {
	clearInterval(timerInterval);
}

function begin() {
	startButton.hidden = true;
	textArea.innerHTML = "";
	cursorNeeded = true;
	nextQuestion();
	startTimer();
}
function nextQuestion(afterAnswer = false) {
	currentQuestionObj = questions[nextQuestionIndex];
	if (!currentQuestionObj) {
		stopTimer();
		return;
	}
	if (currentQuestionObj.extraEnterInFront) add("<br/>");
	nextCorrectAnswers = currentQuestionObj.correctAnswers ? currentQuestionObj.correctAnswers : null;
	nextQuestionIndex++;
	say(currentQuestionObj.toSay, currentQuestionObj.correctAnswers ? true : false, nextQuestionIndex == 0 ? false : true, currentQuestionObj.endEnter, () => !nextCorrectAnswers ? nextQuestion() : null);
	updateQuestionNum();
}
function checkAnswer() {
	if (nextCorrectAnswers === true) return true;
	let answer = textArea.innerHTML.substring(typingAreaBegin, getLengthWithoutCursor());
	answer = answer.replace(/&nbsp;/g, " ");
	if (nextCorrectAnswers.some(correctAnswer => {
		return correctAnswer.trim().split("").filter(char => isLetter(char) || !isNaN(char)).join("").toLowerCase() == answer.trim().split("").filter(char => isLetter(char) || !isNaN(char)).join("").toLowerCase();
	})) return true;
	return false;
}
function answerIncorrect() {
	say([["Answer", " incorrect."], ...currentQuestionObj.toSay], nextCorrectAnswers ? true : false, true);
}

function getLengthWithoutCursor() {
	return cursorEnabled ? textArea.innerHTML.length - cursor.length : textArea.innerHTML.length;
}

function add(str) {
	if (cursorEnabled) toggleCursor();
	str = str.replace(/ /g, "&nbsp;");
	textArea.innerHTML += str;
	if (!cursorEnabled) {
		toggleCursor();
		clearInterval(cursorInterval);
		cursorInterval = setInterval(toggleCursor, cursorDelay);
	}
}
function remove(amount) {
	if (cursorEnabled) toggleCursor();
	let prevEnd = textArea.innerHTML;
	let newAmount = amount;
	for (let i = 0; i < amount; i++) {
		let index = specialRemoves.findIndex(specialRemove => prevEnd.endsWith(specialRemove));
		if (index == -1) continue;
		prevEnd = prevEnd.substring(0, prevEnd.length - specialRemoves[index].length);
		newAmount += specialRemoves[index].length - 1;
	}
	textArea.innerHTML = textArea.innerHTML.substring(0, textArea.innerHTML.length - newAmount);
	if (!cursorEnabled) {
		toggleCursor();
		clearInterval(cursorInterval);
		cursorInterval = setInterval(toggleCursor, cursorDelay);
	}
}

function isLetter(str) {
	return str?.length == 1 && str?.toUpperCase() != str?.toLowerCase();
}

function toggleCursor() {
	if (!cursorNeeded) return;
	if (!cursorEnabled) textArea.innerHTML += cursor;
	else textArea.innerHTML = textArea.innerHTML.substring(0, textArea.innerHTML.length - cursor.length);
	cursorEnabled = !cursorEnabled;
}
function enableCursor() {
	if (!cursorEnabled) toggleCursor();
	cursorNeeded = true;
}
function disableCursor() {
	if (cursorEnabled) toggleCursor();
	cursorNeeded = false;
}

/**
 * Don't use twice in direct succession, use multiple arr params
 * @param {string[][]} strArrArr Arrays of strings with words to say
 * @param {boolean} enableTypingAfterwards
 * @param {boolean} beginEnter
 * @param {boolean} endEnter
 * @param {Function} callback
 */
function say(strArrArr, enableTypingAfterwards = true, beginEnter = true, endEnter = true, callback) {
	if (sayingSomething) return toSayQueue.push({ strArrArr, enableTypingAfterwards, beginEnter, endEnter, callback });

	sayingSomething = true;
	if (enableTypingAfterwards === null) enableTypingAfterwards = typingAllowed;
	typingAllowed = false;
	enableCursor();
	if (beginEnter) add("<br/>");
	let strArr = strArrArr[0];
	sayNext(0);
	
	function sayNext(index) {
		strArr.forEach((str, j) => {
			str = str.toUpperCase();
			str = str.replace(/<BR>|<BR\/>/g, "<br/>   ");
			str = str.replace(/ /g, "&nbsp;"); // must be here to make typingAreaBegin work
			if (j == 0 && j != strArr.length - 1) setTimeout(() => {
				add(prefix);
				add(str);
				scrollToBottom();
			}, wordDelay * (j + 1));
			else if (j != strArr.length - 1) setTimeout(() => { add(str); scrollToBottom(); }, wordDelay * (j + 1));
			else setTimeout(() => {
				scrollToBottom();
				add((j == 0 ? prefix : "") + str + (endEnter ? "<br/>" : ""));
				strArr = strArrArr[index + 1];
				if (strArr) sayNext(index + 1);
				else {
					if (enableTypingAfterwards) typingAllowed = true;
					else disableCursor();
					if (endEnter) add("&nbsp;&nbsp;&nbsp;");
					typingAreaBegin = getLengthWithoutCursor();
					sayingSomething = false;

				 	scrollToBottom();
					if (callback) callback();

					if (toSayQueue.length > 0) {
						wordDelayMultiplier = 1;
						let nextInQueue = toSayQueue.shift();
						say(nextInQueue.strArrArr, nextInQueue.enableTypingAfterwards, nextInQueue.beginEnter, nextInQueue.endEnter, nextInQueue.callback);
					}
				}
			}, wordDelay * (j + 1));
		});
	}
}

function scrollToBottom() {
	textArea.scrollTop = textArea.scrollHeight - textArea.clientHeight;
}