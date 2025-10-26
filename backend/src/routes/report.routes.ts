import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import * as controller from "../controllers/report.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

// multer setup
const uploadDir = path.join(__dirname, "../../uploads/reports");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // Use the dynamic upload directory
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF, Word, and Excel files are allowed"));
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * /api/reports:
 *   post:
 *     summary: Submit quarterly report (with optional attachment)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               actionPlanId:
 *                 type: integer
 *               yearId:
 *                 type: integer
 *               kpiPlanId:
 *                 type: integer
 *               quarterId:
 *                 type: integer
 *               actualValue:
 *                 type: number
 *               progressSummary:
 *                 type: string
 *               options:
 *                 type: string
 *                 description: JSON stringified array of { optionId, optionValue }
 *               reportDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Report submitted successfully
 */
router.post(
  "/",
  authenticate,
  checkRole(["stakeholder_admin", "admin", "subclusterfocalperson"]),
  upload.single("reportDocument"),
  controller.createReport
);

/**
 * @openapi
 * /api/reports/action-plan/{actionPlanId}:
 *   get:
 *     summary: Get reports for an action plan
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: actionPlanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get(
  "/action-plan/:actionPlanId",
  authenticate,
  checkRole(["stakeholder_admin", "admin", "subclusterfocalperson"]),
  controller.getReportsByActionPlan
);

/**
 * @openapi
 * /api/reports/{id}:
 *   get:
 *     summary: Get report by id
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report object
 */
router.get(
  "/:id",
  authenticate,
  checkRole(["stakeholder_admin", "admin", "subclusterfocalperson"]),
  controller.getReport
);

export default router;
