import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create Country
export const createCountry = async (name: string) => {
  return await prisma.country.create({
    data: { name },
  });
};

// Create Province
export const createProvince = async (name: string, countryId: number) => {
  return await prisma.province.create({
    data: {
      name,
      countryId,
    },
  });
};

// Create District
export const createDistrict = async (name: string, provinceId: number) => {
  return await prisma.district.create({
    data: {
      name,
      provinceId,
    },
  });
};

// New: Get all countries
export const getCountries = async () => {
  return await prisma.country.findMany({
    orderBy: { name: "asc" },
  });
};

// New: Get provinces by countryId (if countryId is provided; otherwise return all)
export const getProvinces = async (countryId?: number) => {
  const where = countryId ? { countryId } : undefined;
  return await prisma.province.findMany({
    where,
    orderBy: { name: "asc" },
  });
};

// New: Get districts by provinceId (if provinceId is provided; otherwise return all)
export const getDistricts = async (provinceId?: number) => {
  const where = provinceId ? { provinceId } : undefined;
  return await prisma.district.findMany({
    where,
    orderBy: { name: "asc" },
  });
};
