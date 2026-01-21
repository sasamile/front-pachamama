"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { RestaurantesSidebar } from "@/components/dashboard/superadmin/administradores/restaurantes-sidebar";
import { AdminsTable } from "@/components/dashboard/superadmin/administradores/admins-table";
import { CreateAdminDialog } from "@/components/dashboard/superadmin/administradores/create-admin-dialog";
import { EditAdminDialog } from "@/components/dashboard/superadmin/administradores/edit-admin-dialog";
import { ChangePasswordDialog } from "@/components/dashboard/superadmin/administradores/change-password-dialog";
import type { RestauranteAdmin } from "@/types/admins";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IconMenu2 } from "@tabler/icons-react";

export default function SuperAdminAdministradoresPage() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const initialRestauranteId = searchParams.get("restauranteId") || null;
  const [selectedRestauranteId, setSelectedRestauranteId] = useState<string | null>(
    initialRestauranteId
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<RestauranteAdmin | null>(null);

  useEffect(() => {
    if (initialRestauranteId) setSelectedRestauranteId(initialRestauranteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRestauranteId]);

  const handleCreateAdmin = () => {
    if (!selectedRestauranteId) {
      toast.error("Debes seleccionar un restaurante primero");
      return;
    }
    setCreateModalOpen(true);
  };

  const handleEditAdmin = (admin: RestauranteAdmin) => {
    setSelectedAdmin(admin);
    setEditModalOpen(true);
  };

  const handleChangePassword = (admin: RestauranteAdmin) => {
    setSelectedAdmin(admin);
    setChangePasswordModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administradores</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los administradores de cada restaurante
            </p>
          </div>

          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <IconMenu2 className="size-5" />
                  <span className="sr-only">Abrir menú de restaurantes</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Restaurantes</SheetTitle>
                </SheetHeader>
                <div className="h-full">
                  <RestaurantesSidebar
                    selectedRestauranteId={selectedRestauranteId}
                    onSelectRestaurante={(id) => {
                      setSelectedRestauranteId(id);
                      setIsSheetOpen(false);
                    }}
                    withoutCard={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <div className="px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            {!isMobile && (
              <RestaurantesSidebar
                selectedRestauranteId={selectedRestauranteId}
                onSelectRestaurante={setSelectedRestauranteId}
              />
            )}

         
          </div>

          <div className="lg:col-span-2 h-[calc(100vh-17rem)] overflow-hidden">
            <AdminsTable
              restauranteId={selectedRestauranteId}
              onCreate={handleCreateAdmin}
              onEdit={handleEditAdmin}
              onChangePassword={handleChangePassword}
            />
          </div>
        </div>
      </div>

      {/* Modal para crear administrador */}
      <CreateAdminDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        restauranteId={selectedRestauranteId}
      />

      {/* Modal para editar administrador */}
      <EditAdminDialog
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setSelectedAdmin(null);
        }}
        restauranteId={selectedRestauranteId}
        admin={selectedAdmin}
      />

      {/* Modal para cambiar contraseña */}
      <ChangePasswordDialog
        open={changePasswordModalOpen}
        onOpenChange={(open) => {
          setChangePasswordModalOpen(open);
          if (!open) setSelectedAdmin(null);
        }}
        restauranteId={selectedRestauranteId}
        admin={selectedAdmin}
      />
    </div>
  );
}

