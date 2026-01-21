"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { IconBuilding, IconUserCog } from "@tabler/icons-react";

import { useSubdomain } from "@/components/providers/subdomain-provider";
import { getAxiosInstance } from "@/lib/axios-config";
import { Button } from "@/components/ui/button";
import type { PaginatedResponse, Restaurante } from "@/types/restaurantes";

export function SuperAdminDashboard() {
  const { subdomain } = useSubdomain();

  const { data, isLoading } = useQuery<PaginatedResponse<Restaurante>>({
    queryKey: ["restaurantes", "superadmin-dashboard"],
    queryFn: async () => {
      const axiosInstance = getAxiosInstance(subdomain ?? null);
      const res = await axiosInstance.get("/restaurantes?page=1&limit=10");
      return res.data;
    },
  });

  const totalRestaurantes = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Panel del superadmin de Pachamama (UI tipo Vekino).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Restaurantes</p>
          <p className="text-2xl font-semibold">
            {isLoading ? "..." : totalRestaurantes}
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Usuarios/Admins</p>
          <p className="text-2xl font-semibold">—</p>
          <p className="text-xs text-muted-foreground mt-1">
            (Por ahora estimado / sin métrica)
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Estado</p>
          <p className="text-2xl font-semibold">Activo</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/restaurantes">
            <IconBuilding className="mr-2 h-4 w-4" />
            Gestionar restaurantes
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/administradores">
            <IconUserCog className="mr-2 h-4 w-4" />
            Gestionar administradores
          </Link>
        </Button>
      </div>
    </div>
  );
}

