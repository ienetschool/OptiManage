import { Router } from "express";
import { db } from "./db";
import { 
  specsOrders, 
  lensCuttingTasks, 
  deliveries,
  workflowNotifications,
  lensPrescriptions 
} from "../shared/mysql-schema";
import { eq, desc, and, isNull } from "drizzle-orm";

const router = Router();

// Get all specs orders
router.get("/api/specs-orders", async (req, res) => {
  try {
    console.log("🚨 ROUTE: /api/specs-orders called");
    
    const orders = await db
      .select()
      .from(specsOrders)
      .orderBy(desc(specsOrders.createdAt));

    console.log(`✅ Found ${orders.length} specs orders`);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching specs orders:", error);
    res.status(500).json({ message: "Failed to fetch specs orders" });
  }
});

// Create new specs order
router.post("/api/specs-orders", async (req, res) => {
  try {
    console.log("🚨 ROUTE: POST /api/specs-orders called");
    console.log("📋 Request body:", req.body);

    const orderData = {
      ...req.body,
      orderNumber: `SO-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [newOrder] = await db
      .insert(specsOrders)
      .values(orderData);

    console.log("✅ Specs order created successfully:", newOrder);
    res.status(201).json({ id: newOrder.insertId, ...orderData });
  } catch (error) {
    console.error("Error creating specs order:", error);
    res.status(500).json({ message: "Failed to create specs order" });
  }
});

// Update specs order
router.patch("/api/specs-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🚨 ROUTE: PATCH /api/specs-orders/${id} called`);

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db
      .update(specsOrders)
      .set(updateData)
      .where(eq(specsOrders.id, id));

    console.log("✅ Specs order updated successfully");
    res.json({ message: "Specs order updated successfully" });
  } catch (error) {
    console.error("Error updating specs order:", error);
    res.status(500).json({ message: "Failed to update specs order" });
  }
});

// Get all lens cutting tasks
router.get("/api/lens-cutting-tasks", async (req, res) => {
  try {
    console.log("🚨 ROUTE: /api/lens-cutting-tasks called");
    
    const tasks = await db
      .select()
      .from(lensCuttingTasks)
      .orderBy(desc(lensCuttingTasks.createdAt));

    console.log(`✅ Found ${tasks.length} lens cutting tasks`);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching lens cutting tasks:", error);
    res.status(500).json({ message: "Failed to fetch lens cutting tasks" });
  }
});

// Create new lens cutting task
router.post("/api/lens-cutting-tasks", async (req, res) => {
  try {
    console.log("🚨 ROUTE: POST /api/lens-cutting-tasks called");
    console.log("📋 Request body:", req.body);

    const taskData = {
      ...req.body,
      taskNumber: `LT-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [newTask] = await db
      .insert(lensCuttingTasks)
      .values(taskData);

    console.log("✅ Lens cutting task created successfully:", newTask);
    res.status(201).json({ id: newTask.insertId, ...taskData });
  } catch (error) {
    console.error("Error creating lens cutting task:", error);
    res.status(500).json({ message: "Failed to create lens cutting task" });
  }
});

// Update lens cutting task
router.patch("/api/lens-cutting-tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🚨 ROUTE: PATCH /api/lens-cutting-tasks/${id} called`);

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db
      .update(lensCuttingTasks)
      .set(updateData)
      .where(eq(lensCuttingTasks.id, id));

    console.log("✅ Lens cutting task updated successfully");
    res.json({ message: "Lens cutting task updated successfully" });
  } catch (error) {
    console.error("Error updating lens cutting task:", error);
    res.status(500).json({ message: "Failed to update lens cutting task" });
  }
});

// Get all fitting progress records (using lensCuttingTasks with status tracking)
router.get("/api/fitting-progress", async (req, res) => {
  try {
    console.log("🚨 ROUTE: /api/fitting-progress called");
    
    const progress = await db
      .select()
      .from(lensCuttingTasks)
      .where(and(
        isNull(lensCuttingTasks.deletedAt),
        eq(lensCuttingTasks.status, 'in_progress')
      ))
      .orderBy(desc(lensCuttingTasks.createdAt));

    console.log(`✅ Found ${progress.length} fitting progress records`);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching fitting progress:", error);
    res.status(500).json({ message: "Failed to fetch fitting progress" });
  }
});

// Create new fitting progress record (update task status)
router.post("/api/fitting-progress", async (req, res) => {
  try {
    console.log("🚨 ROUTE: POST /api/fitting-progress called");
    console.log("📋 Request body:", req.body);

    const { taskId, ...progressData } = req.body;

    // Update the lens cutting task with progress data
    await db
      .update(lensCuttingTasks)
      .set({
        ...progressData,
        updatedAt: new Date()
      })
      .where(eq(lensCuttingTasks.id, taskId));

    console.log("✅ Fitting progress updated successfully");
    res.status(201).json({ message: "Fitting progress updated successfully" });
  } catch (error) {
    console.error("Error creating fitting progress:", error);
    res.status(500).json({ message: "Failed to create fitting progress" });
  }
});

// Update fitting progress
router.patch("/api/fitting-progress/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🚨 ROUTE: PATCH /api/fitting-progress/${id} called`);

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db
      .update(lensCuttingTasks)
      .set(updateData)
      .where(eq(lensCuttingTasks.id, id));

    console.log("✅ Fitting progress updated successfully");
    res.json({ message: "Fitting progress updated successfully" });
  } catch (error) {
    console.error("Error updating fitting progress:", error);
    res.status(500).json({ message: "Failed to update fitting progress" });
  }
});

// Get all store deliveries
router.get("/api/store-deliveries", async (req, res) => {
  try {
    console.log("🚨 ROUTE: /api/store-deliveries called");
    
    const storeDeliveries = await db
      .select()
      .from(deliveries)
      .orderBy(desc(deliveries.createdAt));

    console.log(`✅ Found ${storeDeliveries.length} store deliveries`);
    res.json(storeDeliveries);
  } catch (error) {
    console.error("Error fetching store deliveries:", error);
    res.status(500).json({ message: "Failed to fetch store deliveries" });
  }
});

// Create new store delivery
router.post("/api/store-deliveries", async (req, res) => {
  try {
    console.log("🚨 ROUTE: POST /api/store-deliveries called");
    console.log("📋 Request body:", req.body);

    const deliveryData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [newDelivery] = await db
      .insert(deliveries)
      .values(deliveryData);

    console.log("✅ Store delivery created successfully:", newDelivery);
    res.status(201).json({ id: newDelivery.insertId, ...deliveryData });
  } catch (error) {
    console.error("Error creating store delivery:", error);
    res.status(500).json({ message: "Failed to create store delivery" });
  }
});

// Update store delivery
router.patch("/api/store-deliveries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🚨 ROUTE: PATCH /api/store-deliveries/${id} called`);

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, id));

    console.log("✅ Store delivery updated successfully");
    res.json({ message: "Store delivery updated successfully" });
  } catch (error) {
    console.error("Error updating store delivery:", error);
    res.status(500).json({ message: "Failed to update store delivery" });
  }
});

// Dashboard endpoint for specs order statistics
router.get("/api/specs-orders/dashboard", async (req, res) => {
  try {
    console.log("🚨 ROUTE: /api/specs-orders/dashboard called");
    
    const [orders, tasks, notifications, deliveriesData] = await Promise.all([
      db.select().from(specsOrders),
      db.select().from(lensCuttingTasks),
      db.select().from(workflowNotifications),
      db.select().from(deliveries)
    ]);

    const dashboard = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'draft' || o.status === 'confirmed').length,
      activeTasks: tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      readyForDelivery: deliveriesData.filter(d => d.deliveryStatus === 'ready').length,
      delivered: deliveriesData.filter(d => d.deliveryStatus === 'delivered').length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString() || '0'), 0)
    };

    console.log("✅ Dashboard data compiled:", dashboard);
    res.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// Get workflow status for a specific order
router.get("/api/specs-orders/:orderId/workflow", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🚨 ROUTE: /api/specs-orders/${orderId}/workflow called`);
    
    const [order, tasks, notifications, delivery] = await Promise.all([
      db.select().from(specsOrders).where(eq(specsOrders.id, orderId)),
      db.select().from(lensCuttingTasks).where(eq(lensCuttingTasks.specsOrderId, orderId)),
      db.select().from(workflowNotifications).where(eq(workflowNotifications.orderId, orderId)),
      db.select().from(deliveries).where(eq(deliveries.orderId, orderId))
    ]);

    const workflow = {
      order: order[0] || null,
      tasks: tasks,
      notifications: notifications,
      delivery: delivery[0] || null,
      currentStage: order[0]?.status || 'unknown'
    };

    console.log("✅ Workflow data compiled:", workflow);
    res.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow data:", error);
    res.status(500).json({ message: "Failed to fetch workflow data" });
  }
});

export default router;