import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { generateProfessionalPrescriptionPDF, generateDigitalSignature } from './ProfessionalPrescriptionPDF';

interface PrescriptionAudit {
  id: string;
  prescriptionId: string;
  prescriptionNumber: string;
  patientName: string;
  doctorName: string;
  action: 'created' | 'modified' | 'viewed' | 'printed' | 'downloaded' | 'flagged';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  flagReason?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PrescriptionStats {
  totalPrescriptions: number;
  activePrescriptions: number;
  expiredPrescriptions: number;
  flaggedPrescriptions: number;
  totalViews: number;
  totalDownloads: number;
  totalPrints: number;
  uniquePatients: number;
  uniqueDoctors: number;
  averageProcessingTime: number;
}

interface PrescriptionFlag {
  id: string;
  prescriptionId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flaggedBy: string;
  flaggedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  notes: string;
}

const PrescriptionAdminPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [selectedAudit, setSelectedAudit] = useState<PrescriptionAudit | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSeverity, setFlagSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reportType, setReportType] = useState('summary');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock API calls - replace with actual API endpoints
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['prescription-audit', searchTerm, statusFilter, severityFilter, dateRange],
    queryFn: async () => {
      // Mock audit data
      const mockAudits: PrescriptionAudit[] = [
        {
          id: '1',
          prescriptionId: 'RX-2024-001',
          prescriptionNumber: 'RX-2024-001',
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          action: 'created',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          details: 'Prescription created for vision correction',
          severity: 'low'
        },
        {
          id: '2',
          prescriptionId: 'RX-2024-002',
          prescriptionNumber: 'RX-2024-002',
          patientName: 'Jane Smith',
          doctorName: 'Dr. Johnson',
          action: 'flagged',
          timestamp: subDays(new Date(), 1).toISOString(),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          details: 'Unusual prescription pattern detected',
          flagReason: 'Suspicious dosage amounts',
          severity: 'high'
        },
        {
          id: '3',
          prescriptionId: 'RX-2024-003',
          prescriptionNumber: 'RX-2024-003',
          patientName: 'Bob Wilson',
          doctorName: 'Dr. Brown',
          action: 'downloaded',
          timestamp: subDays(new Date(), 2).toISOString(),
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          details: 'PDF downloaded by patient',
          severity: 'low'
        }
      ];
      
      return mockAudits.filter(audit => {
        const matchesSearch = audit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            audit.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            audit.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || audit.action === statusFilter;
        const matchesSeverity = severityFilter === 'all' || audit.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
      });
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['prescription-stats', dateRange],
    queryFn: async (): Promise<PrescriptionStats> => {
      // Mock stats data
      return {
        totalPrescriptions: 1247,
        activePrescriptions: 892,
        expiredPrescriptions: 355,
        flaggedPrescriptions: 23,
        totalViews: 3456,
        totalDownloads: 1234,
        totalPrints: 567,
        uniquePatients: 789,
        uniqueDoctors: 45,
        averageProcessingTime: 2.3
      };
    },
  });

  const { data: flags = [] } = useQuery({
    queryKey: ['prescription-flags'],
    queryFn: async (): Promise<PrescriptionFlag[]> => {
      // Mock flags data
      return [
        {
          id: '1',
          prescriptionId: 'RX-2024-002',
          reason: 'Suspicious dosage amounts',
          severity: 'high',
          flaggedBy: 'System Auto-Detection',
          flaggedAt: new Date().toISOString(),
          status: 'open',
          notes: 'Automated system detected unusual prescription patterns'
        },
        {
          id: '2',
          prescriptionId: 'RX-2024-005',
          reason: 'Multiple prescriptions same day',
          severity: 'medium',
          flaggedBy: 'Dr. Admin',
          flaggedAt: subDays(new Date(), 1).toISOString(),
          status: 'investigating',
          notes: 'Patient received multiple prescriptions from different doctors'
        }
      ];
    },
  });

  const flagPrescriptionMutation = useMutation({
    mutationFn: async ({ prescriptionId, reason, severity }: { prescriptionId: string; reason: string; severity: string }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Prescription Flagged",
        description: "The prescription has been flagged for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['prescription-audit'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-flags'] });
    },
  });

  const updateFlagStatusMutation = useMutation({
    mutationFn: async ({ flagId, status, notes }: { flagId: string; status: string; notes: string }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Flag Updated",
        description: "The flag status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['prescription-flags'] });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async ({ type, dateRange }: { type: string; dateRange: string }) => {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { downloadUrl: 'mock-report.pdf' };
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Your report has been generated and is ready for download.",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'modified': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'viewed': return <Eye className="h-4 w-4 text-gray-600" />;
      case 'printed': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'downloaded': return <Download className="h-4 w-4 text-indigo-600" />;
      case 'flagged': return <Flag className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Administration</h1>
          <p className="text-gray-600 mt-1">Monitor, audit, and manage prescription activities</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive report of prescription activities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Audit Log</SelectItem>
                      <SelectItem value="flags">Security Flags Report</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reportDateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => exportReportMutation.mutate({ type: reportType, dateRange })}
                  disabled={exportReportMutation.isPending}
                  className="w-full"
                >
                  {exportReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPrescriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePrescriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats && ((stats.activePrescriptions / stats.totalPrescriptions) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.flaggedPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uniquePatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats?.uniqueDoctors} doctors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="flags">Security Flags</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Audit Log</CardTitle>
              <CardDescription>
                Track all prescription-related activities and access patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search prescriptions, patients, or doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="modified">Modified</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="printed">Printed</SelectItem>
                    <SelectItem value="downloaded">Downloaded</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audit Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Prescription</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading audit logs...
                        </TableCell>
                      </TableRow>
                    ) : auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((audit) => (
                        <TableRow key={audit.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(audit.action)}
                              <span className="capitalize">{audit.action}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{audit.prescriptionNumber}</TableCell>
                          <TableCell>{audit.patientName}</TableCell>
                          <TableCell>{audit.doctorName}</TableCell>
                          <TableCell>{format(new Date(audit.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(audit.severity)}>
                              {audit.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedAudit(audit)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Audit Log Details</DialogTitle>
                                    <DialogDescription>
                                      Detailed information about this audit entry
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedAudit && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Action</Label>
                                          <p className="text-sm text-gray-600 capitalize">{selectedAudit.action}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Severity</Label>
                                          <Badge className={getSeverityColor(selectedAudit.severity)}>
                                            {selectedAudit.severity}
                                          </Badge>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Prescription</Label>
                                          <p className="text-sm text-gray-600">{selectedAudit.prescriptionNumber}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Timestamp</Label>
                                          <p className="text-sm text-gray-600">
                                            {format(new Date(selectedAudit.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">IP Address</Label>
                                          <p className="text-sm text-gray-600">{selectedAudit.ipAddress}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">User Agent</Label>
                                          <p className="text-sm text-gray-600 truncate">{selectedAudit.userAgent}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Details</Label>
                                        <p className="text-sm text-gray-600 mt-1">{selectedAudit.details}</p>
                                      </div>
                                      {selectedAudit.flagReason && (
                                        <div>
                                          <Label className="text-sm font-medium">Flag Reason</Label>
                                          <p className="text-sm text-red-600 mt-1">{selectedAudit.flagReason}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {audit.action !== 'flagged' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Flag className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Flag Prescription</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Flag this prescription for security review. This action will be logged.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="flagReason">Reason for flagging</Label>
                                        <Textarea
                                          id="flagReason"
                                          placeholder="Describe the security concern..."
                                          value={flagReason}
                                          onChange={(e) => setFlagReason(e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="flagSeverity">Severity Level</Label>
                                        <Select value={flagSeverity} onValueChange={(value: any) => setFlagSeverity(value)}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          flagPrescriptionMutation.mutate({
                                            prescriptionId: audit.prescriptionId,
                                            reason: flagReason,
                                            severity: flagSeverity
                                          });
                                          setFlagReason('');
                                        }}
                                        disabled={!flagReason.trim()}
                                      >
                                        Flag Prescription
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Flags Tab */}
        <TabsContent value="flags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Flags</CardTitle>
              <CardDescription>
                Review and manage flagged prescriptions requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flags.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No security flags at this time</p>
                  </div>
                ) : (
                  flags.map((flag) => (
                    <Card key={flag.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(flag.severity)}>
                                {flag.severity}
                              </Badge>
                              <Badge variant="outline">
                                {flag.status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold">Prescription {flag.prescriptionId}</h3>
                            <p className="text-sm text-gray-600">{flag.reason}</p>
                            <div className="text-xs text-gray-500">
                              Flagged by {flag.flaggedBy} on {format(new Date(flag.flaggedAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                            {flag.notes && (
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm">{flag.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Update
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Flag Status</DialogTitle>
                                  <DialogDescription>
                                    Update the status and add notes for this security flag
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Status</Label>
                                    <Select defaultValue={flag.status}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="dismissed">Dismissed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Notes</Label>
                                    <Textarea placeholder="Add investigation notes..." />
                                  </div>
                                  <Button className="w-full">
                                    Update Flag
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Prescription activity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Views</span>
                    <span className="text-2xl font-bold">{stats?.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Downloads</span>
                    <span className="text-2xl font-bold">{stats?.totalDownloads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prints</span>
                    <span className="text-2xl font-bold">{stats?.totalPrints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Processing Time</span>
                    <span className="text-2xl font-bold">{stats?.averageProcessingTime}min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>Security and compliance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Flags</span>
                    <span className="text-2xl font-bold text-red-600">
                      {flags.filter(f => f.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Resolved This Month</span>
                    <span className="text-2xl font-bold text-green-600">
                      {flags.filter(f => f.status === 'resolved').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <span className="text-2xl font-bold text-blue-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Risk Level</span>
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrescriptionAdminPanel;