import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

/**
 * Layout - the app shell. Desktop: Sidebar on the left. Mobile: BottomNav
 * instead of a slide-in sidebar. Navbar stays on top for both.
 */
export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}