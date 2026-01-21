"use client";

import { useState, useMemo } from "react";
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
import { useSubdomain } from "@/components/providers/subdomain-provider";
import type { RestauranteAdmin } from "@/types/admins";

const passwordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restauranteId: string | null;
  admin: RestauranteAdmin | null;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  restauranteId,
  admin,
}: ChangePasswordDialogProps) {
  const { subdomain } = useSubdomain();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
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

  const onSubmit = async (data: PasswordFormData) => {
    if (!restauranteId || !admin) {
      toast.error("Faltan datos necesarios");
      return;
    }

    setLoading(true);

    try {
      const axiosInstance = getAxiosInstance(subdomain ?? null);

      const payload = {
        password: data.password,
      };

      await axiosInstance.post(
        `/restaurantes/${restauranteId}/admins/${admin.id}/change-password`,
        payload
      );

      toast.success("Contraseña actualizada exitosamente");

      reset();
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al cambiar contraseña";

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
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Establece una nueva contraseña para {admin?.name || "el administrador"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <Field data-invalid={!!errors.password}>
              <FieldLabel>Nueva Contraseña *</FieldLabel>
              <div className="flex gap-2">
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Mínimo 8 caracteres"
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
            <Button type="submit" disabled={loading || !restauranteId || !admin}>
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
