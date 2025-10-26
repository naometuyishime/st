import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "MIGEPROF Stakeholder Mapping Tool API",
      version: "1.0.0",
      description:
        "API documentation for the MIGEPROF Stakeholder Mapping Tool (SMT). It helps coordinate stakeholders, prevent duplication, and ensure transparency.",
      contact: {
        name: "MIGEPROF Tech Team",
        email: "support@migeprof.gov.rw",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/",
        description: "Local Development Server",
      },
      {
        url: "https://smt.migeprof.gov.rw/",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ---------------- AUTH ----------------
        AuthLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "john@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOi..." },
            refreshToken: { type: "string", example: "eyJhbGciOi..." },
            user: { $ref: "#/components/schemas/User" },
          },
        },

        // ---------------- USER ----------------
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", example: "john@example.com" },
            role: {
              type: "string",
              enum: ["ADMIN", "SUBCLUSTERFOCALPERSON", "STAKEHOLDER"],
            },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ---------------- STAKEHOLDERS ----------------
        Stakeholder: {
          type: "object",
          properties: {
            id: { type: "integer" },
            organizationName: { type: "string", example: "UN Women Rwanda" },
            districtId: { type: "integer" },
            provinceId: { type: "integer" },
            countryId: { type: "integer" },
            stakeholderCategoryId: { type: "integer" },
            implementationLevel: { type: "string", example: "Province" },
            userId: { type: "integer" },
          },
        },
        StakeholderCategory: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string", example: "Civil Society" },
            description: {
              type: "string",
              example: "Organizations working on GBV issues",
            },
          },
        },

        // ---------------- KPI ----------------
        KPI: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string", example: "Number of trainings conducted" },
            description: {
              type: "string",
              example: "Capacity building for focal points",
            },
            unit: { type: "string", example: "Number" },
            subClusterId: { type: "integer" },
            kpiCategoryId: { type: "integer" },
            stakeholderCategoryId: { type: "integer" },
          },
        },
        KpiCategory: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string", example: "Education KPIs" },
            subClusterId: { type: "integer" },
          },
        },

        // ---------------- OPTION SET ----------------
        OptionSet: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string", example: "Gender" },
            description: {
              type: "string",
              example: "Disaggregation by gender",
            },
          },
        },
        Option: {
          type: "object",
          properties: {
            id: { type: "integer" },
            optionSetId: { type: "integer" },
            name: { type: "string", example: "Female" },
          },
        },

        // ---------------- ACTION PLANS ----------------
        ActionPlan: {
          type: "object",
          properties: {
            id: { type: "integer" },
            yearId: { type: "integer" },
            stakeholderSubclusterId: { type: "integer" },
            document: { type: "string", example: "plan2025.pdf" },
            comment: { type: "string", example: "Initial plan draft" },
            description: { type: "string", example: "Action plan for FY2025" },
            planLevel: { type: "string", example: "District level" },
            districtId: { type: "integer" },
            provinceId: { type: "integer" },
            countryId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        KpiPlan: {
          type: "object",
          properties: {
            id: { type: "integer" },
            kpiId: { type: "integer" },
            actionPlanId: { type: "integer" },
            plannedValue: { type: "number", example: 150 },
          },
        },

        // ---------------- REPORTS ----------------
        Report: {
          type: "object",
          properties: {
            id: { type: "integer" },
            actionPlanId: { type: "integer" },
            yearId: { type: "integer" },
            actualValue: { type: "number", example: 120 },
            kpiPlanId: { type: "integer" },
            quarterId: { type: "integer" },
            progressSummary: {
              type: "string",
              example: "Achieved 80% of target due to late funding",
            },
            reportDocument: { type: "string", example: "q1_report.pdf" },
          },
        },
        Quarter: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "January-March" },
            startDate: {
              type: "string",
              format: "date-time",
              example: "2023-01-01T00:00:00Z",
            },
            endDate: {
              type: "string",
              format: "date-time",
              example: "2023-03-31T23:59:59Z",
            },
            reportDueDate: {
              type: "string",
              format: "date-time",
              example: "2023-04-10T00:00:00Z",
            },
            yearId: { type: "integer", example: 1 },
            reports: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Report",
              },
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            reportId: { type: "integer", example: 1 },
            focalPersonId: { type: "integer", example: 2 },
            commentText: { type: "string", example: "This is a comment" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ---------- FINANCIAL YEAR ----------------
        FinancialYear: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "2023-2024" },
            startDate: {
              type: "string",
              format: "date-time",
              example: "2023-01-01T00:00:00Z",
            },
            endDate: {
              type: "string",
              format: "date-time",
              example: "2024-12-31T23:59:59Z",
            },
            planStartDate: {
              type: "string",
              format: "date-time",
              example: "2023-04-01T00:00:00Z",
            },
            planEndDate: {
              type: "string",
              format: "date-time",
              example: "2024-03-31T23:59:59Z",
            },
            reportStartDate: {
              type: "string",
              format: "date-time",
              example: "2023-07-01T00:00:00Z",
            },
            reportEndDate: {
              type: "string",
              format: "date-time",
              example: "2024-06-30T23:59:59Z",
            },
            actionPlans: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ActionPlan",
              },
            },
          },
        },

        // ---------------- AUDIT LOG ----------------
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            action: { type: "string", example: "LOGIN" },
            userAgent: { type: "string", example: "Mozilla/5.0 Chrome/120" },
            logIpAddress: { type: "string", example: "192.168.1.10" },
            logDescription: { type: "string", example: "User logged in" },
            actionDetails: {
              type: "string",
              example: "Successful login with JWT",
            },
            timestamps: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
