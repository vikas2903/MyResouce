import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; 

        if (!authHeader) {
            return res.status(401).json({
                message: "Access Token is required"
            })
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Bearer token is required"
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        req.user = decoded
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Access token is invalid or expired" // message, not mesage
        });
    }
}