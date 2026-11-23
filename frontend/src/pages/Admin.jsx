import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Plus, ShoppingCart, Tag, TrendingUp } from "lucide-react";
import { api } from "../lib/api.js";
import { productArt, categoryArtMap } from "../lib/art.js";
import { money, shortDate, slugify } from "../lib/format.js";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { Badge, Spinner } from "../components/UI.jsx";

function AdminContent() {
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [productForm, setProductForm] = useState({
    title: "", description: "", price: "", quantity: "10", category: "", art: "headphones",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", art: "electronics" });

  const load = async () => {
    setLoading(true);
    const [productList, categoryList, orderList] = await Promise.all([
      api.getProducts({ limit: 100, sort: "newest" }),
      api.getCategories(),
      api.getAllOrders(),
    ]);
    setProducts(productList.data);
    setCategories(categoryList);
    setOrders(orderList);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.createProduct({
        title: productForm.title,
        slug: slugify(productForm.title),
        description: productForm.description,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
        category: productForm.category,
        imgCover: productArt[productForm.art],
        images: [productArt[productForm.art]],
      });
      setProductForm({ title: "", description: "", price: "", quantity: "10", category: "", art: "headphones" });
      setMessage("Product created");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const addCategory = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.createCategory({
        name: categoryForm.name,
        slug: slugify(categoryForm.name),
        image: categoryArtMap[categoryForm.art],
      });
      setCategoryForm({ name: "", art: "electronics" });
      setMessage("Category created");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const revenue = orders.reduce((sum, order) => sum + (order.totalOrderPrice || 0), 0);
  const stats = [
    { label: "Products", value: products.length, icon: Package },
    { label: "Categories", value: categories.length, icon: Tag },
    { label: "Orders", value: orders.length, icon: ShoppingCart },
    { label: "Order value", value: money(revenue), icon: TrendingUp },
  ];

  const tabs = [
    ["overview", "Overview", LayoutDashboard],
    ["products", "Products", Package],
    ["categories", "Categories", Tag],
    ["orders", "Orders", ShoppingCart],
  ];

  return (
    <div className="container py-10 sm:py-14">
      <span className="eyebrow">Admin area</span>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500">Manage the catalogue and keep an eye on store activity.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} type="button" onClick={() => setTab(key)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === key ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {message && <p className="mt-5 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{message}</p>}

      {loading ? <Spinner label="Loading dashboard" /> : (
        <div className="mt-6">
          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div className="panel" key={label}>
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon size={19} /></span>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "products" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td><div className="flex items-center gap-3"><img src={product.imgCover} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-semibold">{product.title}</span></div></td>
                        <td>{categories.find((item) => item._id === product.category)?.name || "—"}</td>
                        <td>{money(product.price)}</td>
                        <td><Badge tone={product.quantity > 0 ? "green" : "slate"}>{product.quantity}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form className="panel h-fit" onSubmit={addProduct}>
                <h2 className="flex items-center gap-2"><Plus size={18} /> Add product</h2>
                <div className="field"><label>Title</label><input required value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} /></div>
                <div className="field mt-3"><label>Description</label><textarea required value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="field"><label>Price</label><input type="number" min="0" required value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /></div>
                  <div className="field"><label>Stock</label><input type="number" min="0" required value={productForm.quantity} onChange={(event) => setProductForm({ ...productForm, quantity: event.target.value })} /></div>
                </div>
                <div className="field mt-3"><label>Category</label><select required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}><option value="">Select…</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></div>
                <div className="field mt-3"><label>Cover art</label><select value={productForm.art} onChange={(event) => setProductForm({ ...productForm, art: event.target.value })}>{Object.keys(productArt).map((key) => <option key={key} value={key}>{key}</option>)}</select></div>
                <button className="btn btn--primary mt-5 w-full" type="submit">Create product</button>
              </form>
            </div>
          )}

          {tab === "categories" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div className="panel flex items-center gap-3" key={category._id}>
                    <img src={category.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div><strong className="block text-sm">{category.name}</strong><small className="text-slate-500">/{category.slug}</small></div>
                  </div>
                ))}
              </div>
              <form className="panel h-fit" onSubmit={addCategory}>
                <h2 className="flex items-center gap-2"><Plus size={18} /> Add category</h2>
                <div className="field"><label>Name</label><input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} /></div>
                <div className="field mt-3"><label>Cover art</label><select value={categoryForm.art} onChange={(event) => setCategoryForm({ ...categoryForm, art: event.target.value })}>{Object.keys(categoryArtMap).map((key) => <option key={key} value={key}>{key}</option>)}</select></div>
                <button className="btn btn--primary mt-5 w-full" type="submit">Create category</button>
              </form>
            </div>
          )}

          {tab === "orders" && (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-semibold">#{order._id.slice(-6).toUpperCase()}</td>
                      <td>{order.shippingAddress?.city || "—"}</td>
                      <td>{shortDate(order.createdAt)}</td>
                      <td>{order.paymentMethod}</td>
                      <td className="font-bold">{money(order.totalOrderPrice)}</td>
                      <td><Badge tone={order.isDelivered ? "green" : "amber"}>{order.isDelivered ? "Delivered" : "Processing"}</Badge></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="6" className="py-8 text-center text-slate-500">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return <ProtectedRoute admin><AdminContent /></ProtectedRoute>;
}
