import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentStatus, paymentDetails, totalAmount } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items found in the order request" });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      return res.status(400).json({ message: "Invalid or incomplete shipping address details" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    // Set up tracking message
    let trackingMessage = "Order has been placed successfully.";
    if (paymentMethod !== "cod" && paymentStatus === "paid") {
      trackingMessage = "Payment successful. Order has been placed.";
    }

    const orderData = {
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || "pending",
      paymentDetails: paymentDetails || {},
      totalAmount,
      orderStatus: "Ordered",
      trackingHistory: [
        {
          status: "Ordered",
          message: trackingMessage,
          timestamp: new Date(),
        },
      ],
    };

    // Verify stock for all items in the order
    for (const item of items) {
      const prod = await Product.findById(item.product);
      if (!prod) {
        return res.status(404).json({ message: `Product "${item.title || "Unknown"}" not found` });
      }
      if (prod.stock !== undefined && prod.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: "${prod.title}". Only ${prod.stock} items left.`
        });
      }
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    try {
      await Notification.create({
        title: "New Order Placed",
        message: `Order #${newOrder._id} placed by ${req.user.name} for ₹${totalAmount.toLocaleString("en-IN")}.`,
        type: "order",
        link: `/admin/orders?id=${newOrder._id}`,
      });
    } catch (err) {
      console.error("Failed to create order notification:", err);
    }

    // Decrement stock and increment sold count for products
    for (const item of items) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        });
      } catch (err) {
        console.error(`Failed to update stock/sold count for product ${item.product}:`, err);
      }
    }


    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create order",
    });
  }
};

// Retrieve logged-in customer's orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch customer orders error:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve orders",
    });
  }
};

// Retrieve a single order detail
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify requesting user is order owner or an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to view this order details" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve order details",
    });
  }
};

// Retrieve all orders [Admin Only]
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin authorization required." });
    }

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve all orders",
    });
  }
};

// Update order status & add tracking entry [Admin Only]
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin authorization required." });
    }

    const orderId = req.params.id;
    const { status, message, paymentStatus } = req.body;

    const validStatuses = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status if specified
    if (paymentStatus) {
      const validPaymentStatuses = ["pending", "paid", "failed"];
      if (validPaymentStatuses.includes(paymentStatus)) {
        order.paymentStatus = paymentStatus;
      }
    }

    // If order was cancelled, we don't want to update past cancelled except logging it.
    // If order status is updated, we append to history
    order.orderStatus = status;

    // Default description messages based on the status if not provided by admin
    let trackingMessage = message || "";
    if (!trackingMessage) {
      switch (status) {
        case "Packed":
          trackingMessage = "Your item has been packed and is ready for shipment.";
          break;
        case "Shipped":
          trackingMessage = "Your item has been shipped and is in transit.";
          break;
        case "Out for Delivery":
          trackingMessage = "Your order is out for delivery. Our agent will contact you shortly.";
          break;
        case "Delivered":
          trackingMessage = "Your order has been delivered successfully. Thank you for shopping with us!";
          break;
        case "Cancelled":
          trackingMessage = "Your order has been cancelled.";
          break;
        default:
          trackingMessage = `Order status updated to ${status}.`;
      }
    }

    order.trackingHistory.push({
      status,
      message: trackingMessage,
      timestamp: new Date(),
    });

    // If status is Delivered, update payment status to paid (applicable to COD orders too)
    if (status === "Delivered") {
      order.paymentStatus = "paid";
    }

    await order.save();
    await order.populate("user", "name email");

    return res.status(200).json({
      success: true,
      message: "Order tracking status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update order status",
    });
  }
};
