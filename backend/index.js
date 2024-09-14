const port = 7000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error } = require("console");

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/Ecommerce")
.then(() => console.log("DB Connected!"))
.catch((err) => console.log("Error  connecting DB: ", err.message))

app.get("/",(req,res) => {
    res.send("Express App is Running")
})

app.listen(port,(error) => {
    if(!error){
        console.log("Server Running on Port " + port)
    }
    else{
        console.log("Error :"+error)
    }
})
