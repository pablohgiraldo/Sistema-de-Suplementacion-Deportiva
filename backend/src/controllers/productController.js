import Product from "../models/Product.js";

// Obtener todos los productos con filtros
export async function getProducts(req, res) {
  try {
    const {
      brand,
      price_min,
      price_max,
      category,
      exclude,
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

    // Excluir producto específico
    if (exclude) {
      query._id = { $ne: exclude };
    }

    // Configurar paginación con validaciones mejoradas
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const pageNum = Math.max(1, parseInt(page) || 1);
    const skip = (pageNum - 1) * limitNum;

    // Validar parámetros de paginación
    if (isNaN(limitNum) || isNaN(pageNum)) {
      return res.status(400).json({
        success: false,
        error: "Parámetros de paginación inválidos. 'limit' y 'page' deben ser números."
      });
    }

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

    // Calcular metadatos de paginación mejorados
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    const nextPage = hasNextPage ? pageNum + 1 : null;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + limitNum, totalCount);

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
        nextPage,
        prevPage,
        limit: limitNum,
        startIndex,
        endIndex,
        showing: `${startIndex}-${endIndex} de ${totalCount} productos`
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

// Buscar productos con índices de texto completo de MongoDB
export async function searchProducts(req, res) {
  try {
    const {
      q,
      category,
      brand,
      price_min,
      price_max,
      limit = 20,
      page = 1,
      sortBy = 'score' // score, name, price, createdAt
    } = req.query;

    // Validar parámetros de paginación
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const pageNum = Math.max(1, parseInt(page) || 1);
    const skip = (pageNum - 1) * limitNum;

    if (isNaN(limitNum) || isNaN(pageNum)) {
      return res.status(400).json({
        success: false,
        error: "Parámetros de paginación inválidos. 'limit' y 'page' deben ser números."
      });
    }

    // Construir query base
    let query = {};
    let sortQuery = {};

    // Búsqueda de texto completo usando índices de MongoDB
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
      // Ordenar por relevancia (score) cuando hay búsqueda de texto
      sortQuery = { score: { $meta: 'textScore' } };
    }

    // Filtros adicionales
    if (category) {
      const categories = Array.isArray(category)
        ? category
        : category.split(',').map(cat => cat.trim());
      query.categories = { $in: categories };
    }

    if (brand) {
      const brands = Array.isArray(brand)
        ? brand
        : brand.split(',').map(b => b.trim());
      query.brand = { $in: brands };
    }

    // Filtro por rango de precios
    if (price_min || price_max) {
      query.price = {};
      if (price_min) query.price.$gte = parseFloat(price_min);
      if (price_max) query.price.$lte = parseFloat(price_max);
    }

    // Ordenamiento personalizado
    if (sortBy !== 'score') {
      const sortOptions = {
        'name': { name: 1 },
        'price': { price: 1 },
        'createdAt': { createdAt: -1 },
        'updatedAt': { updatedAt: -1 }
      };
      sortQuery = sortOptions[sortBy] || { createdAt: -1 };
    }

    // Ejecutar consulta con paginación
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select('name brand price stock imageUrl description categories createdAt updatedAt')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    const nextPage = hasNextPage ? pageNum + 1 : null;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + limitNum, totalCount);

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
        nextPage,
        prevPage,
        limit: limitNum,
        startIndex,
        endIndex,
        showing: `${startIndex}-${endIndex} de ${totalCount} productos`
      },
      search: {
        query: q || null,
        category: category || null,
        brand: brand || null,
        price_min: price_min || null,
        price_max: price_max || null,
        sortBy,
        totalResults: totalCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
