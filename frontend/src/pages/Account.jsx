import { useState } from "react";
import { LayoutDashboard, LogOut, MapPin, Package, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useStore } from "../lib/store.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { EmptyState } from "../components/UI.jsx";

function AccountContent() {
  const { user, setUser, signOut, isAdmin, notify } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddress, setNewAddress] = useState({ city: "", street: "", phone: "" });
  const [password, setPassword] = useState({ currentPassword: "", password: "" });
  const [busy, setBusy] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const updated = await api.updateMe(profile);
      setUser(updated);
      notify("Profile updated");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const loadAddresses = () => api.getAddresses().then(setAddresses).catch(() => {});

  const addAddress = async (event) => {
    event.preventDefault();
    try {
      setAddresses(await api.addAddress(newAddress));
      setNewAddress({ city: "", street: "", phone: "" });
      notify("Address added");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const removeAddress = async (addressId) => {
    try {
      setAddresses(await api.removeAddress(addressId));
      notify("Address removed");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.changePassword(password);
      setPassword({ currentPassword: "", password: "" });
      notify("Password updated");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: UserRound },
    { key: "addresses", label: "Addresses", icon: MapPin },
    { key: "orders", label: "Orders", icon: Package },
    { key: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Your space</span>
          <h1 className="text-3xl font-bold">Hello, {user?.name?.split(" ")[0] || "there"}</h1>
          <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
        </div>
        <button className="btn btn--ghost btn--sm" type="button" onClick={() => { signOut(); navigate("/"); }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === "orders") { navigate("/orders"); return; }
                setTab(key);
                if (key === "addresses") loadAddresses();
              }}
              className={`flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${tab === key ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
          {isAdmin && (
            <Link className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50" to="/admin">
              <LayoutDashboard size={17} /> Admin dashboard
            </Link>
          )}
        </aside>

        <div className="panel">
          {tab === "profile" && (
            <>
              <h2>Profile details</h2>
              <form className="max-w-md space-y-4" onSubmit={saveProfile}>
                <div className="field">
                  <label htmlFor="profile-name">Full name</label>
                  <input id="profile-name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
                </div>
                <div className="field">
                  <label htmlFor="profile-email">Email address</label>
                  <input id="profile-email" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
                </div>
                <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
              </form>
            </>
          )}

          {tab === "addresses" && (
            <>
              <h2>Saved addresses</h2>
              {addresses.length === 0 ? (
                <p className="mb-5 text-sm text-slate-500">No saved addresses yet.</p>
              ) : (
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <div key={address._id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                      <strong className="flex items-center gap-2"><MapPin size={15} className="text-brand-700" /> {address.city}</strong>
                      <p className="mt-1 text-slate-600">{address.street}</p>
                      <p className="text-slate-500">{address.phone}</p>
                      <button className="mt-3 text-xs font-bold text-rose-600" type="button" onClick={() => removeAddress(address._id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <form className="max-w-md space-y-4 border-t border-slate-100 pt-6" onSubmit={addAddress}>
                <h3 className="text-base font-bold">Add a new address</h3>
                <div className="field"><label htmlFor="addr-street">Street</label><input id="addr-street" required value={newAddress.street} onChange={(event) => setNewAddress({ ...newAddress, street: event.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="field"><label htmlFor="addr-city">City</label><input id="addr-city" required value={newAddress.city} onChange={(event) => setNewAddress({ ...newAddress, city: event.target.value })} /></div>
                  <div className="field"><label htmlFor="addr-phone">Phone</label><input id="addr-phone" required value={newAddress.phone} onChange={(event) => setNewAddress({ ...newAddress, phone: event.target.value })} /></div>
                </div>
                <button className="btn btn--outline btn--sm" type="submit">Add address</button>
              </form>
            </>
          )}

          {tab === "security" && (
            <>
              <h2>Change password</h2>
              <form className="max-w-md space-y-4" onSubmit={changePassword}>
                <div className="field"><label htmlFor="current-password">Current password</label><input id="current-password" type="password" required value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></div>
                <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" required minLength={6} value={password.password} onChange={(event) => setPassword({ ...password, password: event.target.value })} /></div>
                <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  return <ProtectedRoute><AccountContent /></ProtectedRoute>;
}
