// Common types shared between frontend and backend

export interface LineOfBusiness {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenConfiguration {
  id: string;
  screenKey: string;
  screenName: string;
  description?: string | null;
  config: ScreenConfigData;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceProduct {
  id: string;
  productKey: string;
  productName: string;
  description?: string | null;
  lobId?: string | null;
  screenConfigId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lob?: LineOfBusiness | null;
  screenConfig?: ScreenConfiguration;
}

// Screen Configuration Types
export interface ScreenConfigData {
  accordions: Accordion[];
  metadata?: Record<string, any>;
}

export interface Accordion {
  id: string;
  title: string;
  isOpen?: boolean;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  columns: number;
  widgets: Widget[];
}

// TableWidget column definition

export interface TableRow {
  id: string;
  cells: Record<string, any>;
  isValid?: boolean;
}

export interface WidgetDependency {
  parentFieldId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'isEmpty' | 'isNotEmpty';
  value?: string | string[];
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

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

export interface Widget {
  id: string;
  type: WidgetType;
  label: string;
  field: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  validations?: Validation[];
  options?: SelectOption[];
  placeholder?: string;
  helperText?: string;
  width?: number | string;
  metadata?: Record<string, any>;
  min?: number;
  max?: number;
  // Table widget specific properties
  columns?: TableColumn[];
  minRows?: number;
  maxRows?: number;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  showRowNumbers?: boolean;
  showTotals?: boolean;
  // Dependency properties
  dependency?: WidgetDependency;
  // API binding properties
  apiBinding?: ApiBindingOptions;
}

export enum WidgetType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  DATETIME = 'datetime',
  TEXTAREA = 'textarea',
  TABLE = 'table',
  CUSTOM = 'custom',
  SWITCH = 'switch',
  SLIDER = 'slider',
  AUTOCOMPLETE = 'autocomplete',
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  DIVIDER = 'divider'
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface Validation {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: string; // For custom validators
}

// Table Widget specific types
export interface TableConfig {
  columns: TableColumn[];
  data?: any[];
  editable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: TableAction[];
}

export interface TableColumn {
  id: string; // Unique identifier for the column
  field?: string; // Field name in data source
  header: string; // Display name
  headerName?: string; // Alternative display name (for backward compatibility)
  width?: string | number; // Column width
  type: 'text' | 'number' | 'select' | 'checkbox' | 'switch' | 'formula' | 'string' | 'date' | 'boolean' | 'actions';
  editable?: boolean; // Whether the column is editable
  required?: boolean; // Whether the column is required
  sortable?: boolean; // Whether the column can be sorted
  filterable?: boolean; // Whether the column can be filtered
  options?: SelectOption[]; // Options for select type columns
  formula?: string; // Formula for calculated columns
  defaultValue?: any; // Default value for the column
  renderCell?: string; // Name of the custom renderer function
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TableAction {
  name: string;
  icon: string;
  handler: string; // Name of the handler function
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
