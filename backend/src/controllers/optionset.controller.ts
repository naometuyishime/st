import { Request, Response } from "express";
import * as optionSetService from "../services/optionset.service";
import logger, { saveAuditLog } from "../utils/logger";

export const createOptionSet = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const optionSet = await optionSetService.createOptionSet(name, description);
    res.status(201).json({ message: "Option Set created", optionSet });
  } catch (error) {
    res.status(400).json({ message: "Error creating Option Set" });
  }
};

export const createOption = async (req: Request, res: Response) => {
  try {
    const { optionSetId, name } = req.body;
    const option = await optionSetService.createOption(optionSetId, name);
    res.status(201).json({ message: "Option created", option });
  } catch (error) {
    res.status(400).json({ message: "Error creating Option" });
  }
};

/**
 * Get all option sets (with their options)
 */
export const getOptionSets = async (req: Request, res: Response) => {
  try {
    const optionSets = await optionSetService.getOptionSets();
    logger.info("Fetched option sets");
    await saveAuditLog(
      req,
      1, // replace with actual authenticated user id when available
      "GET_OPTIONSETS",
      "Fetched option sets list",
      `Count: ${optionSets.length}`
    );
    res.json(optionSets);
  } catch (error) {
    logger.error(`Get option sets failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch option sets" });
  }
};

/**
 * Get options for a given optionSet id
 */
export const getOptionsBySet = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid optionSet id" });

    const options = await optionSetService.getOptionsByOptionSet(id);
    logger.info(`Fetched options for optionSet ${id}`);
    await saveAuditLog(
      req,
      1,
      "GET_OPTIONSET_OPTIONS",
      "Fetched options for option set",
      `OptionSetId: ${id}; Count: ${options.length}`
    );
    res.json(options);
  } catch (error) {
    logger.error(`Get options by optionSet failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch options" });
  }
};
