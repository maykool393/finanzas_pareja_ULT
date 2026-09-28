import { type ComponentType, lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireHousehold } from './components/auth/RequireHousehold'
import { AppShell } from './components/layout/AppShell'
import { CurrencyProvider } from './components/CurrencyProvider'
import splashStyles from './components/auth/RequireAuth.module.css'
import { Login } from './pages/Login'
import { Welcome } from './pages/Welcome'

// Cada pantalla se descarga al abrirla, no en la carga inicial. Quedan fuera
// la bienvenida y el login, que son la entrada a la app. La PWA precachea
// todos los fragmentos, así que sin conexión también abren.
const page = <K extends string>(name: K, load: () => Promise<Record<K, ComponentType>>) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const Budgets = page('Budgets', () => import('./pages/Budgets'))
const Categories = page('Categories', () => import('./pages/Categories'))
const Dashboard = page('Dashboard', () => import('./pages/Dashboard'))
const ForgotPassword = page('ForgotPassword', () => import('./pages/ForgotPassword'))
const HouseholdSettings = page('HouseholdSettings', () => import('./pages/HouseholdSettings'))
const InviteHousehold = page('InviteHousehold', () => import('./pages/InviteHousehold'))
const JoinRedirect = page('JoinRedirect', () => import('./pages/JoinRedirect'))
const More = page('More', () => import('./pages/More'))
const NotFound = page('NotFound', () => import('./pages/NotFound'))
const ResetPassword = page('ResetPassword', () => import('./pages/ResetPassword'))
const Statistics = page('Statistics', () => import('./pages/Statistics'))
const Transactions = page('Transactions', () => import('./pages/Transactions'))

/** Mientras llega el fragmento de una pantalla pública: el fondo de página. */
const pageFallback = <div className={splashStyles.splash} aria-busy="true" />

function ProtectedLayout() {
  return (
    <RequireAuth>
      <RequireHousehold>
        <CurrencyProvider>
          <AppShell>
            {/* Dentro de la app el encabezado y la navegación ya están: mientras
                llega la pantalla, el área de contenido queda vacía (es breve). */}
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </AppShell>
        </CurrencyProvider>
      </RequireHousehold>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Suspense fallback={pageFallback}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Login />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/restablecer" element={<ResetPassword />} />
        <Route path="/unirse/:code" element={<JoinRedirect />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/presupuesto" element={<Budgets />} />
          <Route path="/mover" element={<Transactions />} />
          <Route path="/estadisticas" element={<Statistics />} />
          <Route path="/mas" element={<More />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/invitar" element={<InviteHousehold />} />
          <Route path="/ajustes" element={<HouseholdSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
