import otpGenerator from "otp-generator";
import sendEmail from "../utill/email.js";
import User from "../modals/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAcessToken, generateRefreshToken } from "../utill/token.js";
import {authenticate} from '../middleware.js'

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, int: true });
        const hashedOtp = await bcrypt.hash(otp, 10);


        let user = await User.findOne({ email: email });
        if (user) {
            const updatedUser = await User.findOneAndUpdate({ email: email }, { otp: hashedOtp, updatedAt: Date.now() }, { new: true });
            await sendEmail(email, "Verify Your Email", otp, res);
            await updatedUser.save();
        } else {
            const UserData = new User({
                otp: hashedOtp,
                email: email,
            });
            await UserData.save();
        }
        await sendEmail(email, "Verify Your Email", otp, res);

        res.status(200).json({
            message: "OTP sent successfully",
            status: 200
        })




    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })
    }

}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                status: 400
            })
        }

        const isOtpValid = await bcrypt.compare(otp, user.otp);
        if (!isOtpValid) {
            return res.status(400).json({
                message: "Invalid OTP",
                status: 400
            })
        }
        res.status(200).json({
            message: "OTP verified successfully",
            status: 200
        })




    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })
    }
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phoneno, address } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Password and Confirm Password do not match",
                status: 400
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

        const user = await User.findOneAndUpdate({ email: email }, { name, password: hashedPassword, confirmPassword: hashedConfirmPassword, phoneno, address }, { new: true });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                status: 400
            })
        }

        res.status(200).json({
            message: "User data updated successfully",
            status: 200
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, int: true });

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({
            message: "User not found",
            status: 400
        })
    }
    await sendEmail(email, "Reset Your Password", otp, res);
    await User.findOneAndUpdate({ email: email }, { otp: otp, updatedAt: Date.now() }, { new: true });
}

export const resetPassword = async (req, res) => {
    const { email, otp, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Password and Confirm Password do not match",
            status: 400
        })
    }

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({
            message: "User not found",
            status: 400
        })
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
        return res.status(400).json({
            message: "Invalid OTP",
            status: 400
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email: email }, { password: hashedPassword, otp: null, updatedAt: Date.now() }, { new: true });

    res.status(200).json({
        message: "Password reset successfully",
        status: 200
    })
}

export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(403).json({message: "User Not Found",})
        }

        const user = await  User.findOne({email});

        if(!user){
            return res.status(200).json({message:"User Not Found"})
        }

        const ispasswordCorrect  = await bcrypt.compare(password, user.password);
        
        if(!ispasswordCorrect){
            return res.status(401).json({message:"Invalid email or password"})
        }

        const accessToken = generateAcessToken(user);
        const refreshToken = generateRefreshToken (user);

        user.refreshToken = refreshToken;
        await user.save();


        res.cookie("refershToken", refreshToken,{
            httpOnly : true,
            secure: process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });

        res.status(200).json({

            message:"Login Sucessful",
            accessToken,
            user:{
                id:user._id,
                email:user.email,
                role:user.role
            }
        })


    } catch (error) {

        console.log("Error", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })
    }

}

export const getMyProfile  = async(req, res) =>{
    try{
        const userId = req.user._id;
        console.log(userId);
        const user = await User.findById(userId).select("-password -otp -refreshToken",)

        return res.status(200).json({
            message:"Profile Fatched successfully",
            user
        })


    }catch(error){
        return res.status(500).json({
            message:"Internal Server error"
        })
    }
}