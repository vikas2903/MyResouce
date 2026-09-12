import otpGenerator from "otp-generator";

let tempotp = "";

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, int: true });

        res.status(200).json({
            message: "OTP sent successfully",
            status: 200,
            email: email,
            otp: otp
        })

        tempotp = otp;
        return tempotp;



    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })
    }

}

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (otp === "") {
            res.status(400).json({
                message: "Please generate OTP first",
                status: 400
            })
        }

        if (!otp || otp !== tempotp) {
            res.status(400).json({
                message: "Invalid OTP",
                status: 400
            })
            return;
        }


        if (tempotp === otp) {
            res.status(200).json({
                email: email,
                message: "OTP verified successfully",
                status: 200
            })
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            status: 500
        })
    }
}