import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";

const sample = [
  {
    name: "Whey Protein 2lb",
    brand: "SuperGains",
    price: 149900,
    stock: 20,
    imageUrl: "",
    description: "Proteína de suero para recuperación muscular.",
    categories: ["proteina"]
  },
  {
    name: "Creatina 300g",
    brand: "SuperGains",
    price: 89900,
    stock: 35,
    imageUrl: "",
    description: "Creatina monohidratada para fuerza y rendimiento.",
    categories: ["creatina"]
  },
  {
    name: "BCAA 200g",
    brand: "SuperGains",
    price: 69900,
    stock: 15,
    imageUrl: "",
    description: "Aminoácidos de cadena ramificada.",
    categories: ["aminoacidos"]
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany({});
    await Product.insertMany(sample);
    console.log("✅ Seed completado");
  } catch (e) {
    console.error("❌ Seed error:", e.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
