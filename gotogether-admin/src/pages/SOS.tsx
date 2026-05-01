import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, MapPin, Phone } from 'lucide-react';

type SOSAlert = {
  id: string;
  userName: string;
  userPhone: string;
  rideId: string;
  timestamp: number;
  lat: number;
  lng: number;
  status: 'active' | 'resolved';
};

export function SOS() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([
    {
      id: 'SOS-001',
      userName: 'Jane Smith',
      userPhone: '+91 8765432109',
      rideId: 'RIDE-1002',
      timestamp: Date.now() - 1000 * 60 * 5,
      lat: 28.6139,
      lng: 77.2090,
      status: 'active'
    }
  ]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.emit('admin:join');
    
    socket.on('sos:new', (alert: SOSAlert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          SOS Alerts Management
        </h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Active Emergencies ({activeAlerts.length})</h3>
        {activeAlerts.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border rounded-md text-gray-500">
            No active SOS alerts.
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAlerts.map(alert => (
              <Card key={alert.id} className="border-red-500 shadow-sm shadow-red-100">
                <CardHeader className="bg-red-50 py-3">
                  <CardTitle className="text-red-700 flex items-center justify-between text-lg">
                    <span>Alert from {alert.userName}</span>
                    <span className="text-sm font-normal text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">{alert.userPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-sm">Ride: {alert.rideId}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="flex gap-2" onClick={() => window.open(`https://maps.google.com/?q=${alert.lat},${alert.lng}`, '_blank')}>
                        <MapPin className="h-4 w-4" />
                        View on Map
                      </Button>
                      <Button variant="default" className="bg-green-600 hover:bg-green-700">
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8">
        <h3 className="text-xl font-semibold text-gray-600">Recent Resolved Alerts</h3>
        {/* Render resolved alerts simply here */}
        {resolvedAlerts.length === 0 ? (
          <div className="text-sm text-gray-500">No recent resolved alerts.</div>
        ) : null}
      </div>
    </div>
  );
}
