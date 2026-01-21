"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { getAxiosInstance } from "@/lib/axios-config";
import { useQueryClient } from "@tanstack/react-query";
import { useSubdomain } from "@/components/providers/subdomain-provider";
import type { RestauranteAdmin } from "@/types/admins";

const adminSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restauranteId: string | null;
  admin: RestauranteAdmin | null;
}

export function EditAdminDialog({
  open,
  onOpenChange,
  restauranteId,
  admin,
}: EditAdminDialogProps) {
  const queryClient = useQueryClient();
  const { subdomain } = useSubdomain();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  // Actualizar el formulario cuando cambia el admin
  useEffect(() => {
    if (admin && open) {
      reset({
        name: admin.name || "",
        email: admin.email || "",
      });
    }
  }, [admin, open, reset]);

  const onSubmit = async (data: AdminFormData) => {
    if (!restauranteId || !admin) {
      toast.error("Faltan datos necesarios");
      return;
    }

    setLoading(true);

    try {
      const axiosInstance = getAxiosInstance(subdomain ?? null);

      const payload = {
        name: data.name,
        email: data.email,
      };

      await axiosInstance.put(
        `/restaurantes/${restauranteId}/admins/${admin.id}`,
        payload
      );

      toast.success("Administrador actualizado exitosamente");

      // Invalidar y revalidar las queries para actualizar los datos
      await queryClient.invalidateQueries({
        queryKey: ["restaurantes", restauranteId, "admins"],
      });

      reset();
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al actualizar administrador";

      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && onOpenChange(open)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Administrador</DialogTitle>
          <DialogDescription>
            Actualiza la información del administrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Nombre *</FieldLabel>
              <Input
                {...register("name")}
                placeholder="Juan Pérez"
                disabled={loading}
              />
              {errors.name && (
                <FieldError>{errors.name.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel>Email *</FieldLabel>
              <Input
                type="email"
                {...register("email")}
                placeholder="admin@restaurante.com"
                disabled={loading}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !restauranteId || !admin}>
              {loading ? "Actualizando..." : "Actualizar Administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
