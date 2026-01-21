"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconSearch, IconUser, IconCirclePlusFilled, IconDots, IconEdit, IconTrash, IconKey } from "@tabler/icons-react";
import toast from "react-hot-toast";

import { useSubdomain } from "@/components/providers/subdomain-provider";
import { getAxiosInstance } from "@/lib/axios-config";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RestauranteAdmin } from "@/types/admins";

interface AdminsTableProps {
  restauranteId: string | null;
  onCreate?: () => void;
  onEdit?: (admin: RestauranteAdmin) => void;
  onChangePassword?: (admin: RestauranteAdmin) => void;
}

function normalizeAdminsResponse(payload: unknown): RestauranteAdmin[] {
  if (Array.isArray(payload)) return payload as RestauranteAdmin[];
  if (payload && typeof payload === "object") {
    const anyPayload = payload as any;
    if (Array.isArray(anyPayload.data)) return anyPayload.data as RestauranteAdmin[];
    if (Array.isArray(anyPayload.admins)) return anyPayload.admins as RestauranteAdmin[];
    if (Array.isArray(anyPayload.items)) return anyPayload.items as RestauranteAdmin[];
    if (Array.isArray(anyPayload.results)) return anyPayload.results as RestauranteAdmin[];
  }
  return [];
}

export function AdminsTable({ restauranteId, onCreate, onEdit, onChangePassword }: AdminsTableProps) {
  const { subdomain } = useSubdomain();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debounced = useDebounce(searchTerm, 300);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<RestauranteAdmin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useQuery<RestauranteAdmin[]>({
    queryKey: ["restaurantes", restauranteId, "admins", { search: debounced }],
    enabled: !!restauranteId,
    queryFn: async () => {
      const axiosInstance = getAxiosInstance(subdomain);
      const res = await axiosInstance.get(`/restaurantes/${restauranteId}/admins`);
      const list: RestauranteAdmin[] = normalizeAdminsResponse(res.data);
      if (!debounced) return list;
      return list.filter((a) => {
        const q = debounced.toLowerCase();
        return a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
      });
    },
  });

  if (!restauranteId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 h-[calc(100vh-20.2rem)] ">
          <div className="text-center justify-center items-center flex flex-col">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <IconUser className="size-6 text-primary" />
            </div>
            <p className="text-muted-foreground mt-3">
              Selecciona un restaurante para ver sus administradores
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const admins = Array.isArray(data) ? data : [];

  const handleDeleteClick = (admin: RestauranteAdmin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!restauranteId || !adminToDelete) return;

    setIsDeleting(true);
    try {
      const axiosInstance = getAxiosInstance(subdomain);
      await axiosInstance.delete(
        `/restaurantes/${restauranteId}/admins/${adminToDelete.id}`
      );

      toast.success("Administrador eliminado exitosamente");

      // Invalidar y revalidar las queries para actualizar los datos
      await queryClient.invalidateQueries({
        queryKey: ["restaurantes", restauranteId, "admins"],
      });

      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al eliminar administrador";
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full w-full max-w-full flex flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="py-2">Administradores del Restaurante</CardTitle>
              <CardDescription>
                {isLoading ? "Cargando..." : `${admins.length} administrador${admins.length !== 1 ? "es" : ""}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onCreate && (
                <Button onClick={onCreate} className="gap-2">
                  <IconCirclePlusFilled className="size-4" />
                  Crear Admin
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col min-h-0 w-full max-w-full">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Error al cargar los administradores. Por favor, intenta nuevamente.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border-b">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <IconUser className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {debounced ? "No se encontraron administradores" : "No hay administradores para este restaurante"}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 w-full max-w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-xs font-medium">Administrador</th>
                    <th className="text-left p-4 text-xs font-medium">Email</th>
                    <th className="text-right p-4 text-xs font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <IconUser className="size-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{a.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{a.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs">{a.email}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <IconDots className="size-4" />
                                <span className="sr-only">Abrir menú de acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem
                                  onClick={() => onEdit(a)}
                                  className="gap-2"
                                >
                                  <IconEdit className="size-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {onChangePassword && (
                                <DropdownMenuItem
                                  onClick={() => onChangePassword(a)}
                                  className="gap-2"
                                >
                                  <IconKey className="size-4" />
                                  Cambiar contraseña
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(a)}
                                variant="destructive"
                                className="gap-2"
                              >
                                <IconTrash className="size-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el administrador{" "}
              <strong>{adminToDelete?.name}</strong> ({adminToDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 py-2 px-4 text-white rounded-md"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

