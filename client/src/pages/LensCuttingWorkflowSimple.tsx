import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle, Clock, Camera, Play } from 'lucide-react';

export default function LensCuttingWorkflow() {
  return (
    <div className="space-y-6" data-testid="lens-cutting-workflow-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lens Cutting & Fitting Workflow</h1>
          <p className="text-gray-600">Manage lens cutting tasks and fitting processes</p>
        </div>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="cutting-queue-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cutting Queue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>

        <Card data-testid="in-progress-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>

        <Card data-testid="quality-check-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Check</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>

        <Card data-testid="completed-tasks-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
          <CardDescription>Manage lens cutting and fitting tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Start Cutting
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Play className="h-6 w-6 mb-2" />
              Resume Task
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Camera className="h-6 w-6 mb-2" />
              Quality Check
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              Mark Complete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Message */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">Cutting Workflow System</Badge>
            <p className="text-sm text-gray-600">
              Lens Cutting & Fitting Workflow module is now active and ready for use.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}