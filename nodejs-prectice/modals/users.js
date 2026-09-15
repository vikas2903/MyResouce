import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    otp: {
        type: String,
        
        expires: 600 // OTP will expire after 10 minutes (600 seconds)      
    },
    name: {
        type: String,
     
    },
    email: {
        type: String,
       
        unique: true
    },
    isprofilecompleted: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        

    },
    confirmPassword: {
        type: String,
     
    },
    phoneno: {
        type: String,
     
        unique: true
    },
    address: {
        type: String
    },
    refreshToken:{
        type: String,
        default:null
    }
}, { timestamps: true }, { collection: 'users' } , );


export default mongoose.model.userSchema || mongoose.model('User', userSchema);