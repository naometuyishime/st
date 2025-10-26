import express from "express";
import {
  createCountry,
  createProvince,
  createDistrict,
  getCountries,
  getProvinces,
  getDistricts,
} from "../controllers/adm.controller";

const router = express.Router();

/**
 * @openapi
 * /api/adm/country:
 *   post:
 *     summary: Create a new country
 *     tags: [ADM]
 *     description: Creates a new country.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rwanda
 *     responses:
 *       201:
 *         description: Country created successfully
 *       400:
 *         description: Error creating country
 */
router.post("/country", createCountry);

/**
 * @openapi
 * /api/adm/province:
 *   post:
 *     summary: Create a new province
 *     tags: [ADM]
 *     description: Creates a new province under a specific country.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - countryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kigali
 *               countryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Province created successfully
 *       400:
 *         description: Error creating province
 */
router.post("/province", createProvince);

/**
 * @openapi
 * /api/adm/district:
 *   post:
 *     summary: Create a new district
 *     tags: [ADM]
 *     description: Creates a new district under a specific province.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - provinceId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nyarugenge
 *               provinceId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: District created successfully
 *       400:
 *         description: Error creating district
 */
router.post("/district", createDistrict);

/**
 * @openapi
 * /api/adm/countries:
 *   get:
 *     summary: Get list of countries
 *     tags: [ADM]
 *     responses:
 *       200:
 *         description: List of countries
 */
router.get("/countries", getCountries);

/**
 * @openapi
 * /api/adm/provinces:
 *   get:
 *     summary: Get provinces (optionally by countryId)
 *     tags: [ADM]
 *     parameters:
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter provinces by country id
 *     responses:
 *       200:
 *         description: List of provinces
 *       400:
 *         description: Invalid query
 */
router.get("/provinces", getProvinces);

/**
 * @openapi
 * /api/adm/districts:
 *   get:
 *     summary: Get districts (optionally by provinceId)
 *     tags: [ADM]
 *     parameters:
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter districts by province id
 *     responses:
 *       200:
 *         description: List of districts
 *       400:
 *         description: Invalid query
 */
router.get("/districts", getDistricts);

export default router;
