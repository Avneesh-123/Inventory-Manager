import { useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../api/client";
import Alert from "../components/Alert";

const emptyForm = { name: "", sku: "", price: "", quantity_in_stock: "" };

export default function Products() {
  const { data: products, loading, error, reload, setError } = useAsync(
    () => api.getProducts(),
    []
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.sku.trim()) errors.sku = "SKU is required";
    if (!form.price || Number(form.price) <= 0) errors.price = "Price must be greater than 0";
    if (form.quantity_in_stock === "" || Number(form.quantity_in_stock) < 0) {
      errors.quantity_in_stock = "Stock cannot be negative";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setSuccess("Product updated successfully.");
      } else {
        await api.createProduct(payload);
        setSuccess("Product created successfully.");
      }
      resetForm();
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setFormErrors({});
    setSuccess("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setSuccess("");
    setError("");
    try {
      await api.deleteProduct(id);
      setSuccess("Product deleted.");
      if (editingId === id) resetForm();
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage catalog and inventory levels</p>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="grid-2">
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Product name"
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </label>
          <label>
            SKU / Code
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Unique SKU"
            />
            {formErrors.sku && <span className="field-error">{formErrors.sku}</span>}
          </label>
          <label>
            Price
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />
            {formErrors.price && <span className="field-error">{formErrors.price}</span>}
          </label>
          <label>
            Quantity in Stock
            <input
              type="number"
              min="0"
              value={form.quantity_in_stock}
              onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
              placeholder="0"
            />
            {formErrors.quantity_in_stock && (
              <span className="field-error">{formErrors.quantity_in_stock}</span>
            )}
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <div className="card-header">
            <h3>Product List</h3>
          </div>
          {loading ? (
            <p className="muted">Loading products...</p>
          ) : !products?.length ? (
            <p className="muted">No products yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td><code>{product.sku}</code></td>
                      <td>${Number(product.price).toFixed(2)}</td>
                      <td>{product.quantity_in_stock}</td>
                      <td className="actions">
                        <button className="btn btn-sm" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
