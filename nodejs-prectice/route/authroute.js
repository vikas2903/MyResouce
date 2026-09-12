import express from "express";
import { sendOTP } from "../controller/authcontroller.js";
import { verifyOTP } from "../controller/authcontroller.js";  
const AuthRoute = express.Router();
AuthRoute.post("/auth/start", sendOTP);
AuthRoute.post("/auth/verify", verifyOTP);
export default AuthRoute;
