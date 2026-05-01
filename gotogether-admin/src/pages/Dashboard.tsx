import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Car, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const MOCK_LINE_DATA = [
  { name: 'Mon', users: 4000 },
  { name: 'Tue', users: 3000 },
  { name: 'Wed', users: 2000 },
  { name: 'Thu', users: 2780 },
  { name: 'Fri', users: 1890 },
  { name: 'Sat', users: 2390 },
  { name: 'Sun', users: 3490 },
];

const MOCK_BAR_DATA = [
  { name: 'Mon', created: 40, completed: 35 },
  { name: 'Tue', created: 30, completed: 28 },
  { name: 'Wed', created: 20, completed: 18 },
  { name: 'Thu', created: 27, completed: 25 },
  { name: 'Fri', created: 18, completed: 15 },
  { name: 'Sat', created: 23, completed: 20 },
  { name: 'Sun', created: 34, completed: 30 },
];

const MOCK_PIE_DATA = [
  { name: 'Bike', value: 400 },
  { name: 'Car', value: 300 },
];
const COLORS = ['#0088FE', '#00C49F'];

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '8px' };
const center = { lat: 28.6139, lng: 77.2090 };

export function Dashboard() {
  // Mock data fetching, replace with actual endpoints later
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => Promise.resolve({
      totalUsers: 12500, newUsers: 145,
      activeRides: 42,
      totalRidesToday: 850,
      completionRate: 92,
      avgDuration: 28,
      sosAlerts: 0
    }),
    refetchInterval: 30000, // Refresh every 30s
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_API_KEY_HERE'
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats?.newUsers} new today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rides right now</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.activeRides}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRidesToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Ride Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgDuration} mins</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SOS Alerts Active</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats?.sosAlerts && stats.sosAlerts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.sosAlerts && stats.sosAlerts > 0 ? 'text-red-600' : ''}`}>{stats?.sosAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_LINE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Rides: Created vs Completed</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_BAR_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="created" fill="#8884d8" />
                <Bar dataKey="completed" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Vehicle Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MOCK_PIE_DATA} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {MOCK_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>New User Signups</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_LINE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Rides Map</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={11}>
              {/* Markers for active rides will go here */}
              <Marker position={center} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />
            </GoogleMap>
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center bg-slate-100 rounded-md">Loading Map...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
