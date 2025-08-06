import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Shield,
  Clock,
  Award,
  FileText,
  QrCode,
  Download,
  CalendarDays
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  insertStaffSchema, 
  type Staff, 
  type InsertStaff 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import QRCode from "react-qr-code";

// Helper function to auto-generate username
const generateUsername = (firstName: string, lastName: string, existingUsernames: string[] = []) => {
  const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  let username = baseUsername;
  let counter = 1;
  
  while (existingUsernames.includes(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
};

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

  // ID Card print function
  const printIDCard = (staff: Staff) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const idCardHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Card - ${staff.firstName} ${staff.lastName}</title>
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: 'Arial', sans-serif; 
              background: #f0f0f0; 
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .id-card-container {
              display: flex;
              gap: 20px;
            }
            .id-card {
              width: 350px;
              height: 550px;
              background: white;
              border-radius: 20px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              overflow: hidden;
              position: relative;
            }
            .card-front {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #6fa8dc 100%);
              color: white;
              position: relative;
              height: 100%;
            }
            .card-back {
              background: linear-gradient(135deg, #6fa8dc 0%, #2a5298 50%, #1e3c72 100%);
              color: white;
              position: relative;
              height: 100%;
              padding: 30px;
            }
            .blue-curve {
              position: absolute;
              width: 200%;
              height: 200px;
              background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
              border-radius: 50%;
              top: -100px;
              left: -50%;
              transform: rotate(-15deg);
            }
            .company-header {
              text-align: center;
              padding: 30px 20px 20px;
              position: relative;
              z-index: 2;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .company-slogan {
              font-size: 12px;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .photo-section {
              display: flex;
              justify-content: center;
              margin: 20px 0;
              position: relative;
              z-index: 2;
            }
            .photo-circle {
              width: 160px;
              height: 160px;
              border-radius: 50%;
              background: white;
              border: 5px solid rgba(255,255,255,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48px;
              color: #2a5298;
              font-weight: bold;
              box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .employee-info {
              text-align: center;
              padding: 10px 20px 5px 20px;
              position: relative;
              z-index: 2;
            }
            .employee-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .employee-position {
              font-size: 16px;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            .employee-details {
              background: rgba(255,255,255,0.1);
              border-radius: 15px;
              padding: 15px;
              margin: 10px 20px 20px 20px;
              backdrop-filter: blur(10px);
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 12px;
              font-size: 14px;
            }
            .detail-row:last-child {
              margin-bottom: 0;
            }
            .detail-row.address-row {
              flex-direction: row;
              align-items: flex-start;
              margin-bottom: 18px;
            }
            .detail-row.address-row .detail-label {
              min-width: 70px;
              margin-top: 2px;
            }
            .detail-row.address-row .detail-value {
              font-size: 13px;
              line-height: 1.3;
              text-align: right;
              flex: 1;
              max-width: 160px;
              word-break: break-word;
              hyphens: auto;
            }
            .detail-label {
              font-weight: 600;
              opacity: 0.9;
              min-width: 60px;
            }
            .detail-value {
              font-weight: 500;
              text-align: right;
              flex: 1;
            }
            .back-content {
              text-align: left;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #fff;
              border-bottom: 2px solid rgba(255,255,255,0.3);
              padding-bottom: 5px;
            }
            .info-list {
              list-style: none;
              margin-bottom: 25px;
            }
            .info-list li {
              font-size: 12px;
              line-height: 1.6;
              margin-bottom: 8px;
              padding-left: 15px;
              position: relative;
            }
            .info-list li:before {
              content: '▶';
              position: absolute;
              left: 0;
              color: rgba(255,255,255,0.7);
            }
            .qr-section {
              text-align: center;
              margin: 20px 0;
            }
            .qr-code-wrapper {
              background: white;
              border-radius: 10px;
              padding: 15px;
              display: inline-block;
              box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            .signature-area {
              margin-top: 50px;
              text-align: center;
            }
            .signature-line {
              width: 200px;
              height: 1px;
              background: rgba(255,255,255,0.5);
              margin: 20px auto 10px;
            }
            .signature-text {
              font-size: 12px;
              opacity: 0.8;
            }
            @media print {
              body { 
                background: white; 
                padding: 0;
              }
              .id-card-container {
                gap: 10px;
              }
              .id-card {
                box-shadow: none;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="id-card-container">
            <!-- Front of ID Card -->
            <div class="id-card">
              <div class="card-front">
                <div class="blue-curve"></div>
                <div class="company-header">
                  <div class="company-name">OPTISTORE PRO</div>
                  <div class="company-slogan">Medical Excellence</div>
                </div>
                
                <div class="photo-section">
                  <div class="photo-circle">
                    ${staff.staffPhoto ? 
                      `<img src="${staff.staffPhoto}" alt="${staff.firstName} ${staff.lastName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />` :
                      `<span style="font-size: 48px; color: #2a5298; font-weight: bold;">${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}</span>`
                    }
                  </div>
                </div>
                
                <div class="employee-info">
                  <div class="employee-name">${staff.firstName.toUpperCase()} ${staff.lastName.toUpperCase()}</div>
                  <div class="employee-position">${staff.position}</div>
                </div>
                
                <div class="employee-details">
                  <div class="detail-row">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${staff.staffCode}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Blood:</span>
                    <span class="detail-value">${staff.bloodGroup || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${staff.email || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${staff.phone || 'N/A'}</span>
                  </div>
                  <div class="detail-row address-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${staff.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Back of ID Card -->
            <div class="id-card">
              <div class="card-back">
                <div style="text-align: center; padding-top: 60px; margin-bottom: 40px;">
                  <div class="qr-code-wrapper">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=STAFF-${staff.staffCode}-${staff.firstName}-${staff.lastName}-ATTENDANCE" 
                         alt="Staff QR Code" 
                         style="width: 120px; height: 120px;" />
                  </div>
                  <div style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
                    Scan for Attendance
                  </div>
                </div>
                
                <div class="signature-area" style="margin-top: 100px;">
                  <div class="signature-line"></div>
                  <div class="signature-text">Authorized Signature</div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <div class="company-name">OPTISTORE PRO</div>
                  <div style="font-size: 10px; opacity: 0.8; margin-top: 5px;">
                    123 Medical Plaza, Suite 400<br>
                    Healthcare District, City 12345<br>
                    Tel: (555) 123-4567
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(idCardHTML);
    printWindow.document.close();
  };

  // Calculate totals
  const grossSalary = basicSalary + houseAllowance + transportAllowance + medicalAllowance + otherAllowances;
  const totalDeductions = incomeTax + providentFund + healthInsurance + otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  // Generate Staff ID Card function
  const generateStaffIDCard = (staff: any) => {
    const idCardWindow = window.open('', '_blank');
    if (idCardWindow) {
      idCardWindow.document.write(`
        <html>
          <head>
            <title>Staff ID Card - ${staff.firstName} ${staff.lastName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .id-card {
                width: 300px;
                height: 480px;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
                border-radius: 20px;
                padding: 0;
                color: white;
                position: relative;
                box-shadow: 0 20px 40px rgba(37, 99, 235, 0.3);
                margin: 20px auto;
                overflow: hidden;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                padding: 15px;
                border-radius: 12px 12px 0 0;
                margin: -25px -25px 20px -25px;
              }
              .company-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
                line-height: 1.2;
              }
              .company-details {
                font-size: 9px;
                opacity: 0.9;
                margin-bottom: 8px;
                line-height: 1.3;
              }
              .id-title {
                font-size: 12px;
                opacity: 0.9;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .photo-section {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .photo-placeholder {
                width: 80px;
                height: 80px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                border: 3px solid rgba(255,255,255,0.3);
              }
              .qr-section {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
              }
              .info {
                margin-bottom: 15px;
              }
              .name {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 8px;
                text-align: center;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
              }
              .position {
                font-size: 16px;
                margin-bottom: 15px;
                text-align: center;
                font-weight: 500;
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .id-details {
                text-align: left;
                margin-top: 10px;
              }
              .id-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 11px;
              }
              .label {
                font-weight: 600;
                opacity: 0.8;
                width: 50%;
              }
              .value {
                font-weight: 400;
                opacity: 0.9;
                width: 50%;
                text-align: right;
              }
              .details {
                font-size: 13px;
                margin-bottom: 6px;
                opacity: 0.95;
                line-height: 1.3;
              }
              .qr-section {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 15px;
              }
              .qr-placeholder {
                width: 70px;
                height: 70px;
                background: #333;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                text-align: center;
              }
              .footer {
                position: absolute;
                bottom: 10px;
                left: 20px;
                right: 20px;
                text-align: center;
                font-size: 10px;
                opacity: 0.7;
              }
              @media print {
                body { background: white; }
                .id-card { margin: 0; box-shadow: none; }
              }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          </head>
          <body>
            <div class="id-card">
              <div class="header">
                <div class="company-name">OptiStore Pro Medical Center</div>
                <div class="company-details">
                  <div>123 Healthcare Boulevard, Medical District</div>
                  <div>Phone: +1 (555) 123-4567 | Email: info@optistorepro.com</div>
                </div>
                <div class="id-title">Staff Identification Card</div>
              </div>
              
              <div class="photo-section">
                ${staff.staffPhoto ? 
                  `<img src="${staff.staffPhoto}" alt="${staff.firstName} ${staff.lastName}" 
                   style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.3);" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                   <div class="photo-placeholder" style="display: none;">
                     ${staff.firstName?.charAt(0) || ''}${staff.lastName?.charAt(0) || ''}
                   </div>` : 
                  `<div class="photo-placeholder">
                     ${staff.firstName?.charAt(0) || ''}${staff.lastName?.charAt(0) || ''}
                   </div>`
                }
                <div class="qr-section">
                  <canvas id="qr-canvas" width="80" height="80"></canvas>
                </div>
              </div>
              
              <div class="info">
                <div class="name">${staff.firstName} ${staff.lastName}</div>
                <div class="position">${staff.position || 'Staff Member'}</div>
                <div class="id-details">
                  <div class="id-row">
                    <span class="label">Staff ID:</span>
                    <span class="value">${staff.staffCode}</span>
                  </div>
                  <div class="id-row">
                    <span class="label">Employee ID:</span>
                    <span class="value">${staff.employeeId || staff.staffCode}</span>
                  </div>
                  <div class="id-row">
                    <span class="label">Department:</span>
                    <span class="value">${staff.department || 'General'}</span>
                  </div>
                  <div class="id-row">
                    <span class="label">Nationality:</span>
                    <span class="value">${staff.nationality || 'N/A'}</span>
                  </div>
                  <div class="id-row">
                    <span class="label">Phone:</span>
                    <span class="value">${staff.phone || 'N/A'}</span>
                  </div>
                  <div class="id-row">
                    <span class="label">Since:</span>
                    <span class="value">${new Date(staff.hireDate).getFullYear()}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div style="font-weight: 600; margin-bottom: 5px;">OptiStore Pro Medical Center</div>
                <div style="font-size: 8px;">Authorized Personnel Only • Valid ID Required</div>
                <div style="font-size: 8px; margin-top: 3px;">Emergency: +1 (555) 123-4567</div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print ID Card
              </button>
            </div>
            
            <script>
              window.onload = function() {
                try {
                  const canvas = document.getElementById('qr-canvas');
                  if (canvas && window.QRCode) {
                    const staffData = JSON.stringify({
                      staffCode: '${staff.staffCode}',
                      employeeId: '${staff.employeeId || staff.staffCode}',
                      name: '${staff.firstName} ${staff.lastName}',
                      position: '${staff.position}',
                      department: '${staff.department}',
                      phone: '${staff.phone || "N/A"}',
                      bloodGroup: '${staff.bloodGroup || "N/A"}',
                      company: 'OptiStore Pro Medical Center'
                    });
                    QRCode.toCanvas(canvas, staffData, { 
                      width: 76, 
                      height: 76, 
                      margin: 2, 
                      color: { dark: '#000000', light: '#ffffff' },
                      errorCorrectionLevel: 'M'
                    });
                  } else {
                    // Fallback if QRCode library not loaded
                    const canvas = document.getElementById('qr-canvas');
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      ctx.fillStyle = '#333';
                      ctx.fillRect(0, 0, 80, 80);
                      ctx.fillStyle = '#fff';
                      ctx.font = '10px Arial';
                      ctx.textAlign = 'center';
                      ctx.fillText('QR CODE', 40, 40);
                    }
                  }
                } catch (e) {
                  console.error('QR Code generation failed:', e);
                  // Fallback display
                  const canvas = document.getElementById('qr-canvas');
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, 0, 80, 80);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('QR CODE', 40, 40);
                  }
                }
              };
            </script>
          </body>
        </html>
      `);
      idCardWindow.document.close();
    }
    
    toast({
      title: "ID Card Generated",
      description: `Staff ID card for ${staff.firstName} ${staff.lastName} is ready`,
    });
  };

  // Auto-generate credentials
  const handleGenerateCredentials = (firstName: string, lastName: string) => {
    const existingUsernames = mockStaffData.map(staff => staff.username).filter(Boolean);
    const username = generateUsername(firstName, lastName, existingUsernames);
    const password = generatePassword(12);
    
    setGeneratedCredentials({ username, password });
    
    toast({
      title: "Credentials Generated",
      description: `Username: ${username} | Password: ${password}`,
    });
  };

  // Mock staff data for development with enhanced fields
  const mockStaffData = [
    {
      id: "STF-001",
      staffCode: "STF-001",
      firstName: "Dr. Sarah",
      lastName: "Smith",
      email: "sarah.smith@optistorepro.com",
      phone: "+1-555-0101",
      address: "123 Medical Center Dr, City, State 12345",
      position: "Ophthalmologist",
      department: "Eye Care",
      hireDate: "2023-01-15",
      status: "active",
      role: "doctor",
      permissions: ["view_patients", "edit_medical_records", "prescribe"],
      username: "dr.sarah.smith",
      password: "hashed_password_here",
      minimumWorkingHours: 8.00,
      dailyWorkingHours: 9.00,
      bloodGroup: "O+",
      staffPhoto: "/api/placeholder/150/150",
      documents: [
        { name: "Medical License", url: "/documents/license.pdf", type: "license", uploadDate: "2023-01-10" },
        { name: "CV", url: "/documents/cv.pdf", type: "resume", uploadDate: "2023-01-10" }
      ],
      customFields: {
        licenseNumber: "MD-12345",
        specialization: "Retinal Surgery",
        yearsExperience: "12"
      }
    },
    {
      id: "STF-002", 
      staffCode: "STF-002",
      firstName: "John",
      lastName: "Johnson",
      email: "john.johnson@optistorepro.com",
      phone: "+1-555-0102",
      address: "456 Healthcare Ave, City, State 12345",
      position: "Optometrist",
      department: "Vision Care",
      hireDate: "2023-03-20",
      status: "active",
      role: "doctor",
      permissions: ["view_patients", "edit_prescriptions"],
      customFields: {
        licenseNumber: "OD-67890",
        specialization: "Contact Lenses",
        yearsExperience: "8"
      }
    },
    {
      id: "STF-003",
      staffCode: "STF-003", 
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@optistorepro.com",
      phone: "+1-555-0103",
      address: "789 Medical Plaza, City, State 12345",
      position: "Technician",
      department: "Diagnostics",
      hireDate: "2023-06-10",
      status: "active",
      role: "staff",
      permissions: ["view_patients", "run_diagnostics"],
      customFields: {
        certification: "COT-2023",
        specialization: "OCT Imaging",
        yearsExperience: "5"
      }
    },
    {
      id: "STF-004",
      staffCode: "STF-004",
      firstName: "Michael",
      lastName: "Brown", 
      email: "michael.brown@optistorepro.com",
      phone: "+1-555-0104",
      address: "321 Vision Center Blvd, City, State 12345",
      position: "Manager",
      department: "Administration",
      hireDate: "2022-09-05",
      status: "active",
      role: "manager",
      permissions: ["view_all", "edit_all", "manage_staff"],
      customFields: {
        certification: "MBA-Healthcare",
        specialization: "Operations Management",
        yearsExperience: "15"
      }
    }
  ];

  const { data: staffListFromAPI = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    retry: 3,
    retryDelay: 1000,
  });

  // Use API data if available, fallback to mock data only if API fails completely
  const staffList = Array.isArray(staffListFromAPI) && staffListFromAPI.length > 0 ? staffListFromAPI : mockStaffData;

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  const form = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      staffCode: `STF-${Date.now().toString().slice(-6)}`,
      employeeId: `EMP-${Date.now().toString().slice(-6)}`, // Auto-generate Employee ID
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      hireDate: format(new Date(), 'yyyy-MM-dd'),
      status: "active",
      role: "staff",
      permissions: [],
      customFields: {},
    },
  });

  const editForm = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      staffCode: "",
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      hireDate: "",
      status: "active",
      role: "staff",
      permissions: [],
      customFields: {},
      nationality: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  // Set edit form values when editing staff is selected
  React.useEffect(() => {
    if (editingStaff) {
      editForm.reset({
        staffCode: editingStaff.staffCode || "",
        employeeId: editingStaff.employeeId || editingStaff.staffCode || "",
        firstName: editingStaff.firstName || "",
        lastName: editingStaff.lastName || "",
        email: editingStaff.email || "",
        phone: editingStaff.phone || "",
        address: editingStaff.address || "",
        position: editingStaff.position || "",
        department: editingStaff.department || "",
        hireDate: editingStaff.hireDate || "",
        role: editingStaff.role || "staff",
        status: editingStaff.status || "active",
        permissions: editingStaff.permissions || [],
        customFields: editingStaff.customFields || {},
        nationality: editingStaff.nationality || "",
        dateOfBirth: editingStaff.dateOfBirth || "",
        gender: editingStaff.gender || "",
      });
    }
  }, [editingStaff, editForm]);

  const createStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      await apiRequest("POST", "/api/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member added successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add staff member.",
        variant: "destructive",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff & { id: string }) => {
      await apiRequest("PUT", `/api/staff/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Staff member updated successfully.",
      });
      setEditOpen(false);
      setEditingStaff(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update staff member.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStaff) => {
    createStaffMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertStaff) => {
    if (editingStaff?.id) {
      updateStaffMutation.mutate({ ...data, id: editingStaff.id });
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Staff</p>
                    <p className="text-2xl font-bold text-slate-900">{staffList.length}</p>
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <Activity className="h-3 w-3 mr-1" />
                      All employees
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Staff</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {staffList.filter(s => s.status === 'active').length}
                    </p>
                    <p className="text-xs text-slate-500">Currently working</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Activity className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Managers</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {staffList.filter(s => s.role === 'manager').length}
                    </p>
                    <p className="text-xs text-slate-500">Leadership roles</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">New Hires</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {staffList.filter(s => {
                        const hireDate = new Date(s.hireDate);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return hireDate >= thirtyDaysAgo;
                      }).length}
                    </p>
                    <p className="text-xs text-slate-500">Last 30 days</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Award className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="employment">Employment</TabsTrigger>
                        <TabsTrigger value="contact">Contact Details</TabsTrigger>
                        <TabsTrigger value="access">Access & Permissions</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll & Documents</TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="staffCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Staff Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employee ID</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bloodGroup"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Blood Group</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="employment" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="optometrist">Optometrist</SelectItem>
                                    <SelectItem value="nurse">Nurse</SelectItem>
                                    <SelectItem value="technician">Technician</SelectItem>
                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                    <SelectItem value="lab_technician">Lab Technician</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="assistant_manager">Assistant Manager</SelectItem>
                                    <SelectItem value="sales_associate">Sales Associate</SelectItem>
                                    <SelectItem value="inventory_manager">Inventory Manager</SelectItem>
                                    <SelectItem value="cashier">Cashier</SelectItem>
                                    <SelectItem value="admin_staff">Administrative Staff</SelectItem>
                                    <SelectItem value="customer_service">Customer Service</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Eye Care">Eye Care</SelectItem>
                                    <SelectItem value="Vision Care">Vision Care</SelectItem>
                                    <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                                    <SelectItem value="Administration">Administration</SelectItem>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                                    <SelectItem value="Inventory">Inventory</SelectItem>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                                    <SelectItem value="IT Support">IT Support</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="storeId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Store Assignment</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select store" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {(stores as any[]).map((store: any) => (
                                      <SelectItem key={store.id} value={store.id}>
                                        {store.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hireDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hire Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Employment Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="contact" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter complete address..."
                                  className="min-h-[80px]"
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Name</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>


                      </TabsContent>

                      <TabsContent value="access" className="space-y-4">
                        {/* Login Credentials Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              Login Credentials
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Username (Auto-generated)</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    value={generatedCredentials?.username || ""} 
                                    placeholder="Username will be auto-generated"
                                    readOnly
                                    className="bg-gray-50"
                                  />
                                  <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const firstName = form.getValues("firstName");
                                      const lastName = form.getValues("lastName");
                                      if (firstName && lastName) {
                                        handleGenerateCredentials(firstName, lastName);
                                      } else {
                                        toast({
                                          title: "Missing Information",
                                          description: "Please enter first and last name first",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  >
                                    Generate
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label>Password (Auto-generated)</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    type="password"
                                    value={generatedCredentials?.password || ""} 
                                    placeholder="Password will be auto-generated"
                                    readOnly
                                    className="bg-gray-50"
                                  />
                                  <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      if (generatedCredentials?.password) {
                                        navigator.clipboard.writeText(generatedCredentials.password);
                                        toast({
                                          title: "Password Copied",
                                          description: "Password copied to clipboard"
                                        });
                                      }
                                    }}
                                  >
                                    Copy
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {generatedCredentials && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Generated Credentials:</strong><br/>
                                  Username: <code className="bg-blue-100 px-1 rounded">{generatedCredentials.username}</code><br/>
                                  Password: <code className="bg-blue-100 px-1 rounded">{generatedCredentials.password}</code>
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Please save these credentials securely. The password should be changed after first login.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Access Permissions Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              Access Permissions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                      <SelectItem value="doctor">Doctor</SelectItem>
                                      <SelectItem value="nurse">Nurse</SelectItem>
                                      <SelectItem value="technician">Technician</SelectItem>
                                      <SelectItem value="receptionist">Receptionist</SelectItem>
                                      <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div>
                              <Label className="text-base font-medium">Module Permissions</Label>
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                {[
                                  { key: "view_patients", label: "View Patients" },
                                  { key: "edit_patients", label: "Edit Patients" },
                                  { key: "view_appointments", label: "View Appointments" },
                                  { key: "edit_appointments", label: "Edit Appointments" },
                                  { key: "view_inventory", label: "View Inventory" },
                                  { key: "edit_inventory", label: "Edit Inventory" },
                                  { key: "view_sales", label: "View Sales" },
                                  { key: "edit_sales", label: "Edit Sales" },
                                  { key: "view_reports", label: "View Reports" },
                                  { key: "edit_reports", label: "Edit Reports" },
                                  { key: "manage_staff", label: "Manage Staff" },
                                  { key: "system_settings", label: "System Settings" }
                                ].map((permission) => (
                                  <div key={permission.key} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={permission.key}
                                      className="rounded border-gray-300"
                                      onChange={(e) => {
                                        const currentPermissions = form.getValues("permissions") || [];
                                        if (e.target.checked) {
                                          form.setValue("permissions", [...currentPermissions, permission.key]);
                                        } else {
                                          form.setValue("permissions", currentPermissions.filter(p => p !== permission.key));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={permission.key} className="text-sm font-normal cursor-pointer">
                                      {permission.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="payroll" className="space-y-6">
                        {/* Photo Upload Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Photo & Documents</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Staff Photo</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                     onClick={() => document.getElementById('photo-upload')?.click()}>
                                  <User className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">Click to upload photo</p>
                                  <input 
                                    id="photo-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        toast({
                                          title: "Photo uploaded",
                                          description: `Selected: ${file.name}`,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Qualification Documents</Label>
                                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                     onClick={() => document.getElementById('docs-upload')?.click()}>
                                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">Upload certificates, degrees</p>
                                  <input 
                                    id="docs-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx" 
                                    multiple
                                    onChange={(e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) {
                                        toast({
                                          title: "Documents uploaded",
                                          description: `Selected ${files.length} file(s)`,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Appointment Letter</Label>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                   onClick={() => document.getElementById('appointment-upload')?.click()}>
                                <FileText className="mx-auto h-12 w-12 text-blue-400" />
                                <p className="mt-2 text-sm text-gray-500">Upload appointment letter</p>
                                <input 
                                  id="appointment-upload"
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      toast({
                                        title: "Appointment letter uploaded",
                                        description: `Selected: ${file.name}`,
                                      });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Salary & Benefits Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Salary & Benefits</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Basic Salary</Label>
                                <Input 
                                  type="number" 
                                  value={basicSalary || ""} 
                                  onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                                  placeholder="50000" 
                                />
                              </div>
                              <div>
                                <Label>House Allowance</Label>
                                <Input 
                                  type="number" 
                                  value={houseAllowance || ""} 
                                  onChange={(e) => setHouseAllowance(Number(e.target.value) || 0)}
                                  placeholder="15000" 
                                />
                              </div>
                              <div>
                                <Label>Transport Allowance</Label>
                                <Input 
                                  type="number" 
                                  value={transportAllowance || ""} 
                                  onChange={(e) => setTransportAllowance(Number(e.target.value) || 0)}
                                  placeholder="8000" 
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Medical Allowance</Label>
                                <Input 
                                  type="number" 
                                  value={medicalAllowance || ""} 
                                  onChange={(e) => setMedicalAllowance(Number(e.target.value) || 0)}
                                  placeholder="5000" 
                                />
                              </div>
                              <div>
                                <Label>Other Allowances</Label>
                                <Input 
                                  type="number" 
                                  value={otherAllowances || ""} 
                                  onChange={(e) => setOtherAllowances(Number(e.target.value) || 0)}
                                  placeholder="2000" 
                                />
                              </div>
                              <div>
                                <Label>Total Gross Salary</Label>
                                <Input 
                                  type="number" 
                                  value={grossSalary} 
                                  disabled 
                                  className="bg-green-100 font-semibold" 
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Deductions Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Deductions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Income Tax</Label>
                                <Input 
                                  type="number" 
                                  value={incomeTax || ""} 
                                  onChange={(e) => setIncomeTax(Number(e.target.value) || 0)}
                                  placeholder="8000" 
                                />
                              </div>
                              <div>
                                <Label>Provident Fund</Label>
                                <Input 
                                  type="number" 
                                  value={providentFund || ""} 
                                  onChange={(e) => setProvidentFund(Number(e.target.value) || 0)}
                                  placeholder="4000" 
                                />
                              </div>
                              <div>
                                <Label>Health Insurance</Label>
                                <Input 
                                  type="number" 
                                  value={healthInsurance || ""} 
                                  onChange={(e) => setHealthInsurance(Number(e.target.value) || 0)}
                                  placeholder="2000" 
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Other Deductions</Label>
                                <Input 
                                  type="number" 
                                  value={otherDeductions || ""} 
                                  onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                                  placeholder="1000" 
                                />
                              </div>
                              <div>
                                <Label>Total Deductions</Label>
                                <Input 
                                  type="number" 
                                  value={totalDeductions} 
                                  disabled 
                                  className="bg-red-100 font-semibold" 
                                />
                              </div>
                              <div>
                                <Label>Net Salary</Label>
                                <Input 
                                  type="number" 
                                  value={netSalary} 
                                  disabled 
                                  className="bg-green-200 font-bold text-green-800" 
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Working Hours */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Working Hours & Payroll Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Minimum Working Hours (per day)</Label>
                                <Input 
                                  type="number" 
                                  placeholder="8" 
                                  min="1"
                                  max="24"
                                />
                                <p className="text-xs text-gray-500 mt-1">Hours per day</p>
                              </div>
                              <div>
                                <Label>Daily Working Hours (standard)</Label>
                                <Input 
                                  type="number" 
                                  placeholder="8" 
                                  min="1"
                                  max="24"
                                />
                                <p className="text-xs text-gray-500 mt-1">Standard hours</p>
                              </div>
                              <div>
                                <Label>Store Opening Hours</Label>
                                <Input 
                                  type="text" 
                                  placeholder="9:00 AM - 6:00 PM" 
                                  disabled
                                  className="bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">From store settings</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Overtime Rate</Label>
                                <Input 
                                  type="number" 
                                  placeholder="1.5" 
                                  step="0.1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Multiplier for overtime</p>
                              </div>
                              <div>
                                <Label>Double Time Rate</Label>
                                <Input 
                                  type="number" 
                                  placeholder="2.0" 
                                  step="0.1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Multiplier for double time</p>
                              </div>
                              <div>
                                <Label>Undertime Deduction</Label>
                                <Input 
                                  type="number" 
                                  placeholder="0.5" 
                                  step="0.1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Multiplier for undertime</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Leave Management Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Leave Entitlements</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label>Annual Leave</Label>
                                <Input type="number" placeholder="30" />
                                <p className="text-xs text-gray-500 mt-1">Days per year</p>
                              </div>
                              <div>
                                <Label>Sick Leave</Label>
                                <Input type="number" placeholder="15" />
                                <p className="text-xs text-gray-500 mt-1">Days per year</p>
                              </div>
                              <div>
                                <Label>Casual Leave</Label>
                                <Input type="number" placeholder="10" />
                                <p className="text-xs text-gray-500 mt-1">Days per year</p>
                              </div>
                              <div>
                                <Label>Maternity/Paternity</Label>
                                <Input type="number" placeholder="90" />
                                <p className="text-xs text-gray-500 mt-1">Days</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createStaffMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Staff Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No staff members found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm ? "Try adjusting your search criteria." : "Add your first staff member to get started."}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{staff.staffCode}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={staff.staffPhoto} alt={`${staff.firstName} ${staff.lastName}`} />
                                <AvatarFallback className="text-xs">
                                  {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{staff.firstName} {staff.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{staff.position}</span>
                              {staff.department && (
                                <span className="text-slate-500 block">{staff.department}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {staff.phone && (
                                <div className="flex items-center space-x-1 text-sm">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>{staff.phone}</span>
                                </div>
                              )}
                              {staff.email && (
                                <div className="flex items-center space-x-1 text-sm">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span>{staff.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(staff.role)}>
                              {staff.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(staff.status)}>
                              {staff.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {format(new Date(staff.hireDate), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStaff(staff)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingStaff(staff);
                                  setEditOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => printIDCard(staff)}
                                title="Generate ID Card"
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Staff View Dialog */}
      {selectedStaff && (
        <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Staff Profile - {selectedStaff.firstName} {selectedStaff.lastName}</span>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleBadgeColor(selectedStaff.role)}>
                    {selectedStaff.role}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printIDCard(selectedStaff)}
                      title="Generate ID Card"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingStaff(selectedStaff);
                        setEditOpen(true);
                      }}
                      title="Edit Staff"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      title="Print Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Photo and QR Section */}
              <div className="col-span-1 space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {selectedStaff.staffPhoto ? (
                      <img 
                        src={selectedStaff.staffPhoto} 
                        alt={`${selectedStaff.firstName} ${selectedStaff.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken image and show fallback
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                      style={{ display: selectedStaff.staffPhoto ? 'none' : 'flex' }}
                    >
                      <span className="text-white font-bold text-xl">
                        {selectedStaff.firstName?.charAt(0) || ''}{selectedStaff.lastName?.charAt(0) || ''}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                  <p className="text-sm text-slate-600">{selectedStaff.position}</p>
                  <Badge className={getRoleBadgeColor(selectedStaff.role)} style={{ marginTop: '8px' }}>
                    {selectedStaff.role}
                  </Badge>
                </div>
                
                <div className="bg-white p-4 rounded-lg border text-center">
                  <h4 className="font-medium mb-2">Staff QR Code</h4>
                  <div className="w-24 h-24 bg-gray-100 rounded mx-auto flex items-center justify-center">
                    <QRCode
                      value={`${window.location.origin}/staff?view=${selectedStaff.id}`}
                      size={80}
                      level="L"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Scan for staff info</p>
                  
                  <div className="flex space-x-1 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const staffInfo = `Name: ${selectedStaff.firstName} ${selectedStaff.lastName}\nPosition: ${selectedStaff.position}\nDepartment: ${selectedStaff.department}\nPhone: ${selectedStaff.phone}\nEmail: ${selectedStaff.email}`;
                        navigator.clipboard.writeText(staffInfo);
                        toast({ title: "Copied to clipboard", description: "Staff info copied successfully" });
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateStaffIDCard(selectedStaff)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const printWindow = window.open('', '_blank', 'width=900,height=700');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Staff Information - ${selectedStaff.firstName} ${selectedStaff.lastName}</title>
                                <style>
                                  @page { size: A4; margin: 2cm; }
                                  body { 
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                    margin: 0; padding: 20px; 
                                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                                    color: #333;
                                  }
                                  .header {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    padding: 30px;
                                    border-radius: 15px;
                                    text-align: center;
                                    margin-bottom: 30px;
                                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                                  }
                                  .company-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                                  .document-title { font-size: 18px; opacity: 0.9; }
                                  .content {
                                    background: white;
                                    padding: 40px;
                                    border-radius: 15px;
                                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                                    margin-bottom: 20px;
                                  }
                                  .staff-photo {
                                    width: 120px; height: 120px;
                                    background: linear-gradient(135deg, #667eea, #764ba2);
                                    border-radius: 50%;
                                    display: flex; align-items: center; justify-content: center;
                                    color: white; font-size: 40px;
                                    margin: 0 auto 30px auto;
                                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
                                  }
                                  .staff-name {
                                    text-align: center;
                                    font-size: 32px;
                                    font-weight: bold;
                                    color: #667eea;
                                    margin-bottom: 10px;
                                  }
                                  .staff-position {
                                    text-align: center;
                                    font-size: 18px;
                                    color: #764ba2;
                                    margin-bottom: 40px;
                                    font-weight: 500;
                                  }
                                  .info-grid {
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 30px;
                                    margin-bottom: 30px;
                                  }
                                  .info-section {
                                    background: #f8f9ff;
                                    padding: 25px;
                                    border-radius: 12px;
                                    border-left: 5px solid #667eea;
                                  }
                                  .info-section h3 {
                                    color: #667eea;
                                    font-size: 18px;
                                    margin-bottom: 20px;
                                    font-weight: 600;
                                  }
                                  .info-item {
                                    margin-bottom: 15px;
                                    display: flex;
                                    align-items: center;
                                  }
                                  .info-label {
                                    font-weight: 600;
                                    color: #555;
                                    width: 140px;
                                    flex-shrink: 0;
                                  }
                                  .info-value {
                                    color: #333;
                                    flex: 1;
                                  }
                                  .footer {
                                    text-align: center;
                                    color: #666;
                                    font-size: 14px;
                                    margin-top: 30px;
                                    padding: 20px;
                                    border-top: 2px solid #eee;
                                  }
                                  .print-date {
                                    text-align: right;
                                    color: #999;
                                    font-size: 12px;
                                    margin-bottom: 20px;
                                  }
                                  @media print {
                                    body { background: white !important; }
                                    .header, .content { box-shadow: none !important; }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="print-date">Generated on: ${new Date().toLocaleDateString()}</div>
                                
                                <div class="header">
                                  <div class="company-name">OptiStore Pro Medical Center</div>
                                  <div class="document-title">Staff Information Report</div>
                                </div>
                                
                                <div class="content">
                                  <div class="staff-photo">👤</div>
                                  <div class="staff-name">${selectedStaff.firstName} ${selectedStaff.lastName}</div>
                                  <div class="staff-position">${selectedStaff.position || 'Staff Member'} - ${selectedStaff.department || 'General'}</div>
                                  
                                  <div class="info-grid">
                                    <div class="info-section">
                                      <h3>Personal Information</h3>
                                      <div class="info-item">
                                        <span class="info-label">Staff Code:</span>
                                        <span class="info-value">${selectedStaff.staffCode}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Employee ID:</span>
                                        <span class="info-value">${selectedStaff.employeeId || selectedStaff.staffCode}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Date of Birth:</span>
                                        <span class="info-value">${selectedStaff.dateOfBirth || 'Not provided'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Gender:</span>
                                        <span class="info-value">${selectedStaff.gender || 'Not specified'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Blood Group:</span>
                                        <span class="info-value">${selectedStaff.bloodGroup || 'Not provided'}</span>
                                      </div>
                                    </div>
                                    
                                    <div class="info-section">
                                      <h3>Contact Information</h3>
                                      <div class="info-item">
                                        <span class="info-label">Phone:</span>
                                        <span class="info-value">${selectedStaff.phone || 'Not provided'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">${selectedStaff.email || 'Not provided'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Address:</span>
                                        <span class="info-value">${selectedStaff.address || 'Not provided'}</span>
                                      </div>
                                    </div>
                                    
                                    <div class="info-section">
                                      <h3>Employment Details</h3>
                                      <div class="info-item">
                                        <span class="info-label">Position:</span>
                                        <span class="info-value">${selectedStaff.position || 'Not specified'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Department:</span>
                                        <span class="info-value">${selectedStaff.department || 'Not specified'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Hire Date:</span>
                                        <span class="info-value">${selectedStaff.hireDate ? new Date(selectedStaff.hireDate).toLocaleDateString() : 'Not provided'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Status:</span>
                                        <span class="info-value">${selectedStaff.status || 'Active'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Role:</span>
                                        <span class="info-value">${selectedStaff.role || 'Staff'}</span>
                                      </div>
                                    </div>
                                    
                                    <div class="info-section">
                                      <h3>Additional Information</h3>
                                      <div class="info-item">
                                        <span class="info-label">Salary:</span>
                                        <span class="info-value">${selectedStaff.salary ? '$' + selectedStaff.salary.toLocaleString() : 'Confidential'}</span>
                                      </div>
                                      <div class="info-item">
                                        <span class="info-label">Years of Service:</span>
                                        <span class="info-value">${selectedStaff.hireDate ? new Date().getFullYear() - new Date(selectedStaff.hireDate).getFullYear() : 'N/A'} years</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div class="footer">
                                  <p><strong>OptiStore Pro Medical Center</strong></p>
                                  <p>123 Healthcare Boulevard, Medical District | Phone: +1 (555) 123-4567</p>
                                  <p>This document contains confidential information and is intended for authorized personnel only.</p>
                                </div>
                                
                                <script>
                                  window.onload = function() {
                                    setTimeout(function() {
                                      window.print();
                                    }, 500);
                                  }
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-span-1 space-y-4">
                <h4 className="font-semibold text-slate-900 border-b pb-2">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Staff Code</Label>
                    <p className="font-mono bg-gray-50 p-2 rounded">{selectedStaff.staffCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Employee ID</Label>
                    <p className="font-mono bg-gray-50 p-2 rounded">{selectedStaff.employeeId || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Blood Group</Label>
                    <p className="bg-red-50 p-2 rounded text-red-700 font-medium">{selectedStaff.bloodGroup || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                    <p>{selectedStaff.dateOfBirth ? format(new Date(selectedStaff.dateOfBirth), 'MMMM dd, yyyy') : 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Gender</Label>
                    <p className="capitalize">{selectedStaff.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Nationality</Label>
                    <p>{selectedStaff.nationality || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Employment & Contact */}
              <div className="col-span-1 space-y-4">
                <h4 className="font-semibold text-slate-900 border-b pb-2">Employment & Contact</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Department</Label>
                    <p className="bg-blue-50 p-2 rounded text-blue-700">{selectedStaff.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Status</Label>
                    <Badge className={getStatusBadgeColor(selectedStaff.status)}>
                      {selectedStaff.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Hire Date</Label>
                    <p className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{format(new Date(selectedStaff.hireDate), 'MMMM dd, yyyy')}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Phone</Label>
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{selectedStaff.phone || 'Not provided'}</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Email</Label>
                    <p className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm break-all">{selectedStaff.email || 'Not provided'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <Tabs defaultValue="additional" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="additional">Additional Info</TabsTrigger>
                  <TabsTrigger value="salary">Salary Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="leave">Leave & Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="additional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Address</Label>
                        <p className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                          <span>{selectedStaff.address || 'Not provided'}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Emergency Contact</Label>
                        <p>{selectedStaff.emergencyContactName || 'Not provided'}</p>
                        {selectedStaff.emergencyContactPhone && (
                          <p className="text-sm text-slate-500">{selectedStaff.emergencyContactPhone}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Bank Details</Label>
                        <p className="text-sm">{selectedStaff.bankName || 'Not provided'}</p>
                        {selectedStaff.bankAccountNumber && (
                          <p className="text-sm font-mono">{selectedStaff.bankAccountNumber}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">NID Number</Label>
                        <p className="font-mono">{selectedStaff.nidNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="salary" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Label className="text-sm font-medium text-green-600">Basic Salary</Label>
                      <p className="text-2xl font-bold text-green-700">₹{selectedStaff.salary || '50,000'}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Label className="text-sm font-medium text-blue-600">Allowances</Label>
                      <p className="text-2xl font-bold text-blue-700">₹{(selectedStaff.salary || 50000) * 0.3}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Label className="text-sm font-medium text-purple-600">Net Salary</Label>
                      <p className="text-2xl font-bold text-purple-700">₹{(selectedStaff.salary || 50000) * 1.2}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Photo ID Document */}
                    <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-800">Photo ID</p>
                          <p className="text-sm text-green-600">NID_DrSmitaGhosh.pdf</p>
                          <p className="text-xs text-green-500">Uploaded: Jan 15, 2024</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-300 hover:bg-green-100"
                          onClick={() => {
                            // Simulate opening a document viewer
                            const documentWindow = window.open('', '_blank');
                            if (documentWindow) {
                              documentWindow.document.write(`
                                <html>
                                  <head><title>NID Document - Dr. Smita Ghosh</title></head>
                                  <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                                    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                      <h2 style="color: #2563eb; margin-bottom: 20px;">📄 Photo ID Document</h2>
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                                        <h3>National ID Card</h3>
                                        <p><strong>Name:</strong> Dr. Smita Ghosh</p>
                                        <p><strong>NID Number:</strong> 1234567890123</p>
                                        <p><strong>Date of Birth:</strong> January 15, 1985</p>
                                        <p><strong>Issue Date:</strong> March 10, 2020</p>
                                        <p><strong>Expiry Date:</strong> March 10, 2030</p>
                                      </div>
                                      <div style="text-align: center; padding: 20px; background: #ecfdf5; border-radius: 6px;">
                                        <p style="color: #059669; font-weight: bold;">✓ Document Verified</p>
                                        <p style="color: #6b7280; font-size: 14px;">Uploaded: January 15, 2024</p>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              documentWindow.document.close();
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Qualification Certificates */}
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">Qualification Certificates</p>
                          <p className="text-sm text-blue-600">MBBS_Certificate.pdf</p>
                          <p className="text-sm text-blue-600">MD_Ophthalmology.pdf</p>
                          <p className="text-xs text-blue-500">2 files • Latest: Dec 8, 2023</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                          onClick={() => {
                            // Simulate opening qualification documents viewer
                            const documentWindow = window.open('', '_blank');
                            if (documentWindow) {
                              documentWindow.document.write(`
                                <html>
                                  <head><title>Qualification Certificates - Dr. Smita Ghosh</title></head>
                                  <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                                    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                      <h2 style="color: #2563eb; margin-bottom: 20px;">🎓 Qualification Certificates</h2>
                                      
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 15px;">
                                        <h3>MBBS Certificate</h3>
                                        <p><strong>Institution:</strong> All India Institute of Medical Sciences (AIIMS)</p>
                                        <p><strong>Year of Graduation:</strong> 2008</p>
                                        <p><strong>Specialization:</strong> Bachelor of Medicine, Bachelor of Surgery</p>
                                        <p><strong>Grade:</strong> First Class with Distinction</p>
                                      </div>
                                      
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                                        <h3>MD Ophthalmology Certificate</h3>
                                        <p><strong>Institution:</strong> Post Graduate Institute of Medical Education and Research</p>
                                        <p><strong>Year of Completion:</strong> 2011</p>
                                        <p><strong>Specialization:</strong> Doctor of Medicine in Ophthalmology</p>
                                        <p><strong>Thesis:</strong> "Advanced Retinal Surgery Techniques"</p>
                                      </div>
                                      
                                      <div style="text-align: center; padding: 20px; background: #ecfdf5; border-radius: 6px;">
                                        <p style="color: #059669; font-weight: bold;">✓ All Certificates Verified</p>
                                        <p style="color: #6b7280; font-size: 14px;">Latest Upload: December 8, 2023</p>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              documentWindow.document.close();
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Appointment Letter */}
                    <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">Appointment Letter</p>
                          <p className="text-sm text-purple-600">Employment_Contract_2024.pdf</p>
                          <p className="text-xs text-purple-500">Updated: March 12, 2024</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-purple-600 border-purple-300 hover:bg-purple-100"
                          onClick={() => {
                            // Simulate opening appointment letter viewer
                            const documentWindow = window.open('', '_blank');
                            if (documentWindow) {
                              documentWindow.document.write(`
                                <html>
                                  <head><title>Employment Contract - Dr. Smita Ghosh</title></head>
                                  <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                                    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                      <h2 style="color: #2563eb; margin-bottom: 20px;">📋 Employment Contract</h2>
                                      
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 15px;">
                                        <h3>OptiStore Pro Medical Center</h3>
                                        <p><strong>Employee:</strong> Dr. Smita Ghosh</p>
                                        <p><strong>Position:</strong> Senior Ophthalmologist</p>
                                        <p><strong>Department:</strong> Eye Care</p>
                                        <p><strong>Contract Start Date:</strong> March 12, 2024</p>
                                        <p><strong>Employment Type:</strong> Full-time Permanent</p>
                                        <p><strong>Reporting Manager:</strong> Dr. Sarah Johnson (Medical Director)</p>
                                      </div>
                                      
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                                        <h3>Terms & Conditions</h3>
                                        <p><strong>Salary:</strong> ₹85,000 per month</p>
                                        <p><strong>Working Hours:</strong> 40 hours per week</p>
                                        <p><strong>Annual Leave:</strong> 24 days</p>
                                        <p><strong>Medical Benefits:</strong> Comprehensive health insurance</p>
                                        <p><strong>Notice Period:</strong> 90 days</p>
                                      </div>
                                      
                                      <div style="text-align: center; padding: 20px; background: #ecfdf5; border-radius: 6px;">
                                        <p style="color: #059669; font-weight: bold;">✓ Contract Active</p>
                                        <p style="color: #6b7280; font-size: 14px;">Last Updated: March 12, 2024</p>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              documentWindow.document.close();
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Medical Records */}
                    <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-orange-800">Medical Records</p>
                          <p className="text-sm text-orange-600">Health_Checkup_2024.pdf</p>
                          <p className="text-xs text-orange-500">Updated: Feb 20, 2024</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-orange-600 border-orange-300 hover:bg-orange-100"
                          onClick={() => {
                            // Simulate opening medical records viewer
                            const documentWindow = window.open('', '_blank');
                            if (documentWindow) {
                              documentWindow.document.write(`
                                <html>
                                  <head><title>Medical Records - Dr. Smita Ghosh</title></head>
                                  <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                                    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                      <h2 style="color: #2563eb; margin-bottom: 20px;">🏥 Medical Health Records</h2>
                                      
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 15px;">
                                        <h3>Annual Health Checkup 2024</h3>
                                        <p><strong>Date:</strong> February 20, 2024</p>
                                        <p><strong>Medical Officer:</strong> Dr. Robert Smith</p>
                                        <p><strong>Blood Group:</strong> O+</p>
                                        <p><strong>Height:</strong> 165 cm</p>
                                        <p><strong>Weight:</strong> 58 kg</p>
                                        <p><strong>Blood Pressure:</strong> 120/80 mmHg</p>
                                        <p><strong>Overall Health:</strong> Excellent</p>
                                      </div>
                                      
                                      <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                                        <h3>Vaccination Records</h3>
                                        <p><strong>COVID-19:</strong> Fully Vaccinated (Booster: Dec 2023)</p>
                                        <p><strong>Hepatitis B:</strong> Up to date</p>
                                        <p><strong>Influenza:</strong> Annual vaccination current</p>
                                        <p><strong>Next Due:</strong> Annual checkup - February 2025</p>
                                      </div>
                                      
                                      <div style="text-align: center; padding: 20px; background: #ecfdf5; border-radius: 6px;">
                                        <p style="color: #059669; font-weight: bold;">✓ Medical Clearance Valid</p>
                                        <p style="color: #6b7280; font-size: 14px;">Last Updated: February 20, 2024</p>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              documentWindow.document.close();
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Document Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Document Summary</p>
                        <p className="text-sm text-gray-600">All required documents are uploaded and verified</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download All
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="leave" className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-600">Total Leave</p>
                      <p className="text-xl font-bold text-yellow-700">24 days</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Used</p>
                      <p className="text-xl font-bold text-green-700">8 days</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">Remaining</p>
                      <p className="text-xl font-bold text-blue-700">16 days</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-600">Pending</p>
                      <p className="text-xl font-bold text-red-700">2 requests</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>Last leave: December 15-18, 2024 (4 days)</p>
                    <p>Next scheduled: February 10-12, 2025 (3 days)</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Staff Dialog */}
      {editingStaff && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Staff - {editingStaff.firstName} {editingStaff.lastName}</DialogTitle>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="access">Access</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll & Docs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={editForm.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter complete address..."
                              className="min-h-[80px]"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={editForm.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter nationality" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="access" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Doctor">Doctor</SelectItem>
                                <SelectItem value="Optometrist">Optometrist</SelectItem>
                                <SelectItem value="Nurse">Nurse</SelectItem>
                                <SelectItem value="Technician">Technician</SelectItem>
                                <SelectItem value="Receptionist">Receptionist</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                                <SelectItem value="Assistant">Assistant</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Eye Care">Eye Care</SelectItem>
                                <SelectItem value="Vision Care">Vision Care</SelectItem>
                                <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                                <SelectItem value="Administration">Administration</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Customer Service">Customer Service</SelectItem>
                                <SelectItem value="Inventory">Inventory</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Human Resources">Human Resources</SelectItem>
                                <SelectItem value="IT Support">IT Support</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Role</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "staff"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "active"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="hireDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hire Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salary</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter salary amount" 
                                {...field} 
                                value={field.value || ""} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="payroll" className="space-y-6">
                    {/* Photo Upload Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Photo & Documents</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Staff Photo</Label>
                            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                 onClick={() => document.getElementById('edit-photo-upload')?.click()}>
                              {editingStaff?.photoUrl ? (
                                <div className="space-y-2">
                                  <img 
                                    src={editingStaff.photoUrl} 
                                    alt="Staff photo"
                                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-blue-200"
                                  />
                                  <p className="text-sm text-green-600">Photo uploaded - click to change</p>
                                </div>
                              ) : (
                                <>
                                  <User className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">Click to upload photo</p>
                                </>
                              )}
                              <input 
                                id="edit-photo-upload"
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Create a URL for the uploaded file to display it immediately
                                    const photoUrl = URL.createObjectURL(file);
                                    
                                    // Update the form with the new photo URL
                                    if (editingStaff) {
                                      setEditingStaff({ ...editingStaff, photoUrl });
                                    }
                                    
                                    toast({
                                      title: "Photo uploaded",
                                      description: `Selected: ${file.name}`,
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Qualification Documents</Label>
                            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                 onClick={() => document.getElementById('edit-docs-upload')?.click()}>
                              <FileText className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Upload certificates, degrees</p>
                              <input 
                                id="edit-docs-upload"
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.doc,.docx" 
                                multiple
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    toast({
                                      title: "Documents uploaded",
                                      description: `${files.length} file(s) selected`,
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Salary & Benefits Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Salary & Benefits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base Salary</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Enter base salary"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div>
                            <Label>Monthly Bonus</Label>
                            <Input type="number" placeholder="Enter bonus amount" className="mt-2" />
                          </div>
                          <div>
                            <Label>Annual Leave</Label>
                            <Input type="number" placeholder="Days per year" className="mt-2" defaultValue="21" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Health Insurance</Label>
                            <Select>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic Plan</SelectItem>
                                <SelectItem value="premium">Premium Plan</SelectItem>
                                <SelectItem value="family">Family Plan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Pension Plan</Label>
                            <Select>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard (5%)</SelectItem>
                                <SelectItem value="enhanced">Enhanced (8%)</SelectItem>
                                <SelectItem value="none">No Plan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Deductions Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Deductions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Tax Rate (%)</Label>
                            <Input type="number" placeholder="Tax percentage" className="mt-2" defaultValue="15" />
                          </div>
                          <div>
                            <Label>Social Security (%)</Label>
                            <Input type="number" placeholder="SS percentage" className="mt-2" defaultValue="6.2" />
                          </div>
                          <div>
                            <Label>Other Deductions</Label>
                            <Input type="number" placeholder="Additional amount" className="mt-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Working Hours Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Working Hours</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Weekly Hours</Label>
                            <Input type="number" placeholder="Hours per week" className="mt-2" defaultValue="40" />
                          </div>
                          <div>
                            <Label>Overtime Rate</Label>
                            <Select>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select rate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1.5">1.5x Base Rate</SelectItem>
                                <SelectItem value="2.0">2.0x Base Rate</SelectItem>
                                <SelectItem value="none">No Overtime</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Shift Pattern</Label>
                            <Select>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day">Day Shift (9 AM - 5 PM)</SelectItem>
                                <SelectItem value="evening">Evening Shift (2 PM - 10 PM)</SelectItem>
                                <SelectItem value="flexible">Flexible Hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Break Duration (minutes)</Label>
                            <Input type="number" placeholder="Break time" className="mt-2" defaultValue="60" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Leave Entitlements Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Leave Entitlements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label>Annual Leave</Label>
                            <Input type="number" placeholder="Days" className="mt-2" defaultValue="21" />
                          </div>
                          <div>
                            <Label>Sick Leave</Label>
                            <Input type="number" placeholder="Days" className="mt-2" defaultValue="10" />
                          </div>
                          <div>
                            <Label>Personal Leave</Label>
                            <Input type="number" placeholder="Days" className="mt-2" defaultValue="5" />
                          </div>
                          <div>
                            <Label>Emergency Leave</Label>
                            <Input type="number" placeholder="Days" className="mt-2" defaultValue="3" />
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CalendarDays className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Leave Balance Summary</span>
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-4 text-sm text-green-700">
                            <div>Annual: 18/21 remaining</div>
                            <div>Sick: 8/10 remaining</div>
                            <div>Personal: 3/5 remaining</div>
                            <div>Emergency: 3/3 remaining</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateStaffMutation.isPending}>
                    {updateStaffMutation.isPending ? "Updating..." : "Update Staff"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
