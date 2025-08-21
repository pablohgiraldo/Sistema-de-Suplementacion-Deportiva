import { useEffect, useState } from "react";
import api from "./services/api";
import ProductCard from "./components/productCard";

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Catálogo SuperGains</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => <ProductCard key={p._id} p={p} />)}
      </div>
    </main>
  );
}
