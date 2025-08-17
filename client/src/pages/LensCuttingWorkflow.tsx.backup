import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  Send, 
  Truck,
  Star,
  MessageSquare,
  Calendar,
  FileText,
  Upload,
  Play,
  Pause,
  RotateCcw,
  CheckSquare
} from "lucide-react";

interface SpecsOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  frameName: string;
  status: string;
  priority: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
}

interface LensCuttingTask {
  id: string;
  orderId: string;
  taskNumber: string;
  assignedTo?: string;
  assignedBy: string;
  assignedDate: string;
  lensType: string;
  lensMaterial: string;
  frameType: string;
  specialInstructions: string;
  deadline?: string;
  startedAt?: string;
  completedAt?: string;
  status: string;
  priority: string;
  progressNotes: Array<{note: string; timestamp: string; addedBy: string}>;
  workPhotos: Array<{url: string; description: string; uploadedAt: string}>;
}

interface FittingProgress {
  id: string;
  taskId: string;
  fitterId: string;
  progressStatus: string;
  progressPercentage: number;
  workStarted?: string;
  workCompleted?: string;
  hoursWorked: number;
  issues: Array<{issue: string; severity: string; reportedAt: string; resolved: boolean}>;
  remarks: Array<{remark: string; timestamp: string; addedBy: string}>;
  qualityChecks?: {
    lensAlignment: boolean;
    frameAdjustment: boolean;
    screwTightness: boolean;
    cleaningDone: boolean;
    finalInspection: boolean;
  };
  progressPhotos: Array<{url: string; stage: string; description: string; uploadedAt: string}>;
}

interface StoreDelivery {
  id: string;
  orderId: string;
  taskId: string;
  storeId: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  deliveryContact?: string;
  deliveryStatus: string;
  sentToStore?: string;
  readyForDelivery?: string;
  scheduledDelivery?: string;
  actualDelivery?: string;
  finalChecks?: {
    lensQuality: boolean;
    frameCondition: boolean;
    cleaningDone: boolean;
    packaging: boolean;
    invoiceAttached: boolean;
  };
  deliveryInstructions?: string;
  finalRemarks?: string;
  trackingNumber?: string;
  courierService?: string;
  deliveredBy?: string;
  receivedBy?: string;
  deliveryConfirmation: boolean;
  patientFeedback?: {
    satisfaction: number;
    comments: string;
    issues: string[];
    wouldRecommend: boolean;
  };
}

export default function LensCuttingWorkflow() {
  const [selectedTab, setSelectedTab] = useState("tasks");
  const [selectedOrder, setSelectedOrder] = useState<SpecsOrder | null>(null);
  const [selectedTask, setSelectedTask] = useState<LensCuttingTask | null>(null);
  const [newRemark, setNewRemark] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueSeverity, setIssueSeverity] = useState("low");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: specsOrders = [] } = useQuery<SpecsOrder[]>({
    queryKey: ["/api/specs-orders"],
  });

  const { data: lensCuttingTasks = [] } = useQuery<LensCuttingTask[]>({
    queryKey: ["/api/lens-cutting-tasks"],
  });

  const { data: fittingProgress = [] } = useQuery<FittingProgress[]>({
    queryKey: ["/api/fitting-progress"],
  });

  const { data: storeDeliveries = [] } = useQuery<StoreDelivery[]>({
    queryKey: ["/api/store-deliveries"],
  });

  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
  });

  // Mutations for task management
  const assignTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/lens-cutting-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to assign task");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Task Assigned", description: "Lens cutting task has been assigned successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/lens-cutting-tasks"] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/fitting-progress/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Progress Updated", description: "Task progress has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/fitting-progress"] });
    },
  });

  const createDeliveryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/store-deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create delivery");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sent to Store", description: "Task completed and sent to store for delivery." });
      queryClient.invalidateQueries({ queryKey: ["/api/store-deliveries"] });
    },
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startTask = (task: LensCuttingTask) => {
    const progressData = {
      taskId: task.id,
      fitterId: "current-user-id", // This should come from auth
      progressStatus: 'in_progress',
      progressPercentage: 10,
      workStarted: new Date().toISOString(),
      remarks: [{
        remark: "Task started",
        timestamp: new Date().toISOString(),
        addedBy: "current-user-id"
      }]
    };

    updateProgressMutation.mutate(progressData);
  };

  const completeTask = (task: LensCuttingTask) => {
    const progressData = {
      taskId: task.id,
      fitterId: "current-user-id",
      progressStatus: 'completed',
      progressPercentage: 100,
      workCompleted: new Date().toISOString(),
      qualityChecks: {
        lensAlignment: true,
        frameAdjustment: true,
        screwTightness: true,
        cleaningDone: true,
        finalInspection: true
      }
    };

    updateProgressMutation.mutate(progressData);
  };

  const sendToStore = (task: LensCuttingTask) => {
    const deliveryData = {
      orderId: task.orderId,
      taskId: task.id,
      storeId: "store001", // This should come from the order
      deliveryMethod: 'pickup',
      deliveryStatus: 'ready',
      sentToStore: new Date().toISOString(),
      finalChecks: {
        lensQuality: true,
        frameCondition: true,
        cleaningDone: true,
        packaging: true,
        invoiceAttached: true
      }
    };

    createDeliveryMutation.mutate(deliveryData);
  };

  const addRemark = (taskId: string) => {
    if (!newRemark.trim()) return;

    const progress = fittingProgress.find(p => p.taskId === taskId);
    if (!progress) return;

    const updatedRemarks = [
      ...progress.remarks,
      {
        remark: newRemark,
        timestamp: new Date().toISOString(),
        addedBy: "current-user-id"
      }
    ];

    updateProgressMutation.mutate({
      ...progress,
      remarks: updatedRemarks
    });

    setNewRemark("");
  };

  const addIssue = (taskId: string) => {
    if (!issueDescription.trim()) return;

    const progress = fittingProgress.find(p => p.taskId === taskId);
    if (!progress) return;

    const newIssueObj = {
      issue: issueDescription,
      severity: issueSeverity,
      reportedAt: new Date().toISOString(),
      resolved: false
    };

    const updatedIssues = [...progress.issues, newIssueObj];

    updateProgressMutation.mutate({
      ...progress,
      issues: updatedIssues
    });

    setIssueDescription("");
    setIssueSeverity("low");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lens Cutting & Fitting Workflow</h1>
          <p className="text-gray-600 mt-1">Manage tasks, track progress, and handle deliveries</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">Assign Tasks</TabsTrigger>
          <TabsTrigger value="progress">Fitting Progress</TabsTrigger>
          <TabsTrigger value="store">Send to Store</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Ready</TabsTrigger>
          <TabsTrigger value="confirmation">Delivery Confirmation</TabsTrigger>
        </TabsList>

        {/* Sub-Module 1: Assign Lens Cutting Task */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Assign Lens Cutting Tasks
              </CardTitle>
              <CardDescription>
                Assign lens cutting tasks to fitters and set deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Orders */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Available Orders for Task Assignment</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {specsOrders
                      .filter(order => order.status === 'confirmed')
                      .map((order) => (
                        <Card key={order.id} className="hover:bg-gray-50 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{order.orderNumber}</h4>
                                <p className="text-sm text-gray-600">{order.patientName}</p>
                                <p className="text-sm text-gray-500">{order.frameName}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={getPriorityColor(order.priority)}>
                                  {order.priority}
                                </Badge>
                                <p className="text-sm text-gray-600 mt-1">
                                  ${order.totalAmount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedOrder(order)}
                                className="flex-1"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Assign Task
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Existing Tasks */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Tasks</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {lensCuttingTasks.map((task) => {
                      const order = specsOrders.find(o => o.id === task.orderId);
                      const assignedFitter = staff.find(s => s.id === task.assignedTo);
                      
                      return (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{task.taskNumber}</h4>
                                <p className="text-sm text-gray-600">{order?.patientName}</p>
                                <p className="text-sm text-gray-500">
                                  Assigned to: {assignedFitter?.firstName} {assignedFitter?.lastName}
                                </p>
                              </div>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Lens: {task.lensType} - {task.lensMaterial}</p>
                              <p>Frame: {task.frameType}</p>
                              {task.deadline && (
                                <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-Module 2: Fitting in Progress */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Fitting in Progress
              </CardTitle>
              <CardDescription>
                Track work progress, add remarks, and upload photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks in Progress */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Active Tasks</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {lensCuttingTasks
                      .filter(task => ['assigned', 'in_progress'].includes(task.status))
                      .map((task) => {
                        const order = specsOrders.find(o => o.id === task.orderId);
                        const progress = fittingProgress.find(p => p.taskId === task.id);
                        
                        return (
                          <Card key={task.id} className="hover:bg-gray-50 cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{task.taskNumber}</h4>
                                  <p className="text-sm text-gray-600">{order?.patientName}</p>
                                  <p className="text-sm text-gray-500">{task.lensType}</p>
                                </div>
                                <Badge className={getStatusColor(task.status)}>
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              {progress && (
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{progress.progressPercentage}%</span>
                                  </div>
                                  <Progress value={progress.progressPercentage} className="h-2" />
                                </div>
                              )}

                              <div className="flex gap-2">
                                {task.status === 'assigned' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => startTask(task)}
                                    className="flex-1"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Job
                                  </Button>
                                )}
                                
                                {task.status === 'in_progress' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      onClick={() => completeTask(task)}
                                      variant="secondary"
                                      className="flex-1"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Complete
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => setSelectedTask(task)}
                                      variant="outline"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Add Notes
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>

                {/* Task Details & Progress Updates */}
                <div>
                  {selectedTask && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Task Progress Details</CardTitle>
                        <CardDescription>
                          {selectedTask.taskNumber} - Add remarks and track issues
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Add Remarks */}
                        <div>
                          <Label htmlFor="remark">Add Progress Remark</Label>
                          <div className="flex gap-2 mt-1">
                            <Textarea
                              id="remark"
                              value={newRemark}
                              onChange={(e) => setNewRemark(e.target.value)}
                              placeholder="Update on work progress..."
                              className="flex-1"
                            />
                            <Button 
                              onClick={() => addRemark(selectedTask.id)}
                              disabled={!newRemark.trim()}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Report Issue */}
                        <div>
                          <Label htmlFor="issue">Report Issue</Label>
                          <div className="space-y-2">
                            <Select value={issueSeverity} onValueChange={setIssueSeverity}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low Severity</SelectItem>
                                <SelectItem value="medium">Medium Severity</SelectItem>
                                <SelectItem value="high">High Severity</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Describe the issue..."
                                className="flex-1"
                              />
                              <Button 
                                onClick={() => addIssue(selectedTask.id)}
                                disabled={!issueDescription.trim()}
                                variant="destructive"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Upload Photo */}
                        <div>
                          <Label>Upload Work Photo</Label>
                          <Button variant="outline" className="w-full mt-1">
                            <Camera className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-Module 3: Send to Store */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Send to Store
              </CardTitle>
              <CardDescription>
                Mark tasks as completed and send specs to store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completed Tasks */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Completed Tasks</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {lensCuttingTasks
                      .filter(task => task.status === 'completed')
                      .map((task) => {
                        const order = specsOrders.find(o => o.id === task.orderId);
                        
                        return (
                          <Card key={task.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{task.taskNumber}</h4>
                                  <p className="text-sm text-gray-600">{order?.patientName}</p>
                                  <p className="text-sm text-gray-500">{task.lensType}</p>
                                  <p className="text-sm text-gray-500">
                                    Completed: {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(task.status)}>
                                  Completed
                                </Badge>
                              </div>
                              
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  onClick={() => sendToStore(task)}
                                  className="flex-1"
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  Send to Store
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>

                {/* Store Deliveries */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Sent to Store</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {storeDeliveries
                      .filter(delivery => delivery.deliveryStatus === 'ready')
                      .map((delivery) => {
                        const order = specsOrders.find(o => o.id === delivery.orderId);
                        
                        return (
                          <Card key={delivery.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{order?.orderNumber}</h4>
                                  <p className="text-sm text-gray-600">{order?.patientName}</p>
                                  <p className="text-sm text-gray-500">
                                    Sent: {delivery.sentToStore ? new Date(delivery.sentToStore).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(delivery.deliveryStatus)}>
                                  Ready for Delivery
                                </Badge>
                              </div>
                              
                              {delivery.finalChecks && (
                                <div className="text-sm text-gray-600">
                                  <p>✓ Quality Check: {delivery.finalChecks.lensQuality ? 'Passed' : 'Pending'}</p>
                                  <p>✓ Packaging: {delivery.finalChecks.packaging ? 'Complete' : 'Pending'}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-Module 4: Delivery Ready & Final Checks */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="w-5 h-5 mr-2" />
                Delivery Ready & Final Checks
              </CardTitle>
              <CardDescription>
                Final preparation and scheduling for delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storeDeliveries
                  .filter(delivery => ['ready', 'scheduled'].includes(delivery.deliveryStatus))
                  .map((delivery) => {
                    const order = specsOrders.find(o => o.id === delivery.orderId);
                    
                    return (
                      <Card key={delivery.id}>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">{order?.orderNumber}</h4>
                              <p className="text-sm text-gray-600 mb-4">Patient: {order?.patientName}</p>
                              
                              <div className="space-y-2">
                                <h5 className="font-medium">Final Quality Checks</h5>
                                {delivery.finalChecks && (
                                  <div className="space-y-1 text-sm">
                                    <p>✓ Lens Quality: {delivery.finalChecks.lensQuality ? 'Passed' : 'Pending'}</p>
                                    <p>✓ Frame Condition: {delivery.finalChecks.frameCondition ? 'Good' : 'Check Required'}</p>
                                    <p>✓ Cleaning Done: {delivery.finalChecks.cleaningDone ? 'Yes' : 'Pending'}</p>
                                    <p>✓ Packaging: {delivery.finalChecks.packaging ? 'Complete' : 'Pending'}</p>
                                    <p>✓ Invoice Attached: {delivery.finalChecks.invoiceAttached ? 'Yes' : 'Pending'}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="deliveryMethod">Delivery Method</Label>
                                <Select defaultValue={delivery.deliveryMethod}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pickup">Customer Pickup</SelectItem>
                                    <SelectItem value="courier">Courier Service</SelectItem>
                                    <SelectItem value="home_delivery">Home Delivery</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="scheduledDate">Scheduled Delivery</Label>
                                <Input 
                                  type="datetime-local" 
                                  defaultValue={delivery.scheduledDelivery}
                                />
                              </div>

                              <div>
                                <Label htmlFor="finalRemarks">Final Remarks</Label>
                                <Textarea 
                                  placeholder="Any special instructions for delivery..."
                                  defaultValue={delivery.finalRemarks}
                                />
                              </div>

                              <Button className="w-full">
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Delivery
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-Module 5: Delivery Confirmation */}
        <TabsContent value="confirmation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Delivery Confirmation
              </CardTitle>
              <CardDescription>
                Confirm delivery and collect customer feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {storeDeliveries
                  .filter(delivery => ['scheduled', 'out_for_delivery'].includes(delivery.deliveryStatus))
                  .map((delivery) => {
                    const order = specsOrders.find(o => o.id === delivery.orderId);
                    
                    return (
                      <Card key={delivery.id}>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">{order?.orderNumber}</h4>
                              <p className="text-sm text-gray-600 mb-4">Patient: {order?.patientName}</p>
                              
                              <div className="space-y-2 text-sm">
                                <p><strong>Delivery Method:</strong> {delivery.deliveryMethod}</p>
                                <p><strong>Scheduled:</strong> {delivery.scheduledDelivery ? new Date(delivery.scheduledDelivery).toLocaleString() : 'Not scheduled'}</p>
                                {delivery.trackingNumber && (
                                  <p><strong>Tracking:</strong> {delivery.trackingNumber}</p>
                                )}
                                <Badge className={getStatusColor(delivery.deliveryStatus)}>
                                  {delivery.deliveryStatus.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="receivedBy">Received By</Label>
                                <Input 
                                  placeholder="Customer name or signature"
                                  defaultValue={delivery.receivedBy}
                                />
                              </div>

                              <div>
                                <Label htmlFor="deliveredBy">Delivered By</Label>
                                <Input 
                                  placeholder="Staff member name"
                                  defaultValue={delivery.deliveredBy}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Customer Satisfaction</Label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Button
                                      key={star}
                                      variant="outline"
                                      size="sm"
                                      className="p-1"
                                    >
                                      <Star className="w-4 h-4" />
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="feedback">Customer Feedback</Label>
                                <Textarea 
                                  placeholder="Customer comments and feedback..."
                                  defaultValue={delivery.patientFeedback?.comments}
                                />
                              </div>

                              <Button className="w-full">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Delivered
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                {/* Completed Deliveries */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Completed Deliveries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {storeDeliveries
                      .filter(delivery => delivery.deliveryStatus === 'delivered')
                      .map((delivery) => {
                        const order = specsOrders.find(o => o.id === delivery.orderId);
                        
                        return (
                          <Card key={delivery.id}>
                            <CardContent className="p-4">
                              <h4 className="font-medium">{order?.orderNumber}</h4>
                              <p className="text-sm text-gray-600">{order?.patientName}</p>
                              <p className="text-sm text-gray-500">
                                Delivered: {delivery.actualDelivery ? new Date(delivery.actualDelivery).toLocaleDateString() : 'N/A'}
                              </p>
                              
                              {delivery.patientFeedback && (
                                <div className="mt-2">
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: delivery.patientFeedback.satisfaction }, (_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  {delivery.patientFeedback.comments && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      "{delivery.patientFeedback.comments}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}