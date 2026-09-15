import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        const atuhHeader = req.headers.authorization;

        if (!atuhHeader) {
            return res.status(401).json({
                message: "Access Token is required"
            })
        }
        const token = atuhHeader.split(" ")[1];

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
            mesage: "Access token is invalid and expired"
        })

    }
}