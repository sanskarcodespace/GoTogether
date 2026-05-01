import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function AdminLayout() {
  const { token, user } = useAuthStore();
  const [activeSos, setActiveSos] = useState(0);

  useEffect(() => {
    if (!token) return;
    const socket = io('http://localhost:5000');
    socket.emit('admin:join');
    socket.on('sos:new', () => {
      setActiveSos(prev => prev + 1);
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeSos > 0 && (
          <div className="flex h-10 w-full items-center justify-center bg-red-600 text-sm font-bold text-white shadow-md animate-pulse">
            🚨 WARNING: {activeSos} Active SOS Alert(s) Detected! Please check the SOS Alerts page immediately.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
