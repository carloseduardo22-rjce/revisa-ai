require("dotenv").config();
const express = require("express");
const cors = require("cors");
const contentRoutes = require("./routes/content.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", contentRoutes);

module.exports = app;
