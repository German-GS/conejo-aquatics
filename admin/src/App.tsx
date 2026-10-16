import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BarChart3, Globe, ShoppingCart } from "lucide-react";
import { AuthProvider, RequireAdmin, RequireAuth, RequirePermiso } from "@/lib/auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import LoginPage from "@/routes/LoginPage";
import IngresoDesdeTokenPage from "@/routes/IngresoDesdeTokenPage";
import DashboardPage from "@/routes/DashboardPage";
import PersonalPage from "@/routes/PersonalPage";
import InventarioPage from "@/routes/InventarioPage";
import CatalogoPage from "@/routes/CatalogoPage";
import ClientesPage from "@/routes/ClientesPage";
import ConfiguracionPage from "@/routes/ConfiguracionPage";
import ContabilidadPage from "@/routes/ContabilidadPage";
import FacturacionPage from "@/routes/FacturacionPage";
import ComingSoonPage from "@/routes/ComingSoonPage";

// Coincide con `base` en vite.config.ts: "/ac/" en producción (dentro del
// hosting de Conejo Motors), "/" en dev. React Router no quiere la barra
// final en basename.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ingreso" element={<IngresoDesdeTokenPage />} />

          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route
              path="/pos"
              element={
                <RequirePermiso permiso="pos.vender">
                  <ComingSoonPage title="Punto de venta" icon={ShoppingCart} />
                </RequirePermiso>
              }
            />
            <Route
              path="/inventario"
              element={
                <RequirePermiso permiso="inventario.ver">
                  <InventarioPage />
                </RequirePermiso>
              }
            />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route
              path="/clientes"
              element={
                <RequirePermiso permiso="clientes.gestionar">
                  <ClientesPage />
                </RequirePermiso>
              }
            />
            <Route
              path="/tienda-web"
              element={
                <RequirePermiso permiso="clientes.gestionar">
                  <ComingSoonPage title="Tienda en línea" icon={Globe} />
                </RequirePermiso>
              }
            />
            <Route
              path="/personal"
              element={
                <RequireAdmin>
                  <PersonalPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/informes"
              element={
                <RequirePermiso permiso="informes.ver">
                  <ComingSoonPage title="Informes" icon={BarChart3} />
                </RequirePermiso>
              }
            />
            <Route
              path="/contabilidad"
              element={
                <RequirePermiso permiso="contabilidad.ver">
                  <ContabilidadPage />
                </RequirePermiso>
              }
            />
            <Route
              path="/facturacion"
              element={
                <RequirePermiso permiso="facturacion.gestionar">
                  <FacturacionPage />
                </RequirePermiso>
              }
            />
            <Route
              path="/configuracion"
              element={
                <RequirePermiso permiso="catalogo.gestionar">
                  <ConfiguracionPage />
                </RequirePermiso>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
