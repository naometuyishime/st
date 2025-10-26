import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new Stakeholder with multiple districts and sub-clusters
export const createStakeholder = async (
  organizationName: string,
  districtIds: number[], 
  stakeholderCategoryId: number,
  implementationLevel: string,
  subClusters?: number[] | null
) => {
  try {
    console.log('🔍 createStakeholder called with:', {
      organizationName,
      districtIds,
      stakeholderCategoryId,
      implementationLevel,
      subClusters
    });

    // Validate subClusters if provided
    if (subClusters && subClusters.length > 0) {
      const existingSubClusters = await prisma.subCluster.findMany({
        where: { id: { in: subClusters } },
      });
      console.log('🔍 Found existing subClusters:', existingSubClusters);
      
      if (existingSubClusters.length !== subClusters.length) {
        const missingSubClusters = subClusters.filter(
          id => !existingSubClusters.some(sc => sc.id === id)
        );
        throw new Error(`Sub-clusters not found: ${missingSubClusters.join(', ')}`);
      }
    }

    // Validate districtIds
    if (districtIds.length === 0) {
      throw new Error("At least one district must be selected");
    }

    const existingDistricts = await prisma.district.findMany({
      where: { id: { in: districtIds } },
      include: { province: true },
    });
    
    if (existingDistricts.length !== districtIds.length) {
      const missingDistricts = districtIds.filter(
        id => !existingDistricts.some(d => d.id === id)
      );
      throw new Error(`Districts not found: ${missingDistricts.join(', ')}`);
    }

    // Prepare the data object
    const createData: any = {
      organizationName,
      stakeholderCategoryId,
      implementationLevel,
      stakeholderDistricts: {
        create: districtIds.map(districtId => ({
          districtId: districtId,
        })),
      },
    };

    // Add sub-clusters relation only if provided and not empty
    if (subClusters && subClusters.length > 0) {
      createData.stakeholderSubClusters = {
        create: subClusters.map(subClusterId => ({
          subClusterId: subClusterId,
        })),
      };
    }

    console.log('📦 Creating stakeholder with data:', JSON.stringify(createData, null, 2));

    // Create the stakeholder with relations
    const result = await prisma.stakeholder.create({
      data: createData,
      include: {
        stakeholderDistricts: {
          include: {
            district: {
              include: {
                province: true,
              },
            },
          },
        },
        stakeholderSubClusters: {
          include: {
            subCluster: true,
          },
        },
        stakeholderCategory: true,
      },
    });

    console.log('✅ Stakeholder created successfully:', {
      id: result.id,
      organizationName: result.organizationName,
      districtsCount: result.stakeholderDistricts.length,
      subClustersCount: result.stakeholderSubClusters?.length || 0,
      subClusters: result.stakeholderSubClusters?.map(ssc => ({
        id: ssc.subCluster.id,
        name: ssc.subCluster.name
      })) || []
    });

    return result;
  } catch (error) {
    console.error('❌ Error creating stakeholder:', error);
    throw error;
  }
};
// Keep other functions the same...
export const createStakeholderCategory = async (
  name: string,
  description: string
) => {
  return prisma.stakeholderCategory.create({
    data: {
      name,
      description,
    },
  });
};

export const getAllStakeholderCategories = async () => {
  return prisma.stakeholderCategory.findMany({
    orderBy: { name: "asc" },
  });
};

export const getStakeholderCategoryById = async (id: number) => {
  return prisma.stakeholderCategory.findUnique({
    where: { id },
  });
};

export const getAllStakeholders = async () => {
  return prisma.stakeholder.findMany({
    include: {
      stakeholderCategory: true,
      stakeholderDistricts: {
        include: {
          district: {
            include: {
              province: true,
            },
          },
        },
      },
      stakeholderSubClusters: {
        include: {
          subCluster: true,
        },
      },
    },
  });
};

export const getStakeholderById = async (id: number) => {
  return prisma.stakeholder.findUnique({
    where: { id },
    include: {
      stakeholderCategory: true,
      stakeholderDistricts: {
        include: {
          district: {
            include: {
              province: true,
            },
          },
        },
      },
      stakeholderSubClusters: {
        include: {
          subCluster: true,
        },
      },
    },
  });
};