export interface Restaurante {
  id: string;
  name: string;
  subdomain: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  logo: string | null;
  primaryColor: string;
  subscriptionPlan: string;
  unitLimit: number;
  planExpiresAt: string;
  activeModules: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface RestaurantesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  subscriptionPlan?: string;
  city?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
