import type { User } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `API ${res.status} ${res.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Try to parse JSON; if empty or invalid, return as-is
    const text = await res.text();
    if (!text) return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch (parseErr) {
      // If response is not JSON, return raw text
      return text as unknown as T;
    }
  } catch (err) {
    if (err instanceof Error) {
      // Normalize fetch/network errors so callers receive Error instead of TypeError
      throw new Error(`Network request to ${url} failed: ${err.message}`);
    }
    throw err;
  }
}

// Helper function for authenticated requests
async function authenticatedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export const api = {
  // Auth endpoints
  login: (email: string, password: string) =>
    request<{ message: string; token: string; user?: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

register: (
  username: string,
  email: string,
  password: string,
  role: string,
  stakeholderId?: string,
  subClusterId?: string
) =>
  request<{ message: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      role,
      ...(stakeholderId && { stakeholderId }),
      ...(subClusterId && { subClusterId }),
    }),
  }),


  activateAccount: (token: string) =>
    request<{ message: string }>(
      `/auth/activate?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
      }
    ),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, token: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, newPassword }),
    }),

  // Profile endpoints
  getProfile: (token: string) =>
    authenticatedRequest<User>("/auth/profile", token, {
      method: "GET",
    }),

  updateProfile: (token: string, userData: Partial<User>) =>
    authenticatedRequest<{ user: User }>("/auth/profile", token, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  // Users endpoints
  getUsers: (token: string) =>
    authenticatedRequest<User[]>("/users", token, { method: "GET" }),

  getUserById: (token: string, id: string) =>
    authenticatedRequest<User>(`/users/${id}`, token, { method: "GET" }),

  bulkImportUsers: (token: string, users: any[]) =>
    authenticatedRequest<{
      message: string;
      created: number;
      skipped: number;
      total: number;
    }>("/users/import", token, {
      method: "POST",
      body: JSON.stringify({ users }),
    }),

  updateUser: (token: string, id: string, data: Partial<User>) =>
    authenticatedRequest<{ user: User }>(`/users/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (token: string, id: string) =>
    authenticatedRequest<{ message: string }>(`/users/${id}`, token, {
      method: "DELETE",
    }),

  // KPI endpoints - UPDATED WITH AUTH
  getSubClusters: (token?: string) => {
    if (token) {
      return authenticatedRequest<
        Array<{
          id: string;
          name: string;
          description?: string;
          focalPersonId?: string;
        }>
      >("/kpi/sub-cluster", token, { method: "GET" });
    }
    return request<
      Array<{
        id: string;
        name: string;
        description?: string;
        focalPersonId?: string;
      }>
    >("/kpi/sub-cluster", { method: "GET" });
  },

  createSubCluster: (
    token: string,
    data: { name: string; description?: string;  }
  ) =>
    authenticatedRequest<any>("/kpi/sub-cluster", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // UPDATED: getKpis now requires token
  getKpis: (
    token: string,
    params?: { subClusterId?: string; categoryId?: string }
  ) => {
    const qs = new URLSearchParams();
    if (params?.subClusterId) qs.set("subClusterId", params.subClusterId);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    const path = qs.toString() ? `/kpi/kpi?${qs.toString()}` : "/kpi/kpi";
    return authenticatedRequest<any[]>(path, token, { method: "GET" });
  },

  createKPI: (token: string, data: any) =>
    authenticatedRequest<any>("/kpi/kpi", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // UPDATED: getKpiCategories now requires token
  getKpiCategories: (token: string, params?: { subClusterId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.subClusterId) qs.set("subClusterId", params.subClusterId);
    const path = qs.toString()
      ? `/kpi/kpi-category?${qs.toString()}`
      : "/kpi/kpi-category";
    return authenticatedRequest<
      Array<{ id: string; name: string; subClusterId: string }>
    >(path, token, { method: "GET" });
  },

  createKpiCategory: (token: string, data: any) =>
    authenticatedRequest<any>("/kpi/kpi-category", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Action Plans
  getActionPlans: (
    token: string,
    params?: {
      subClusterId?: string;
      yearId?: string;
      kpiId?: string;
      countryId?: string;
    }
  ) => {
    const qs = new URLSearchParams();
    if (params?.subClusterId) qs.set("subClusterId", params.subClusterId);
    if (params?.yearId) qs.set("yearId", params.yearId);
    if (params?.kpiId) qs.set("kpiId", params.kpiId);
    if (params?.countryId) qs.set("countryId", params.countryId);
    const path = qs.toString()
      ? `/action-plans?${qs.toString()}`
      : "/action-plans";
    return authenticatedRequest<any[]>(path, token, { method: "GET" });
  },

  getActionPlan: (id: string, token: string) => {
    const path = `/action-plans/${id}`;
    return authenticatedRequest<any>(path, token, { method: "GET" });
  },

  createActionPlan: (token: string, data: any) =>
    authenticatedRequest<any>("/action-plans", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateActionPlan: (token: string, id: string, data: any) =>
    authenticatedRequest<any>(`/action-plans/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteActionPlan: (token: string, id: string) =>
    authenticatedRequest<any>(`/action-plans/${id}`, token, {
      method: "DELETE",
    }),

  // Financial years
  getFinancialYears: (token?: string) => {
    const options: RequestInit = { method: "GET" };
    if (token) {
      options.headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
    return request<any>("/financial-years/financialYears", options).then(
      (response) => {
        return response?.data || response || [];
      }
    );
  },

  getFinancialYearById: (token: string, id: string) =>
    authenticatedRequest<any>(`/financial-years/financialYear/${id}`, token, {
      method: "GET",
    }),

  createFinancialYear: (token: string, data: any) =>
    authenticatedRequest<any>("/financial-years/financialYear", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFinancialYear: (token: string, id: string, data: any) =>
    authenticatedRequest<any>(`/financial-years/financialYear/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteFinancialYear: (token: string, id: string) =>
    authenticatedRequest<any>(`/financial-years/financialYear/${id}`, token, {
      method: "DELETE",
    }),

  // ADM (administrative divisions)
  getCountries: () => request<any[]>("/adm/countries", { method: "GET" }),

  getProvinces: (params?: { countryId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.countryId) qs.set("countryId", params.countryId);
    const path = qs.toString()
      ? `/adm/provinces?${qs.toString()}`
      : "/adm/provinces";
    return request<any[]>(path, { method: "GET" });
  },

  getDistricts: (params?: { provinceId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.provinceId) qs.set("provinceId", params.provinceId);
    const path = qs.toString()
      ? `/adm/districts?${qs.toString()}`
      : "/adm/districts";
    return request<any[]>(path, { method: "GET" });
  },

  createCountry: (token: string, data: any) =>
    authenticatedRequest<any>("/adm/country", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createProvince: (token: string, data: any) =>
    authenticatedRequest<any>("/adm/province", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createDistrict: (token: string, data: any) =>
    authenticatedRequest<any>("/adm/district", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

 // Update these functions in your api.ts file

// Option Sets and Options
getOptionSets: (token?: string) => {
  const options: RequestInit = { method: "GET" };
  if (token) {
    options.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  return request<any[]>("/optionSet", options);
},

getOptionsBySet: (id: string | number, token?: string) => {
  const options: RequestInit = { method: "GET" };
  if (token) {
    options.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  return request<any[]>(`/optionSet/${id}/options`, options);
},

createOptionSet: (
  token: string,
  data: { name: string; description?: string }
) =>
  authenticatedRequest<{ id: number; name: string; description: string }>(
    "/optionSet", 
    token, 
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  ),

createOption: (
  token: string, 
  data: { optionSetId: number; name: string }
) =>
  authenticatedRequest<{ id: number; optionSetId: number; name: string }>(
    "/optionSet/option", 
    token, 
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  ),
  // Quarters
  getQuartersByYear: (yearId: string, token?: string) => {
    const options: RequestInit = { method: "GET" };
    if (token) {
      options.headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
    return request<any>(`/quarters/quarters/${yearId}`, options).then(
      (response) => {
        return response?.data || response || [];
      }
    );
  },

  getQuarterById: (token: string, id: string) =>
    authenticatedRequest<any>(`/quarters/quarter/${id}`, token, {
      method: "GET",
    }),

  createQuarter: (token: string, data: any) =>
    authenticatedRequest<any>("/quarters/quarter", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateQuarter: (token: string, id: string, data: any) =>
    authenticatedRequest<any>(`/quarters/quarter/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteQuarter: (token: string, id: string) =>
    authenticatedRequest<any>(`/quarters/quarter/${id}`, token, {
      method: "DELETE",
    }),

  // Plan reports / Plan list by subcluster
  getPlansBySubCluster: (subClusterId: string) =>
    request<any[]>(`/planReports/plans/${subClusterId}`, { method: "GET" }),

  getReportsBySubCluster: (subClusterId: string) =>
    request<any[]>(`/planReports/reports/${subClusterId}`, { method: "GET" }),

  // Reports (with file upload)
  createReport: async (token: string, formData: FormData) => {
    const url = `${API_BASE_URL}/reports`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getReportsByActionPlan: (actionPlanId: string, token?: string) => {
    const path = `/reports/action-plan/${actionPlanId}`;
    return token
      ? authenticatedRequest<any[]>(path, token, { method: "GET" })
      : request<any[]>(path, { method: "GET" });
  },

  getReport: (id: string, token: string) =>
    authenticatedRequest<any>(`/reports/${id}`, token, { method: "GET" }),

  // Comments
  postComment: (token: string, data: any) =>
    authenticatedRequest<any>(`/comments/comment`, token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCommentsByReport: (reportId: string) =>
    request<any[]>(`/comments/comments/${reportId}`, { method: "GET" }),

  // Stakeholders
  getStakeholders: () => request<any[]>("/stakeholder", { method: "GET" }),

  getStakeholderById: (id: string, token?: string) => {
    const path = `/stakeholder/${id}`;
    return token
      ? authenticatedRequest<any>(path, token, { method: "GET" })
      : request<any>(path, { method: "GET" });
  },

  createStakeholder: (
    token: string,
    data: {
      organizationName: string;
      stakeholderCategoryId: string;
      implementationLevel: string;
      districts: string[];
      subClusters: string[];
    }
  ) =>
    authenticatedRequest<any>("/stakeholder", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

// Add these to your existing api functions
updateStakeholder: (token: string, id: string, data: {
  organizationName: string;
  stakeholderCategoryId: string;
  implementationLevel: string;
  districts: string[];
  subClusters: string[];
}) =>
  authenticatedRequest<any>(`/stakeholder/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

deleteStakeholder: (token: string, id: string) =>
  authenticatedRequest<any>(`/stakeholder/${id}`, token, {
    method: "DELETE",
  }),

  getStakeholderCategories: (token?: string) => {
    const options: RequestInit = { method: "GET" };
    if (token) {
      options.headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
    return request<any[]>("/stakeholder/category", options);
  },

  getStakeholderCategoryById: (id: string, token?: string) => {
    const path = `/stakeholder/category/${id}`;
    return token
      ? authenticatedRequest<any>(path, token, { method: "GET" })
      : request<any>(path, { method: "GET" });
  },

  createStakeholderCategory: (token: string, data: any) =>
    authenticatedRequest<any>("/stakeholder/category", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAuditLogs: (
    token: string,
    params?: {
      userId?: number;
      action?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const qs = new URLSearchParams();
    if (params?.userId) qs.set("userId", params.userId.toString());
    if (params?.action) qs.set("action", params.action);
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.limit) qs.set("limit", params.limit.toString());

    const path = `/audit-logs?${qs.toString()}`;
    return authenticatedRequest<{
      logs: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(path, token, { method: "GET" });
  },

  getAuditLogById: (token: string, id: string) =>
    authenticatedRequest<any>(`/audit-logs/${id}`, token, { method: "GET" }),
};
