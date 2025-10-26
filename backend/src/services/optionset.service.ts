import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOptionSet = async (name: string, description: string) => {
  return await prisma.optionSet.create({
    data: {
      name,
      description,
    },
  });
};

export const createOption = async (optionSetId: number, name: string) => {
  return await prisma.option.create({
    data: {
      optionSetId,
      name,
    },
  });
};

/**
 * Get all OptionSets (with options)
 */
export const getOptionSets = async () => {
  return await prisma.optionSet.findMany({
    include: { options: true },
    orderBy: { name: "asc" },
  });
};

/**
 * Get options for a specific OptionSet
 */
export const getOptionsByOptionSet = async (optionSetId: number) => {
  return await prisma.option.findMany({
    where: { optionSetId },
    orderBy: { name: "asc" },
  });
};
