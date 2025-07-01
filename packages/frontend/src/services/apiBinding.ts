// API Binding Service for Widget Data
import axios from 'axios';

export interface ApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  responseMapping?: {
    // For options (dropdown, multiselect)
    options?: {
      path: string; // JSON path to array of options
      valueField: string; // Field to use as value
      labelField: string; // Field to use as label
    };
    // For value (textbox, number, etc.)
    value?: {
      path: string; // JSON path to value
    };
    // For table data
    tableData?: {
      path: string; // JSON path to array of rows
      columns: Record<string, string>; // Map of column IDs to data fields
    };
  };
  // For testing/mocking
  mockResponse?: any;
  useMock?: boolean;
}

export interface ApiBindingOptions {
  apiConfig?: ApiConfig;
  loadOnRender?: boolean;
  refreshTriggers?: string[]; // Field IDs that trigger a refresh when changed
  loadingState?: {
    show: boolean;
    message?: string;
  };
  errorHandling?: {
    showError: boolean;
    errorMessage?: string;
  };
}

// Function to execute API call based on configuration
export const executeApiCall = async (config: ApiConfig, formValues?: Record<string, any>): Promise<any> => {
  try {
    // Use mock response if specified
    if (config.useMock && config.mockResponse) {
      return config.mockResponse;
    }

    // Replace any template variables in URL, params, and body
    const url = replaceTemplateVariables(config.url, formValues);
    const params = config.params ? replaceTemplateVariablesInObject(config.params, formValues) : undefined;
    const body = config.body ? replaceTemplateVariablesInObject(config.body, formValues) : undefined;

    // Execute the API call
    const response = await axios({
      url,
      method: config.method,
      headers: config.headers || { 'Content-Type': 'application/json' },
      params,
      data: body
    });

    return response.data;
  } catch (error) {
    console.error('API binding error:', error);
    throw error;
  }
};

// Helper function to replace template variables in a string
// Format: ${fieldName} will be replaced with the value of formValues.fieldName
const replaceTemplateVariables = (template: string, values?: Record<string, any>): string => {
  if (!values) return template;
  
  return template.replace(/\${([^}]+)}/g, (match, field) => {
    return values[field] !== undefined ? values[field] : match;
  });
};

// Helper function to replace template variables in an object
const replaceTemplateVariablesInObject = (obj: Record<string, any>, values?: Record<string, any>): Record<string, any> => {
  if (!values) return obj;
  
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      result[key] = replaceTemplateVariables(obj[key], values);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = replaceTemplateVariablesInObject(obj[key], values);
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
};

// Extract data from API response based on mapping configuration
export const extractDataFromResponse = (response: any, mapping: ApiConfig['responseMapping']): any => {
  if (!mapping) return response;
  
  try {
    if (mapping.options && mapping.options.path) {
      const optionsArray = getValueByPath(response, mapping.options.path) || [];
      return optionsArray.map((item: any) => ({
        value: getValueByPath(item, mapping.options!.valueField),
        label: getValueByPath(item, mapping.options!.labelField)
      }));
    }
    
    if (mapping.value && mapping.value.path) {
      return getValueByPath(response, mapping.value.path);
    }
    
    if (mapping.tableData && mapping.tableData.path) {
      const rowsArray = getValueByPath(response, mapping.tableData.path) || [];
      return rowsArray.map((row: any) => {
        const mappedRow: Record<string, any> = { id: row.id || crypto.randomUUID() };
        const cells: Record<string, any> = {};
        
        for (const [columnId, dataField] of Object.entries(mapping.tableData!.columns)) {
          cells[columnId] = getValueByPath(row, dataField);
        }
        
        mappedRow.cells = cells;
        return mappedRow;
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error extracting data from response:', error);
    return null;
  }
};

// Helper function to get a value from an object by dot notation path
export const getValueByPath = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) return undefined;
    result = result[key];
  }
  
  return result;
};

// Test an API configuration with optional mock data
export const testApiConfig = async (config: ApiConfig): Promise<any> => {
  try {
    if (config.useMock && config.mockResponse) {
      return {
        success: true,
        data: config.mockResponse,
        processedData: config.responseMapping 
          ? extractDataFromResponse(config.mockResponse, config.responseMapping)
          : config.mockResponse
      };
    }
    
    const response = await axios({
      url: config.url,
      method: config.method,
      headers: config.headers || { 'Content-Type': 'application/json' },
      params: config.params,
      data: config.body
    });
    
    return {
      success: true,
      data: response.data,
      processedData: config.responseMapping 
        ? extractDataFromResponse(response.data, config.responseMapping)
        : response.data
    };
  } catch (error) {
    console.error('API test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
