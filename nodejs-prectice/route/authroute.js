import express from "express";
import { 
    sendOTP,
    verifyOtp, 
    registerUser, 
    forgotPassword, 
    resetPassword,
    loginUser,
    getMyProfile
 } from "../controller/authcontroller.js";
 import { authenticate } from "../middleware.js";
const AuthRoute = express.Router();
AuthRoute.post("/auth/send-otp", sendOTP);
AuthRoute.post("/auth/verify-otp", verifyOtp);
AuthRoute.post("/auth/register", registerUser);
AuthRoute.post("/auth/forgot-password", forgotPassword);
AuthRoute.post("/auth/reset-password", resetPassword);
AuthRoute.post("/auth/loginuser", loginUser);
AuthRoute.post('/auth/my-profile', authenticate, getMyProfile);

export default AuthRoute;
