const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("./public"));
app.use(express.json());
app.get("/", (req, res) => {
	res.redirect("./normal");
});


io.on("connection", (socket) => {
	console.log(`${socket.id} connected!`);
	let isAdmin = false;
	socket.on("identification", (obj) => {
		isAdmin = obj.isAdmin;
		if (!isAdmin) {
			socket.join("normal");
			io.to(socket.id).emit("getId", socket.id);
		}
		else socket.join("admin");
	});
	socket.on("hint", (toSay, to) => {
		socket.to(to).emit("hint", toSay);
	});
	socket.on("toCheck", (answer, wasCorrect, questionNum) => {
		socket.to("admin").emit("toCheck", answer, wasCorrect, questionNum, socket.id);
		socket.to("admin").emit("updateQuestionNum", questionNum, socket.id)
	});
	socket.on("approve", (socketId) => {
		socket.to(socketId).emit("approve");
	});
	socket.on("updateQuestionNum", num => socket.to("admin").emit("updateQuestionNum", num, socket.id));
	socket.on("time", (time) => socket.to("admin").emit("time", time, socket.id));
	socket.on("connectToAdmin", () => socket.to("admin").emit("connectToAdmin", socket.id));
	socket.on("escaped", () => socket.to("admin").emit("escaped", socket.id))
});

const port = process.env.PORT || 8130;
server.listen(port, () => console.log(`running on *:${port}`));