import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Gift, CreditCard, AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InsuranceCoupon {
  couponCode: string;
  serviceType: string;
  amount: number;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  description?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  insuranceCoupons: InsuranceCoupon[];
}

interface InsuranceCouponsManagerProps {
  patient: Patient;
  onCouponRedeemed?: (couponCode: string, amount: number) => void;
  showRedemption?: boolean;
}

export default function InsuranceCouponsManager({ patient, onCouponRedeemed, showRedemption = false }: InsuranceCouponsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    couponCode: '',
    serviceType: '',
    amount: '',
    expiryDate: '',
    description: ''
  });

  const addCouponMutation = useMutation({
    mutationFn: async (couponData: InsuranceCoupon) => {
      // Update patient's insurance coupons array
      const updatedCoupons = [...(patient.insuranceCoupons || []), couponData];
      await apiRequest("PUT", `/api/patients/${patient.id}`, {
        insuranceCoupons: updatedCoupons
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsAddingCoupon(false);
      setNewCoupon({
        couponCode: '',
        serviceType: '',
        amount: '',
        expiryDate: '',
        description: ''
      });
      toast({
        title: "Success",
        description: "Insurance coupon added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add insurance coupon.",
        variant: "destructive",
      });
    },
  });

  const redeemCouponMutation = useMutation({
    mutationFn: async (couponCode: string) => {
      // Mark coupon as used
      const updatedCoupons = patient.insuranceCoupons.map(coupon =>
        coupon.couponCode === couponCode
          ? { ...coupon, status: 'used' as const }
          : coupon
      );
      await apiRequest("PUT", `/api/patients/${patient.id}`, {
        insuranceCoupons: updatedCoupons
      });
      return couponCode;
    },
    onSuccess: (couponCode) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      const redeemedCoupon = patient.insuranceCoupons.find(c => c.couponCode === couponCode);
      if (redeemedCoupon && onCouponRedeemed) {
        onCouponRedeemed(couponCode, redeemedCoupon.amount);
      }
      toast({
        title: "Coupon Redeemed",
        description: `Successfully redeemed coupon ${couponCode}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to redeem coupon.",
        variant: "destructive",
      });
    },
  });

  const handleAddCoupon = () => {
    if (!newCoupon.couponCode || !newCoupon.serviceType || !newCoupon.amount || !newCoupon.expiryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const couponData: InsuranceCoupon = {
      couponCode: newCoupon.couponCode,
      serviceType: newCoupon.serviceType,
      amount: parseFloat(newCoupon.amount),
      issuedDate: new Date().toISOString(),
      expiryDate: newCoupon.expiryDate,
      status: 'active',
      description: newCoupon.description
    };

    addCouponMutation.mutate(couponData);
  };

  const handleRedeemCoupon = (couponCode: string) => {
    redeemCouponMutation.mutate(couponCode);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'used': return <CreditCard className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const activeCoupons = patient.insuranceCoupons?.filter(c => c.status === 'active') || [];
  const totalCreditAvailable = activeCoupons.reduce((sum, coupon) => sum + coupon.amount, 0);

  return (
    <div className="space-y-6">
      {/* Credit Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-green-800">
            <DollarSign className="w-5 h-5 mr-2" />
            Insurance Credit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalCreditAvailable.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Available Credit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeCoupons.length}</div>
              <div className="text-sm text-gray-600">Active Coupons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {patient.insuranceCoupons?.filter(c => c.status === 'used').length || 0}
              </div>
              <div className="text-sm text-gray-600">Used Coupons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {patient.insuranceCoupons?.filter(c => c.status === 'expired').length || 0}
              </div>
              <div className="text-sm text-gray-600">Expired Coupons</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Coupons</TabsTrigger>
          <TabsTrigger value="all">All Coupons</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Insurance Coupons</h3>
            {showRedemption && activeCoupons.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ${totalCreditAvailable.toFixed(2)} available for redemption
              </Badge>
            )}
          </div>
          
          {activeCoupons.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Coupons</h3>
                <p className="text-gray-600 mb-4">This patient doesn't have any active insurance coupons.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeCoupons.map((coupon, index) => (
                <Card key={index} className="border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-green-800">{coupon.couponCode}</CardTitle>
                        <CardDescription>{coupon.serviceType}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(coupon.status)}>
                        {getStatusIcon(coupon.status)}
                        <span className="ml-1 capitalize">{coupon.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-semibold text-green-600">${coupon.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expires:</span>
                        <span className="text-sm">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                      </div>
                      {coupon.description && (
                        <div>
                          <span className="text-sm text-gray-600">Description:</span>
                          <p className="text-sm mt-1">{coupon.description}</p>
                        </div>
                      )}
                      {showRedemption && coupon.status === 'active' && (
                        <Button 
                          onClick={() => handleRedeemCoupon(coupon.couponCode)}
                          className="w-full mt-3"
                          disabled={redeemCouponMutation.isPending}
                        >
                          {redeemCouponMutation.isPending ? "Redeeming..." : "Redeem Coupon"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <h3 className="text-lg font-semibold">All Insurance Coupons</h3>
          
          {(!patient.insuranceCoupons || patient.insuranceCoupons.length === 0) ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Coupons Found</h3>
                <p className="text-gray-600">This patient doesn't have any insurance coupons.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {patient.insuranceCoupons.map((coupon, index) => (
                <Card key={index} className={coupon.status === 'active' ? 'border-green-200' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{coupon.couponCode}</h4>
                          <Badge className={getStatusColor(coupon.status)}>
                            {getStatusIcon(coupon.status)}
                            <span className="ml-1 capitalize">{coupon.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{coupon.serviceType}</p>
                        {coupon.description && (
                          <p className="text-sm text-gray-500">{coupon.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">${coupon.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Insurance Coupons</h3>
            <Dialog open={isAddingCoupon} onOpenChange={setIsAddingCoupon}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Insurance Coupon</DialogTitle>
                  <DialogDescription>
                    Add a new insurance coupon for {patient.firstName} {patient.lastName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="couponCode">Coupon Code *</Label>
                    <Input
                      id="couponCode"
                      value={newCoupon.couponCode}
                      onChange={(e) => setNewCoupon({...newCoupon, couponCode: e.target.value})}
                      placeholder="e.g., GOV-2024-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select 
                      value={newCoupon.serviceType} 
                      onValueChange={(value) => setNewCoupon({...newCoupon, serviceType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Eye Examination">Eye Examination</SelectItem>
                        <SelectItem value="Glasses">Glasses</SelectItem>
                        <SelectItem value="Contact Lenses">Contact Lenses</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="General Medical">General Medical</SelectItem>
                        <SelectItem value="Dental">Dental</SelectItem>
                        <SelectItem value="Any Service">Any Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newCoupon.amount}
                      onChange={(e) => setNewCoupon({...newCoupon, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                      placeholder="Optional description or notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingCoupon(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCoupon} disabled={addCouponMutation.isPending}>
                    {addCouponMutation.isPending ? "Adding..." : "Add Coupon"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coupon Management</CardTitle>
              <CardDescription>
                Manage insurance coupons for {patient.firstName} {patient.lastName}. 
                Active coupons can be redeemed during appointments and billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">How Insurance Coupons Work</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Coupons are issued by government or insurance providers</li>
                    <li>• Each coupon has a specific service type and monetary value</li>
                    <li>• Coupons can be redeemed during billing to reduce costs</li>
                    <li>• Used coupons cannot be redeemed again</li>
                    <li>• Expired coupons are automatically marked as expired</li>
                  </ul>
                </div>

                {totalCreditAvailable > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Available Credit</h4>
                    <p className="text-green-700">
                      This patient has <strong>${totalCreditAvailable.toFixed(2)}</strong> in available insurance credits
                      across {activeCoupons.length} active coupon{activeCoupons.length !== 1 ? 's' : ''}.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}