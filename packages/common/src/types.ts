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
  field: string;
  headerName: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions';
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: string; // Name of the custom renderer function
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
