import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Eye,
  Download,
  FileText,
  Calendar,
  Stethoscope,
  Pill,
  Clock,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Printer
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import { generateProfessionalPrescriptionPDF, generateDigitalSignature } from "./ProfessionalPrescriptionPDF";

interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface PrescriptionDetails {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  doctorLicense: string;
  doctorSpecialization: string;
  prescriptionDate: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  status: string;
  sphereRight?: string;
  cylinderRight?: string;
  axisRight?: string;
  sphereLeft?: string;
  cylinderLeft?: string;
  axisLeft?: string;
  pdDistance?: string;
  items: PrescriptionItem[];
}

interface PrescriptionSummary {
  id: string;
  prescriptionNumber: string;
  doctorName: string;
  prescriptionDate: string;
  diagnosis: string;
  status: string;
  prescriptionType: string;
}

interface PatientPrescriptionPortalProps {
  patientId?: string;
}

export default function PatientPrescriptionPortal({ patientId }: PatientPrescriptionPortalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetails | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch patient's prescriptions list
  const { data: prescriptions = [], isLoading } = useQuery<PrescriptionSummary[]>({
    queryKey: ["/api/patients", patientId, "prescriptions"],
    enabled: !!patientId,
  });

  // Fetch prescription details when selected
  const { data: prescriptionDetails, isLoading: isLoadingDetails } = useQuery<PrescriptionDetails>({
    queryKey: ["/api/prescriptions", selectedPrescription?.id, "details"],
    enabled: !!selectedPrescription?.id,
  });

  // Filter prescriptions based on search
  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = async (prescription: PrescriptionSummary) => {
    setSelectedPrescription(prescription as any);
    setViewDetailsOpen(true);
  };

  const handleDownloadPDF = (prescription: PrescriptionDetails) => {
    const pdf = generatePDF(prescription);
    pdf.save(`prescription-${prescription.prescriptionNumber}.pdf`);
    
    toast({
      title: "Download Started",
      description: `Digitally signed prescription ${prescription.prescriptionNumber} is being downloaded`,
    });
  };

  const handlePrintPDF = (prescription: PrescriptionDetails) => {
    // Generate digital signature
    const signature = generateDigitalSignature(
      prescription.doctorLicense || 'DOC-001',
      prescription.id
    );
    
    // Generate professional HTML content
    const htmlContent = generateProfessionalPrescriptionPDF(prescription, signature);
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    toast({
      title: "Prescription Ready",
      description: `Digitally signed prescription ${prescription.prescriptionNumber} opened for printing`,
    });
  };

  const generatePDF = (prescription: PrescriptionDetails): jsPDF => {
     // Generate digital signature
     const signature = generateDigitalSignature(
       prescription.doctorLicense || 'DOC-001',
       prescription.id
     );
     
     const pdf = new jsPDF();
     
     // Header
     pdf.setFontSize(20);
     pdf.text('IeOMS - Medical Prescription', 20, 30);
     
     // Prescription details
     pdf.setFontSize(12);
     pdf.text(`Prescription #: ${prescription.prescriptionNumber}`, 20, 50);
     pdf.text(`Patient: ${prescription.patientName}`, 20, 65);
     pdf.text(`Doctor: ${prescription.doctorName}`, 20, 80);
     pdf.text(`Date: ${format(new Date(prescription.prescriptionDate), 'dd/MM/yyyy')}`, 20, 95);
     pdf.text(`Status: ${prescription.status?.toUpperCase() || 'ACTIVE'}`, 20, 110);
     
     // Vision prescription if available
     if (prescription.sphereRight || prescription.sphereLeft) {
       pdf.setFontSize(14);
       pdf.text('OPTICAL PRESCRIPTION', 20, 130);
       pdf.setFontSize(10);
       pdf.text('Right Eye (OD):', 20, 145);
       pdf.text(`  Sphere: ${prescription.sphereRight || 'Plano'}`, 25, 155);
       pdf.text(`  Cylinder: ${prescription.cylinderRight || 'Plano'}`, 25, 165);
       pdf.text(`  Axis: ${prescription.axisRight || '---'}°`, 25, 175);
       
       pdf.text('Left Eye (OS):', 20, 190);
       pdf.text(`  Sphere: ${prescription.sphereLeft || 'Plano'}`, 25, 200);
       pdf.text(`  Cylinder: ${prescription.cylinderLeft || 'Plano'}`, 25, 210);
       pdf.text(`  Axis: ${prescription.axisLeft || '---'}°`, 25, 220);
       
       if (prescription.pdDistance) {
         pdf.text(`Pupillary Distance: ${prescription.pdDistance} mm`, 20, 235);
       }
     }
     
     // Clinical information
     let yPos = 250;
     if (prescription.diagnosis) {
       pdf.text(`Diagnosis: ${prescription.diagnosis}`, 20, yPos);
       yPos += 15;
     }
     if (prescription.treatment) {
       pdf.text(`Treatment: ${prescription.treatment}`, 20, yPos);
       yPos += 15;
     }
     if (prescription.notes) {
       pdf.text(`Notes: ${prescription.notes}`, 20, yPos);
       yPos += 15;
     }
     
     // Digital signature info
     pdf.setFontSize(8);
     pdf.text('DIGITALLY SIGNED', 20, 270);
     pdf.text(`Verification Code: ${signature.verificationCode}`, 20, 275);
     pdf.text(`Signed: ${format(new Date(signature.timestamp), 'dd/MM/yyyy HH:mm')}`, 20, 280);
     pdf.text('Verify at: verify.optistorepro.com', 20, 285);
     
     return pdf;
   };

  const generatePrescriptionPDF = (prescription: PrescriptionDetails): string => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription - ${prescription.prescriptionNumber}</title>
        <style>
          @page { 
            size: A4; 
            margin: 20mm; 
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12pt; 
            color: #333; 
            line-height: 1.6;
          }
          
          .prescription-header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            text-align: center;
          }
          
          .clinic-name { 
            font-size: 24pt; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          
          .prescription-number { 
            font-size: 14pt; 
            opacity: 0.9; 
          }
          
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 25px; 
          }
          
          .info-section { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #667eea;
          }
          
          .section-title { 
            font-weight: bold; 
            color: #2d3748; 
            margin-bottom: 10px; 
            font-size: 14pt;
          }
          
          .info-row { 
            margin-bottom: 8px; 
            display: flex;
            justify-content: space-between;
          }
          
          .info-label { 
            font-weight: 600; 
            color: #4a5568; 
            min-width: 120px;
          }
          
          .info-value { 
            color: #2d3748; 
            flex: 1;
            text-align: right;
          }
          
          .vision-section { 
            background: #e6fffa; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            border-left: 4px solid #319795;
          }
          
          .vision-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
          }
          
          .eye-details { 
            background: white; 
            padding: 12px; 
            border-radius: 6px; 
            border: 1px solid #e2e8f0;
          }
          
          .eye-title { 
            font-weight: bold; 
            color: #2d3748; 
            margin-bottom: 8px; 
            text-align: center;
          }
          
          .medications-section { 
            background: #fef5e7; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            border-left: 4px solid #d69e2e;
          }
          
          .medication-item { 
            background: white; 
            padding: 12px; 
            border-radius: 6px; 
            margin-bottom: 10px;
            border: 1px solid #e2e8f0;
          }
          
          .medication-name { 
            font-weight: bold; 
            color: #2d3748; 
            font-size: 13pt;
          }
          
          .medication-details { 
            color: #4a5568; 
            margin-top: 5px;
          }
          
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 2px solid #e2e8f0; 
            text-align: center;
            color: #718096;
          }
          
          .signature-section { 
            margin-top: 40px; 
            display: flex;
            justify-content: space-between;
          }
          
          .signature-box { 
            width: 200px; 
            border-bottom: 2px solid #2d3748; 
            padding-bottom: 5px; 
            text-align: center;
          }
          
          .qr-code { 
            position: absolute; 
            top: 20px; 
            right: 20px; 
            background: white; 
            padding: 10px; 
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="prescription-header">
          <div class="clinic-name">IeOMS Medical Center</div>
          <div class="prescription-number">Prescription #${prescription.prescriptionNumber}</div>
        </div>
        
        <div class="qr-code">
          <div style="width: 80px; height: 80px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 8pt;">QR Code</div>
        </div>
        
        <div class="info-grid">
          <div class="info-section">
            <div class="section-title">Patient Information</div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${prescription.patientName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Patient ID:</span>
              <span class="info-value">${prescription.patientCode}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${format(new Date(prescription.prescriptionDate), 'MMMM dd, yyyy')}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="section-title">Doctor Information</div>
            <div class="info-row">
              <span class="info-label">Doctor:</span>
              <span class="info-value">${prescription.doctorName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">License:</span>
              <span class="info-value">${prescription.doctorLicense || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Specialization:</span>
              <span class="info-value">${prescription.doctorSpecialization || 'General Practice'}</span>
            </div>
          </div>
        </div>
        
        ${prescription.sphereRight || prescription.sphereLeft ? `
        <div class="vision-section">
          <div class="section-title">Vision Prescription</div>
          <div class="vision-grid">
            <div class="eye-details">
              <div class="eye-title">Right Eye (OD)</div>
              <div class="info-row">
                <span class="info-label">Sphere:</span>
                <span class="info-value">${prescription.sphereRight || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cylinder:</span>
                <span class="info-value">${prescription.cylinderRight || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Axis:</span>
                <span class="info-value">${prescription.axisRight || 'N/A'}°</span>
              </div>
            </div>
            
            <div class="eye-details">
              <div class="eye-title">Left Eye (OS)</div>
              <div class="info-row">
                <span class="info-label">Sphere:</span>
                <span class="info-value">${prescription.sphereLeft || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cylinder:</span>
                <span class="info-value">${prescription.cylinderLeft || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Axis:</span>
                <span class="info-value">${prescription.axisLeft || 'N/A'}°</span>
              </div>
            </div>
          </div>
          
          ${prescription.pdDistance ? `
          <div style="text-align: center; margin-top: 15px;">
            <strong>Pupillary Distance (PD): ${prescription.pdDistance} mm</strong>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${prescription.items && prescription.items.length > 0 ? `
        <div class="medications-section">
          <div class="section-title">Prescribed Medications</div>
          ${prescription.items.map(item => `
          <div class="medication-item">
            <div class="medication-name">${item.medicationName}</div>
            <div class="medication-details">
              <strong>Dosage:</strong> ${item.dosage} | 
              <strong>Frequency:</strong> ${item.frequency} | 
              <strong>Duration:</strong> ${item.duration}
            </div>
            <div class="medication-details">
              <strong>Quantity:</strong> ${item.quantity} | 
              <strong>Instructions:</strong> ${item.instructions}
            </div>
          </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="info-section">
          <div class="section-title">Diagnosis & Treatment</div>
          <div style="margin-bottom: 15px;">
            <strong>Diagnosis:</strong><br>
            ${prescription.diagnosis || 'No diagnosis recorded'}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Treatment:</strong><br>
            ${prescription.treatment || 'No treatment recorded'}
          </div>
          ${prescription.notes ? `
          <div>
            <strong>Additional Notes:</strong><br>
            ${prescription.notes}
          </div>
          ` : ''}
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div style="margin-bottom: 30px;"></div>
            <div>Doctor's Signature</div>
          </div>
          <div class="signature-box">
            <div style="margin-bottom: 30px;"></div>
            <div>Date</div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>IeOMS Medical Center</strong></p>
          <p>Sandy Babb Street, Kitty, Georgetown, Guyana | Phone: +592 750-3901</p>
          <p>This prescription is valid for 12 months from the date of issue</p>
        </div>
      </body>
    </html>
    `;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      expired: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2>
          <p className="text-gray-600">View, download, and print your prescription history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-600 font-medium">HIPAA Secure</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prescriptions by number, doctor, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="grid gap-4">
        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Found</h3>
              <p className="text-gray-600">
                {searchTerm ? "No prescriptions match your search criteria." : "You don't have any prescriptions yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {prescription.prescriptionNumber}
                      </h3>
                      {getStatusBadge(prescription.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Dr. {prescription.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {format(new Date(prescription.prescriptionDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {prescription.prescriptionType?.replace('_', ' ') || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">
                          {prescription.diagnosis || 'No diagnosis'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(prescription)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Prescription Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prescription Details
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : prescriptionDetails ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Prescription Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Number:</strong> {prescriptionDetails.prescriptionNumber}</div>
                      <div><strong>Date:</strong> {format(new Date(prescriptionDetails.prescriptionDate), 'MMMM dd, yyyy')}</div>
                      <div><strong>Status:</strong> {getStatusBadge(prescriptionDetails.status)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Doctor Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Doctor:</strong> {prescriptionDetails.doctorName}</div>
                      <div><strong>License:</strong> {prescriptionDetails.doctorLicense || 'N/A'}</div>
                      <div><strong>Specialization:</strong> {prescriptionDetails.doctorSpecialization || 'General Practice'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision Prescription */}
              {(prescriptionDetails.sphereRight || prescriptionDetails.sphereLeft) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vision Prescription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-center mb-3">Right Eye (OD)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Sphere:</span>
                            <span className="font-mono">{prescriptionDetails.sphereRight || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cylinder:</span>
                            <span className="font-mono">{prescriptionDetails.cylinderRight || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Axis:</span>
                            <span className="font-mono">{prescriptionDetails.axisRight || 'N/A'}°</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-center mb-3">Left Eye (OS)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Sphere:</span>
                            <span className="font-mono">{prescriptionDetails.sphereLeft || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cylinder:</span>
                            <span className="font-mono">{prescriptionDetails.cylinderLeft || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Axis:</span>
                            <span className="font-mono">{prescriptionDetails.axisLeft || 'N/A'}°</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {prescriptionDetails.pdDistance && (
                      <div className="mt-4 text-center">
                        <div className="bg-purple-50 p-3 rounded-lg inline-block">
                          <strong>Pupillary Distance (PD): {prescriptionDetails.pdDistance} mm</strong>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Medications */}
              {prescriptionDetails.items && prescriptionDetails.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Prescribed Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {prescriptionDetails.items.map((item, index) => (
                        <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">{item.medicationName}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div><strong>Dosage:</strong> {item.dosage}</div>
                            <div><strong>Frequency:</strong> {item.frequency}</div>
                            <div><strong>Duration:</strong> {item.duration}</div>
                            <div><strong>Quantity:</strong> {item.quantity}</div>
                          </div>
                          {item.instructions && (
                            <div className="mt-2 text-sm">
                              <strong>Instructions:</strong> {item.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Diagnosis & Treatment */}
              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis & Treatment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {prescriptionDetails.diagnosis || 'No diagnosis recorded'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Treatment</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {prescriptionDetails.treatment || 'No treatment recorded'}
                    </p>
                  </div>
                  {prescriptionDetails.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {prescriptionDetails.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => handlePrintPDF(prescriptionDetails)}
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Prescription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(prescriptionDetails)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Unable to load prescription details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}