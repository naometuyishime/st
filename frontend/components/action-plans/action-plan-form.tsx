"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  X,
  AlertCircle,
  Target,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ListChecks,
  Plus,
  CheckCircle2,
  Building,
  Info,
} from "lucide-react";

interface ActionPlanFormProps {
  onClose: () => void;
  onSubmit: (plan: any) => void;
}

interface KpiTarget {
  kpiId: string;
  plannedValue: string;
  disaggregation: Record<string, Record<string, string>>;
}

import { useKpi } from "@/contexts/kpi-context"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

type FormStep =
  | "planning"
  | "stakeholder"
  | "kpi-selection"
  | "review";

// Safe value extraction helpers
function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') return defaultValue
  return String(value)
}

// Safe user extraction function
function extractSafeUser(user: any) {
  if (!user) return { exists: false, displayName: '', role: '' };
  
  if (typeof user === 'string') {
    return { exists: true, displayName: user, role: user };
  }
  
  if (typeof user === 'object' && user !== null) {
    if ('organizationName' in user) {
      return { 
        exists: true, 
        displayName: safeString(user.organizationName, 'Organization'), 
        role: 'stakeholder' 
      };
    }
    else if ('role' in user) {
      const role = safeString(user.role);
      return { 
        exists: true, 
        displayName: role.replace('_', ' '), 
        role: role 
      };
    }
    else if ('name' in user) {
      return { 
        exists: true, 
        displayName: safeString(user.name), 
        role: 'user' 
      };
    }
    else {
      return { 
        exists: true, 
        displayName: 'User', 
        role: 'user' 
      };
    }
  }
  
  return { 
    exists: true, 
    displayName: String(user), 
    role: String(user) 
  };
}

export function ActionPlanForm({ onClose, onSubmit }: ActionPlanFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("planning");
  const [selectedKpis, setSelectedKpis] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    financialYear: "",
    subCluster: "",
    stakeholder: "",
    planLevel: "", // This will be auto-filled from organization
    description: "",
    kpiTargets: [] as KpiTarget[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shouldProceedToReview, setShouldProceedToReview] = useState(false);
  const [existingPlans, setExistingPlans] = useState<any[]>([]);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);

  const { kpis, categories: kpiCategories, subClusters, isLoading: kpiLoading } = useKpi()
  const { user: rawUser, token } = useAuth()
  
  const safeUser = extractSafeUser(rawUser);

  const [financialYearsState, setFinancialYearsState] = useState<any[]>([])
  const [stakeholdersState, setStakeholdersState] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Check for existing action plans when year or sub-cluster changes
  useEffect(() => {
    const checkExistingPlans = async () => {
      if (!formData.financialYear || !formData.subCluster || !token) {
        setExistingPlans([]);
        return;
      }

      setDuplicateCheckLoading(true);
      try {
        const plans = await api.getActionPlans(token);
        const existing = plans.filter((plan: any) => 
          String(plan.yearId) === String(formData.financialYear) &&
          String(plan.stakeholderSubclusterId) === String(formData.subCluster)
        );
        setExistingPlans(existing);
      } catch (error) {
        console.error('Failed to check existing plans:', error);
        setExistingPlans([]);
      } finally {
        setDuplicateCheckLoading(false);
      }
    };

    checkExistingPlans();
  }, [formData.financialYear, formData.subCluster, token]);

  // FIXED: Stakeholder filtering based on stakeholderSubClusters array
  const filteredStakeholders = stakeholdersState.filter((stakeholder) => {
    if (!formData.subCluster) return false;
    
    // Check if stakeholder has sub-clusters and if any match the selected sub-cluster
    const hasMatchingSubCluster = stakeholder.stakeholderSubClusters?.some(
      (subClusterRel: any) => String(subClusterRel.subClusterId) === String(formData.subCluster)
    );
    
    return hasMatchingSubCluster;
  });

  // Filter KPI categories based on selected sub-cluster ID
  const filteredCategories = kpiCategories.filter(
    (category) =>
      formData.subCluster && 
      String(category.subClusterId) === String(formData.subCluster)
  );

  // Filter KPIs based on selected sub-cluster ID and category
  const filteredKpis = kpis.filter(
    (kpi) =>
      formData.subCluster &&
      String(kpi.subCluster) === String(formData.subCluster) &&
      (!selectedCategory || String(kpi.category) === String(selectedCategory))
  );

  // Get sub-cluster name by ID
  const getSubClusterName = (subClusterId: string) => {
    const subCluster = subClusters.find(sc => String(sc.id) === String(subClusterId));
    return subCluster ? safeString(subCluster.name) : subClusterId;
  };

  // Get financial year name by ID
  const getFinancialYearName = (yearId: string) => {
    const year = financialYearsState.find(fy => String(fy.id) === String(yearId));
    return year ? safeString(year.name) : yearId;
  };

  // Get stakeholder (organization) details
  const getStakeholderDetails = (stakeholderId: string) => {
    const stakeholder = stakeholdersState.find(s => String(s.id) === String(stakeholderId));
    if (!stakeholder) return null;
    
    return {
      name: safeString(stakeholder.organizationName || stakeholder.name, 'Not specified'),
      type: stakeholder.stakeholderCategoryId ? `Category ${stakeholder.stakeholderCategoryId}` : 'Not specified',
      implementationLevel: stakeholder.implementationLevel || 'Not specified',
    };
  };

  // Get stakeholder name from plan
  const getStakeholderNameFromPlan = (plan: any) => {
    if (!plan) return 'Unknown';
    
    // Try to get from stakeholder object
    if (plan.stakeholder) {
      if (typeof plan.stakeholder === 'object' && plan.stakeholder.organizationName) {
        return safeString(plan.stakeholder.organizationName);
      }
      if (typeof plan.stakeholder === 'string') {
        return plan.stakeholder;
      }
    }
    
    // Try to find stakeholder by ID
    if (plan.stakeholderId) {
      const stakeholder = stakeholdersState.find(s => String(s.id) === String(plan.stakeholderId));
      if (stakeholder) {
        return safeString(stakeholder.organizationName || stakeholder.name, 'Unknown');
      }
    }
    
    return 'Unknown Organization';
  };

  const hasExistingPlan = existingPlans.length > 0;

  // Step progress
  const steps = [
    {
      id: "planning",
      name: "Planning Period",
      completed: !!formData.financialYear && !!formData.subCluster && !hasExistingPlan,
    },
    {
      id: "stakeholder",
      name: "Organization",
      completed: !!formData.stakeholder && !!formData.planLevel,
    },
    {
      id: "kpi-selection",
      name: "KPI Selection",
      completed: selectedKpis.length > 0,
    },
    { id: "review", name: "Review & Submit", completed: false },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Auto-select first category when sub-cluster changes or categories load
  useEffect(() => {
    if (formData.subCluster && filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0].id);
    }
  }, [formData.subCluster, filteredCategories.length]);

  // Effect to handle navigation after KPI targets are set
  useEffect(() => {
    if (shouldProceedToReview && formData.kpiTargets.length > 0) {
      nextStep();
      setShouldProceedToReview(false);
    }
  }, [shouldProceedToReview, formData.kpiTargets]);

  // Load all form data
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        
        const [fYears, stakeholders] = await Promise.all([
          api.getFinancialYears(token || undefined),
          api.getStakeholders(),
        ])
        
        if (!mounted) return
        
        console.log('Loaded form data:', {
          financialYears: fYears,
          stakeholders: stakeholders,
        });

        setFinancialYearsState(fYears || [])
        setStakeholdersState(stakeholders || [])
      } catch (err) {
        console.error('Failed to load action plan reference data', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    load()
    return () => { mounted = false }
  }, [token])

  // Navigation functions
  const nextStep = () => {
    const stepOrder: FormStep[] = [
      "planning",
      "stakeholder",
      "kpi-selection",
      "review",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: FormStep[] = [
      "planning",
      "stakeholder",
      "kpi-selection",
      "review",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // KPI functions
  const addKpi = (kpiId: string) => {
    if (!selectedKpis.includes(kpiId)) {
      setSelectedKpis((prev) => [...prev, kpiId]);
    }
  };

  const removeKpi = (kpiId: string) => {
    setSelectedKpis((prev) => prev.filter((id) => id !== kpiId));
  };

  const proceedToReview = () => {
    if (selectedKpis.length === 0) return;

    const kpiTargets: KpiTarget[] = selectedKpis.map((kpiId) => {
      const kpi = kpis.find((k) => k.id === kpiId);
      const initialDisagg: Record<string, Record<string, string>> = {};
      if (kpi && kpi.disaggregation) {
        kpi.disaggregation.forEach((d: any) => {
          initialDisagg[d.id] = {};
          d.options.forEach((opt: any) => {
            initialDisagg[d.id][opt.id] = "";
          });
        });
      }

      return {
        kpiId,
        plannedValue: "",
        disaggregation: initialDisagg,
      };
    });

    setFormData((prev) => ({
      ...prev,
      kpiTargets,
    }));

    setShouldProceedToReview(true);
  };

  const updateKpiTargetValue = (kpiId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      kpiTargets: prev.kpiTargets.map((kpi) =>
        kpi.kpiId === kpiId ? { ...kpi, plannedValue: value } : kpi
      ),
    }));
  };

  const handleYearChange = (value: string) => {
    setFormData({ ...formData, financialYear: value });
  };

  const handleSubClusterChange = (value: string) => {
    setFormData({ 
      ...formData, 
      subCluster: value,
      stakeholder: "",
      planLevel: "" // Reset plan level when sub-cluster changes
    });
  };

  // NEW: Handle stakeholder selection with auto-setting plan level
  const handleStakeholderChange = (stakeholderId: string) => {
    const selectedStakeholder = stakeholdersState.find(s => String(s.id) === String(stakeholderId));
    
    setFormData({ 
      ...formData, 
      stakeholder: stakeholderId,
      planLevel: selectedStakeholder?.implementationLevel || "" // Auto-set the plan level
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== ACTION PLAN SUBMISSION STARTED ===");
    console.log("Current form data:", formData);
    console.log("Selected KPIs:", selectedKpis);
    console.log("Token available:", !!token);
    
    if (!token) {
      const errorMsg = "No authentication token available";
      console.error(errorMsg);
      setSubmitError(errorMsg);
      return;
    }

    if (hasExistingPlan) {
      const errorMsg = `An action plan already exists for ${getFinancialYearName(formData.financialYear)} in ${getSubClusterName(formData.subCluster)}. Only one action plan per year per sub-cluster is allowed.`;
      setSubmitError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const missingFields = [];
      if (!formData.financialYear) missingFields.push("financialYear");
      if (!formData.subCluster) missingFields.push("subCluster");
      if (!formData.stakeholder) missingFields.push("stakeholder");
      if (!formData.planLevel) missingFields.push("planLevel");
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
        console.error(errorMsg);
        setSubmitError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (formData.kpiTargets.length === 0) {
        const errorMsg = "No KPIs selected for the action plan";
        console.error(errorMsg);
        setSubmitError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Get selected stakeholder details for geographic data
      const selectedStakeholder = stakeholdersState.find(
        s => String(s.id) === String(formData.stakeholder)
      );

      if (!selectedStakeholder) {
        setSubmitError("Selected organization not found");
        setIsSubmitting(false);
        return;
      }

      // Prepare geographic data based on implementation level
      let countryId = null;
      let provinceId = null;
      let districtId = null;

      switch (formData.planLevel) {
        case "national":
          countryId = 1; // Rwanda
          break;
        case "province":
          countryId = 1;
          // Use the first province from stakeholder districts if available
          provinceId = selectedStakeholder.stakeholderDistricts?.[0]?.district?.provinceId || null;
          break;
        case "district":
          countryId = 1;
          // Use the first district from stakeholder districts if available
          provinceId = selectedStakeholder.stakeholderDistricts?.[0]?.district?.provinceId || null;
          districtId = selectedStakeholder.stakeholderDistricts?.[0]?.districtId || null;
          break;
      }

      const submitData = {
        yearId: parseInt(formData.financialYear),
        stakeholderSubclusterId: parseInt(formData.subCluster),
        stakeholderId: parseInt(formData.stakeholder),
        planLevel: formData.planLevel,
        countryId: countryId,
        provinceId: provinceId,
        districtId: districtId,
        description: formData.description || "",
        kpiPlans: formData.kpiTargets.map(target => {
          const plannedValue = target.plannedValue ? parseFloat(target.plannedValue) : 0;
          
          return {
            kpiId: parseInt(target.kpiId),
            plannedValue: plannedValue,
            disaggregation: target.disaggregation || {}
          };
        })
      };
      
      console.log('=== FINAL SUBMIT DATA ===');
      console.log('Submit data structure:', JSON.stringify(submitData, null, 2));

      const result = await api.createActionPlan(token, submitData);
      
      console.log('=== ACTION PLAN CREATION SUCCESSFUL ===');
      console.log('API Response:', result);
      
      onClose();
      
    } catch (error: any) {
      console.error('=== ACTION PLAN SUBMISSION FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error?.message || "Failed to create action plan. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation for current step
  const canProceed = () => {
    switch (currentStep) {
      case "planning":
        return !!formData.financialYear && !!formData.subCluster && !hasExistingPlan;
      case "stakeholder":
        return !!formData.stakeholder && !!formData.planLevel;
      case "kpi-selection":
        return selectedKpis.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  };

  // Reset selections when sub-cluster changes
  useEffect(() => {
    if (formData.subCluster) {
      setSelectedKpis([]);
      setFormData((prev) => ({ 
        ...prev, 
        stakeholder: "",
        planLevel: "" 
      }));
    }
  }, [formData.subCluster]);

  const isLoading = loading || kpiLoading;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading form data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Create New Action Plan
            </CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {steps.length}:{" "}
              {steps[currentStepIndex]?.name}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index <= currentStepIndex ? "text-primary" : ""
                }`}
              >
                {index <= currentStepIndex ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-muted mr-1" />
                )}
                {step.name}
              </div>
            ))}
          </div>
        </div>

        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Planning Period */}
            {currentStep === "planning" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="text-lg font-semibold">Planning Period</h3>
                </div>

                {hasExistingPlan && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Action Plan Already Exists</strong>
                      <br />
                      An action plan already exists for {getFinancialYearName(formData.financialYear)} in {getSubClusterName(formData.subCluster)}. 
                      Only one action plan per year per sub-cluster is allowed.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="financialYear">Financial Year *</Label>
                    <Select
                      value={formData.financialYear}
                      onValueChange={handleYearChange}
                      disabled={duplicateCheckLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select financial year">
                          {formData.financialYear
                            ? financialYearsState.find(
                                (fy) => String(fy.id) === String(formData.financialYear)
                              )?.name
                            : "Select financial year"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {financialYearsState.map((year) => (
                          <SelectItem key={year.id} value={String(year.id)}>
                            {safeString(year.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {duplicateCheckLoading && (
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        Checking for existing plans...
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subCluster">Sub-Cluster *</Label>
                    <Select
                      value={formData.subCluster}
                      onValueChange={handleSubClusterChange}
                      disabled={duplicateCheckLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sub-cluster">
                          {formData.subCluster
                            ? subClusters.find(
                                (cluster) => String(cluster.id) === String(formData.subCluster)
                              )?.name
                            : "Select sub-cluster"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {subClusters.map((cluster) => (
                          <SelectItem key={cluster.id} value={String(cluster.id)}>
                            {safeString(cluster.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Show existing plans */}
                {existingPlans.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Existing Action Plan(s)
                      </h4>
                      <div className="space-y-2">
                        {existingPlans.map((plan) => (
                          <div key={safeString(plan.id)} className="text-sm text-amber-700 p-2 bg-amber-100 rounded">
                            <p><strong>Plan ID:</strong> {safeString(plan.id)}</p>
                            <p><strong>Organization:</strong> {getStakeholderNameFromPlan(plan)}</p>
                            <p><strong>Created:</strong> {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Unknown'}</p>
                            <p><strong>Description:</strong> {safeString(plan.description || plan.comment, 'No description')}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* STEP 2: Organization Selection */}
            {currentStep === "stakeholder" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Organization Selection
                  </h3>
                </div>

                {!formData.subCluster ? (
                  <Card className="p-6 text-center">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">
                      Select a Sub-Cluster First
                    </h4>
                    <p className="text-muted-foreground">
                      Please go back to Step 1 and select a sub-cluster first.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg border">
                      <h4 className="font-semibold">
                        Select Organization for {
                          subClusters.find(sc => String(sc.id) === String(formData.subCluster))?.name || 'Selected Sub-Cluster'
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Showing {filteredStakeholders.length} organization(s) available in this sub-cluster
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="stakeholder">
                        Organization *
                      </Label>
                      <Select
                        value={formData.stakeholder}
                        onValueChange={handleStakeholderChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select organization">
                            {formData.stakeholder ? 
                              (() => {
                                const selectedOrg = stakeholdersState.find(s => String(s.id) === String(formData.stakeholder));
                                return safeString(selectedOrg?.organizationName || selectedOrg?.name, "Selected organization");
                              })()
                              : "Select organization"
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {filteredStakeholders.map((stakeholder) => (
                            <SelectItem
                              key={stakeholder.id}
                              value={String(stakeholder.id)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {safeString(stakeholder.organizationName || stakeholder.name)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Implementation Level: {stakeholder.implementationLevel || 'Not specified'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {filteredStakeholders.length === 0 && (
                            <SelectItem value="no-orgs" disabled>
                              No organizations available for this sub-cluster
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.stakeholder && (() => {
                      const selectedStakeholder = stakeholdersState.find(
                        s => String(s.id) === String(formData.stakeholder)
                      );

                      if (!selectedStakeholder) return null;
                      
                      return (
                        <Card className="p-4 border-l-4 border-l-primary">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-lg">
                              {safeString(selectedStakeholder.organizationName)}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">
                                  <strong>Implementation Level:</strong>{" "}
                                  <Badge variant="outline" className="ml-1 capitalize">
                                    {safeString(selectedStakeholder.implementationLevel, 'Not specified')}
                                  </Badge>
                                </p>
                                <p className="text-muted-foreground">
                                  <strong>Category:</strong> {safeString(selectedStakeholder.stakeholderCategory?.name, 'N/A')}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  <strong>Sub-clusters:</strong>{" "}
                                  {selectedStakeholder.stakeholderSubClusters?.map((sc: any) => 
                                    sc.subCluster?.name
                                  ).join(", ") || "None"}
                                </p>
                                <p className="text-muted-foreground">
                                  <strong>Districts:</strong> {selectedStakeholder.stakeholderDistricts?.length || 0}
                                </p>
                              </div>
                            </div>
                            
                            {/* Show auto-selected plan level information */}
                            {formData.planLevel && (
                              <Alert className="bg-blue-50 border-blue-200">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                  <strong>Plan Level Auto-selected:</strong> This organization operates at the{" "}
                                  <span className="font-semibold capitalize">{formData.planLevel}</span> level. 
                                  This will be used for your action plan.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </Card>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: KPI Selection */}
            {currentStep === "kpi-selection" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-semibold">Select KPIs</h3>
                  </div>
                  <Badge variant="default">
                    {selectedKpis.length} selected
                  </Badge>
                </div>

                {!formData.subCluster ? (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Please select a sub-cluster first in Step 1.
                    </p>
                  </Card>
                ) : filteredCategories.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No KPI categories available for the selected sub-cluster.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Tabs
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                      className="w-full"
                    >
                      <TabsList className="w-full justify-start h-auto bg-transparent p-0 border-b">
                        {filteredCategories.map((category) => {
                          const kpiCount = kpis.filter(
                            (kpi) =>
                              String(kpi.subCluster) === String(formData.subCluster) &&
                              String(kpi.category) === String(category.id)
                          ).length;
                          return (
                            <TabsTrigger
                              key={category.id}
                              value={category.id}
                              className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 px-4 py-3"
                            >
                              <span className="font-medium">
                                {safeString(category.name)}
                              </span>
                              <Badge variant="default" className="ml-2">
                                {kpiCount}
                              </Badge>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {filteredCategories.map((category) => {
                        const categoryKpis = kpis.filter(
                          (kpi) =>
                            String(kpi.subCluster) === String(formData.subCluster) &&
                            String(kpi.category) === String(category.id)
                        );

                        return (
                          <TabsContent
                            key={category.id}
                            value={category.id}
                            className="space-y-4 mt-6"
                          >
                            {categoryKpis.length === 0 ? (
                              <Card className="p-6 text-center">
                                <p className="text-muted-foreground">
                                  No KPIs found in the "{safeString(category.name)}" category.
                                </p>
                              </Card>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {categoryKpis.map((kpi) => (
                                  <div
                                    key={kpi.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-all cursor-pointer ${
                                      selectedKpis.includes(kpi.id)
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                    onClick={() => {
                                      if (selectedKpis.includes(kpi.id)) {
                                        removeKpi(kpi.id);
                                      } else {
                                        addKpi(kpi.id);
                                      }
                                    }}
                                  >
                                    <div className="flex-1">
                                      <h4 className="font-medium">{safeString(kpi.title)}</h4>
                                      {kpi.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {safeString(kpi.description)}
                                        </p>
                                      )}
                                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                        <span>Unit: {safeString(kpi.units)}</span>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={
                                        selectedKpis.includes(kpi.id)
                                          ? "default"
                                          : "outline"
                                      }
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedKpis.includes(kpi.id)) {
                                          removeKpi(kpi.id);
                                        } else {
                                          addKpi(kpi.id);
                                        }
                                      }}
                                    >
                                      {selectedKpis.includes(kpi.id) ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                      ) : (
                                        <Plus className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Review & Submit */}
            {currentStep === "review" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <h3 className="text-lg font-semibold">Review & Submit</h3>
                </div>

                {hasExistingPlan && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Cannot Create Action Plan</strong>
                      <br />
                      An action plan already exists for {getFinancialYearName(formData.financialYear)} in {getSubClusterName(formData.subCluster)}. 
                      Only one action plan per year per sub-cluster is allowed.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Planning Details</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Financial Year:</strong>{" "}
                          {
                            financialYearsState.find(
                              (fy) => String(fy.id) === String(formData.financialYear)
                            )?.name
                          }
                        </p>
                        <p>
                          <strong>Sub-Cluster:</strong> {getSubClusterName(formData.subCluster)}
                        </p>
                        <p>
                          <strong>Organization:</strong>{" "}
                          {getStakeholderDetails(formData.stakeholder)?.name}
                        </p>
                        <p>
                          <strong>Implementation Level:</strong>{" "}
                          <Badge variant="outline" className="ml-1 capitalize">
                            {formData.planLevel}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Selected KPIs</h4>
                      <div className="space-y-2">
                        {formData.kpiTargets.map((kpiTarget) => {
                          const kpi = kpis.find(
                            (k) => k.id === kpiTarget.kpiId
                          );
                          return (
                            <div
                              key={kpiTarget.kpiId}
                              className="flex justify-between items-center p-2 border rounded"
                            >
                              <span className="text-sm">{safeString(kpi?.title)}</span>
                              <Badge variant="outline">
                                {safeString(kpi?.units)}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description">Plan Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your planned activities and approach..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === "planning"}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === "review" ? (
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={isSubmitting || hasExistingPlan}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Action Plan
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentStep === "kpi-selection") {
                      proceedToReview();
                    } else {
                      nextStep();
                    }
                  }}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}