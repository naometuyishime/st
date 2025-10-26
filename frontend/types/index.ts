export interface User {
  id: string;
  email: string;
  username: string;
  role:
    | "admin"
    | "stakeholder_user"
    | "subclusterfocalperson"
    | "stakeholder_admin";
  status: "active" | "inactive" | "pending";
  createdAt?: string;
  updatedAt?: string;
  // Optional fields that might be present
  stakeholderId?: string;
  subClusters?: Array<{ id: string; name: string }>;
  name?: string;
  phone?: string;
  extra?: {
    fullName?: string;
    organization_name?: string;
    stakeholderCategoryId?: string;
    planLevel?: string;
    province?: string;
    district?: string;
    subClusters?: string[];
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  canManageStakeholder: (stakeholderId: string) => boolean;
  canManageKPI: (kpiSubClusterId: string) => boolean;
  refreshUser?: () => Promise<boolean>;
}

export interface Stakeholder {
  id: string;
  userId: string;
  organizationName: string;
  districtId?: string;
  provinceId?: string;
  countryId: string;
  stakeholderCategoryId: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  province: string;
  district: string;
  subClusters: string[];
  level: string;
  activePlans: number;
  completedReports: number;
  joinDate: string;
  status: "Active" | "Inactive" | "Suspended";
}

export interface StakeholderCategory {
  id: string;
  name: string;
  description: string;
}

export interface SubCluster {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  countryId: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
}

export interface KPI {
  id: string;
  subClusterId: string;
  name: string;
  description: string;
  unit: string;
  kpiCategoryId: string;
  stakeholderCategoryId: string;
  subCluster: string;
  category: string;
  status: "Active" | "Inactive";
  disaggregation?: { id: string; name: string }[];
}

export interface FinancialYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  planStartDate: string;
  planEndDate: string;
  reportStartDate: string;
  reportEndDate: string;
}

export interface ActionPlan {
  id: string;
  yearId: string;
  stakeholderSubclusterId: string;
  document?: string;
  comment?: string;
  description: string;
  planLevel: "country" | "province" | "district";
  districtId?: string;
  provinceId?: string;
  countryId: string;
}

export interface Quarter {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reportDueDate: string;
  yearId: string;
}

export interface Report {
  id: string;
  actionPlanId: string;
  yearId: string;
  actualValue: number;
  kpiPlanId: string;
  quarterId: string;
  progressSummary: string;
  reportDocument?: string;
}

// types/audit.ts or add to your existing types
export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  userAgent: string;
  logIpAddress: string;
  logDescription: string;
  actionDetails: string;
  timestamps: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
