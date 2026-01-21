"use client";

import { useMemo, useState } from "react";
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

const adminSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  // Puede quedar vacía si el usuario quiere generar una contraseña aleatoria.
  password: z.string().optional(),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restauranteId: string | null;
}

export function CreateAdminDialog({
  open,
  onOpenChange,
  restauranteId,
}: CreateAdminDialogProps) {
  const queryClient = useQueryClient();
  const { subdomain } = useSubdomain();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const passwordGenerator = useMemo(() => {
    // Genera una contraseña fuerte usando crypto (browser).
    const alphabet =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-";
    return (length = 12) => {
      const buf = new Uint32Array(length);
      crypto.getRandomValues(buf);
      let out = "";
      for (let i = 0; i < buf.length; i++) {
        out += alphabet[buf[i] % alphabet.length];
      }
      return out;
    };
  }, []);

  const onSubmit = async (data: AdminFormData) => {
    if (!restauranteId) {
      toast.error("Debes seleccionar un restaurante primero");
      return;
    }

    setLoading(true);

    try {
      const axiosInstance = getAxiosInstance(subdomain ?? null);

      const password = (data.password ?? "").trim() || passwordGenerator(12);

      const payload = {
        name: data.name,
        email: data.email,
        password,
      };

      await axiosInstance.post(`/restaurantes/${restauranteId}/admins`, payload);

      toast.success(
        data.password?.trim()
          ? "Administrador creado exitosamente"
          : `Administrador creado. Contraseña: ${password}`,
        {
        duration: 3000,
        }
      );

      // Invalidar y revalidar las queries para actualizar los datos
      await queryClient.invalidateQueries({
        queryKey: ["restaurantes", restauranteId, "admins"],
      });

      reset();
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al crear administrador";

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
          <DialogTitle>Crear Nuevo Administrador</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo administrador para el restaurante.
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

            <Field data-invalid={!!errors.password}>
              <FieldLabel>Contraseña (opcional)</FieldLabel>
              <div className="flex gap-2">
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Deja vacío para generar aleatoria"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const pwd = passwordGenerator(12);
                    setValue("password", pwd, { shouldValidate: true, shouldDirty: true });
                    toast.success("Contraseña generada");
                  }}
                  disabled={loading}
                >
                  Generar
                </Button>
              </div>
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
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
            <Button type="submit" disabled={loading || !restauranteId}>
              {loading ? "Creando..." : "Crear Administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
