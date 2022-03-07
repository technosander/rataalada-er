const socket = io();

socket.emit("identification", { isAdmin: true });


const textArea = document.getElementById("textarea");
const sendButton = document.getElementById("send-hint-button");

sendButton.onclick = e => {
	text = textArea.value;
	textArea.value = "";
	socket.emit("hint", [["hint: ", ...text.split(" ").map(str => str = " " + str)]]);
};


const toApproveDiv = document.getElementById("to-approve");
const approveButton = document.getElementById("approve-button");
const approvedSpan = document.getElementById("approved-span");
let servingSocketId = "";

socket.on("toCheck", (answer, wasCorrect, questionNum, socketId) => {
	approvedSpan.hidden = true;
	toApproveDiv.innerHTML = `nr. ${questionNum}<br/><br/>antwoord${wasCorrect ? " (was al juist)" : ""}: ${answer}`;
	servingSocketId = socketId;
});

approveButton.onclick = e => {
	approvedSpan.hidden = false;
	socket.emit("approve", servingSocketId);
}