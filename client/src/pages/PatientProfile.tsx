import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  Gift, 
  CreditCard, 
  Calendar,
  FileText,
  Heart,
  Pill,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  History,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PatientProfileProps {
  patientId: string;
}

interface Coupon {
  id: string;
  couponCode: string;
  couponType: 'percentage' | 'fixed_amount' | 'service_discount';
  discountValue: number;
  applicableServices: string[];
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  issueDate: string;
  expirationDate: string;
  redemptionLimit: number;
  timesRedeemed: number;
  isActive: boolean;
  createdBy: string;
  notes?: string;
  redemptions?: Array<{
    id: string;
    transactionType: string;
    transactionId: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    redemptionDate: string;
  }>;
}

export default function PatientProfile() {
  const { patientId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    couponType: 'percentage' as const,
    discountValue: 0,
    expirationDate: '',
    notes: ''
  });
  const { toast } = useToast();

  // Fetch comprehensive patient data
  const { data: patient, isLoading, refetch } = useQuery({
    queryKey: [`/api/patients/${patientId}/comprehensive`],
    enabled: !!patientId
  });

  // Fetch patient coupons
  const { data: coupons = [], refetch: refetchCoupons } = useQuery<Coupon[]>({
    queryKey: [`/api/patients/${patientId}/coupons`],
    enabled: !!patientId
  });

  const handleAddCoupon = async () => {
    try {
      await apiRequest("POST", `/api/patients/${patientId}/coupons`, {
        ...newCoupon,
        expirationDate: new Date(newCoupon.expirationDate).toISOString(),
        redemptionLimit: 1,
        applicableServices: ['all']
      });
      
      toast({
        title: "Success",
        description: "Coupon added successfully",
      });
      
      refetchCoupons();
      setShowAddCoupon(false);
      setNewCoupon({
        couponType: 'percentage',
        discountValue: 0,
        expirationDate: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add coupon",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  const personalInfo = patient.customFields?.personalInfo || {};
  const address = patient.customFields?.address || {};
  const emergencyContact = patient.customFields?.emergencyContact || {};
  const medicalInfo = patient.customFields?.medicalInfo || {};
  const insurance = patient.customFields?.insurance || [];
  const communicationPrefs = patient.customFields?.communicationPreferences || {};

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{patient.patientCode}</Badge>
                <Badge variant={patient.isActive ? "default" : "secondary"}>
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
            data-testid="button-edit-patient"
          >
            <Edit className="h-4 w-4" />
            Edit Patient
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Full Name:</span>
                  <span className="font-medium">
                    {patient.firstName} {personalInfo.middleName} {patient.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date of Birth:</span>
                  <span className="font-medium">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">{personalInfo.gender || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Language:</span>
                  <span className="font-medium">{personalInfo.preferredLanguage || 'English'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{patient.phone}</span>
                </div>
                {personalInfo.alternatePhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{personalInfo.alternatePhone}</span>
                    <Badge variant="outline" className="text-xs">Alt</Badge>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{patient.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {address.streetAddress ? (
                  <div className="space-y-1">
                    <p className="font-medium">{address.streetAddress}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No address on file</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          {emergencyContact.name && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="font-medium">{emergencyContact.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <p className="font-medium">{emergencyContact.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Relationship:</span>
                    <p className="font-medium capitalize">{emergencyContact.relation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Blood Type:</span>
                  <span className="font-medium">{medicalInfo.bloodType || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Allergies:</span>
                  <span className="font-medium">
                    {medicalInfo.allergies?.length > 0 ? `${medicalInfo.allergies.length} recorded` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Medications:</span>
                  <span className="font-medium">
                    {medicalInfo.medications?.length > 0 ? `${medicalInfo.medications.length} current` : 'None'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            {medicalInfo.allergies?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {medicalInfo.allergies.map((allergy: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{allergy.allergen}</span>
                          <Badge variant={
                            allergy.severity === 'severe' ? 'destructive' : 
                            allergy.severity === 'moderate' ? 'default' : 'secondary'
                          }>
                            {allergy.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{allergy.reaction}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Current Medications */}
          {medicalInfo.medications?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicalInfo.medications.map((medication: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{medication.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <p>Dosage: {medication.dosage}</p>
                        <p>Frequency: {medication.frequency}</p>
                        {medication.prescribedBy && <p>Prescribed by: {medication.prescribedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          {insurance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insurance.map((policy: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {policy.providerName}
                      </div>
                      {policy.isPrimary && <Badge>Primary</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Policy Number:</span>
                        <p className="font-medium">{policy.policyNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Member ID:</span>
                        <p className="font-medium">{policy.memberNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Copay:</span>
                        <p className="font-medium">${policy.copayAmount || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Deductible:</span>
                        <p className="font-medium">${policy.deductibleAmount || '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No insurance policies on file</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Patient Coupons</h3>
            <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Coupon</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Coupon Type</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={newCoupon.couponType}
                      onChange={(e) => setNewCoupon({...newCoupon, couponType: e.target.value as any})}
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Discount Value ({newCoupon.couponType === 'percentage' ? '%' : '$'})
                    </label>
                    <input 
                      type="number"
                      className="w-full mt-1 p-2 border rounded"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expiration Date</label>
                    <input 
                      type="date"
                      className="w-full mt-1 p-2 border rounded"
                      value={newCoupon.expirationDate}
                      onChange={(e) => setNewCoupon({...newCoupon, expirationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea 
                      className="w-full mt-1 p-2 border rounded"
                      rows={3}
                      value={newCoupon.notes}
                      onChange={(e) => setNewCoupon({...newCoupon, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddCoupon(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCoupon}>
                      Add Coupon
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="border-2 border-dashed border-yellow-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-yellow-600" />
                        <span className="font-mono text-lg">{coupon.couponCode}</span>
                      </div>
                      <Badge variant={coupon.isActive && new Date(coupon.expirationDate) > new Date() ? "default" : "secondary"}>
                        {coupon.isActive && new Date(coupon.expirationDate) > new Date() ? "Active" : "Expired"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="font-medium">
                        {coupon.couponType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `$${coupon.discountValue}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Used:</span>
                      <span className="font-medium">
                        {coupon.timesRedeemed} / {coupon.redemptionLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expires:</span>
                      <span className="font-medium">
                        {new Date(coupon.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                    {coupon.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">{coupon.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No coupons available</p>
                <p className="text-xs text-gray-400 mt-1">Add a coupon to provide discounts for this patient</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No appointments found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Patient History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Patient registered</p>
                    <p className="text-sm text-gray-600">
                      {new Date(patient.createdAt).toLocaleString()}
                    </p>
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