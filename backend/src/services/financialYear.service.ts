import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createFinancialYear = async (data: any) => {
  try {
    const financialYear = await prisma.financialYear.create({
      data,
    });
    return financialYear;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating financial year: ${error.message}`);
    } else {
      throw new Error("Error creating financial year: Unknown error");
    }
  }
};

export const getFinancialYears = async () => {
  try {
    const financialYears = await prisma.financialYear.findMany();
    return financialYears;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error retrieving financial years: ${error.message}`);
    } else {
      throw new Error("Error retrieving financial years: Unknown error");
    }
  }
};

export const updateFinancialYear = async (id: number, data: any) => {
  try {
    const financialYear = await prisma.financialYear.update({
      where: { id },
      data,
    });
    return financialYear;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error updating financial year: ${error.message}`);
    } else {
      throw new Error("Error updating financial year: Unknown error");
    }
  }
};

export const deleteFinancialYear = async (id: number) => {
  try {
    await prisma.financialYear.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error deleting financial year: ${error.message}`);
    } else {
      throw new Error("Error deleting financial year: Unknown error");
    }
  }
};

export const getFinancialYearById = async (id: number) => {
  try {
    const fy = await prisma.financialYear.findUnique({
      where: { id },
    });
    return fy;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error retrieving financial year: ${error.message}`);
    } else {
      throw new Error("Error retrieving financial year: Unknown error");
    }
  }
};
