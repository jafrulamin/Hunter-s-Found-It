require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", function (req, res) {
  res.send("Hunter's FoundIt API is running");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(function () {
    console.log("Connected to MongoDB");
    app.listen(PORT, function () {
      console.log("Server running on port " + PORT);
    });
  })
  .catch(function (err) {
    console.log("MongoDB connection error:", err.message);
  });
