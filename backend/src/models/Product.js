import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    imageUrl: String,
    description: String,
    categories: [String]
  },
  { timestamps: true }
);
export default mongoose.model("Product", productSchema);
