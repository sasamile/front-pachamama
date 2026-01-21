"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconSearch, IconBuildingStore } from "@tabler/icons-react";

import { useSubdomain } from "@/components/providers/subdomain-provider";
import { getAxiosInstance } from "@/lib/axios-config";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PaginatedResponse, Restaurante } from "@/types/restaurantes";

interface RestaurantesSidebarProps {
  selectedRestauranteId: string | null;
  onSelectRestaurante: (restauranteId: string) => void;
  withoutCard?: boolean;
}

export function RestaurantesSidebar({
  selectedRestauranteId,
  onSelectRestaurante,
  withoutCard = false,
}: RestaurantesSidebarProps) {
  const { subdomain } = useSubdomain();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: response, isLoading } = useQuery<PaginatedResponse<Restaurante>>({
    queryKey: ["restaurantes", "sidebar"],
    queryFn: async () => {
      const axiosInstance = getAxiosInstance(subdomain);
      const res = await axiosInstance.get("/restaurantes?page=1&limit=100");
      return res.data;
    },
  });

  const restaurantes = response?.data || [];
  const filtered = restaurantes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const listContent = (
    <>
      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <IconBuildingStore className="size-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "No se encontraron restaurantes" : "No hay restaurantes disponibles"}
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRestaurante(r.id)}
              className={cn(
                "w-full p-4 text-left hover:bg-accent transition-colors",
                selectedRestauranteId === r.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2">
                {r.logo ? (
                  <div
                    className="size-10 rounded-lg overflow-hidden border-2 shadow-sm shrink-0"
                    style={{ borderColor: r.primaryColor || "#3B82F6" }}
                  >
                    <img
                      src={r.logo}
                      alt={r.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: ${r.primaryColor || "#3B82F6"}">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M9 21V9h6v12" />
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="size-10 rounded-lg overflow-hidden border-2 shadow-sm bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0"
                    style={{ borderColor: r.primaryColor || "#3B82F6" }}
                  >
                    <IconBuildingStore className="size-5" style={{ color: r.primaryColor || "#3B82F6" }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.city}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );

  if (withoutCard) {
    return (
      <div className="h-full flex flex-col">
        <div className="pb-3 px-4 pt-4">
          <div className="relative mt-2">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Buscar restaurante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{listContent}</div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col max-h-[calc(100vh-12rem)]">
      <CardHeader className="pb-3">
        <CardTitle>Restaurantes</CardTitle>
        <div className="relative mt-2">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Buscar restaurante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">{listContent}</CardContent>
    </Card>
  );
}

