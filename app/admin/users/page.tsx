"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  is_verified: boolean;
  user_status: string | null;
  created_at: string;
  email?: string; // from auth.users (if we can join or fetch separately)
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (!error) {
      setUsers(data || []);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    setEditForm({ ...user });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name,
        phone: editForm.phone,
        phone_verified: editForm.phone_verified,
        is_verified: editForm.is_verified,
        user_status: editForm.user_status,
      })
      .eq("id", selectedUser.id);

    setSaving(true); // reset state
    if (!error) {
      setToast({ msg: "User updated successfully", type: "success" });
      fetchUsers();
      setSelectedUser(null);
    } else {
      setToast({ msg: error.message, type: "error" });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ padding: "40px" }}>
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", padding: "12px 24px", borderRadius: "12px",
          background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", fontWeight: 600, zIndex: 1000
        }}>
          {toast.msg}
        </div>
      )}

      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>User Management</h1>
        <p style={{ color: "#64748b" }}>Verify users, manage phone numbers, and update account statuses.</p>
      </header>

      <div style={{ marginBottom: "24px" }}>
        <input
          style={{ width: "100%", maxWidth: "400px", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Verified</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{user.full_name || "Unnamed User"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{user.id}</div>
                  </td>
                  <td style={styles.td}>
                    {user.phone || "No phone"}
                    {user.phone_verified && <span style={{ marginLeft: "8px", color: "#10b981" }}>✓</span>}
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px", background: "#f1f5f9" }}>
                      {user.user_status || "Standard"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {user.is_verified ? 
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Verified</span> : 
                      <span style={{ color: "#94a3b8" }}>Unverified</span>
                    }
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(user)} style={styles.editBtn}>Edit / Verify</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}>
          <div style={styles.modal}>
            <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontWeight: 700 }}>Edit User: {selectedUser.full_name}</h2>
              <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} value={editForm.full_name || ""} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input style={styles.input} value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>User Status</label>
                <select style={styles.input} value={editForm.user_status || ""} onChange={(e) => setEditForm({ ...editForm, user_status: e.target.value })}>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={editForm.phone_verified} onChange={(e) => setEditForm({ ...editForm, phone_verified: e.target.checked })} />
                  Phone Verified
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={editForm.is_verified} onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })} />
                  Account Verified
                </label>
              </div>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  th: { padding: "16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b" },
  td: { padding: "16px", fontSize: "0.9rem", color: "#334155" },
  editBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "500px" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginBottom: "6px" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none" },
  saveBtn: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", fontWeight: 600, cursor: "pointer" }
};
