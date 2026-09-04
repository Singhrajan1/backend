import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

export {app}

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))



app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

import userRoute from "./routes/user.Route.js"

app.use("/api/v1/users",userRoute);

import videoRouter from "./routes/video.route.js"