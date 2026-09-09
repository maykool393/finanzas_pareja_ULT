import { Outlet, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireHousehold } from './components/auth/RequireHousehold'
import { AppShell } from './components/layout/AppShell'
import { Budgets } from './pages/Budgets'
import { Categories } from './pages/Categories'
import { Dashboard } from './pages/Dashboard'
import { ForgotPassword } from './pages/ForgotPassword'
import { InviteHousehold } from './pages/InviteHousehold'
import { Login } from './pages/Login'
import { More } from './pages/More'
import { ResetPassword } from './pages/ResetPassword'
import { Transactions } from './pages/Transactions'
import { Welcome } from './pages/Welcome'

function ProtectedLayout() {
  return (
    <RequireAuth>
      <RequireHousehold>
        <AppShell>
          <Outlet />
        </AppShell>
      </RequireHousehold>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Login />} />
      <Route path="/recuperar" element={<ForgotPassword />} />
      <Route path="/restablecer" element={<ResetPassword />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/presupuesto" element={<Budgets />} />
        <Route path="/mover" element={<Transactions />} />
        <Route path="/estadisticas" element={<p>Estadísticas — pendiente</p>} />
        <Route path="/mas" element={<More />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/invitar" element={<InviteHousehold />} />
      </Route>
    </Routes>
  )
}
