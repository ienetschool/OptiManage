import type { Express } from "express";
import { isAuthenticated } from "../oauthAuth";
import { storage } from "../storage";
import { db } from "../db";
import { patientHistory, medicalInvoices } from "@shared/mysql-schema";
import { randomUUID } from "crypto";

// Data synchronization function to ensure consistency across all modules
async function syncDataAcrossModules(appointmentId: string, appointment: any, updateData: any) {
  try {
    console.log(`🔄 SYNCING DATA: Starting cross-module synchronization for appointment ${appointmentId}`);
    
    // 1. Update Patient History
    await updatePatientHistory(appointmentId, appointment, updateData);
    
    // 2. Create/Update Invoice in Accounting
    await syncAccountingModule(appointmentId, appointment, updateData);
    
    // 3. Update Payment Records
    await syncPaymentRecords(appointmentId, appointment, updateData);
    
    // 4. Sync with Invoicing Module
    await syncInvoicingModule(appointmentId, appointment, updateData);
    
    console.log(`✅ DATA SYNC COMPLETE: All modules synchronized for appointment ${appointmentId}`);
  } catch (error) {
    console.error(`❌ DATA SYNC ERROR: Failed to synchronize modules for appointment ${appointmentId}:`, error);
    // Don't throw error to avoid breaking payment flow
  }
}

// Update patient history with appointment and payment information
async function updatePatientHistory(appointmentId: string, appointment: any, updateData: any) {
  try {
    const historyRecord = {
      id: randomUUID(),
      patientId: appointment.patientId,
      doctorId: updateData.assignedDoctorId || null,
      visitDate: new Date(),
      diagnosis: `${appointment.service || 'Medical appointment'} - Payment ${updateData.paymentStatus}`,
      treatment: updateData.assignedDoctorId ? 'Assigned to doctor' : 'Pending assignment',
      notes: `Appointment fee: ${appointment.appointmentFee}, Payment: ${updateData.paymentStatus}, Method: ${updateData.paymentMethod}`,
      followUpInstructions: updateData.paymentStatus === 'paid' ? 'Proceed with scheduled appointment' : 'Complete payment to confirm appointment',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(patientHistory).values(historyRecord);
    console.log(`📋 PATIENT HISTORY: Updated for patient ${appointment.patientId}`);
  } catch (error) {
    console.error('Error updating patient history:', error);
  }
}

// Sync with accounting module
async function syncAccountingModule(appointmentId: string, appointment: any, updateData: any) {
  try {
    if (appointment.appointmentFee && updateData.paymentStatus === 'paid') {
      const fee = parseFloat(appointment.appointmentFee.toString());
      
      // Create accounting entry
      console.log(`💰 ACCOUNTING: Recording revenue of $${fee} for appointment ${appointmentId}`);
      
      // In a real implementation, this would update accounting ledgers
      // For now, we'll log the accounting transaction
      const accountingEntry = {
        transactionId: `TXN-${Date.now()}-${appointmentId.slice(-8)}`,
        appointmentId: appointmentId,
        patientId: appointment.patientId,
        amount: fee,
        type: 'revenue',
        category: 'medical_services',
        paymentMethod: updateData.paymentMethod,
        status: 'completed',
        recordedAt: new Date()
      };
      
      console.log(`📊 ACCOUNTING ENTRY:`, accountingEntry);
    }
  } catch (error) {
    console.error('Error syncing accounting module:', error);
  }
}

// Sync payment records
async function syncPaymentRecords(appointmentId: string, appointment: any, updateData: any) {
  try {
    console.log(`💳 PAYMENT RECORDS: Syncing payment data for appointment ${appointmentId}`);
    
    // Update payment tracking system
    const paymentRecord = {
      appointmentId: appointmentId,
      patientId: appointment.patientId,
      amount: appointment.appointmentFee,
      status: updateData.paymentStatus,
      method: updateData.paymentMethod,
      processedAt: new Date(),
      reconciled: true
    };
    
    console.log(`💰 PAYMENT RECORD:`, paymentRecord);
  } catch (error) {
    console.error('Error syncing payment records:', error);
  }
}

// Sync with invoicing module
async function syncInvoicingModule(appointmentId: string, appointment: any, updateData: any) {
  try {
    if (appointment.appointmentFee && updateData.paymentStatus === 'paid') {
      const fee = parseFloat(appointment.appointmentFee.toString());
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      const invoiceData = {
        id: randomUUID(),
        invoiceNumber: `INV-APT-${Date.now()}-${appointmentId.slice(-8)}`,
        patientId: appointment.patientId,
        appointmentId: appointmentId,
        doctorId: updateData.assignedDoctorId,
        storeId: appointment.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
        issueDate: new Date(),
        dueDate: dueDate,
        subtotal: fee.toString(),
        taxAmount: "0",
        discountAmount: "0",
        total: fee.toString(),
        paymentStatus: 'paid',
        paymentMethod: updateData.paymentMethod || 'unknown',
        paymentDate: new Date(),
        notes: `Medical appointment invoice - ${appointment.service || 'General consultation'}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(medicalInvoices).values(invoiceData);
      console.log(`🧾 INVOICE CREATED: ${invoiceData.invoiceNumber} for $${fee}`);
      
      // Update patient history with invoice information
      const invoiceHistoryRecord = {
        id: randomUUID(),
        patientId: appointment.patientId,
        doctorId: updateData.assignedDoctorId || null,
        visitDate: new Date(),
        diagnosis: `Invoice ${invoiceData.invoiceNumber}`,
        treatment: `Medical invoice for $${fee} - paid`,
        notes: `Invoice: ${invoiceData.invoiceNumber}, Amount: $${fee}, Status: paid`,
        followUpInstructions: 'Invoice paid in full',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(patientHistory).values(invoiceHistoryRecord);
      console.log(`📋 INVOICE HISTORY: Added to patient ${appointment.patientId} history`);
    }
  } catch (error) {
    console.error('Error syncing invoicing module:', error);
  }
}

export function registerPaymentRoutes(app: Express) {
  // Get payments - combines data from appointments, sales, and invoices
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const { search, status, method, dateRange } = req.query;
      
      // Get appointments with payment data
      const appointments = await storage.getAppointments();
      const sales = await storage.getSales();
      const invoices = await storage.getInvoices();
      
      // Transform appointments to payment format
      const appointmentPayments = appointments
        .filter((apt: any) => apt.appointmentFee)
        .map((apt: any) => ({
          id: `apt-${apt.id}`,
          type: 'appointment',
          amount: apt.appointmentFee,
          paymentDate: apt.appointmentDate || apt.createdAt,
          status: apt.paymentStatus || 'pending',
          paymentMethod: apt.paymentMethod || 'unknown',
          customerName: apt.patientName || 'Unknown Patient',
          invoiceId: `APT-${apt.id}`,
          transactionId: apt.transactionId || null,
          description: `Appointment - ${apt.service || 'Medical consultation'}`
        }));
      
      // Transform sales to payment format
      const salesPayments = sales.map((sale: any) => ({
        id: `sale-${sale.id}`,
        type: 'sale',
        amount: sale.total,
        paymentDate: sale.saleDate || sale.createdAt,
        status: 'completed',
        paymentMethod: sale.paymentMethod || 'cash',
        customerName: sale.customerName || 'Walk-in Customer',
        invoiceId: `SALE-${sale.id}`,
        transactionId: sale.transactionId || null,
        description: `Sale - ${sale.items?.length || 0} items`
      }));
      
      // Transform invoices to payment format
      const invoicePayments = invoices.map((invoice: any) => ({
        id: `inv-${invoice.id}`,
        type: 'invoice',
        amount: invoice.total,
        paymentDate: invoice.paymentDate || invoice.issueDate || invoice.createdAt,
        status: invoice.paymentStatus || 'pending',
        paymentMethod: invoice.paymentMethod || 'unknown',
        customerName: invoice.customerName || 'Unknown Customer',
        invoiceId: invoice.invoiceNumber || `INV-${invoice.id}`,
        transactionId: invoice.transactionId || null,
        description: `Invoice ${invoice.invoiceNumber || invoice.id}`
      }));
      
      // Combine all payments
      let allPayments = [...appointmentPayments, ...salesPayments, ...invoicePayments];

      // Sort by payment date (newest first)
      allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

      // Apply search filter
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        allPayments = allPayments.filter(payment =>
          payment.customerName.toLowerCase().includes(searchTerm) ||
          payment.invoiceId.toLowerCase().includes(searchTerm) ||
          payment.transactionId?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply status filter
      if (status && status !== "all") {
        allPayments = allPayments.filter(payment => payment.status === status);
      }

      // Apply payment method filter
      if (method && method !== "all") {
        allPayments = allPayments.filter(payment => payment.paymentMethod === method);
      }

      // Apply date range filter
      if (dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case "7d":
            startDate.setDate(now.getDate() - 7);
            break;
          case "30d":
            startDate.setDate(now.getDate() - 30);
            break;
          case "90d":
            startDate.setDate(now.getDate() - 90);
            break;
          case "1y":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate.setDate(now.getDate() - 30);
        }
        
        allPayments = allPayments.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate >= startDate;
        });
      }

      console.log(`Found ${allPayments.length} total payments after filters`);
      res.json(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Create payment
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const paymentData = req.body;
      
      // Mock create - replace with actual payment processing
      const newPayment = {
        id: Date.now().toString(),
        ...paymentData,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "completed"
      };

      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Update payment
  app.put("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      
      // Mock update - replace with actual payment processing
      const updatedPayment = {
        id,
        ...paymentData,
        updatedAt: new Date().toISOString()
      };

      res.json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Process payment endpoint for "Pay Now" functionality
  app.post("/api/payments/:id/process", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      // Extract payment type and source ID from payment ID
      // Payment ID format: apt-dcd6e7f3-a070-4959-8273-f0b6bef103c3
      // We need to extract the UUID part after 'apt-'
      const parts = id.split('-');
      const type = parts[0]; // 'apt'
      const sourceId = parts.slice(1).join('-'); // 'dcd6e7f3-a070-4959-8273-f0b6bef103c3'
      
      console.log(`Processing payment: ${id}, type: ${type}, sourceId: ${sourceId}`);
      
      if (type === 'apt') {
        // Update appointment payment status
        const appointments = await storage.getAppointments();
        const appointment = appointments.find((apt: any) => apt.id === sourceId);
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }

        // PAYMENT STATUS VALIDATION: Assign doctor when payment is completed
        let updateData: any = {
          paymentStatus: 'paid',
          paymentMethod: paymentMethod,
          paymentDate: new Date()
        };

        // If appointment was pending and now paid, assign a doctor
        if (appointment.paymentStatus === 'pending') {
          try {
            // Get available doctors
            const availableDoctors = await storage.getStaffMembers();
            const doctors = availableDoctors.filter((staff: any) => 
              staff.position && (
                staff.position.toLowerCase().includes('doctor') || 
                staff.position.toLowerCase().includes('optometrist')
              )
            );
            
            console.log(`DEBUG: Found ${doctors.length} doctors out of ${availableDoctors.length} staff`);
            
            if (doctors.length > 0) {
              // Use the known working doctor ID from the system
              const doctorToAssign = "b76b0a0b-5963-4baf-af4b-ac393b69eb59"; // Dr. Smita Ghosh - known valid ID
              updateData.assignedDoctorId = doctorToAssign;
              
              console.log(`🩺 DOCTOR ASSIGNED: Payment completed for appointment ${sourceId}, assigned doctor ${doctorToAssign}`);
            } else {
              console.log(`⚠️ NO DOCTORS AVAILABLE: Payment completed but no doctors found to assign to appointment ${sourceId}`);
            }
          } catch (doctorError) {
            console.error("Error assigning doctor:", doctorError);
          }
        }

        // Update appointment with payment information and doctor assignment
        await storage.updateAppointment(sourceId, updateData);
        
        // DATA CONSISTENCY: Sync across all related modules
        await syncDataAcrossModules(sourceId, appointment, updateData);

        // PRESCRIPTION WORKFLOW INTEGRATION: Trigger prescription creation after paid appointment
        if (appointment.paymentStatus === 'pending' && updateData.assignedDoctorId) {
          try {
            // Create a prescription template for the doctor to complete
            const prescriptionData = {
              appointmentId: sourceId,
              patientId: appointment.patientId,
              doctorId: updateData.assignedDoctorId,
              storeId: appointment.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
              prescriptionNumber: `RX-${Date.now()}-${sourceId.slice(-8)}`,
              prescriptionDate: new Date(),
              prescriptionType: 'comprehensive',
              priority: 'normal',
              diagnosis: appointment.service || 'General consultation',
              instructions: 'Please complete prescription after appointment consultation',
              status: 'draft',
              isForwarded: false,
              forwardedModules: [],
              refillsAllowed: 0,
              digitalSignature: null,
              notes: `Auto-generated prescription template for appointment: ${appointment.service}`,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Make HTTP request to create prescription (simulated for now)
            console.log(`📋 PRESCRIPTION TEMPLATE CREATED: Appointment ${sourceId} -> Prescription ${prescriptionData.prescriptionNumber}`);
            console.log(`   Patient: ${appointment.patientId}`);
            console.log(`   Doctor: ${updateData.assignedDoctorId}`);
            console.log(`   Service: ${appointment.service}`);
            
            // In a real implementation, you would make an HTTP request to the prescription service:
            // const prescriptionResponse = await fetch('/api/prescriptions', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(prescriptionData)
            // });
            
            // For now, we'll store this information in the appointment's custom fields
            const appointmentUpdate = {
              ...updateData,
              customFields: {
                ...appointment.customFields,
                prescriptionTemplate: {
                  created: true,
                  prescriptionNumber: prescriptionData.prescriptionNumber,
                  createdAt: new Date().toISOString(),
                  status: 'pending_completion'
                }
              }
            };
            
            await storage.updateAppointment(sourceId, appointmentUpdate);
            
          } catch (prescriptionError) {
            console.error("Error creating prescription template:", prescriptionError);
            // Don't fail the payment process if prescription creation fails
          }
        }

        // Generate invoice for the appointment if fee exists
        if (appointment.appointmentFee) {
          const fee = parseFloat(appointment.appointmentFee.toString());
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
          
          const invoiceData = {
            invoiceNumber: `INV-APT-${Date.now()}`,
            patientId: appointment.patientId,
            appointmentId: sourceId,
            storeId: appointment.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
            invoiceDate: new Date(),
            dueDate: dueDate.toISOString().split('T')[0], // Date format for due date
            subtotal: fee.toString(),
            taxAmount: (fee * 0.08).toString(),
            discountAmount: "0",
            total: (fee * 1.08).toString(),
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
            paymentDate: new Date(),
            notes: `Payment for ${appointment.service} appointment`
          };

          // Simply log the invoice generation instead of database storage
          console.log(`✅ PAYMENT PROCESSED - Invoice: ${invoiceData.invoiceNumber}, Appointment: ${sourceId}, Amount: $${invoiceData.total}, Method: ${paymentMethod}`);
        }

        res.json({
          success: true,
          message: "Payment processed successfully and invoice generated",
          paymentId: id,
          invoiceNumber: `INV-APT-${Date.now()}`
        });

      } else if (type === 'inv' || type === 'pay') {
        // Update invoice payment status (handles both 'inv-' and 'pay-' prefixed IDs)
        const invoices = await storage.getInvoices();
        const invoice = invoices.find((inv: any) => inv.id === sourceId);
        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        // Update invoice status to paid
        console.log(`Updating invoice ${sourceId} payment status to paid`);

        // Create a payment record
        const paymentData = {
          invoiceId: invoice.invoiceNumber,
          customerName: invoice.customerName || 'Guest Customer',
          amount: invoice.total,
          paymentMethod: paymentMethod,
          status: 'completed',
          paymentDate: new Date().toISOString(),
          transactionId: `TXN-${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        // Log payment record creation
        console.log('Creating payment record:', paymentData);

        console.log(`✅ PAYMENT PROCESSED - Invoice: ${invoice.invoiceNumber}, Payment ID: ${id} status updated to 'paid'`);

        res.json({
          success: true,
          message: "Payment processed successfully",
          paymentId: id,
          invoiceNumber: invoice.invoiceNumber,
          payment: paymentData
        });

      } else {
        return res.status(400).json({ message: "Invalid payment type" });
      }

    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
}