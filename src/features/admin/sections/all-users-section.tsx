"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Building,
  Clock,
  Users,
  UserCheck,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Activity,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  EmptyState,
  SearchBox,
  SectionHeader,
  Skeleton,
  parseServiceAreas,
} from "@/components/admin/admin-primitives";
import { PropertyOpsModal } from "@/components/admin/property-ops-modal";
import { cn, formatPrice } from "@/lib/utils";

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
