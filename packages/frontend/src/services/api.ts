import axios from 'axios';

// Local type definitions to avoid ESM/CommonJS compatibility issues
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export interface LineOfBusiness {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenConfiguration {
  id: string;
  screenKey: string;
  screenName: string;
  description: string | null;
  config: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: InsuranceProduct[];
}

export interface InsuranceProduct {
  id: string;
  name: string;
  description: string | null;
  lineOfBusinessId: string;
  screenConfigurationId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lineOfBusiness?: LineOfBusiness;
  screenConfiguration?: ScreenConfiguration | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Line of Business API
export const lineOfBusinessApi = {
  getAll: async (): Promise<LineOfBusiness[]> => {
    const response = await api.get<ApiResponse<LineOfBusiness[]>>('/lines-of-business');
    return response.data.data || [];
  },
  
  getById: async (id: string): Promise<LineOfBusiness> => {
    const response = await api.get<ApiResponse<LineOfBusiness>>(`/lines-of-business/${id}`);
    return response.data.data as LineOfBusiness;
  },
  
  create: async (data: Partial<LineOfBusiness>): Promise<LineOfBusiness> => {
    const response = await api.post<ApiResponse<LineOfBusiness>>('/lines-of-business', data);
    return response.data.data as LineOfBusiness;
  },
  
  update: async (id: string, data: Partial<LineOfBusiness>): Promise<LineOfBusiness> => {
    const response = await api.put<ApiResponse<LineOfBusiness>>(`/lines-of-business/${id}`, data);
    return response.data.data as LineOfBusiness;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/lines-of-business/${id}`);
  }
};

// Screen Configuration API
export const screenConfigurationApi = {
  getAll: async (): Promise<ScreenConfiguration[]> => {
    const response = await api.get<ApiResponse<ScreenConfiguration[]>>('/screen-configurations');
    return response.data.data || [];
  },
  
  getById: async (id: string): Promise<ScreenConfiguration> => {
    const response = await api.get<ApiResponse<ScreenConfiguration>>(`/screen-configurations/${id}`);
    return response.data.data as ScreenConfiguration;
  },
  
  getByKey: async (screenKey: string): Promise<ScreenConfiguration> => {
    const response = await api.get<ApiResponse<ScreenConfiguration>>(`/screen-configurations/key/${screenKey}`);
    return response.data.data as ScreenConfiguration;
  },
  
  create: async (data: Partial<ScreenConfiguration>): Promise<ScreenConfiguration> => {
    const response = await api.post<ApiResponse<ScreenConfiguration>>('/screen-configurations', data);
    return response.data.data as ScreenConfiguration;
  },
  
  update: async (id: string, data: Partial<ScreenConfiguration>): Promise<ScreenConfiguration> => {
    const response = await api.put<ApiResponse<ScreenConfiguration>>(`/screen-configurations/${id}`, data);
    return response.data.data as ScreenConfiguration;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/screen-configurations/${id}`);
  }
};

// Insurance Product API
export const insuranceProductApi = {
  getAll: async (): Promise<InsuranceProduct[]> => {
    const response = await api.get<ApiResponse<InsuranceProduct[]>>('/insurance-products');
    return response.data.data || [];
  },
  
  getById: async (id: string): Promise<InsuranceProduct> => {
    const response = await api.get<ApiResponse<InsuranceProduct>>(`/insurance-products/${id}`);
    return response.data.data as InsuranceProduct;
  },
  
  getByLobId: async (lobId: string): Promise<InsuranceProduct[]> => {
    const response = await api.get<ApiResponse<InsuranceProduct[]>>(`/insurance-products/lob/${lobId}`);
    return response.data.data || [];
  },
  
  create: async (data: Partial<InsuranceProduct>): Promise<InsuranceProduct> => {
    const response = await api.post<ApiResponse<InsuranceProduct>>('/insurance-products', data);
    return response.data.data as InsuranceProduct;
  },
  
  update: async (id: string, data: Partial<InsuranceProduct>): Promise<InsuranceProduct> => {
    const response = await api.put<ApiResponse<InsuranceProduct>>(`/insurance-products/${id}`, data);
    return response.data.data as InsuranceProduct;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/insurance-products/${id}`);
  }
};
