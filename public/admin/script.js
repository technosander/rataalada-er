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
	if (servingSocketId && socketId != servingSocketId) return;
	approvedSpan.hidden = true;
	toApproveDiv.innerHTML = `nr. ${questionNum}<br/><br/>antwoord${wasCorrect ? " (was al juist)" : ""}: ${answer}`;
	checkServingSocketId(socketId);
});

approveButton.onclick = e => {
	if (!servingSocketId) return;
	approvedSpan.hidden = false;
	socket.emit("approve", servingSocketId);
}


const numSpan = document.getElementById("question-num");

socket.on("updateQuestionNum", (num, socketId) => {
	if (servingSocketId && socketId != servingSocketId) return;
	numSpan.innerHTML = num;
	checkServingSocketId(socketId);
});


const socketIdSpan = document.getElementById("serving-socket");
function checkServingSocketId(id) {
	if (!servingSocketId) {
		servingSocketId = id;
		socketIdSpan.innerHTML = id;
	}
}