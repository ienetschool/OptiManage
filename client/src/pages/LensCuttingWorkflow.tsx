import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Settings, Play, Pause, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function LensCuttingWorkflow() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lens Cutting & Fitting</h1>
          <p className="text-muted-foreground">
            Monitor and manage the lens cutting and fitting process
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Equipment Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Currently in process
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +5 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Waiting for processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Machine Status</CardTitle>
            <CardDescription>Current status of lens cutting equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cutting Machine A</span>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cutting Machine B</span>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Edging Machine</span>
                </div>
                <Badge variant="secondary">Maintenance</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Fitting Station</span>
                </div>
                <Badge variant="default">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Tasks</CardTitle>
            <CardDescription>Active lens cutting and fitting tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "LC001", patient: "John Doe", stage: "Cutting", progress: 75, eta: "15 min" },
                { id: "LC002", patient: "Jane Smith", stage: "Edging", progress: 45, eta: "25 min" },
                { id: "LC003", patient: "Mike Johnson", stage: "Fitting", progress: 90, eta: "5 min" },
              ].map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.patient}</p>
                      <p className="text-sm text-muted-foreground">{task.id} • {task.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{task.progress}%</p>
                      <p className="text-xs text-muted-foreground">ETA: {task.eta}</p>
                    </div>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Tasks</CardTitle>
          <CardDescription>
            Recently completed lens cutting and fitting tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "LC015", patient: "Sarah Wilson", type: "Progressive", completedAt: "2:30 PM", duration: "45 min", status: "Completed" },
              { id: "LC014", patient: "Tom Brown", type: "Bifocal", completedAt: "2:15 PM", duration: "35 min", status: "Completed" },
              { id: "LC013", patient: "Lisa Davis", type: "Single Vision", completedAt: "1:45 PM", duration: "20 min", status: "Completed" },
              { id: "LC012", patient: "Robert Taylor", type: "Reading", completedAt: "1:20 PM", duration: "18 min", status: "Quality Check Failed" },
            ].map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{task.patient}</p>
                    <p className="text-sm text-muted-foreground">{task.id} • {task.type} Lenses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">{task.completedAt}</p>
                    <p className="text-xs text-muted-foreground">Duration: {task.duration}</p>
                  </div>
                  <Badge variant={task.status === "Completed" ? "default" : "destructive"}>
                    {task.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}