import express from "express"
import db from "./db/db.js"
import music from "./music/music.api.js"
import cors from "cors";
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

const app = express()
app.use(cors());
app.use(express.json());
app.use("/api/youtube",music)
if(process.env.NODE_ENV === "production"){
    app.use(express.static(frontendDistPath))
    app.get("*",(req,res)=>{
        res.sendFile(path.join(frontendDistPath,"index.html"))
    })
}
app.listen(5000,()=>{
    console.log("server is running port 5000")
    // db()
})