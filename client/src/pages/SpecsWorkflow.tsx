import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SpecsWorkflow() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Specs Workflow</h1>
          <p className="text-muted-foreground">
            Complete workflow tracking for specs orders from prescription to delivery
          </p>
        </div>
        <Button>
          <Eye className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Cutting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Fitting</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Awaiting final fitting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Activities</CardTitle>
          <CardDescription>
            Latest updates from the specs workflow process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "SW001", patient: "John Smith", status: "Lens Cutting", stage: "In Progress", priority: "Normal" },
              { id: "SW002", patient: "Sarah Johnson", status: "Fitting", stage: "Ready", priority: "High" },
              { id: "SW003", patient: "Mike Brown", status: "Quality Check", stage: "Completed", priority: "Normal" },
              { id: "SW004", patient: "Lisa Davis", status: "Prescription Review", stage: "Pending", priority: "Low" },
            ].map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{workflow.patient}</p>
                    <p className="text-sm text-muted-foreground">Order: {workflow.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={workflow.stage === "Completed" ? "default" : "secondary"}>
                    {workflow.status}
                  </Badge>
                  <Badge variant={workflow.priority === "High" ? "destructive" : workflow.priority === "Low" ? "outline" : "secondary"}>
                    {workflow.priority}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
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