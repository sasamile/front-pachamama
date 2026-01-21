"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCirclePlusFilled, IconFilter, IconSearch } from "@tabler/icons-react";
import type { RestaurantesFilters } from "@/types/restaurantes";

interface RestaurantesFiltersProps {
  filters: RestaurantesFilters;
  searchName: string;
  onSearchNameChange: (value: string) => void;
  onStatusFilter: (status: boolean | null) => void;
  onPlanFilter: (plan: string | null) => void;
  onCityFilter: (city: string | null) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  onCreate?: () => void;
}

export function RestaurantesFiltersComponent({
  filters,
  searchName,
  onSearchNameChange,
  onStatusFilter,
  onPlanFilter,
  onCityFilter,
  onClearFilters,
  activeFiltersCount,
  onCreate,
}: RestaurantesFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>
              Busca y filtra restaurantes por nombre, estado, plan o ciudad
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Limpiar filtros ({activeFiltersCount})
              </Button>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer"
              onClick={onCreate}
            >
              <IconCirclePlusFilled />
              <span>Crear Restaurante</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchName}
                onChange={(e) => onSearchNameChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <IconFilter className="size-4" />
                Estado
                {filters.isActive !== undefined && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground size-5 flex items-center justify-center text-xs">
                    {filters.isActive ? "✓" : "✗"}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusFilter(null)}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilter(true)}>
                Activos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilter(false)}>
                Inactivos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <IconFilter className="size-4" />
                Plan
                {filters.subscriptionPlan && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground size-5 flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onPlanFilter(null)}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanFilter("BASICO")}>
                Básico
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanFilter("PRO")}>
                Pro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPlanFilter("ENTERPRISE")}>
                Enterprise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="min-w-[200px]">
            <Input
              placeholder="Filtrar por ciudad..."
              value={filters.city || ""}
              onChange={(e) => onCityFilter(e.target.value || null)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

