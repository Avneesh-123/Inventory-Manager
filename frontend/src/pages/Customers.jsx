import { useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../api/client";
import Alert from "../components/Alert";

const emptyForm = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const { data: customers, loading, error, reload, setError } = useAsync(
    () => api.getCustomers(),
    []
  );
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = "Full name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email";
    }
    if (!form.phone.trim()) errors.phone = "Phone is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!validate()) return;

    try {
      await api.createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setForm(emptyForm);
      setSuccess("Customer added successfully.");
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    setSuccess("");
    setError("");
    try {
      await api.deleteCustomer(id);
      setSuccess("Customer deleted.");
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="page-header">
        <h2>Customers</h2>
        <p>Manage customer records</p>
      </div>

      <Alert type="error" message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="grid-2">
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3>Add Customer</h3>
          <label>
            Full Name
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Jane Doe"
            />
            {formErrors.full_name && <span className="field-error">{formErrors.full_name}</span>}
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@example.com"
            />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 555 0100"
            />
            {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
          </label>
          <button type="submit" className="btn btn-primary">
            Add Customer
          </button>
        </form>

        <div className="card">
          <div className="card-header">
            <h3>Customer List</h3>
          </div>
          {loading ? (
            <p className="muted">Loading customers...</p>
          ) : !customers?.length ? (
            <p className="muted">No customers yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.full_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td className="actions">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(customer.id)}
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
