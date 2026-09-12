import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import uploadRoute from "./route/uploadroute.js";
import prectice from "./prectice.js";

import fs, { constants } from "fs";
import readline from "readline";
import {Worker} from "worker_threads";
import fileUpLoadWithRestriction from "./route/file_upload_with_restrication.js";

const app = express();
dotenv.config();



console.log("Main thread is running"); 

app.get("/heavy-work", (req, res) => {

   const worker = new Worker(new URL("./worker.js", import.meta.url));
   let responded = false;

   worker.on("message", (message) => {
       if (responded) return;
       responded = true;
       console.log("Received message from worker thread:", message);
       res.json({ result: message });
    });

    worker.on("error", (error) => {
        if (responded) return;
        responded = true;
        console.error("Worker thread error:", error);
        res.status(500).json({ error: "Worker thread error" });
    }   
    );

    worker.on("exit", (code) => {
        console.log("Worker thread exited with code:", code);
        if (code !== 0 && !responded) {
            responded = true;
            res.status(500).json({ error: "Worker stopped unexpectedly" });
        }
    });
});
 
// #-------------------------------------------------------#

app.use(cors());
app.use('/api/videos', uploadRoute);
app.use(express.json());

app.use("/api/files", fileUpLoadWithRestriction);
prectice();

const PORT = process.env.PORT || 5000;
connectDB();

app.get("/", (req, res) => {

    let temp = 0;
    for(let i = 0; i < 100; i++) {
        temp = i * i; 
    }       
    res.json({ message: "Welcome to the Shopable Video API", temp });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
