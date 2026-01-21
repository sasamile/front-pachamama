"use client";

import { useMemo, useState } from "react";
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
  planExpiresAt: z.string().optional(),
  activeModules: z.string().optional(), // comma separated o JSON
  logo: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateRestauranteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseModules(input?: string): string[] | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  // Permitir que el usuario pegue JSON ["a","b"] o escriba "a,b,c"
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

export function CreateRestauranteDialog({ open, onOpenChange }: CreateRestauranteDialogProps) {
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
    defaultValues: {
      subscriptionPlan: "BASICO",
      country: "Colombia",
      timezone: "AMERICA_BOGOTA",
      primaryColor: "#3B82F6",
      activeModules: "[\"reservas\", \"pedidos\", \"pqrs\"]",
    },
  });

  const baseURL = useMemo(() => {
    const ax = getAxiosInstance(subdomain ?? null);
    return ax.defaults.baseURL || "/api";
  }, [subdomain]);

  const onSubmit = async (data: FormValues) => {
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
      if (data.planExpiresAt) {
        // enviar ISO 8601 si viene de datetime-local
        const iso = new Date(data.planExpiresAt).toISOString();
        formData.append("planExpiresAt", iso);
      }
      const modules = parseModules(data.activeModules);
      if (!modules) {
        // si escribió algo y es inválido, avisar
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

      await formAxios.post("/restaurantes", formData);

      toast.success("Restaurante creado exitosamente", { duration: 3000 });
      await queryClient.invalidateQueries({ queryKey: ["restaurantes"] });
      reset();
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error al crear restaurante";
      toast.error(msg, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Restaurante</DialogTitle>
          <DialogDescription>
            Crea un nuevo restaurante (requiere rol SUPERADMIN).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.name}>
                <FieldLabel>Nombre *</FieldLabel>
                <Input {...register("name")} placeholder="Restaurante El Carbón" disabled={loading} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.nit}>
                <FieldLabel>NIT</FieldLabel>
                <Input {...register("nit")} placeholder="900123456-7" disabled={loading} />
                {errors.nit && <FieldError>{errors.nit.message}</FieldError>}
              </Field>

              <Field className="col-span-2" data-invalid={!!errors.address}>
                <FieldLabel>Dirección</FieldLabel>
                <Input {...register("address")} placeholder="Calle 123 #45-67" disabled={loading} />
                {errors.address && <FieldError>{errors.address.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.city}>
                <FieldLabel>Ciudad</FieldLabel>
                <Input {...register("city")} placeholder="Bogotá" disabled={loading} />
                {errors.city && <FieldError>{errors.city.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.country}>
                <FieldLabel>País</FieldLabel>
                <Input {...register("country")} placeholder="Colombia" disabled={loading} />
                {errors.country && <FieldError>{errors.country.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.timezone}>
                <FieldLabel>Zona horaria</FieldLabel>
                <Input {...register("timezone")} placeholder="AMERICA_BOGOTA" disabled={loading} />
                {errors.timezone && <FieldError>{errors.timezone.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.subdomain}>
                <FieldLabel>Subdominio</FieldLabel>
                <Input {...register("subdomain")} placeholder="alcarbon" disabled={loading} />
                {errors.subdomain && <FieldError>{errors.subdomain.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.primaryColor}>
                <FieldLabel>Color principal</FieldLabel>
                <div className="flex gap-2">
                  <Input type="color" {...register("primaryColor")} disabled={loading} className="w-14 p-1" />
                  <Input
                    {...register("primaryColor")}
                    disabled={loading}
                    placeholder="#3B82F6"
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

              <Field data-invalid={!!errors.planExpiresAt}>
                <FieldLabel>Vence plan</FieldLabel>
                <Input type="datetime-local" {...register("planExpiresAt")} disabled={loading} />
                {errors.planExpiresAt && <FieldError>{errors.planExpiresAt.message}</FieldError>}
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
                          alt="Preview del logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IconPhoto className="size-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Sube una imagen (PNG/JPG). Opcional.
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
                              // mantener el comportamiento de RHF
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
                        Si no subes logo, el restaurante quedará con logo por defecto.
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
                reset();
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
              {loading ? "Creando..." : "Crear Restaurante"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

