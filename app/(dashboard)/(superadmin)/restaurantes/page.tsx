"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSubdomain } from "@/components/providers/subdomain-provider";
import { getAxiosInstance } from "@/lib/axios-config";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";
import type { Restaurante } from "@/types/restaurantes";
import type {
  RestaurantesFilters,
  PaginatedResponse,
} from "@/types/restaurantes";
import { RestaurantesFiltersComponent } from "@/components/dashboard/superadmin/restaurantes/restaurantes-filters";
import { RestaurantesTable } from "@/components/dashboard/superadmin/restaurantes/restaurantes-table";
import { ViewRestauranteDialog } from "../../../../components/dashboard/superadmin/restaurantes/view-restaurante-dialog";
import { CreateRestauranteDialog } from "@/components/dashboard/superadmin/restaurantes/create-restaurante-dialog";
import { EditRestauranteDialog } from "@/components/dashboard/superadmin/restaurantes/edit-restaurante-dialog";

function SuperAdminRestaurantesPage() {
  const { subdomain } = useSubdomain();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [filters, setFilters] = useState<RestaurantesFilters>({
    page: 1,
    limit: 5,
  });
  const [searchName, setSearchName] = useState("");
  const debouncedSearchName = useDebounce(searchName, 300);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRestaurante, setSelectedRestaurante] = useState<Restaurante | null>(
    null
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Actualizar filtros cuando cambia el debounce
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearchName || undefined,
      page: 1, // Resetear a la primera página cuando cambia la búsqueda
    }));
  }, [debouncedSearchName]);

  // Construir query params (solo incluir filtros con valor)
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  if (filters.search && filters.search.trim()) {
    queryParams.append("search", filters.search.trim());
  }
  if (typeof filters.isActive === "boolean") {
    queryParams.append("isActive", String(filters.isActive));
  }
  if (filters.subscriptionPlan && filters.subscriptionPlan.trim()) {
    queryParams.append("subscriptionPlan", filters.subscriptionPlan.trim());
  }
  if (filters.city && filters.city.trim()) {
    queryParams.append("city", filters.city.trim());
  }

  const queryString = queryParams.toString();
  const endpoint = `/restaurantes${queryString ? `?${queryString}` : ""}`;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<PaginatedResponse<Restaurante>>({
    queryKey: ["restaurantes", filters],
    queryFn: async () => {
      const axiosInstance = getAxiosInstance(subdomain);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    },
  });

  const restaurantes = response?.data || [];
  const total = response?.total || 0;
  const currentPage = response?.page || 1;
  const totalPages = response?.totalPages || 0;
  const limitValue = response?.limit || (filters.limit || 5);

  const handleStatusFilter = (status: boolean | null) => {
    setFilters((prev) => ({
      ...prev,
      isActive: status === null ? undefined : status,
      page: 1,
    }));
  };

  const handlePlanFilter = (plan: string | null) => {
    setFilters((prev) => ({
      ...prev,
      subscriptionPlan: plan || undefined,
      page: 1,
    }));
  };

  const handleCityFilter = (city: string | null) => {
    setFilters((prev) => ({
      ...prev,
      city: city || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 5 });
    setSearchName("");
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const activeFiltersCount = [
    filters.search,
    filters.isActive !== undefined ? filters.isActive : undefined,
    filters.subscriptionPlan,
    filters.city,
  ].filter((v) => v !== undefined).length;

  const handleView = (restaurante: Restaurante) => {
    setSelectedRestaurante(restaurante);
    setViewModalOpen(true);
  };

  const handleEdit = (restaurante: Restaurante) => {
    setSelectedRestaurante(restaurante);
    setEditModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (restauranteId: string) => {
      const axiosInstance = getAxiosInstance(subdomain);
      // API: DELETE /restaurantes/:id/delete
      await axiosInstance.delete(`/restaurantes/${restauranteId}/delete`);
    },
    onSuccess: () => {
      toast.success("Restaurante eliminado exitosamente", { duration: 2000 });
      queryClient.invalidateQueries({ queryKey: ["restaurantes"] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al eliminar el restaurante";
      toast.error(msg, { duration: 3000 });
    },
  });

  const handleDelete = (r: Restaurante) => deleteMutation.mutate(r.id);

  return (
    <div className="space-y-6">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Restaurantes</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona y administra todos los restaurantes de la plataforma
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <RestaurantesFiltersComponent
          filters={filters}
          searchName={searchName}
          onSearchNameChange={setSearchName}
          onStatusFilter={handleStatusFilter}
          onPlanFilter={handlePlanFilter}
          onCityFilter={handleCityFilter}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
          onCreate={() => setCreateModalOpen(true)}
        />

        <RestaurantesTable
          restaurantes={restaurantes}
          isLoading={isLoading}
          error={error as any}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limitValue}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onGoToAdmins={(r) => router.push(`/administradores?restauranteId=${r.id}`)}
        />
      </div>

      <ViewRestauranteDialog
        open={viewModalOpen}
        onOpenChange={(open: boolean) => {
          setViewModalOpen(open);
          if (!open) setSelectedRestaurante(null);
        }}
        restaurante={selectedRestaurante}
      />

      <CreateRestauranteDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <EditRestauranteDialog
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setSelectedRestaurante(null);
        }}
        restaurante={selectedRestaurante}
      />
    </div>
  );
}

export default SuperAdminRestaurantesPage;
