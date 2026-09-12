import mongoose from 'mongoose';

const productTagSchema = new mongoose.Schema({
  productId: {type:string, required: true},
  variantId: {type:string, required: true},
  xposition: {type:Number, required: true},
  yposition: {type:Number, required: true},
  videoId: {type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true},

}, { timestamps: true });

export default mongoose.model.ProductTag || mongoose.model('ProductTag', productTagSchema);