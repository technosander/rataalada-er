const socket = io();

socket.emit("identification", { isAdmin: false });

socket.on("hint", toSay => {
	say(toSay, null, true);
});