"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  SearchBox,
  SectionHeader,
  Skeleton,
} from "@/components/admin/admin-primitives";

export function AllUsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleVariant = (r: string) => {
    switch (r) {
      case "ADMIN": return "error";
      case "BROKER": return "blue";
      case "OWNER": return "warning";
      default: return "default";
    }
  };

  const filteredUsers = useMemo(() => users.filter((u) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [u.name, u.phone, u.email, u.role]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  }), [query, users]);

  return (
    <div>
      <SectionHeader
        eyebrow="Accounts"
        title="All Users"
        description="Search customers, owners, brokers, and admins from the same account table."
        right={<SearchBox value={query} onChange={setQuery} placeholder="Search name, phone, role..." />}
      />
      {loading ? (
        <Skeleton />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No users found" description="Try another name, phone number, email, or role." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Email</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Role</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name || "--"}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.phone}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email || "--"}</td>
                  <td className="px-4 py-3"><Badge variant={roleVariant(u.role) as any}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */
