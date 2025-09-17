import Product from "../models/Product.js";

// Datos de ejemplo para desarrollo sin MongoDB
const sampleProducts = [
  {
    _id: "1",
    name: "Designer Whey Protein",
    description: "Germany's No. 1 whey protein powder",
    price: 167580,
    currency: "COP",
    category: "Protein Powder",
    brand: "SuperGains",
    image: "https://via.placeholder.com/300x300?text=Designer+Whey",
    stock: 50,
    rating: 5,
    reviews: 7607,
    isBestseller: true
  },
  {
    _id: "2", 
    name: "Isoclear Whey Protein Isolate",
    description: "Refreshingly clear protein drink",
    price: 222180,
    currency: "COP",
    category: "Protein Powder",
    brand: "SuperGains",
    image: "https://via.placeholder.com/300x300?text=Isoclear+Whey",
    stock: 30,
    rating: 5,
    reviews: 8526,
    isBestseller: true
  },
  {
    _id: "3",
    name: "Designer Protein Bar",
    description: "Protein bars with no added sugar",
    price: 112980,
    currency: "COP", 
    category: "Protein Bars",
    brand: "SuperGains",
    image: "https://via.placeholder.com/300x300?text=Protein+Bar",
    stock: 25,
    rating: 5,
    reviews: 7628,
    isBestseller: true
  },
  {
    _id: "4",
    name: "Ultrapure Creatine Powder",
    description: "High-quality micro creatine powder",
    price: 125580,
    currency: "COP",
    category: "Performance",
    brand: "SuperGains", 
    image: "https://via.placeholder.com/300x300?text=Creatine",
    stock: 40,
    rating: 5,
    reviews: 1570,
    isBestseller: true
  }
];

// Obtener todos los productos
export async function getProducts(req, res) {
  try {
    // Intentar obtener de MongoDB primero
    try {
      const products = await Product.find().limit(50).lean();
      res.json({ success: true, count: products.length, data: products });
    } catch (dbError) {
      // Si no hay MongoDB, usar datos de ejemplo
      console.log("📦 Usando datos de ejemplo (MongoDB no disponible)");
      res.json({ success: true, count: sampleProducts.length, data: sampleProducts });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Obtener un producto por ID
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Crear un nuevo producto
export async function createProduct(req, res) {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// Actualizar un producto
export async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// Eliminar un producto
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }
    res.json({ success: true, message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Buscar productos por nombre o categoría
export async function searchProducts(req, res) {
  try {
    const { q, category } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    const products = await Product.find(query).lean();
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
