import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, Edit, QrCode, CalendarDays, Building2, User, Shield, Clock, CreditCard, FileText, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Staff, insertStaffSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Helper function to generate random password
const generatePassword = (length: number = 8) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export default function StaffPage() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);
  const [basicSalary, setBasicSalary] = useState(0);
  const [houseAllowance, setHouseAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [medicalAllowance, setMedicalAllowance] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [providentFund, setProvidentFund] = useState(0);
  const [healthInsurance, setHealthInsurance] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Single ID Card print function - clean and simple
  const printIDCard = (staff: Staff) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const idCardHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Card - ${staff.firstName} ${staff.lastName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; background: white; }
            .page-container {
              width: 210mm; height: 297mm; display: flex; justify-content: center;
              align-items: center; padding: 20mm; margin: 0 auto;
            }
            .id-card-container { display: flex; gap: 10mm; }
            .id-card {
              width: 85mm; height: 130mm; background: white; border-radius: 10px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2); overflow: hidden;
            }
            .card-front, .card-back {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #6fa8dc 100%);
              color: white; height: 100%; position: relative; padding: 20px;
            }
            .company-header { text-align: center; margin-bottom: 20px; }
            .company-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
            .company-slogan { font-size: 12px; opacity: 0.9; text-transform: uppercase; }
            .photo-section { display: flex; justify-content: center; margin: 20px 0; }
            .photo-circle {
              width: 80px; height: 80px; border-radius: 50%; background: white;
              border: 3px solid rgba(255,255,255,0.3); display: flex; align-items: center;
              justify-content: center; font-size: 28px; color: #2a5298; font-weight: bold;
              overflow: hidden;
            }
            .photo-circle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
            .employee-info { text-align: center; margin-bottom: 20px; }
            .employee-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .employee-position { font-size: 14px; opacity: 0.9; margin-bottom: 15px; }
            .employee-details {
              background: rgba(255,255,255,0.1); border-radius: 15px;
              padding: 15px; backdrop-filter: blur(10px);
            }
            .detail-row {
              display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;
            }
            .footer-section {
              position: absolute; bottom: 15px; left: 15px; right: 15px;
              text-align: center; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.2);
              padding-top: 10px;
            }
            .terms-list { list-style: none; padding: 0; font-size: 12px; }
            .terms-list li { margin-bottom: 8px; padding-left: 15px; position: relative; }
            .terms-list li:before { content: '•'; position: absolute; left: 0; }
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-placeholder {
              width: 60px; height: 60px; background: white; margin: 0 auto;
              border-radius: 8px; display: flex; align-items: center; justify-content: center;
              color: black; font-size: 10px; font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="id-card-container">
              <!-- Front -->
              <div class="id-card">
                <div class="card-front">
                  <div class="company-header">
                    <div class="company-name">OPTISTORE PRO</div>
                    <div class="company-slogan">Medical Excellence</div>
                  </div>
                  <div class="photo-section">
                    <div class="photo-circle">
                      ${staff.staffPhoto ? 
                        `<img src="${staff.staffPhoto}" alt="${staff.firstName} ${staff.lastName}" />` : 
                        `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`
                      }
                    </div>
                  </div>
                  <div class="employee-info">
                    <div class="employee-name">${staff.firstName.toUpperCase()} ${staff.lastName.toUpperCase()}</div>
                    <div class="employee-position">${staff.position}</div>
                  </div>
                  <div class="employee-details">
                    <div class="detail-row">
                      <span>ID:</span><span>${staff.staffCode}</span>
                    </div>
                    <div class="detail-row">
                      <span>Email:</span><span>${staff.email || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                      <span>Phone:</span><span>${staff.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                      <span>Dept:</span><span>${staff.department || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="footer-section">
                    123 Vision Street, Eyecare City, EC 12345<br>
                    Phone: (555) 123-4567
                  </div>
                </div>
              </div>
              <!-- Back -->
              <div class="id-card">
                <div class="card-back">
                  <div class="company-header">
                    <div class="company-name">OPTISTORE PRO</div>
                    <div class="company-slogan">Terms & Conditions</div>
                  </div>
                  <ul class="terms-list">
                    <li>Property of OptiStore Pro Medical</li>
                    <li>Must be worn during work hours</li>
                    <li>Report if lost or stolen</li>
                    <li>Valid for employment period only</li>
                    <li>Access permissions subject to role</li>
                  </ul>
                  <div class="qr-section">
                    <div class="qr-placeholder">QR CODE</div>
                  </div>
                  <div style="position: absolute; bottom: 15px; left: 15px; right: 15px; text-align: center; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;">
                    Authorized Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(idCardHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const { data: staff = [] } = useQuery({
    queryKey: ['/api/staff'],
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores']
  });

  const createStaffMutation = useMutation({
    mutationFn: (newStaff: z.infer<typeof insertStaffSchema>) =>
      apiRequest('/api/staff', {
        method: 'POST',
        body: JSON.stringify(newStaff),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
    },
  });

  return (
    <div className="p-6 space-y-6" data-testid="staff-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" data-testid="staff-page-title">Staff Management</h1>
        <Button onClick={() => setOpen(true)} data-testid="button-add-staff">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="input-search-staff"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-photo">Photo</TableHead>
              <TableHead data-testid="header-name">Name</TableHead>
              <TableHead data-testid="header-position">Position</TableHead>
              <TableHead data-testid="header-department">Department</TableHead>
              <TableHead data-testid="header-email">Email</TableHead>
              <TableHead data-testid="header-phone">Phone</TableHead>
              <TableHead data-testid="header-actions">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff
              .filter((s) =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((s) => (
                <TableRow key={s.id} data-testid={`row-staff-${s.id}`}>
                  <TableCell data-testid={`cell-photo-${s.id}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={s.staffPhoto || ''} alt={`${s.firstName} ${s.lastName}`} />
                      <AvatarFallback>{s.firstName.charAt(0)}{s.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell data-testid={`cell-name-${s.id}`}>{s.firstName} {s.lastName}</TableCell>
                  <TableCell data-testid={`cell-position-${s.id}`}>{s.position}</TableCell>
                  <TableCell data-testid={`cell-department-${s.id}`}>{s.department || 'N/A'}</TableCell>
                  <TableCell data-testid={`cell-email-${s.id}`}>{s.email || 'N/A'}</TableCell>
                  <TableCell data-testid={`cell-phone-${s.id}`}>{s.phone || 'N/A'}</TableCell>
                  <TableCell data-testid={`cell-actions-${s.id}`}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(s);
                        }}
                        data-testid={`button-view-${s.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingStaff(s);
                          setEditOpen(true);
                        }}
                        data-testid={`button-edit-${s.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printIDCard(s)}
                        data-testid={`button-id-card-${s.id}`}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}