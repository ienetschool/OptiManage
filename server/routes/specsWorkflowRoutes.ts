import type { Express } from "express";
import { z } from "zod";
import { db } from "../db";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  lensPrescriptions,
  specsOrders,
  lensCuttingTasks,
  deliveries,
  workflowNotifications,
  patients,
  doctors,
  staff,
  stores,
  products,
  insertLensPrescriptionSchema,
  insertSpecsOrderSchema,
  insertLensCuttingTaskSchema,
  insertDeliverySchema,
  insertWorkflowNotificationSchema,
} from "@shared/mysql-schema";

// Comprehensive 7-Step Lens Prescription and Specs Order Management Workflow
export function registerSpecsWorkflowRoutes(app: Express) {
  
  // ==================== STEP 1: Doctor Prescribes Lenses ====================
  
  // Get all lens prescriptions
  app.get("/api/lens-prescriptions", async (req, res) => {
    try {
      const prescriptions = await db
        .select({
          id: lensPrescriptions.id,
          patientId: lensPrescriptions.patientId,
          doctorId: lensPrescriptions.doctorId,
          prescriptionDate: lensPrescriptions.prescriptionDate,
          rightEyeSph: lensPrescriptions.rightEyeSph,
          rightEyeCyl: lensPrescriptions.rightEyeCyl,
          rightEyeAxis: lensPrescriptions.rightEyeAxis,
          rightEyeAdd: lensPrescriptions.rightEyeAdd,
          leftEyeSph: lensPrescriptions.leftEyeSph,
          leftEyeCyl: lensPrescriptions.leftEyeCyl,
          leftEyeAxis: lensPrescriptions.leftEyeAxis,
          leftEyeAdd: lensPrescriptions.leftEyeAdd,
          pupillaryDistance: lensPrescriptions.pupillaryDistance,
          lensType: lensPrescriptions.lensType,
          lensMaterial: lensPrescriptions.lensMaterial,
          frameRecommendation: lensPrescriptions.frameRecommendation,
          coatings: lensPrescriptions.coatings,
          tints: lensPrescriptions.tints,
          specialInstructions: lensPrescriptions.specialInstructions,
          status: lensPrescriptions.status,
          createdAt: lensPrescriptions.createdAt,
          // Join patient and doctor details
          patientName: patients.firstName,
          patientLastName: patients.lastName,
          doctorName: doctors.firstName,
          doctorLastName: doctors.lastName,
        })
        .from(lensPrescriptions)
        .leftJoin(patients, eq(lensPrescriptions.patientId, patients.id))
        .leftJoin(doctors, eq(lensPrescriptions.doctorId, doctors.id))
        .orderBy(desc(lensPrescriptions.createdAt));

      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching lens prescriptions:", error);
      res.status(500).json({ error: "Failed to fetch lens prescriptions" });
    }
  });

  // Create new lens prescription
  app.post("/api/lens-prescriptions", async (req, res) => {
    try {
      const prescriptionData = insertLensPrescriptionSchema.parse(req.body);
      
      await db
        .insert(lensPrescriptions)
        .values(prescriptionData);

      // Auto-check inventory for prescribed lens/material/frames
      const inventoryCheck = await checkInventoryAvailability(
        prescriptionData.lensType,
        prescriptionData.lensMaterial
      );

      res.json({
        success: true,
        prescription: newPrescription,
        inventoryStatus: inventoryCheck,
        message: "Lens prescription created successfully"
      });
    } catch (error) {
      console.error("Error creating lens prescription:", error);
      res.status(500).json({ error: "Failed to create lens prescription" });
    }
  });

  // ==================== STEP 2: Specs Order Creation ====================
  
  // Create specs order from prescription
  app.post("/api/specs-orders", async (req, res) => {
    try {
      const orderData = insertSpecsOrderSchema.parse(req.body);
      
      // Generate order number
      const orderNumber = await generateOrderNumber();
      
      const specsOrderData = {
        ...orderData,
        orderNumber,
        status: 'draft'
      };

      await db
        .insert(specsOrders)
        .values(specsOrderData);

      // Update prescription status
      if (orderData.lensPrescriptionId) {
        await db
          .update(lensPrescriptions)
          .set({ status: 'order_created' })
          .where(eq(lensPrescriptions.id, orderData.lensPrescriptionId));
      }

      // Real-time inventory check
      const inventoryAvailable = await checkFrameInventory(orderData.frameId);

      res.json({
        success: true,
        order: { orderNumber },
        inventoryAvailable,
        message: "Specs order created successfully"
      });
    } catch (error) {
      console.error("Error creating specs order:", error);
      res.status(500).json({ error: "Failed to create specs order" });
    }
  });

  // Get all specs orders
  app.get("/api/specs-orders", async (req, res) => {
    try {
      const orders = await db
        .select({
          id: specsOrders.id,
          orderNumber: specsOrders.orderNumber,
          lensPrescriptionId: specsOrders.lensPrescriptionId,
          patientId: specsOrders.patientId,
          storeId: specsOrders.storeId,
          frameName: specsOrders.frameName,
          framePrice: specsOrders.framePrice,
          lensPrice: specsOrders.lensPrice,
          totalAmount: specsOrders.totalAmount,
          status: specsOrders.status,
          priority: specsOrders.priority,
          orderDate: specsOrders.orderDate,
          expectedDelivery: specsOrders.expectedDelivery,
          orderNotes: specsOrders.orderNotes,
          // Join patient details
          patientName: patients.firstName,
          patientLastName: patients.lastName,
          patientPhone: patients.phone,
          // Join store details
          storeName: stores.name,
        })
        .from(specsOrders)
        .leftJoin(patients, eq(specsOrders.patientId, patients.id))
        .leftJoin(stores, eq(specsOrders.storeId, stores.id))
        .orderBy(desc(specsOrders.orderDate));

      res.json(orders);
    } catch (error) {
      console.error("Error fetching specs orders:", error);
      res.status(500).json({ error: "Failed to fetch specs orders" });
    }
  });

  // Confirm order and move to next step
  app.patch("/api/specs-orders/:id/confirm", async (req, res) => {
    try {
      const { id } = req.params;
      
      await db
        .update(specsOrders)
        .set({ status: 'confirmed' })
        .where(eq(specsOrders.id, id));

      // Auto-generate invoice and update inventory
      await generateInvoiceFromOrder(id);
      await updateInventoryFromOrder(id);

      res.json({ success: true, message: "Order confirmed and processed" });
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ error: "Failed to confirm order" });
    }
  });

  // ==================== STEP 3: Assign Lens Cutting Task ====================
  
  // Create lens cutting task
  app.post("/api/lens-cutting-tasks", async (req, res) => {
    try {
      const taskData = insertLensCuttingTaskSchema.parse(req.body);
      
      await db
        .insert(lensCuttingTasks)
        .values(taskData);

      // Update specs order status
      await db
        .update(specsOrders)
        .set({ status: 'assigned' })
        .where(eq(specsOrders.id, taskData.specsOrderId));

      // Send notification to fitter
      await sendWorkflowNotification({
        type: 'lens_cutting_assigned',
        recipientType: 'fitter',
        recipientId: taskData.assignedToFitterId || '',
        specsOrderId: taskData.specsOrderId,
        lensCuttingTaskId: taskData.id,
        subject: 'New Lens Cutting Task Assigned',
        message: `You have been assigned a new lens fitting job. Please check your dashboard for details.`
      });

      res.json({
        success: true,
        task: { id: taskData.id },
        message: "Lens cutting task assigned successfully"
      });
    } catch (error) {
      console.error("Error creating lens cutting task:", error);
      res.status(500).json({ error: "Failed to create lens cutting task" });
    }
  });

  // Get lens cutting tasks for fitter
  app.get("/api/lens-cutting-tasks/fitter/:fitterId", async (req, res) => {
    try {
      const { fitterId } = req.params;
      
      const tasks = await db
        .select({
          id: lensCuttingTasks.id,
          specsOrderId: lensCuttingTasks.specsOrderId,
          taskType: lensCuttingTasks.taskType,
          frameSize: lensCuttingTasks.frameSize,
          specialInstructions: lensCuttingTasks.specialInstructions,
          status: lensCuttingTasks.status,
          progress: lensCuttingTasks.progress,
          assignedDate: lensCuttingTasks.assignedDate,
          deadline: lensCuttingTasks.deadline,
          workRemarks: lensCuttingTasks.workRemarks,
          // Join order details
          orderNumber: specsOrders.orderNumber,
          frameName: specsOrders.frameName,
          priority: specsOrders.priority,
          // Join patient details
          patientName: patients.firstName,
          patientLastName: patients.lastName,
        })
        .from(lensCuttingTasks)
        .leftJoin(specsOrders, eq(lensCuttingTasks.specsOrderId, specsOrders.id))
        .leftJoin(patients, eq(specsOrders.patientId, patients.id))
        .where(eq(lensCuttingTasks.assignedToFitterId, fitterId))
        .orderBy(desc(lensCuttingTasks.assignedDate));

      res.json(tasks);
    } catch (error) {
      console.error("Error fetching fitter tasks:", error);
      res.status(500).json({ error: "Failed to fetch fitter tasks" });
    }
  });

  // ==================== STEP 4: Fitting in Progress ====================
  
  // Update task progress
  app.patch("/api/lens-cutting-tasks/:id/progress", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, progress, workRemarks, workPhotos } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      
      if (status) updateData.status = status;
      if (progress !== undefined) updateData.progress = progress;
      if (workRemarks) updateData.workRemarks = workRemarks;
      if (workPhotos) updateData.workPhotos = JSON.stringify(workPhotos);
      
      if (status === 'in_progress' && !updateData.startedDate) {
        updateData.startedDate = new Date();
      }
      
      if (status === 'completed') {
        updateData.completedDate = new Date();
        updateData.progress = 100;
      }

      await db
        .update(lensCuttingTasks)
        .set(updateData)
        .where(eq(lensCuttingTasks.id, id));

      // Update specs order status if task is completed
      if (status === 'completed') {
        const [task] = await db
          .select({ specsOrderId: lensCuttingTasks.specsOrderId })
          .from(lensCuttingTasks)
          .where(eq(lensCuttingTasks.id, id));

        await db
          .update(specsOrders)
          .set({ status: 'in_progress' })
          .where(eq(specsOrders.id, task.specsOrderId));

        // Send notification to store
        await sendWorkflowNotification({
          type: 'task_completed',
          recipientType: 'store',
          specsOrderId: task.specsOrderId,
          lensCuttingTaskId: id,
          subject: 'Lens Cutting Task Completed',
          message: 'The lens cutting task has been completed and is ready for store pickup.'
        });
      }

      res.json({ success: true, message: "Task progress updated successfully" });
    } catch (error) {
      console.error("Error updating task progress:", error);
      res.status(500).json({ error: "Failed to update task progress" });
    }
  });

  // ==================== STEP 5: Send to Store ====================
  
  // Mark task as sent to store
  app.patch("/api/lens-cutting-tasks/:id/send-to-store", async (req, res) => {
    try {
      const { id } = req.params;
      const { trackingInfo, deliveryNotes } = req.body;
      
      await db
        .update(lensCuttingTasks)
        .set({ 
          status: 'sent_to_store',
          updatedAt: new Date()
        })
        .where(eq(lensCuttingTasks.id, id));

      // Get task details for order update
      const [task] = await db
        .select({ specsOrderId: lensCuttingTasks.specsOrderId })
        .from(lensCuttingTasks)
        .where(eq(lensCuttingTasks.id, id));

      // Update specs order status
      await db
        .update(specsOrders)
        .set({ status: 'completed' })
        .where(eq(specsOrders.id, task.specsOrderId));

      // Create delivery record
      const [order] = await db
        .select({
          patientId: specsOrders.patientId,
          storeId: specsOrders.storeId,
        })
        .from(specsOrders)
        .where(eq(specsOrders.id, task.specsOrderId));

      await db.insert(deliveries).values({
        specsOrderId: task.specsOrderId,
        patientId: order.patientId,
        storeId: order.storeId,
        deliveryMethod: 'pickup',
        status: 'ready',
        deliveryNotes,
        finalQualityCheck: true,
        finalCheckDate: new Date(),
      });

      // Send notifications
      await sendWorkflowNotification({
        type: 'ready_for_delivery',
        recipientType: 'store',
        specsOrderId: task.specsOrderId,
        subject: 'Specs Ready for Delivery',
        message: 'Specs are completed and ready for customer delivery.'
      });

      await sendWorkflowNotification({
        type: 'ready_for_delivery',
        recipientType: 'patient',
        specsOrderId: task.specsOrderId,
        subject: 'Your Specs are Ready',
        message: 'Your spectacles are now ready for pickup. Please visit the store.'
      });

      res.json({ success: true, message: "Task sent to store successfully" });
    } catch (error) {
      console.error("Error sending task to store:", error);
      res.status(500).json({ error: "Failed to send task to store" });
    }
  });

  // ==================== STEP 6: Delivery Ready & Final Checks ====================
  
  // Get deliveries for store
  app.get("/api/deliveries/store/:storeId", async (req, res) => {
    try {
      const { storeId } = req.params;
      
      const deliveriesData = await db
        .select({
          id: deliveries.id,
          specsOrderId: deliveries.specsOrderId,
          deliveryMethod: deliveries.deliveryMethod,
          status: deliveries.status,
          readyDate: deliveries.readyDate,
          scheduledDate: deliveries.scheduledDate,
          deliveryNotes: deliveries.deliveryNotes,
          finalQualityCheck: deliveries.finalQualityCheck,
          // Join order details
          orderNumber: specsOrders.orderNumber,
          frameName: specsOrders.frameName,
          totalAmount: specsOrders.totalAmount,
          // Join patient details
          patientName: patients.firstName,
          patientLastName: patients.lastName,
          patientPhone: patients.phone,
        })
        .from(deliveries)
        .leftJoin(specsOrders, eq(deliveries.specsOrderId, specsOrders.id))
        .leftJoin(patients, eq(deliveries.patientId, patients.id))
        .where(eq(deliveries.storeId, storeId))
        .orderBy(desc(deliveries.readyDate));

      res.json(deliveriesData);
    } catch (error) {
      console.error("Error fetching store deliveries:", error);
      res.status(500).json({ error: "Failed to fetch store deliveries" });
    }
  });

  // Schedule delivery
  app.patch("/api/deliveries/:id/schedule", async (req, res) => {
    try {
      const { id } = req.params;
      const { deliveryMethod, scheduledDate, deliveryAddress, recipientName, recipientPhone } = req.body;
      
      await db
        .update(deliveries)
        .set({
          deliveryMethod,
          scheduledDate,
          deliveryAddress,
          recipientName,
          recipientPhone,
          status: 'out_for_delivery',
          updatedAt: new Date()
        })
        .where(eq(deliveries.id, id));

      res.json({ success: true, message: "Delivery scheduled successfully" });
    } catch (error) {
      console.error("Error scheduling delivery:", error);
      res.status(500).json({ error: "Failed to schedule delivery" });
    }
  });

  // ==================== STEP 7: Delivery Confirmation ====================
  
  // Mark as delivered
  app.patch("/api/deliveries/:id/delivered", async (req, res) => {
    try {
      const { id } = req.params;
      const { recipientName, customerFeedback, deliveryRating } = req.body;
      
      await db
        .update(deliveries)
        .set({
          status: 'delivered',
          deliveredDate: new Date(),
          recipientName,
          customerFeedback,
          deliveryRating,
          updatedAt: new Date()
        })
        .where(eq(deliveries.id, id));

      // Get delivery details for notifications
      const [delivery] = await db
        .select({
          specsOrderId: deliveries.specsOrderId,
          patientId: deliveries.patientId,
        })
        .from(deliveries)
        .where(eq(deliveries.id, id));

      // Send completion notifications
      await sendWorkflowNotification({
        type: 'delivered',
        recipientType: 'patient',
        specsOrderId: delivery.specsOrderId,
        deliveryId: id,
        subject: 'Specs Successfully Delivered',
        message: 'Thank you! Your spectacles have been successfully delivered.'
      });

      await sendWorkflowNotification({
        type: 'delivered',
        recipientType: 'admin',
        specsOrderId: delivery.specsOrderId,
        deliveryId: id,
        subject: 'Specs Successfully Delivered',
        message: 'Patient has received their spectacles. Order completed successfully.'
      });

      res.json({ success: true, message: "Delivery confirmed successfully" });
    } catch (error) {
      console.error("Error confirming delivery:", error);
      res.status(500).json({ error: "Failed to confirm delivery" });
    }
  });

  // ==================== WORKFLOW ANALYTICS & REPORTS ====================
  
  // Get workflow dashboard data
  app.get("/api/specs-workflow/dashboard", async (req, res) => {
    try {
      // Get workflow statistics
      const [prescriptionsCount] = await db
        .select({ count: lensPrescriptions.id })
        .from(lensPrescriptions);

      const [ordersCount] = await db
        .select({ count: specsOrders.id })
        .from(specsOrders);

      const [tasksInProgress] = await db
        .select({ count: lensCuttingTasks.id })
        .from(lensCuttingTasks)
        .where(eq(lensCuttingTasks.status, 'in_progress'));

      const [readyForDelivery] = await db
        .select({ count: deliveries.id })
        .from(deliveries)
        .where(eq(deliveries.status, 'ready'));

      const [completedDeliveries] = await db
        .select({ count: deliveries.id })
        .from(deliveries)
        .where(eq(deliveries.status, 'delivered'));

      // Get recent activities
      const recentOrders = await db
        .select({
          id: specsOrders.id,
          orderNumber: specsOrders.orderNumber,
          status: specsOrders.status,
          orderDate: specsOrders.orderDate,
          patientName: patients.firstName,
          patientLastName: patients.lastName,
        })
        .from(specsOrders)
        .leftJoin(patients, eq(specsOrders.patientId, patients.id))
        .orderBy(desc(specsOrders.orderDate))
        .limit(10);

      res.json({
        statistics: {
          totalPrescriptions: prescriptionsCount?.count || 0,
          totalOrders: ordersCount?.count || 0,
          tasksInProgress: tasksInProgress?.count || 0,
          readyForDelivery: readyForDelivery?.count || 0,
          completedDeliveries: completedDeliveries?.count || 0,
        },
        recentOrders,
      });
    } catch (error) {
      console.error("Error fetching workflow dashboard:", error);
      res.status(500).json({ error: "Failed to fetch workflow dashboard" });
    }
  });

  // Get workflow notifications
  app.get("/api/workflow-notifications/:recipientId", async (req, res) => {
    try {
      const { recipientId } = req.params;
      
      const notifications = await db
        .select()
        .from(workflowNotifications)
        .where(eq(workflowNotifications.recipientId, recipientId))
        .orderBy(desc(workflowNotifications.createdAt))
        .limit(50);

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
}

// ==================== HELPER FUNCTIONS ====================

async function checkInventoryAvailability(lensType: string, lensMaterial: string) {
  try {
    // Check if lens materials are in stock
    const lensInventory = await db
      .select()
      .from(products)
      .where(and(
        eq(products.name, `${lensType} - ${lensMaterial}`),
        eq(products.isActive, true)
      ));

    return {
      lensAvailable: lensInventory.length > 0,
      stockLevel: 0, // Note: stockQuantity field needs to be added to products table
      lowStock: true
    };
  } catch (error) {
    console.error("Error checking inventory:", error);
    return { lensAvailable: false, stockLevel: 0, lowStock: true };
  }
}

async function checkFrameInventory(frameId?: string) {
  if (!frameId) return { available: true, stockLevel: 0 };
  
  try {
    const [frame] = await db
      .select()
      .from(products)
      .where(eq(products.id, frameId));

    return {
      available: frame?.isActive || false,
      stockLevel: 0, // Note: stockQuantity field needs to be added to products table
      lowStock: true
    };
  } catch (error) {
    console.error("Error checking frame inventory:", error);
    return { available: false, stockLevel: 0, lowStock: true };
  }
}

async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().substr(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  // Get count of orders today for sequence
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  const [todayOrdersCount] = await db
    .select({ count: specsOrders.id })
    .from(specsOrders)
    .where(and(
      eq(specsOrders.orderDate, todayStart),
      eq(specsOrders.orderDate, todayEnd)
    ));

  const sequence = (Number(todayOrdersCount?.count || 0) + 1).toString().padStart(3, '0');
  
  return `SPO${year}${month}${day}${sequence}`;
}

async function generateInvoiceFromOrder(orderId: string) {
  // Integration with existing invoice system
  // This would connect to the existing invoice generation system
  console.log(`Generating invoice for order: ${orderId}`);
}

async function updateInventoryFromOrder(orderId: string) {
  // Update inventory quantities based on order
  console.log(`Updating inventory for order: ${orderId}`);
}

async function sendWorkflowNotification(notificationData: {
  type: string;
  recipientType: string;
  recipientId?: string;
  recipientEmail?: string;
  specsOrderId?: string;
  lensCuttingTaskId?: string;
  deliveryId?: string;
  subject: string;
  message: string;
}) {
  try {
    await db.insert(workflowNotifications).values({
      ...notificationData,
      status: 'pending',
    });
    
    // Here you would integrate with email/SMS services
    console.log(`Notification sent: ${notificationData.subject}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}