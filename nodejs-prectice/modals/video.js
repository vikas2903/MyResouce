import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title:{ type: String, required: true},
    description:{ type: String, required: true},
    url:{ type: String, required: true},
    thumbnail:{ type: String, required: true},
    isActive:{ type: Boolean, default: true},
}, { timestamps: true });

export default mongoose.model.Video || mongoose.model('Video', videoSchema);