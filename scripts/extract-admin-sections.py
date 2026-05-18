from pathlib import Path

admin = Path("src/app/admin/page.tsx").read_text(encoding="utf-8")

sections = [
    ("dashboard-section", "function DashboardSection()", "function OpsQueueCard"),
    ("pending-properties-section", "function PendingPropertiesSection()", "function AllPropertiesSection"),
    ("all-properties-section", "function AllPropertiesSection()", "function PendingBrokersSection"),
    ("pending-brokers-section", "function PendingBrokersSection()", "function AllUsersSection"),
    ("all-users-section", "function AllUsersSection()", "function SettingsSection"),
    ("settings-section", "function SettingsSection()", None),
]

out_dir = Path("src/features/admin/sections")
out_dir.mkdir(parents=True, exist_ok=True)

COMMON_IMPORTS = '''"use client";

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
'''

for name, start_marker, end_marker in sections:
    start = admin.index(start_marker)
    if end_marker:
        end = admin.index(end_marker, start)
        chunk = admin[start:end].rstrip()
    else:
        chunk = admin[start:].rstrip()

    fn_name = start_marker.replace("function ", "").replace("()", "")
    chunk = chunk.replace(f"function {fn_name}", f"export function {fn_name}", 1)

    if name == "dashboard-section":
        # include OpsQueueCard in same file
        pass

    body = COMMON_IMPORTS + "\n" + chunk + "\n"
    path = out_dir / f"{name}.tsx"
    path.write_text(body, encoding="utf-8")
    print("wrote", path, len(body))
