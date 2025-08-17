import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SpecsOrderCreation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Specs Order Creation</h1>
          <p className="text-muted-foreground">
            Create new specs orders and manage existing orders
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Badge variant="secondary" className="text-xs">15</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Badge variant="default" className="text-xs">8</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <Badge variant="default" className="text-xs">$</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">
              From specs orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest specs orders and their current status
          </CardDescription>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-8" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "SO001", patient: "Alice Johnson", type: "Progressive Lenses", amount: "$420", status: "Processing", date: "2025-08-17" },
              { id: "SO002", patient: "Bob Wilson", type: "Bifocal Glasses", amount: "$280", status: "Ready", date: "2025-08-16" },
              { id: "SO003", patient: "Carol Davis", type: "Single Vision", amount: "$150", status: "Completed", date: "2025-08-16" },
              { id: "SO004", patient: "David Brown", type: "Reading Glasses", amount: "$95", status: "In Progress", date: "2025-08-15" },
              { id: "SO005", patient: "Emma Taylor", type: "Computer Glasses", amount: "$200", status: "Pending", date: "2025-08-15" },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{order.patient}</p>
                    <p className="text-sm text-muted-foreground">{order.type} • {order.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium">{order.amount}</p>
                  <Badge 
                    variant={
                      order.status === "Completed" ? "default" : 
                      order.status === "Ready" ? "secondary" : 
                      order.status === "Pending" ? "outline" : "secondary"
                    }
                  >
                    {order.status}
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