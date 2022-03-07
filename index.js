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
	socket.on("hint", toSay => {
		socket.to("normal").emit("hint", toSay);
	});
	socket.on("toCheck", (answer, wasCorrect, questionNum) => {
		socket.to("admin").emit("toCheck", answer, wasCorrect, questionNum, socket.id);
	});
	socket.on("approve", (socketId) => {
		socket.to(socketId).emit("approve");
	});
	socket.on("updateQuestionNum", num => socket.to("admin").emit("updateQuestionNum", num, socket.id));
});

const port = process.env.PORT || 8130;
server.listen(port, () => console.log(`running on *:${port}`));