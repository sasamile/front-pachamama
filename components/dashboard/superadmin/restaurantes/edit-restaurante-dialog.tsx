"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useSubdomain } from "@/components/providers/subdomain-provider";
import { getAxiosInstance } from "@/lib/axios-config";
import { useQueryClient } from "@tanstack/react-query";
import type { Restaurante } from "@/types/restaurantes";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  nit: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  subdomain: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[a-z0-9-]+$/.test(v),
      "Subdominio inválido (solo minúsculas, números y guiones)"
    ),
  primaryColor: z.string().optional(),
  subscriptionPlan: z.enum(["BASICO", "PRO", "ENTERPRISE"]).optional(),
  activeModules: z.string().optional(),
  logo: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditRestauranteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurante: Restaurante | null;
}

function parseModules(input?: string): string[] | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  if (value.startsWith("[")) {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) ? arr.map(String) : null;
    } catch {
      return null;
    }
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function EditRestauranteDialog({
  open,
  onOpenChange,
  restaurante,
}: EditRestauranteDialogProps) {
  const queryClient = useQueryClient();
  const { subdomain } = useSubdomain();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!restaurante) return;
    reset({
      name: restaurante.name,
      nit: restaurante.nit,
      address: restaurante.address,
      city: restaurante.city,
      country: restaurante.country,
      timezone: restaurante.timezone,
      subdomain: restaurante.subdomain,
      primaryColor: restaurante.primaryColor,
      subscriptionPlan: (restaurante.subscriptionPlan as any) ?? "BASICO",
      activeModules: restaurante.activeModules || "",
    });
    // Limpiar preview cuando cambia el restaurante
    setLogoPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurante]);

  const baseURL = useMemo(() => {
    const ax = getAxiosInstance(subdomain ?? null);
    return ax.defaults.baseURL || "/api";
  }, [subdomain]);

  const onSubmit = async (data: FormValues) => {
    if (!restaurante) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.nit) formData.append("nit", data.nit);
      if (data.address) formData.append("address", data.address);
      if (data.city) formData.append("city", data.city);
      if (data.country) formData.append("country", data.country);
      if (data.timezone) formData.append("timezone", data.timezone);
      if (data.subdomain) formData.append("subdomain", data.subdomain);
      if (data.primaryColor) formData.append("primaryColor", data.primaryColor);
      if (data.subscriptionPlan) formData.append("subscriptionPlan", data.subscriptionPlan);

      const modules = parseModules(data.activeModules);
      if (!modules) {
        if ((data.activeModules ?? "").trim()) {
          toast.error("activeModules inválido. Usa JSON o lista separada por comas.");
          return;
        }
      } else {
        formData.append("activeModules", JSON.stringify(modules));
      }

      const fileList = data.logo as FileList | undefined;
      const file = fileList?.item?.(0) ?? (fileList && fileList[0]);
      if (file) formData.append("logo", file);

      const formAxios = axios.create({
        baseURL,
        withCredentials: true,
      });

      await formAxios.put(`/restaurantes/${restaurante.id}`, formData);

      toast.success("Restaurante actualizado", { duration: 2500 });
      await queryClient.invalidateQueries({ queryKey: ["restaurantes"] });
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      onOpenChange(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Error al actualizar restaurante";
      toast.error(msg, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  if (!restaurante) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Restaurante</DialogTitle>
          <DialogDescription>Actualiza los datos del restaurante.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.name}>
                <FieldLabel>Nombre *</FieldLabel>
                <Input {...register("name")} disabled={loading} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.nit}>
                <FieldLabel>NIT</FieldLabel>
                <Input {...register("nit")} disabled={loading} />
                {errors.nit && <FieldError>{errors.nit.message}</FieldError>}
              </Field>

              <Field className="col-span-2" data-invalid={!!errors.address}>
                <FieldLabel>Dirección</FieldLabel>
                <Input {...register("address")} disabled={loading} />
                {errors.address && <FieldError>{errors.address.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.city}>
                <FieldLabel>Ciudad</FieldLabel>
                <Input {...register("city")} disabled={loading} />
                {errors.city && <FieldError>{errors.city.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.country}>
                <FieldLabel>País</FieldLabel>
                <Input {...register("country")} disabled={loading} />
                {errors.country && <FieldError>{errors.country.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.timezone}>
                <FieldLabel>Zona horaria</FieldLabel>
                <Input {...register("timezone")} disabled={loading} />
                {errors.timezone && <FieldError>{errors.timezone.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.subdomain}>
                <FieldLabel>Subdominio</FieldLabel>
                <Input {...register("subdomain")} disabled={loading} />
                {errors.subdomain && <FieldError>{errors.subdomain.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.primaryColor}>
                <FieldLabel>Color principal</FieldLabel>
                <div className="flex gap-2">
                  <Input type="color" {...register("primaryColor")} disabled={loading} className="w-14 p-1" />
                  <Input
                    {...register("primaryColor")}
                    disabled={loading}
                    onChange={(e) => setValue("primaryColor", e.target.value)}
                  />
                </div>
                {errors.primaryColor && <FieldError>{errors.primaryColor.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.subscriptionPlan}>
                <FieldLabel>Plan</FieldLabel>
                <select
                  {...register("subscriptionPlan")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="BASICO">Básico</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
                {errors.subscriptionPlan && <FieldError>{errors.subscriptionPlan.message}</FieldError>}
              </Field>

              <Field className="col-span-2" data-invalid={!!errors.activeModules}>
                <FieldLabel>activeModules</FieldLabel>
                <Input
                  {...register("activeModules")}
                  disabled={loading}
                  placeholder='["reservas","pedidos"] o reservas,pedidos'
                />
                {errors.activeModules && <FieldError>{errors.activeModules.message}</FieldError>}
              </Field>

              <Field className="col-span-2" data-invalid={!!errors.logo}>
                <FieldLabel>Logo</FieldLabel>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-start gap-4">
                    <div className="size-20 rounded-md border bg-background flex items-center justify-center overflow-hidden shrink-0">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Preview del nuevo logo"
                          className="w-full h-full object-cover"
                        />
                      ) : restaurante.logo ? (
                        <img
                          src={restaurante.logo}
                          alt="Logo actual"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IconPhoto className="size-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Si quieres cambiar el logo, sube un nuevo archivo.
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center">
                          <Input
                            type="file"
                            accept="image/*"
                            {...register("logo")}
                            disabled={loading}
                            className="hidden"
                            onChange={(e) => {
                              register("logo").onChange(e);
                              const f = e.target.files?.[0];
                              if (f) {
                                // Limpiar preview anterior si existe
                                if (logoPreview) {
                                  URL.revokeObjectURL(logoPreview);
                                }
                                // Crear nueva preview
                                const previewUrl = URL.createObjectURL(f);
                                setLogoPreview(previewUrl);
                                toast.success(`Archivo seleccionado: ${f.name}`);
                              }
                            }}
                          />
                          <Button type="button" variant="outline" disabled={loading} asChild>
                            <span>Seleccionar archivo</span>
                          </Button>
                        </label>
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={loading}
                            onClick={() => {
                              setValue("logo", undefined as any, { shouldDirty: true });
                              URL.revokeObjectURL(logoPreview);
                              setLogoPreview(null);
                              toast.success("Logo removido");
                            }}
                            className="gap-2"
                          >
                            <IconTrash className="size-4" />
                            Quitar
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Nota: si no subes archivo, el logo actual se mantiene.
                      </div>
                    </div>
                  </div>
                </div>
                {errors.logo && <FieldError>{String(errors.logo.message ?? "")}</FieldError>}
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (logoPreview) {
                  URL.revokeObjectURL(logoPreview);
                  setLogoPreview(null);
                }
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

