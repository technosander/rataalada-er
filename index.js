const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("./public"));
app.use(express.json());
app.get("/", (req, res) => {
	res.redirect("./normal");
});

const port = process.env.PORT || 8130;
app.listen(port, () => console.log(`running on *:${port}`));