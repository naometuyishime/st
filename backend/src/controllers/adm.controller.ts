import { Request, Response } from "express";
import * as admService from "../services/adm.service";
import logger, { saveAuditLog } from "../utils/logger";

// Create Country
export const createCountry = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const country = await admService.createCountry(name);

    // Log action and save audit log
    logger.info(`Country created: ${name}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with the actual authenticated userId
      "CREATE_COUNTRY",
      "A new country was created",
      `Country Name: ${name}`
    );

    res.status(201).json({ message: "Country created", country });
  } catch (error) {
    logger.error(`Error creating country: ${error}`);
    res.status(400).json({ message: "Error creating country" });
  }
};

// Create Province
export const createProvince = async (req: Request, res: Response) => {
  try {
    const { name, countryId } = req.body;
    const province = await admService.createProvince(name, countryId);

    // Log action and save audit log
    logger.info(`Province created: ${name}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with the actual authenticated userId
      "CREATE_PROVINCE",
      "A new province was created",
      `Province Name: ${name}, Country ID: ${countryId}`
    );

    res.status(201).json({ message: "Province created", province });
  } catch (error) {
    res.status(400).json({ message: "Error creating province" });
  }
};

// Create District
export const createDistrict = async (req: Request, res: Response) => {
  try {
    const { name, provinceId } = req.body;
    const district = await admService.createDistrict(name, provinceId);

    // Log action and save audit log
    logger.info(`District created: ${name}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with the actual authenticated userId
      "CREATE_DISTRICT",
      "A new district was created",
      `District Name: ${name}, Province ID: ${provinceId}`
    );

    res.status(201).json({ message: "District created", district });
  } catch (error) {
    res.status(400).json({ message: "Error creating district" });
  }
};

// New: Get all countries
export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await admService.getCountries();
    logger.info("Fetched countries list");
    await saveAuditLog(
      req,
      1, // TODO: replace with authenticated user id
      "GET_COUNTRIES",
      "Fetched countries list",
      `Count: ${countries.length}`
    );
    res.json(countries);
  } catch (error) {
    logger.error(`Get countries failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch countries" });
  }
};

// New: Get provinces by countryId (query param)
export const getProvinces = async (req: Request, res: Response) => {
  try {
    const countryIdParam = req.query.countryId as string | undefined;
    let countryId: number | undefined;
    if (countryIdParam !== undefined) {
      countryId = Number(countryIdParam);
      if (Number.isNaN(countryId)) {
        return res.status(400).json({ message: "Invalid countryId" });
      }
    }

    const provinces = await admService.getProvinces(countryId);
    logger.info(
      `Fetched provinces${countryId ? ` for country ${countryId}` : ""}`
    );
    await saveAuditLog(
      req,
      1,
      "GET_PROVINCES",
      "Fetched provinces list",
      `countryId: ${countryId ?? "all"}; count: ${provinces.length}`
    );
    res.json(provinces);
  } catch (error) {
    logger.error(`Get provinces failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch provinces" });
  }
};

// New: Get districts by provinceId (query param)
export const getDistricts = async (req: Request, res: Response) => {
  try {
    const provinceIdParam = req.query.provinceId as string | undefined;
    let provinceId: number | undefined;
    if (provinceIdParam !== undefined) {
      provinceId = Number(provinceIdParam);
      if (Number.isNaN(provinceId)) {
        return res.status(400).json({ message: "Invalid provinceId" });
      }
    }

    const districts = await admService.getDistricts(provinceId);
    logger.info(
      `Fetched districts${provinceId ? ` for province ${provinceId}` : ""}`
    );
    await saveAuditLog(
      req,
      1,
      "GET_DISTRICTS",
      "Fetched districts list",
      `provinceId: ${provinceId ?? "all"}; count: ${districts.length}`
    );
    res.json(districts);
  } catch (error) {
    logger.error(`Get districts failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
};
