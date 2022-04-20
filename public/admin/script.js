const socket = io();

socket.emit("identification", { isAdmin: true });


const textArea = document.getElementById("textarea");
const sendButton = document.getElementById("send-hint-button");

sendButton.onclick = e => {
	if (!servingSocketId) return;
	text = textArea.value;
	textArea.value = "";
	if (text.trim().length > 0) socket.emit("hint", [["hint:", ...text.split(" ").map(str => str = " " + str)]], servingSocketId);
};


const toApproveDiv = document.getElementById("to-approve");
const approveButton = document.getElementById("approve-button");
const approvedSpan = document.getElementById("approved-span");
let servingSocketId = "";

socket.on("toCheck", (answer, wasCorrect, questionNum, socketId) => {
	setServingSocketId(socketId);
	if (socketId != servingSocketId) return;
	approvedSpan.hidden = true;
	toApproveDiv.innerHTML = `nr. ${questionNum}<br/><br/>antwoord${wasCorrect ? " (was al juist)" : ""}: ${answer}`;
});

approveButton.onclick = e => {
	if (!servingSocketId) return;
	approvedSpan.hidden = false;
	socket.emit("approve", servingSocketId);
}


const numSpan = document.getElementById("question-num");

socket.on("updateQuestionNum", (num, socketId) => {
	setServingSocketId(socketId);
	if (socketId != servingSocketId) return;
	numSpan.innerHTML = num;
});

const formatOptions = { minimumIntegerDigits: 2, useGrouping: false };

const timer = document.getElementById("timer");
socket.on("time", (time, socketId) => {
	setServingSocketId(socketId);
	if (socketId != servingSocketId) return;
	timer.innerHTML = `${Math.floor(time / 60).toLocaleString('en-US', formatOptions)}:${(time % 60).toLocaleString('en-US', formatOptions)}`;
	if (time <= 0) approveButton.hidden = true;
});

const socketIdSpan = document.getElementById("serving-socket");
function setServingSocketId(id) {
	if (!servingSocketId) {
		servingSocketId = id;
		socketIdSpan.innerHTML = id;
	}
}

socket.on("connectToAdmin", (id) => {
	setServingSocketId(id);
})