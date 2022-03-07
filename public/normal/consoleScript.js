const cursor = "&nbsp;&lt;?&gt;";
const cursorDelay = 500; // in ms
const wordDelay = 600;
const prefix = "&gt;&gt;&nbsp;";
const specialRemoves = ["<br/>&nbsp;&nbsp;&nbsp;", "<br>&nbsp;&nbsp;&nbsp;", "<br>", "<br/>", "&nbsp;", "&gt;", "&lt;", ];
const otherAllowedChars = ["'", ".", ",", "?", "!"];
let questions;
fetch("./questions.json").then(res => res.json()).then(json => {
	questions = json.questions;
	begin();
});

let nextQuestionIndex = 0;
let nextCorrectAnswers = [];
let sayingSomething = false;
let currentQuestionObj = questions?.[nextQuestionIndex];
const textArea = document.getElementById("textarea");
let typingAreaBegin = 0;
let cursorNeeded = true;
let cursorEnabled = false;
let typingAllowed = false;

let cursorInterval = setInterval(toggleCursor, cursorDelay);

document.onkeydown = e => {
	if (!typingAllowed) return;
	const key = e.key;
	// console.log(key);
	switch (key) {
		case " ":
			add("&nbsp;");
			break;
		case "Enter":
			if (nextCorrectAnswers) checkAnswer() ? nextQuestion() : answerIncorrect();
			break;
		case "Backspace":
			if (typingAreaBegin < getLengthWithoutCursor()) remove(1);
			break;
		default:
			if (isLetter(key) || otherAllowedChars.includes(key) || !isNaN(key)) add(key.toUpperCase());
			break;
	}
}

function begin() {
	textArea.innerHTML = "";
	nextQuestion();
}
function nextQuestion() {
	currentQuestionObj = questions[nextQuestionIndex];
	if (!currentQuestionObj) return;
	if (nextQuestionIndex > 0) add("<br/>");
	say(currentQuestionObj.toSay, currentQuestionObj.correctAnswers ? true : false, nextQuestionIndex == 0 ? false : true);
	nextCorrectAnswers = currentQuestionObj.correctAnswers ? currentQuestionObj.correctAnswers : null;
	nextQuestionIndex++;
	if (!nextCorrectAnswers) nextQuestion();
}
function checkAnswer() {
	if (nextCorrectAnswers === true) return true;
	let answer = textArea.innerHTML.substring(typingAreaBegin, getLengthWithoutCursor());
	answer = answer.replace(/&nbsp;/g, " ");
	if (nextCorrectAnswers.some(correctAnswer => {
		// console.log(correctAnswer.trim().split("").filter(char => isLetter(char) || !isNaN(char)).join("").toLowerCase() + "==" + answer.trim().split("").filter(char => isLetter(char) || !isNaN(char)).join("").toLowerCase());
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
function disableCursor() {
	if (cursorEnabled) toggleCursor();
	cursorNeeded = false;
}

/**
 * Don't use twice in direct succession, use multiple arr params
 * @param {string[][]} strArrArr Arrays of strings with words to say
 * @param {boolean} enableTypingAfterwards
 */
function say(strArrArr, enableTypingAfterwards = true, beginEnter = true) {
	if (sayingSomething) return setTimeout(say, wordDelay, strArrArr, enableTypingAfterwards, beginEnter);

	sayingSomething = true;
	if (enableTypingAfterwards === null) enableTypingAfterwards = typingAllowed;
	typingAllowed = false;
	if (beginEnter) add("<br/>");
	let strArr = strArrArr[0];
	sayNext(0);
	
	function sayNext(index) {
		strArr.forEach((str, j) => {
			str = str.toUpperCase();
			str = str.replace(/<BR>|<BR\/>/g, "<br/>   ");
			str = str.replace(/ /g, "&nbsp;"); // must be here to make typingAreaBegin work
			if (j == 0) setTimeout(() => {
				add(prefix);
				add(str);
			}, wordDelay * (j + 1));
			else if (j != strArr.length - 1) setTimeout(add, wordDelay * (j + 1), str);
			else setTimeout(() => {
				add(str + "<br/>")
				strArr = strArrArr[index + 1];
				if (strArr) sayNext(index + 1);
				else {
					if (enableTypingAfterwards) typingAllowed = true;
					else disableCursor();
					add("&nbsp;&nbsp;&nbsp;");
					typingAreaBegin = getLengthWithoutCursor();
					sayingSomething = false;
				}
			}, wordDelay * (j + 1));
		});
	}
}