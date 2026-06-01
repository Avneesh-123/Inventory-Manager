import { useAsync } from "../hooks/useAsync";
import { api } from "../api/client";
import Alert from "../components/Alert";

export default function Dashboard() {
  const { data, loading, error } = useAsync(() => api.getDashboard(), []);

  if (loading) return <p className="muted">Loading dashboard...</p>;

  return (
    <section>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your inventory and orders</p>
      </div>

      <Alert type="error" message={error} />

      {data && (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-label">Total Products</span>
              <strong className="stat-value">{data.total_products}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Total Customers</span>
              <strong className="stat-value">{data.total_customers}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Total Orders</span>
              <strong className="stat-value">{data.total_orders}</strong>
            </article>
            <article className="stat-card warning">
              <span className="stat-label">Low Stock Items</span>
              <strong className="stat-value">{data.low_stock_products.length}</strong>
            </article>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Low Stock Products</h3>
              <span className="badge">≤ 10 units</span>
            </div>
            {data.low_stock_products.length === 0 ? (
              <p className="muted">All products are sufficiently stocked.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.low_stock_products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td><code>{product.sku}</code></td>
                        <td>${Number(product.price).toFixed(2)}</td>
                        <td>
                          <span className={product.quantity_in_stock === 0 ? "text-danger" : "text-warning"}>
                            {product.quantity_in_stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
