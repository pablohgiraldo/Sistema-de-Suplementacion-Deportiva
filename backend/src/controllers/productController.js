import Product from "../models/Product.js";

// Obtener todos los productos con filtros
export async function getProducts(req, res) {
  try {
    const {
      brand,
      price_min,
      price_max,
      category,
      limit = 50,
      page = 1
    } = req.query;

    // Construir query de filtros
    let query = {};

    // Filtro por marca
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Filtro por rango de precios
    if (price_min || price_max) {
      query.price = {};
      if (price_min) {
        query.price.$gte = parseFloat(price_min);
      }
      if (price_max) {
        query.price.$lte = parseFloat(price_max);
      }
    }

    // Filtro por categoría
    if (category) {
      // Permitir múltiples categorías separadas por coma
      const categories = category.split(',').map(cat => cat.trim());
      query.categories = { $in: categories };
    }

    // Configurar paginación
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * limitNum;

    // Ejecutar consulta con filtros y paginación
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select('name brand price stock imageUrl description categories createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      count: products.length,
      totalCount,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      filters: {
        brand: brand || null,
        price_min: price_min || null,
        price_max: price_max || null,
        category: category || null
      }
    });
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
