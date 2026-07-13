import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin authorization required." });
    }

    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin authorization required." });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ message: error.message || "Failed to update notification" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin authorization required." });
    }

    await Notification.updateMany({ isRead: false }, { isRead: true });

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({ message: error.message || "Failed to update notifications" });
  }
};
