import Papa from "papaparse";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

export interface ImportedUser {
  username: string;
  email: string;
  password?: string;
  role?: string;
  status?: string;
  phone?: string;
  extra?: {
    fullName?: string;
    organization_name?: string;
    stakeholderCategoryId?: string;
  };
}

export class FileImportService {
  static async parseFile(file: File): Promise<ImportedUser[]> {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "csv":
        return await this.parseCSV(file);
      case "xlsx":
      case "xls":
        return await this.parseExcel(file);
      case "docx":
        return await this.parseWord(file);
      //   case 'pdf':
      //     return await this.parsePDF(file);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  private static parseCSV(file: File): Promise<ImportedUser[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const users = this.validateAndTransformData(results.data as any[]);
            resolve(users);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  }

  private static async parseExcel(file: File): Promise<ImportedUser[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          const users = this.validateAndTransformData(jsonData as any[]);
          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  }

  private static async parseWord(file: File): Promise<ImportedUser[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          const users = this.extractTableFromText(text);
          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read Word file"));
      reader.readAsArrayBuffer(file);
    });
  }

  //   private static async parsePDF(file: File): Promise<ImportedUser[]> {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = async (e) => {
  //         try {
  //           const arrayBuffer = e.target?.result as ArrayBuffer;
  //           const data = await pdf(arrayBuffer);
  //           const users = this.extractTableFromText(data.text);
  //           resolve(users);
  //         } catch (error) {
  //           reject(error);
  //         }
  //       };
  //       reader.onerror = () => reject(new Error('Failed to read PDF file'));
  //       reader.readAsArrayBuffer(file);
  //     });
  //   }

  private static extractTableFromText(text: string): ImportedUser[] {
    const lines = text.split("\n").filter((line) => line.trim());
    const users: ImportedUser[] = [];

    // Look for table-like structure (rows with multiple columns separated by spaces/tabs)
    for (const line of lines) {
      const columns = line.split(/\t|\s{2,}/).filter((col) => col.trim());

      // Skip if it doesn't look like a data row (too few columns or contains "id" header)
      if (
        columns.length < 2 ||
        columns.some(
          (col) =>
            col.toLowerCase().includes("id") &&
            col.toLowerCase() !== "stakeholderCategoryId"
        )
      ) {
        continue;
      }

      // Try to map columns to user fields
      const user = this.mapColumnsToUser(columns);
      if (user.username && user.email) {
        users.push(user);
      }
    }

    return users;
  }

  private static mapColumnsToUser(columns: string[]): ImportedUser {
    const user: ImportedUser = {
      username: "",
      email: "",
      role: "stakeholder_user",
      status: "active",
    };

    // Simple heuristic mapping - you might want to make this more sophisticated
    columns.forEach((col, index) => {
      const value = col.trim();
      if (!value) return;

      if (value.includes("@") && !user.email) {
        user.email = value;
      } else if (!user.username && index === 0) {
        user.username = value;
      } else if (
        [
          "admin",
          "subclusterfocalperson",
          "stakeholder_admin",
          "stakeholder_user",
        ].includes(value.toLowerCase())
      ) {
        user.role = value.toLowerCase() as any;
      } else if (["active", "inactive"].includes(value.toLowerCase())) {
        user.status = value.toLowerCase() as any;
      } else if (value.match(/^\+?[\d\s\-\(\)]+$/)) {
        user.phone = value;
      } else if (!user.extra) {
        user.extra = { fullName: value };
      } else if (user.extra && !user.extra.fullName) {
        user.extra.fullName = value;
      }
    });

    // If username is still empty but we have email, use email prefix
    if (!user.username && user.email) {
      user.username = user.email.split("@")[0];
    }

    return user;
  }

  private static validateAndTransformData(data: any[]): ImportedUser[] {
    // Check for forbidden columns
    const forbiddenColumns = ["id", "no", "number", "#"];
    const firstRow = data[0];
    if (firstRow) {
      const columns = Object.keys(firstRow);
      const hasForbiddenColumn = columns.some((col) =>
        forbiddenColumns.includes(col.toLowerCase())
      );

      if (hasForbiddenColumn) {
        throw new Error(
          "File contains forbidden columns (id, no, number, #). Please remove these columns and try again."
        );
      }
    }

    return data.map((row, index) => {
      const user: ImportedUser = {
        username: row.username || row.Username || row.USERNAME || "",
        email: row.email || row.Email || row.EMAIL || "",
        role: (row.role || row.Role || row.ROLE || "stakeholder_user") as any,
        status: (row.status || row.Status || row.STATUS || "active") as any,
        phone: row.phone || row.Phone || row.PHONE,
      };

      // Handle extra fields
      const extraFields: any = {};
      if (row.fullName || row["full name"] || row.FullName) {
        extraFields.fullName = row.fullName || row["full name"] || row.FullName;
      }
      if (row.organization || row.organization_name || row.organizationName) {
        extraFields.organization_name =
          row.organization || row.organization_name || row.organizationName;
      }
      if (row.stakeholderCategoryId) {
        extraFields.stakeholderCategoryId = row.stakeholderCategoryId;
      }

      if (Object.keys(extraFields).length > 0) {
        user.extra = extraFields;
      }

      // Generate username from email if not provided
      if (!user.username && user.email) {
        user.username = user.email.split("@")[0];
      }

      // Validate required fields
      if (!user.username || !user.email) {
        throw new Error(`Row ${index + 1}: username and email are required`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error(`Row ${index + 1}: invalid email format`);
      }

      return user;
    });
  }
}
