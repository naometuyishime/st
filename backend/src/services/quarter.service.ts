import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createQuarter = async (data: any) => {
  try {
    const quarter = await prisma.quarter.create({
      data,
    });
    return quarter;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating quarter: ${error.message}`);
    } else {
      throw new Error("Error creating quarter: Unknown error");
    }
  }
};

export const getQuartersByYear = async (yearId: number) => {
  try {
    const quarters = await prisma.quarter.findMany({
      where: { yearId },
    });
    return quarters;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error retrieving quarters: ${error.message}`);
    } else {
      throw new Error("Error retrieving quarters: Unknown error");
    }
  }
};

export const updateQuarter = async (id: number, data: any) => {
  try {
    const quarter = await prisma.quarter.update({
      where: { id },
      data,
    });
    return quarter;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error updating quarter: ${error.message}`);
    } else {
      throw new Error("Error updating quarter: Unknown error");
    }
  }
};

export const deleteQuarter = async (id: number) => {
  try {
    await prisma.quarter.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error deleting quarter: ${error.message}`);
    } else {
      throw new Error("Error deleting quarter: Unknown error");
    }
  }
};

export const getQuarterById = async (id: number) => {
  try {
    const quarter = await prisma.quarter.findUnique({
      where: { id },
    });
    return quarter;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error retrieving quarter: ${error.message}`);
    } else {
      throw new Error("Error retrieving quarter: Unknown error");
    }
  }
};
