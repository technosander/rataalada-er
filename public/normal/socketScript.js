const socket = io();

socket.emit("identification", { isAdmin: false });

socket.on("hint", toSay => {
	say(toSay, null, true);
});

function checkByAdmin(answer) {
	socket.emit("toCheck", answer, wasCorrect, nextQuestionIndex);
}

socket.on("approve", () => {
	say([["Answer", " approved", " by", " higher", " authority.", " Next", " question."]], false, true, false);
	nextQuestion();
})