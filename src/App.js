
import './styles.css';
import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function App() {
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', stock: '', price: '' });
  const [history, setHistory] = useState([]);
  const [addQuantities, setAddQuantities] = useState({});
  const [sellQuantities, setSellQuantities] = useState({});

  const handleAdd = (productToAdd, quantity) => {
    if (isNaN(quantity) || quantity <= 0) return;
    const updatedProducts = products.map(p =>
      p.id === productToAdd.id ? {
        ...p,
        stock: p.stock + quantity
      } : p
    );
    setProducts(updatedProducts);
    const updatedProduct = updatedProducts.find(p => p.id === productToAdd.id);
    setHistory([{ action: 'Agregar Stock', product: updatedProduct, quantity, date: new Date() }, ...history]);
  };

  const handleAddNew = () => {
    const stock = parseInt(newProduct.stock);
    const price = parseFloat(newProduct.price);
    if (!newProduct.name || isNaN(stock) || isNaN(price)) return;
    const product = {
      ...newProduct,
      id: Date.now(),
      stock,
      price
    };
    setProducts([...products, product]);
    setHistory([{ action: 'Agregar Producto', product, quantity: product.stock, date: new Date() }, ...history]);
    setNewProduct({ name: '', stock: '', price: '' });
  };

  const handleEdit = (id, field, value) => {
    const updated = products.map(p => p.id === id ? { ...p, [field]: value } : p);
    setProducts(updated);
    const product = updated.find(p => p.id === id);
    setHistory([{ action: 'Editar', product, date: new Date() }, ...history]);
  };

  const handleSell = (productToSell, quantity) => {
    if (isNaN(quantity) || quantity <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }
    if (quantity > productToSell.stock) {
      alert("No hay suficiente stock disponible para esta venta");
      return;
    }
    const updatedProducts = products.map(p =>
      p.id === productToSell.id ? { ...p, stock: p.stock - quantity } : p
    );
    setProducts(updatedProducts);
    const updatedProduct = updatedProducts.find(p => p.id === productToSell.id);
    setHistory([{ action: 'Venta', product: updatedProduct, quantity, date: new Date() }, ...history]);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Resumen de Stock", 14, 16);
    const tableRows = products.map(p => [p.name, p.stock, `$${p.price}`, `$${(p.stock * p.price).toFixed(2)}`]);
    doc.autoTable({
      head: [["Producto", "Stock", "Precio", "Total"]],
      body: tableRows,
      startY: 20
    });
    doc.save("stock_resumen.pdf");
  };

  if (!logged) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
        <h2>Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button
          onClick={() => {
            if (username === 'admin' && password === '1234') setLogged(true);
            else alert('Credenciales incorrectas');
          }}
        >
          Ingresar
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>📦 Panel de Stock</h1>
      <button style={{ marginBottom: 20 }} onClick={() => setLogged(false)}>Cerrar sesión</button>

      <h2>Agregar producto</h2>
      <input
        placeholder="Nombre"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        placeholder="Stock"
        type="number"
        value={newProduct.stock}
        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
      />
      <input
        placeholder="Precio"
        type="number"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
      />
      <button onClick={handleAddNew}>Agregar</button>

      <h2 style={{ marginTop: 20 }}>Lista de productos</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Agregar</th>
            <th>Vender</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td><input value={p.name} onChange={(e) => handleEdit(p.id, 'name', e.target.value)} /></td>
              <td><input type="number" value={p.stock} onChange={(e) => handleEdit(p.id, 'stock', parseInt(e.target.value))} /></td>
              <td><input type="number" value={p.price} onChange={(e) => handleEdit(p.id, 'price', parseFloat(e.target.value))} /></td>
              <td>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={addQuantities[p.id] || ''}
                  onChange={(e) => setAddQuantities({ ...addQuantities, [p.id]: parseInt(e.target.value) })}
                  style={{ width: '60px', marginRight: '5px' }}
                />
                <button onClick={() => handleAdd(p, addQuantities[p.id] || 0)}>Agregar</button>
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={sellQuantities[p.id] || ''}
                  onChange={(e) => setSellQuantities({ ...sellQuantities, [p.id]: parseInt(e.target.value) })}
                  style={{ width: '60px', marginRight: '5px' }}
                />
                <button onClick={() => handleSell(p, sellQuantities[p.id] || 0)}>Vender</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={downloadPDF} style={{ marginTop: 10 }}>Descargar PDF</button>

      <h2 style={{ marginTop: 20 }}>Historial</h2>
      <ul className="history">
        {history.map((h, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            [{new Date(h.date).toLocaleString()}] {h.action} - {h.product.name} {h.quantity ? `(${h.quantity})` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
