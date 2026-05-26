export type OwnerListingStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

/** Legacy role-based listing access (kept for backward compatibility). */
export function userCanList(role: string): boolean {
  return role === "OWNER" || role === "BROKER" || role === "ADMIN";
}

/** Listing tools enabled (canList flag or legacy owner/broker role). */
export function profileCanList(profile: {
  role: string;
  canList?: boolean;
}): boolean {
  if (profile.canList === true) return true;
  return userCanList(profile.role);
}

/** Can submit or edit property listings (listing tools + approved owner status). */
export function profileCanPostProperty(profile: {
  role: string;
  canList?: boolean;
  ownerStatus?: string | null;
}): boolean {
  if (profile.role === "ADMIN") return true;
  if (!profileCanList(profile)) return false;
  const status = (profile.ownerStatus || "NONE") as OwnerListingStatus;
  return status === "APPROVED";
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
  ownerStatus?: string | null;
  hasBrokerApplication?: boolean;
};

export type AuthCapabilities = {
  /** Can use marketplace search, save, and buyer enquiries */
  canSearch: boolean;
  canSave: boolean;
  canList: boolean;
  canPostProperty: boolean;
  ownerStatus: OwnerListingStatus;
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
  const canPostProperty = profileCanPostProperty(user);
  const ownerStatus = (user.ownerStatus || (canList ? "APPROVED" : "NONE")) as OwnerListingStatus;
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
    accountLabel = "Listing tools active";
    accountBadgeVariant = "accent";
  } else if (isApprovedBroker) {
    accountLabel = "Approved broker";
    accountBadgeVariant = "blue";
  } else if (isPendingBroker) {
    accountLabel = "Broker application pending";
    accountBadgeVariant = "warning";
  } else if (isRejectedBroker) {
    accountLabel = "Application not approved";
    accountBadgeVariant = "error";
  } else if (ownerStatus === "PENDING") {
    accountLabel = "Listing tools pending approval";
    accountBadgeVariant = "warning";
  } else if (ownerStatus === "REJECTED") {
    accountLabel = "Listing access not approved";
    accountBadgeVariant = "error";
  } else if (isOwner && canPostProperty) {
    accountLabel = "Listing tools active";
    accountBadgeVariant = "accent";
  } else if (isOwner) {
    accountLabel = "Listing tools limited";
    accountBadgeVariant = "warning";
  }

  return {
    canSearch: true,
    canSave: true,
    canList,
    canPostProperty,
    ownerStatus,
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
export function getAccountCapabilityLines(
  user: AccountCapabilityUser,
  options?: { ownerDashboard?: boolean }
): string[] {
  const caps = deriveAuthCapabilities(user);
  const ownerDashboard = options?.ownerDashboard ?? false;
  const lines: string[] = [];

  if (caps.isAdmin) {
    lines.push("Full platform administration");
    return lines;
  }

  if (caps.isBuyer && !ownerDashboard) {
    lines.push("Search, save, and enquire on listings");
    lines.push("Post property requirements for KrrishJazz matching");
  }

  if (caps.canList) {
    if (caps.canPostProperty) {
      lines.push("List and manage your properties");
      lines.push("Track buyer interest, visits, and listing freshness");
      lines.push("KrrishJazz coordinates callbacks and closure support");
    } else if (caps.ownerStatus === "PENDING") {
      lines.push("Listing tools are pending KrrishJazz approval");
    } else if (caps.ownerStatus === "REJECTED") {
      lines.push("Listing access was not approved — contact KrrishJazz");
    } else {
      lines.push("Enable listing tools from Profile to post properties");
    }
  }

  if (!ownerDashboard) {
    if (caps.isApprovedBroker) {
      lines.push("Broker workspace: requirements, inventory, and collaborations");
    } else if (caps.isPendingBroker) {
      lines.push("Broker application under review");
    } else if (caps.isRejectedBroker) {
      lines.push("Broker application was not approved — you can re-apply from the brokers page");
    }
  } else if (caps.isApprovedBroker) {
    lines.push("Partner workspace is available separately from this owner dashboard");
  }

  return lines;
}
