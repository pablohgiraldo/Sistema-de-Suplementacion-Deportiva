import Product from "../models/Product.js";

export async function getProducts(req, res) {
  const products = await Product.find().limit(50).lean();
  res.json(products);
}
