const socket = io();

socket.emit("identification", { isAdmin: true });


const textArea = document.getElementById("textarea");
const sendButton = document.getElementById("send-hint-button");

sendButton.onclick = e => {
	text = textArea.value;
	textArea.value = "";
	socket.emit("hint", [["hint: ", ...text.split(" ")]]);
};