import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Global Pricing Configuration</CardTitle>
            <CardDescription>Adjust base and per-km pricing for vehicles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Car Base Price (₹)</label>
              <Input type="number" defaultValue={50} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Car Per-Km Price (₹)</label>
              <Input type="number" defaultValue={10} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bike Base Price (₹)</label>
              <Input type="number" defaultValue={20} />
            </div>
            <Button>Save Pricing</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Constraints</CardTitle>
            <CardDescription>Adjust limits for ride creation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Detour Threshold (km)</label>
              <Input type="number" defaultValue={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Seats per Ride</label>
              <Input type="number" defaultValue={4} />
            </div>
            <Button>Save Constraints</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">MongoDB Cluster</span>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm font-bold">Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Redis Cache</span>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm font-bold">Connected</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Firebase RTDB</span>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm font-bold">Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
