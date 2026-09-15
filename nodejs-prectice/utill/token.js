
import jsonwebtoken from "jsonwebtoken";


export const generateAcessToken = (user) => {
    return jsonwebtoken.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_ACCESS_SECRET, 
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
}


export  const generateRefreshToken = (user) =>{
return jsonwebtoken.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

} 

