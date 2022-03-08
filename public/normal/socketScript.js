const socket = io();

socket.emit("identification", { isAdmin: false });
socket.on("getId", id => console.log(id));

socket.on("hint", toSay => {
	say(toSay, null, true);
});

function checkByAdmin(answer, wasCorrect) {
	socket.emit("toCheck", answer, wasCorrect, nextQuestionIndex);
}

socket.on("approve", () => {
	say([["Answer", " approved", " by", " higher", " authority.", " Next", " question."]], null, true, false, nextQuestion);
});

function updateQuestionNum() {
	socket.emit("updateQuestionNum", nextQuestionIndex);
}

function testSocket() {
	socket.emit("toCheck", "TEST",  false, nextQuestionIndex);
}