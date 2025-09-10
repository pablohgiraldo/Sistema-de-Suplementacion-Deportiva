import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProductCard from './components/productCard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useEffect, useState } from 'react';
import api from './services/api';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else {
          console.error("Formato de respuesta inesperado:", res.data);
          setError("Formato de respuesta inesperado del servidor");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        setError("Error al cargar los productos");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="w-full p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Cargando productos...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Catálogo SuperGains</h1>
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay productos disponibles
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => <ProductCard key={p._id} p={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
