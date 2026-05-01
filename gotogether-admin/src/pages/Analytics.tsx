import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
      <Card>
        <CardHeader>
          <CardTitle>Retention & Heatmaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Advanced chart visualizations (retention cohorts, match rate heatmaps, revenue projection) will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
