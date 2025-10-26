import express from "express";
import cors from "cors";
import { setupSwagger } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import admRoutes from "./routes/adm.routes";
import stakeholderRoutes from "./routes/stakeholder.routes";
import kpiRoutes from "./routes/kpi.routes";
import optionsetRoutes from "./routes/optionset.routes";
import reportRoutes from "./routes/report.routes";
import actionPlanRoutes from "./routes/actionPlan.routes";
import financialYearRoutes from "./routes/financialYear.routes";
import quarterRoutes from "./routes/quarter.routes";
import commentRoutes from "./routes/comment.routes";
import planReportRoutes from "./routes/planReport.routes";
import usersRoutes from "./routes/user.routes";
import auditRoutes from "./routes/audit.routes";
import logger from "./utils/logger";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());
setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/adm", admRoutes);
app.use("/api/stakeholder", stakeholderRoutes);
app.use("/api/kpi", kpiRoutes);
app.use("/api/optionSet", optionsetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/action-plans", actionPlanRoutes);
app.use("/api/financial-years", financialYearRoutes);
app.use("/api/quarters", quarterRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/planReports", planReportRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/audit-logs", auditRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
