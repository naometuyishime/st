import { Request, Response } from "express";
import * as commentService from "../services/comment.service";
import { sendEmailNotification } from "../utils/email.util";
import logger, { saveAuditLog } from "../utils/logger";

export const addComment = async (req: Request, res: Response) => {
  const { reportId, commentText } = req.body;
  const focalPersonId = req.user.id; // comes from auth middleware

  try {
    const comment = await commentService.addComment(
      reportId,
      focalPersonId,
      commentText
    );

    // Send email notification to stakeholders related to the report
    const reportOwnerEmail = "owner@example.com"; // You’ll fetch from report -> stakeholder -> user.email
    await sendEmailNotification(
      reportOwnerEmail,
      "New Comment on Your Report",
      `A focal person commented: ${commentText}`
    );

    logger.info(`Comment added by user ${focalPersonId} on report ${reportId}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "ADD_COMMENT",
      "Comment added to report",
      `Report ID: ${reportId}`
    );
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    logger.error(`Failed to add comment: ${error}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "ADD_COMMENTS_ERROR",
      "Error adding comments for report",
      `Message: ${error}`
    );
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

export const getCommentsByReport = async (req: Request, res: Response) => {
  const { reportId } = req.params;
  try {
    const comments = await commentService.getCommentsByReport(Number(reportId));
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "GET_COMMENTS",
      "Fetched comments for report",
      `Report ID: ${reportId}`
    );
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    logger.error(`Failed to fetch comments for report ${reportId}: ${error}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "GET_COMMENTS_ERROR",
      "Error fetching comments for report",
      `Message: ${error}`
    );
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch comments" });
  }
};
