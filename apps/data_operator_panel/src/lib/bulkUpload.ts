import { supabase } from './supabase';
import { PropertyFormData } from './propertyData';

// Define the CSV row structure based on the sample.csv
export interface CSVRow {
  property_id?: string;
  property_type: string;
  special_note?: string;
  owner_name: string;
  owner_contact: string;
  area: string;
  address: string;
  sub_property_type: string;
  size?: string;
  furnishing_status?: string;
  availability?: string;
  floor?: string;
  tenant_preference?: string;
  additional_details?: string;
  age?: string;
  rent_or_sell_price: string;
  deposit?: string;
  date_stamp?: string;
  rent_sold_out?: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Bulk upload result interface
export interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successfulInserts: number;
  errors: Array<{
    row: number;
    error: string;
    data?: Partial<PropertyFormData>;
  }>;
  message: string;
}

// Required fields for validation (based on your sample data)
export const REQUIRED_FIELDS = [
  'owner_name',
  'owner_contact', 
  'area',
  'address',
  'property_type',
  'sub_property_type',
  'rent_or_sell_price'
];

// Contact number validation (Indian mobile numbers)
const validateContactNumber = (contact: string): boolean => {
  // Remove quotes and clean the number
  const cleaned = contact.replace(/["'\s-]/g, '').replace(/\D/g, '');
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
};

// Clean and normalize field values
const cleanFieldValue = (value: string | undefined): string => {
  if (!value) return '';
  // Remove quotes and extra spaces
  const cleaned = value.replace(/^["']+|["']+$/g, '').trim();
  // Convert "N/A" to empty string for optional fields
  if (cleaned.toLowerCase() === 'n/a' || cleaned === '') {
    return '';
  }
  return cleaned;
};

// Clean field value but keep defaults for required fields
const cleanFieldValueWithDefault = (value: string | undefined, defaultValue: string = 'N/A'): string => {
  if (!value) return defaultValue;
  const cleaned = value.replace(/^["']+|["']+$/g, '').trim();
  if (cleaned.toLowerCase() === 'n/a' || cleaned === '') {
    return defaultValue;
  }
  return cleaned;
};

// Validate a single property row
export const validatePropertyRow = (row: CSVRow, rowIndex: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    const value = row[field as keyof CSVRow];
    if (!value || cleanFieldValue(value).trim() === '') {
      errors.push(`Row ${rowIndex + 2}: Missing required field '${field}'`);
    }
  });

  // Validate contact number
  if (row.owner_contact) {
    const cleanContact = cleanFieldValue(row.owner_contact);
    if (!validateContactNumber(cleanContact)) {
      errors.push(`Row ${rowIndex + 2}: Invalid contact number '${cleanContact}'. Must be 10 digits starting with 6-9`);
    }
  }

  // Validate property type
  if (row.property_type) {
    const propertyType = cleanFieldValue(row.property_type);
    const validTypes = ['Res_rental', 'Res_resale', 'Com_rental', 'Com_resale'];
    if (!validTypes.includes(propertyType)) {
      warnings.push(`Row ${rowIndex + 2}: Property type '${propertyType}' should be one of: ${validTypes.join(', ')}`);
    }
  }

  // Validate price fields (should be numeric)
  if (row.rent_or_sell_price) {
    const price = cleanFieldValue(row.rent_or_sell_price);
    if (price && isNaN(Number(price.replace(/[^\d.]/g, '')))) {
      warnings.push(`Row ${rowIndex + 2}: Rent/Sell price '${price}' may not be a valid number`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Convert CSV row to PropertyFormData
export const csvRowToPropertyData = (csvRow: CSVRow): PropertyFormData => {
  return {
    owner_name: cleanFieldValueWithDefault(csvRow.owner_name),
    owner_contact: cleanFieldValueWithDefault(csvRow.owner_contact),
    area: cleanFieldValue(csvRow.area),
    address: cleanFieldValueWithDefault(csvRow.address),
    property_type: cleanFieldValueWithDefault(csvRow.property_type),
    sub_property_type: cleanFieldValueWithDefault(csvRow.sub_property_type),
    size: cleanFieldValue(csvRow.size),
    furnishing_status: cleanFieldValueWithDefault(csvRow.furnishing_status),
    availability: cleanFieldValueWithDefault(csvRow.availability),
    floor: cleanFieldValue(csvRow.floor),
    tenant_preference: cleanFieldValueWithDefault(csvRow.tenant_preference),
    additional_details: cleanFieldValue(csvRow.additional_details),
    age: cleanFieldValue(csvRow.age),
    rent_or_sell_price: cleanFieldValueWithDefault(csvRow.rent_or_sell_price),
    deposit: cleanFieldValue(csvRow.deposit),
    special_note: cleanFieldValue(csvRow.special_note)
  };
};

// Parse CSV file using native JavaScript
export const parseCSVFile = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must contain at least a header and one data row'));
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']+|["']+$/g, ''));
        
        // Parse data rows
        const data: CSVRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          
          const values = parseCSVLine(line);
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          data.push(row as unknown as CSVRow);
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Parse a single CSV line (handles quoted values with commas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Validate CSV headers
export const validateCSVHeaders = (headers: string[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const expectedHeaders = [
    'property_id', 'property_type', 'special_note', 'owner_name', 'owner_contact',
    'area', 'address', 'sub_property_type', 'size', 'furnishing_status',
    'availability', 'floor', 'tenant_preference', 'additional_details',
    'age', 'rent_or_sell_price', 'deposit', 'date_stamp', 'rent_sold_out'
  ];
  
  const requiredHeaders = ['owner_name', 'owner_contact', 'area', 'address', 'property_type', 'sub_property_type', 'rent_or_sell_price'];
  const missingRequired = requiredHeaders.filter(header => !headers.includes(header));
  
  if (missingRequired.length > 0) {
    errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
  }

  const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));
  if (extraHeaders.length > 0) {
    warnings.push(`Extra columns found (will be ignored): ${extraHeaders.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Bulk insert properties to Supabase
export const bulkInsertProperties = async (properties: PropertyFormData[]): Promise<BulkUploadResult> => {
  const result: BulkUploadResult = {
    success: false,
    totalRows: properties.length,
    successfulInserts: 0,
    errors: [],
    message: ''
  };

  if (properties.length === 0) {
    result.message = 'No valid properties to insert';
    return result;
  }

  try {
    // Prepare data for insertion (matching the database schema)
    const insertData = properties.map(property => ({
      owner_name: property.owner_name || null,
      owner_contact: property.owner_contact || null,
      area: property.area || null,
      address: property.address || null,
      property_type: property.property_type || null,
      sub_property_type: property.sub_property_type || null,
      size: property.size || null,
      furnishing_status: property.furnishing_status || null,
      availability: property.availability || null,
      floor: property.floor || null,
      tenant_preference: property.tenant_preference || null,
      additional_details: property.additional_details || null,
      age: property.age || null,
      rent_or_sell_price: property.rent_or_sell_price || null,
      deposit: property.deposit || null,
      special_note: property.special_note || null,
      visibility: true,
      rent_sold_out: false
      // property_id and date_stamp will be auto-generated by Supabase
    }));

    // Debug: Log first few records to see what's being sent
    console.log('First 2 records being inserted:', insertData.slice(0, 2));

    // Insert all properties at once
    const { data, error } = await supabase
      .from('propertydata')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }

    result.success = true;
    result.successfulInserts = data?.length || 0;
    result.message = `Successfully inserted ${result.successfulInserts} properties`;

  } catch (error) {
    console.error('Bulk insert error:', error);
    
    // Better error handling for Supabase errors
    let errorMessage = 'Unknown error during bulk insert';
    if (error && typeof error === 'object') {
      if ('message' in error && error.message) {
        errorMessage = error.message as string;
      } else if ('details' in error && error.details) {
        errorMessage = error.details as string;
      } else if ('hint' in error && error.hint) {
        errorMessage = error.hint as string;
      } else {
        errorMessage = JSON.stringify(error);
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    result.errors.push({
      row: 0,
      error: errorMessage
    });
    result.message = `Failed to insert properties: ${errorMessage}`;
  }

  return result;
};

// Main bulk upload function
export const processBulkUpload = async (file: File): Promise<BulkUploadResult> => {
  try {
    // Parse CSV file
    const csvData = await parseCSVFile(file);
    
    if (csvData.length === 0) {
      return {
        success: false,
        totalRows: 0,
        successfulInserts: 0,
        errors: [{ row: 0, error: 'CSV file is empty or contains no valid data' }],
        message: 'No data found in CSV file'
      };
    }

    // Validate headers
    const headers = Object.keys(csvData[0]);
    const headerValidation = validateCSVHeaders(headers);
    
    if (!headerValidation.isValid) {
      return {
        success: false,
        totalRows: csvData.length,
        successfulInserts: 0,
        errors: headerValidation.errors.map(error => ({ row: 0, error })),
        message: 'Invalid CSV structure'
      };
    }

    // Convert and validate each row
    const validProperties: PropertyFormData[] = [];
    const validationErrors: Array<{ row: number; error: string; data?: Partial<PropertyFormData> }> = [];

    csvData.forEach((csvRow, index) => {
      const validation = validatePropertyRow(csvRow, index);

      if (validation.isValid) {
        const propertyData = csvRowToPropertyData(csvRow);
        validProperties.push(propertyData);
      } else {
        validation.errors.forEach(error => {
          validationErrors.push({
            row: index + 2, // +2 because CSV rows start from 2 (after header)
            error,
            data: csvRowToPropertyData(csvRow)
          });
        });
      }
    });

    // If no valid properties, return validation errors
    if (validProperties.length === 0) {
      return {
        success: false,
        totalRows: csvData.length,
        successfulInserts: 0,
        errors: validationErrors,
        message: 'No valid properties found after validation'
      };
    }

    // Insert valid properties
    const insertResult = await bulkInsertProperties(validProperties);
    
    // Combine validation errors with insert errors
    insertResult.errors = [...validationErrors, ...insertResult.errors];
    insertResult.totalRows = csvData.length;

    if (insertResult.success && validationErrors.length > 0) {
      insertResult.message += `. ${validationErrors.length} rows had validation errors and were skipped.`;
    }

    return insertResult;

  } catch (error) {
    console.error('Bulk upload processing error:', error);
    return {
      success: false,
      totalRows: 0,
      successfulInserts: 0,
      errors: [{ 
        row: 0, 
        error: error instanceof Error ? error.message : 'Unknown error during processing' 
      }],
      message: 'Failed to process bulk upload'
    };
  }
};

// Generate CSV template based on the provided dummy records structure
export const generateCSVTemplate = (): string => {
  const headers = [
    'property_id', 'property_type', 'special_note', 'owner_name', 'owner_contact',
    'area', 'address', 'sub_property_type', 'size', 'furnishing_status',
    'availability', 'floor', 'tenant_preference', 'additional_details',
    'age', 'rent_or_sell_price', 'deposit', 'date_stamp', 'rent_sold_out'
  ];
  
  // Sample data rows matching the dummy records structure
  const sampleDataRows = [
    [
      '', // property_id (auto-generated)
      'Res_rental',
      '', // special_note
      'John Doe',
      '8308834710',
      'Wakad',
      '"123 Street, City"',
      '1 BHK',
      '600 sq.ft',
      'Furnished',
      'Immediate',
      '1 of 5',
      'N/A',
      'N/A',
      '1 to 5 years',
      '15000',
      '45000',
      '', // date_stamp (auto-generated)
      '' // rent_sold_out (auto-generated)
    ],
    [
      '', // property_id (auto-generated)
      'Res_rental',
      '', // special_note
      'Jane Smith',
      '9850709909',
      'Pimpri Chinchwad',
      '"456 Avenue, City"',
      '2 BHK',
      '800 sq.ft',
      'Unfurnished',
      'N/A',
      'N/A',
      'Family Only',
      'N/A',
      '5 to 10 years',
      '18000',
      '54000',
      '', // date_stamp (auto-generated)
      '' // rent_sold_out (auto-generated)
    ],
    [
      '', // property_id (auto-generated)
      'Res_rental',
      '', // special_note
      'Alice Brown',
      '7741818822',
      'Balewadi',
      '"789 Boulevard, City"',
      '2 BHK',
      '700 sq.ft',
      'Semi-Furnished',
      'Immediate',
      'N/A',
      'All',
      'N/A',
      'N/A',
      '20000',
      '60000',
      '', // date_stamp (auto-generated)
      '' // rent_sold_out (auto-generated)
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleDataRows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

// Download CSV template
export const downloadCSVTemplate = () => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'property_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
