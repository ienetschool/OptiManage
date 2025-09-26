import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  DollarSign, 
  Calendar, 
  FileText, 
  Gift, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  Receipt,
  Pill,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface PatientHistorySectionProps {
  patientId: string;
  patient: any;
}

interface HistoryRecord {
  id: string;
  recordType: 'appointment' | 'invoice' | 'prescription' | 'coupon' | 'insurance';
  recordId: string;
  recordDate: string;
  title: string;
  description: string;
  metadata: any;
  createdAt: string;
}

interface AppointmentHistory {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: string;
  doctorName: string;
  appointmentFee: number;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
}

interface PaymentHistory {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  appliedCouponCode?: string;
}

interface VoucherHistory {
  id: string;
  couponCode: string;
  couponType: string;
  discountValue: number;
  redemptionDate: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  transactionType: string;
}

interface InsuranceHistory {
  id: string;
  claimNumber: string;
  claimDate: string;
  provider: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount: number;
  status: string;
  notes: string;
}

export default function PatientHistorySection({ patientId, patient }: PatientHistorySectionProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch comprehensive patient history
  const { data: historyRecords = [], isLoading: historyLoading } = useQuery<HistoryRecord[]>({
    queryKey: [`/api/patients/${patientId}/history`],
    enabled: !!patientId
  });

  // Fetch appointment history
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentHistory[]>({
    queryKey: [`/api/patients/${patientId}/appointments`],
    enabled: !!patientId
  });

  // Fetch payment history
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<PaymentHistory[]>({
    queryKey: [`/api/patients/${patientId}/payments`],
    enabled: !!patientId
  });

  // Fetch voucher usage history
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery<VoucherHistory[]>({
    queryKey: [`/api/patients/${patientId}/vouchers`],
    enabled: !!patientId
  });

  // Fetch insurance claims history
  const { data: insuranceClaims = [], isLoading: insuranceLoading } = useQuery<InsuranceHistory[]>({
    queryKey: [`/api/patients/${patientId}/insurance-claims`],
    enabled: !!patientId
  });

  const getStatusBadge = (status: string, type: 'payment' | 'appointment' | 'insurance' = 'payment') => {
    const statusConfig = {
      payment: {
        paid: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
        pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
        overdue: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
        cancelled: { variant: "outline" as const, icon: XCircle, color: "text-gray-600" }
      },
      appointment: {
        confirmed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
        scheduled: { variant: "secondary" as const, icon: Clock, color: "text-blue-600" },
        completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
        cancelled: { variant: "outline" as const, icon: XCircle, color: "text-gray-600" },
        no_show: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
      },
      insurance: {
        approved: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
        pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
        denied: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
        processing: { variant: "outline" as const, icon: Activity, color: "text-blue-600" }
      }
    };

    const typeConfig = statusConfig[type];
    const statusKey = status.toLowerCase() as keyof typeof typeConfig;
    const config = typeConfig[statusKey] || typeConfig.pending || typeConfig.scheduled || typeConfig.approved;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalPaid = payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.paymentStatus === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const totalVoucherSavings = vouchers.reduce((sum, v) => sum + v.discountAmount, 0);
  const totalInsuranceClaims = insuranceClaims.reduce((sum, c) => sum + c.approvedAmount, 0);

  if (historyLoading || appointmentsLoading || paymentsLoading || vouchersLoading || insuranceLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-spin" />
            <span>Loading patient history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Appointments</p>
                <p className="text-lg font-semibold">{completedAppointments}/{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Voucher Savings</p>
                <p className="text-lg font-semibold text-purple-600">{formatCurrency(totalVoucherSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Insurance Claims</p>
                <p className="text-lg font-semibold text-orange-600">{formatCurrency(totalInsuranceClaims)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Comprehensive Patient History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {/* Registration Record */}
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">Patient registered</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(patient.createdAt), 'PPP p')}
                      </p>
                    </div>
                  </div>

                  {/* Recent History Records */}
                  {historyRecords.slice(0, 10).map((record) => {
                    const getRecordIcon = () => {
                      switch (record.recordType) {
                        case 'appointment': return <Calendar className="h-5 w-5 text-blue-500" />;
                        case 'invoice': return <Receipt className="h-5 w-5 text-green-500" />;
                        case 'prescription': return <Pill className="h-5 w-5 text-purple-500" />;
                        case 'coupon': return <Gift className="h-5 w-5 text-orange-500" />;
                        case 'insurance': return <Shield className="h-5 w-5 text-indigo-500" />;
                        default: return <FileText className="h-5 w-5 text-gray-500" />;
                      }
                    };

                    return (
                      <div key={record.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getRecordIcon()}
                        <div className="flex-1">
                          <p className="font-medium">{record.title}</p>
                          <p className="text-sm text-gray-600">{record.description}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(record.recordDate), 'PPP p')}
                          </p>
                        </div>
                        {record.metadata?.amount && (
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(parseFloat(record.metadata.amount))}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {historyRecords.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No history records found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{payment.invoiceNumber}</p>
                          {getStatusBadge(payment.paymentStatus, 'payment')}
                        </div>
                        <p className="text-sm text-gray-600">{payment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Method: {payment.paymentMethod}</span>
                          <span>Date: {format(new Date(payment.invoiceDate), 'PP')}</span>
                          {payment.appliedCouponCode && (
                            <span className="text-purple-600">Coupon: {payment.appliedCouponCode}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                        {payment.paymentDate && (
                          <p className="text-xs text-gray-500">
                            Paid: {format(new Date(payment.paymentDate), 'PP')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {payments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No payment records found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{appointment.appointmentNumber}</p>
                          {getStatusBadge(appointment.status, 'appointment')}
                        </div>
                        <p className="text-sm text-gray-600">
                          {appointment.appointmentType} with {appointment.doctorName}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Date: {format(new Date(appointment.appointmentDate), 'PP')}</span>
                          <span>Time: {appointment.appointmentTime}</span>
                          <span>Payment: {getStatusBadge(appointment.paymentStatus, 'payment')}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-xs text-gray-600 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(appointment.appointmentFee)}</p>
                        <p className="text-xs text-gray-500">{appointment.paymentMethod}</p>
                      </div>
                    </div>
                  ))}

                  {appointments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No appointment records found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="vouchers" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {vouchers.map((voucher) => (
                    <div key={voucher.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Gift className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{voucher.couponCode}</p>
                          <Badge variant="outline">{voucher.couponType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {voucher.transactionType} - Saved {formatCurrency(voucher.discountAmount)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Original: {formatCurrency(voucher.originalAmount)}</span>
                          <span>Final: {formatCurrency(voucher.finalAmount)}</span>
                          <span>Used: {format(new Date(voucher.redemptionDate), 'PP')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-purple-600">
                          -{formatCurrency(voucher.discountAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {voucher.discountValue}{voucher.couponType === 'percentage' ? '%' : ''} off
                        </p>
                      </div>
                    </div>
                  ))}

                  {vouchers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Gift className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No voucher usage records found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {insuranceClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Shield className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{claim.claimNumber}</p>
                          {getStatusBadge(claim.status, 'insurance')}
                        </div>
                        <p className="text-sm text-gray-600">
                          {claim.provider} - Policy: {claim.policyNumber}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Claimed: {formatCurrency(claim.claimAmount)}</span>
                          <span>Approved: {formatCurrency(claim.approvedAmount)}</span>
                          <span>Date: {format(new Date(claim.claimDate), 'PP')}</span>
                        </div>
                        {claim.notes && (
                          <p className="text-xs text-gray-600 mt-1">{claim.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-orange-600">
                          {formatCurrency(claim.approvedAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {((claim.approvedAmount / claim.claimAmount) * 100).toFixed(0)}% approved
                        </p>
                      </div>
                    </div>
                  ))}

                  {insuranceClaims.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No insurance claim records found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}