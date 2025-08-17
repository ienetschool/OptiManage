import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ClipboardList, Settings, CheckCircle, Timer } from 'lucide-react';

export default function SpecsWorkflow() {
  return (
    <div className="space-y-6" data-testid="specs-workflow-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Specs Workflow Management</h1>
          <p className="text-gray-600">7-Step Lens Prescription & Order Management System</p>
        </div>
      </div>

      {/* Workflow Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card data-testid="total-prescriptions-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card data-testid="total-orders-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specs Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card data-testid="tasks-in-progress-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks in Progress</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>

        <Card data-testid="completed-tasks-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
          </CardContent>
        </Card>

        <Card data-testid="cutting-tasks-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cutting Tasks</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common workflow operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <Eye className="h-6 w-6 mb-2" />
              New Prescription
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <ClipboardList className="h-6 w-6 mb-2" />
              Create Order
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Assign Task
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              Complete Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Message */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">System Status</Badge>
            <p className="text-sm text-gray-600">
              Specs Workflow Management System is now active and ready for use.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}