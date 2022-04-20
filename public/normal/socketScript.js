const socket = io();

socket.emit("connectToAdmin");

socket.emit("identification", { isAdmin: false });
socket.on("getId", id => console.log(id));

const hintAudio = new Audio("./hint.wav");

socket.on("hint", toSay => {
	if (timerStarted) {
		say(toSay, null, true);
		hintAudio.play();
	}
});

function checkByAdmin(answer, wasCorrect) {
	socket.emit("toCheck", answer, wasCorrect, nextQuestionIndex);
}

socket.on("approve", () => {
	if (timerStarted) {
		say([["Answer", " approved", " by", " higher", " authority.", " Next", " question."]], null, true, false, nextQuestion);
		hintAudio.play();
	}
});

function updateQuestionNum() {
	socket.emit("updateQuestionNum", nextQuestionIndex);
}

function sendTime(time) {
	socket.emit("time", time);
}

function testSocket() {
	socket.emit("toCheck", "TEST", false, nextQuestionIndex);
}