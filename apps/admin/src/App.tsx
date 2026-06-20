import { Navigate, Outlet, Route, Routes } from 'react-router'

import { useAuth } from './hooks'
import { AdminLayout } from './layouts/AdminLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/dashboard/Dashboard'
import { UserDetail } from './pages/users/UserDetail'
import { Users } from './pages/users/Users'
import { ADMIN_PATHS, adminRoutes } from './routes'

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to={adminRoutes.login()} replace />
  return <Outlet />
}

function GuestOnly() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={adminRoutes.home()} replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path={ADMIN_PATHS.LOGIN} element={<Login />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to={adminRoutes.dashboard()} replace />} />
          <Route path={ADMIN_PATHS.DASHBOARD} element={<Dashboard />} />
          <Route path={ADMIN_PATHS.USERS} element={<Users />} />
          <Route path={ADMIN_PATHS.USER_DETAIL} element={<UserDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={adminRoutes.home()} replace />} />
    </Routes>
  )
}
