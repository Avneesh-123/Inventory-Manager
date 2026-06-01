import { useEffect, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../api/client";
import Alert from "../components/Alert";

export default function Orders() {
  const { data: orders, loading, error, reload, setError } = useAsync(() => api.getOrders(), []);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ customer_id: "", product_id: "", quantity: "1" });
  const [lineItems, setLineItems] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCustomers()])
      .then(([productList, customerList]) => {
        setProducts(productList);
        setCustomers(customerList);
      })
      .catch((err) => setError(err.message));
  }, [setError]);

  const addLineItem = () => {
    setFormErrors({});
    if (!form.product_id) {
      setFormErrors({ product_id: "Select a product" });
      return;
    }
    if (!form.quantity || Number(form.quantity) < 1) {
      setFormErrors({ quantity: "Quantity must be at least 1" });
      return;
    }
    const product = products.find((p) => p.id === Number(form.product_id));
    if (!product) return;

    const existing = lineItems.find((item) => item.product_id === product.id);
    if (existing) {
      setFormErrors({ product_id: "Product already added to order" });
      return;
    }

    setLineItems([
      ...lineItems,
      { product_id: product.id, quantity: Number(form.quantity), name: product.name, sku: product.sku },
    ]);
    setForm({ ...form, product_id: "", quantity: "1" });
  };

  const removeLineItem = (productId) => {
    setLineItems(lineItems.filter((item) => item.product_id !== productId));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setFormErrors({});

    if (!form.customer_id) {
      setFormErrors({ customer_id: "Select a customer" });
      return;
    }
    if (lineItems.length === 0) {
      setFormErrors({ items: "Add at least one product to the order" });
      return;
    }

    try {
      await api.createOrder({
        customer_id: Number(form.customer_id),
        items: lineItems.map(({ product_id, quantity }) => ({ product_id, quantity })),
      });
      setSuccess("Order created successfully. Stock has been updated.");
      setLineItems([]);
      setForm({ customer_id: form.customer_id, product_id: "", quantity: "1" });
      await reload();
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  const viewOrder = async (id) => {
    setError("");
    try {
      const order = await api.getOrder(id);
      setSelectedOrder(order);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel/delete this order? Stock will be restored.")) return;
    setSuccess("");
    setError("");
    try {
      await api.deleteOrder(id);
      setSuccess("Order cancelled. Inventory restored.");
      if (selectedOrder?.id === id) setSelectedOrder(null);
      await reload();
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="page-header">
        <h2>Orders</h2>
        <p>Create orders and track fulfillment</p>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="grid-2">
        <form className="card form-card" onSubmit={handleCreateOrder}>
          <h3>Create Order</h3>
          <label>
            Customer
            <select
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            {formErrors.customer_id && (
              <span className="field-error">{formErrors.customer_id}</span>
            )}
          </label>

          <div className="line-item-row">
            <label>
              Product
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — stock: {p.quantity_in_stock}
                  </option>
                ))}
              </select>
              {formErrors.product_id && (
                <span className="field-error">{formErrors.product_id}</span>
              )}
            </label>
            <label>
              Qty
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              {formErrors.quantity && <span className="field-error">{formErrors.quantity}</span>}
            </label>
            <button type="button" className="btn btn-secondary" onClick={addLineItem}>
              Add line
            </button>
          </div>

          {formErrors.items && <span className="field-error">{formErrors.items}</span>}

          {lineItems.length > 0 && (
            <ul className="line-items">
              {lineItems.map((item) => (
                <li key={item.product_id}>
                  <span>
                    {item.name} <code>{item.sku}</code> × {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeLineItem(item.product_id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button type="submit" className="btn btn-primary" disabled={lineItems.length === 0}>
            Place Order
          </button>
        </form>

        <div className="card">
          <div className="card-header">
            <h3>Order List</h3>
          </div>
          {loading ? (
            <p className="muted">Loading orders...</p>
          ) : !orders?.length ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>${Number(order.total_amount).toFixed(2)}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                      <td className="actions">
                        <button className="btn btn-sm" onClick={() => viewOrder(order.id)}>
                          Details
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(order.id)}
                        >
                          Cancel
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

      {selectedOrder && (
        <div className="card order-detail">
          <div className="card-header">
            <h3>Order #{selectedOrder.id}</h3>
            <button className="btn btn-sm" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>
          <p>
            <strong>Customer:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})
          </p>
          <p>
            <strong>Total:</strong> ${Number(selectedOrder.total_amount).toFixed(2)}
          </p>
          <p>
            <strong>Placed:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td><code>{item.product_sku}</code></td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unit_price).toFixed(2)}</td>
                    <td>${Number(item.line_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
