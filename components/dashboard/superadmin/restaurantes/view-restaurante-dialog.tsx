"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { IconBuildingStore, IconCheck, IconX } from "@tabler/icons-react";
import type { Restaurante } from "@/types/restaurantes";
import { RestauranteLogo } from "./restaurante-logo";

interface ViewRestauranteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurante: Restaurante | null;
}

export function ViewRestauranteDialog({
  open,
  onOpenChange,
  restaurante,
}: ViewRestauranteDialogProps) {
  if (!restaurante) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Restaurante</DialogTitle>
          <DialogDescription>
            Información completa del restaurante seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="shrink-0">
              {restaurante.logo ? (
                <RestauranteLogo
                  logo={restaurante.logo}
                  name={restaurante.name}
                  primaryColor={restaurante.primaryColor}
                />
              ) : (
                <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconBuildingStore className="size-8 text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-bold truncate">{restaurante.name}</h3>
              <p className="text-muted-foreground text-sm truncate">
                Subdominio: {restaurante.subdomain}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <p className="text-sm font-medium">{restaurante.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    restaurante.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {restaurante.isActive ? (
                    <IconCheck className="size-3.5" />
                  ) : (
                    <IconX className="size-3.5" />
                  )}
                  {restaurante.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">NIT</Label>
              <p className="text-sm font-medium">{restaurante.nit}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">País / Ciudad</Label>
              <p className="text-sm font-medium">
                {restaurante.country} / {restaurante.city}
              </p>
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Dirección</Label>
              <p className="text-sm font-medium">{restaurante.address}</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Plan</Label>
              <p className="text-sm font-medium">{restaurante.subscriptionPlan}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Límite de Unidades</Label>
              <p className="text-sm font-medium">{restaurante.unitLimit}</p>
            </div>

            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Módulos Activos</Label>
              <p className="text-sm font-medium">
                {restaurante.activeModules || "No disponible"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-xs text-muted-foreground">Vencimiento del Plan</Label>
              <p className="text-sm font-medium">
                {new Date(restaurante.planExpiresAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Zona Horaria</Label>
              <p className="text-sm font-medium">{restaurante.timezone}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fecha de Creación</Label>
              <p className="text-sm font-medium">
                {new Date(restaurante.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Última Actualización</Label>
              <p className="text-sm font-medium">
                {new Date(restaurante.updatedAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

