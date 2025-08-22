import { useEffect, useState } from "react";
import api from "./services/api";
import ProductCard from "./components/productCard";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        // El backend ahora devuelve { success: true, count: X, data: [...] }
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
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando productos...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
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
    </main>
  );
}
