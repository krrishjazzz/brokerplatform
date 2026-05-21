/** Legacy role-based listing access (kept for backward compatibility). */
export function userCanList(role: string): boolean {
  return role === "OWNER" || role === "BROKER" || role === "ADMIN";
}

/** Preferred: explicit canList flag, then legacy role. */
export function profileCanList(profile: { role: string; canList?: boolean }): boolean {
  if (profile.canList === true) return true;
  return userCanList(profile.role);
}

export function profileNeedsCompletion(name: string | null | undefined): boolean {
  return !name?.trim();
}

export function canAccessBrokerWorkspace(brokerStatus?: string | null): boolean {
  return brokerStatus === "APPROVED";
}

export type AccountCapabilityUser = {
  role: string;
  brokerStatus?: string | null;
  canList?: boolean;
  hasBrokerApplication?: boolean;
};

export type AuthCapabilities = {
  canList: boolean;
  canAccessBrokerWorkspace: boolean;
  hasBrokerApplication: boolean;
  isApprovedBroker: boolean;
  isPendingBroker: boolean;
  isRejectedBroker: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isBuyer: boolean;
  accountLabel: string;
  accountBadgeVariant: "default" | "accent" | "blue" | "warning" | "error" | "success";
};

export function deriveAuthCapabilities(user: AccountCapabilityUser): AuthCapabilities {
  const canList = profileCanList(user);
  const hasBrokerApplication = Boolean(
    user.hasBrokerApplication ??
      (user.brokerStatus === "PENDING" ||
        user.brokerStatus === "APPROVED" ||
        user.brokerStatus === "REJECTED")
  );
  const isApprovedBroker = canAccessBrokerWorkspace(user.brokerStatus);
  const isPendingBroker = hasBrokerApplication && user.brokerStatus === "PENDING";
  const isRejectedBroker = hasBrokerApplication && user.brokerStatus === "REJECTED";
  const isAdmin = user.role === "ADMIN";
  const isOwner = canList && !isAdmin;
  const isBuyer = !canList && !isApprovedBroker && !isAdmin;

  let accountLabel = "Buyer account";
  let accountBadgeVariant: AuthCapabilities["accountBadgeVariant"] = "default";

  if (isAdmin) {
    accountLabel = "Admin";
    accountBadgeVariant = "error";
  } else if (isApprovedBroker && isOwner) {
    accountLabel = "Owner - Approved broker";
    accountBadgeVariant = "blue";
  } else if (isApprovedBroker) {
    accountLabel = "Approved broker";
    accountBadgeVariant = "blue";
  } else if (isPendingBroker) {
    accountLabel = "Broker application pending";
    accountBadgeVariant = "warning";
  } else if (isRejectedBroker) {
    accountLabel = "Application not approved";
    accountBadgeVariant = "error";
  } else if (isOwner) {
    accountLabel = "Owner tools active";
    accountBadgeVariant = "accent";
  }

  return {
    canList,
    canAccessBrokerWorkspace: isApprovedBroker,
    hasBrokerApplication,
    isApprovedBroker,
    isPendingBroker,
    isRejectedBroker,
    isAdmin,
    isOwner,
    isBuyer,
    accountLabel,
    accountBadgeVariant,
  };
}

/** Human-readable capability lines for profile / dashboard. */
export function getAccountCapabilityLines(user: AccountCapabilityUser): string[] {
  const caps = deriveAuthCapabilities(user);
  const lines: string[] = [];

  if (caps.isAdmin) {
    lines.push("Full platform administration");
    return lines;
  }

  if (caps.isBuyer) {
    lines.push("Search, save, and enquire on listings");
    lines.push("Post property requirements for KrrishJazz matching");
  }

  if (caps.canList) {
    lines.push("List and manage your properties");
    lines.push("Track enquiries and listing freshness");
  }

  if (caps.isApprovedBroker) {
    lines.push("Broker workspace: requirements, inventory, and collaborations");
  } else if (caps.isPendingBroker) {
    lines.push("Broker application under review");
  } else if (caps.isRejectedBroker) {
    lines.push("Broker application was not approved — you can re-apply from the brokers page");
  }

  return lines;
}
