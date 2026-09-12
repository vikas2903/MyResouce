import express from "express";
const PORT = 3000;
const AuthApp = express();
import AuthRoute from "./route/authroute.js";

AuthApp.use(express.json());
function runauthServer() {
    try {
        AuthApp.get("/", (req, res) => {
            res.json({
                message: "Auth Server is running",
                status: 200
            })
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })

    }
}

runauthServer();
AuthApp.use("/api", AuthRoute);

AuthApp.listen(PORT, () => {
    console.log(`Auth Server is running on port ${PORT}`);
})