import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import { FcSearch } from "react-icons/fc";
import { TableRowSkeleton } from "../components/skeleton/Skeletons";
import Swal from "sweetalert2";
import { FiX, FiCheck, FiInfo, FiTruck, FiMapPin, FiMail, FiPhone, FiCalendar, FiDollarSign } from "react-icons/fi";

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get("id");

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Ordered");
  const [newPaymentStatus, setNewPaymentStatus] = useState("pending");
  const [statusMessage, setStatusMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  const openManageModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus || "pending");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/orders");
      setOrders(data);
      if (highlightOrderId) {
        const order = data.find((o) => o._id === highlightOrderId);
        if (order) {
          openManageModal(order);
        }
      }
    } catch (error) {
      console.error("Failed to load admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [highlightOrderId]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = order._id.toLowerCase();
      const customerName = order.user?.name?.toLowerCase() || "";
      const customerEmail = order.user?.email?.toLowerCase() || "";
      const status = order.orderStatus.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return (
        orderId.includes(search) ||
        customerName.includes(search) ||
        customerEmail.includes(search) ||
        status.includes(search)
      );
    });
  }, [orders, searchTerm]);



  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await apiRequest(`/orders/${selectedOrder._id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          message: statusMessage.trim(),
          paymentStatus: newPaymentStatus,
        }),
      });

      if (res.success && res.order) {
        // Update local orders state
        setOrders((prev) =>
          prev.map((o) => (o._id === res.order._id ? { ...o, ...res.order } : o))
        );
        setSelectedOrder((prev) => ({ ...prev, ...res.order }));
        
        Swal.fire({
          title: "Status Updated!",
          text: `Order status changed to ${newStatus} successfully.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          width: "360px",
          customClass: {
            popup: "rounded-2xl dark:bg-gray-900 dark:text-white dark:border dark:border-gray-800",
            title: "text-lg font-bold text-gray-950 dark:text-white",
          }
        });
        setStatusMessage("");
        setIsModalOpen(false);
      } else {
        throw new Error(res.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Update Failed",
        text: error.message || "Could not update the status.",
        icon: "error",
        width: "360px",
        customClass: {
          popup: "rounded-2xl dark:bg-gray-900 dark:text-white dark:border dark:border-gray-800",
          title: "text-lg font-bold text-gray-950 dark:text-white",
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View orders, verify payments, and dispatch live tracking status updates.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-850">
            <FcSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, customer, status..."
              className="w-full bg-transparent outline-none dark:text-white text-sm"
            />
          </label>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 text-sm transition"
          >
            Refresh Orders
          </button>
        </div>
      </header>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Order ID</th>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Customer</th>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Date Placed</th>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Payment</th>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Total</th>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {loading ? (
                <TableRowSkeleton rows={5} cols={7} />
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-500">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/55 dark:hover:bg-gray-850/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-zinc-400 font-bold select-all truncate max-w-[120px]">
                        {order._id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{order.user?.name || "Deleted User"}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{order.user?.email || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs uppercase font-bold text-gray-700 dark:text-gray-300">{order.paymentMethod}</span>
                        <span className={`ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          order.orderStatus === "Delivered"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : order.orderStatus === "Cancelled"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openManageModal(order)}
                          className="rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40 px-3 py-1.5 text-xs font-bold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Order Modal Overlay */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 max-h-[90vh] flex flex-col transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Manage Order</h2>
                <p className="text-xs text-zinc-400 mt-1">ID: <span className="font-mono text-zinc-500 font-bold select-all">{selectedOrder._id}</span></p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-gray-800 rounded-full transition dark:text-zinc-500"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
                {/* Left Panel: Items & Address */}
                <div className="space-y-6">
                  {/* Items List */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Items Ordered</h4>
                    <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 p-4 bg-zinc-50/20 dark:border-zinc-800 dark:bg-zinc-900/20 dark:divide-zinc-800">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={item._id || idx} className={`flex gap-3 items-center ${idx > 0 ? "pt-3 mt-3" : ""}`}>
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-12 w-12 rounded-lg object-cover bg-white border dark:border-gray-800"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-gray-950 dark:text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Price: ₹{item.price} | Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-950 dark:text-white">₹{((item.price - (item.price * (item.discount || 0)) / 100) * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Shipping Address</h4>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2 text-xs text-gray-700 dark:text-zinc-300">
                      <p className="font-bold text-sm text-gray-950 dark:text-white flex items-center gap-1.5"><FiMapPin className="text-zinc-400" /> {selectedOrder.shippingAddress.name}</p>
                      <p className="leading-relaxed mt-1">{selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}</p>
                      <div className="flex items-center gap-4 pt-2 border-t dark:border-zinc-800 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1"><FiPhone /> {selectedOrder.shippingAddress.phone}</span>
                        {selectedOrder.user?.email && <span className="flex items-center gap-1"><FiMail /> {selectedOrder.user.email}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Stepper Status Update & Timeline */}
                <div className="space-y-6">
                  {/* Status update form */}
                  <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/10 dark:border-indigo-900/40 dark:bg-indigo-900/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 mb-3">Push Tracking Update</h4>
                    <form id="order-update-form" onSubmit={handleUpdateStatus} className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Set Delivery State</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full text-xs rounded-lg border dark:border-zinc-800 dark:bg-gray-800 dark:text-white px-3 py-2 outline-none"
                        >
                          {["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Set Payment Status</label>
                        <select
                          value={newPaymentStatus}
                          onChange={(e) => setNewPaymentStatus(e.target.value)}
                          className="w-full text-xs rounded-lg border dark:border-zinc-800 dark:bg-gray-800 dark:text-white px-3 py-2 outline-none"
                        >
                          {["pending", "paid", "failed"].map((ps) => (
                            <option key={ps} value={ps}>{ps.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Message (e.g. Courier description)</label>
                        <textarea
                          value={statusMessage}
                          onChange={(e) => setStatusMessage(e.target.value)}
                          placeholder="e.g. Dispatched from Bangalore hub via Xpressbees. AWB: 27123912."
                          rows={2}
                          className="w-full text-xs rounded-lg border dark:border-zinc-800 dark:bg-gray-800 dark:text-white px-3 py-2 outline-none resize-none"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Payment Info</h4>
                    <div className="border border-zinc-200 rounded-xl p-3 dark:border-zinc-800 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-bold uppercase">{selectedOrder.paymentMethod}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          selectedOrder.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/20"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20"
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      {selectedOrder.paymentDetails?.razorpay_payment_id && (
                        <div className="mt-2 pt-2 border-t dark:border-zinc-800 font-mono text-[9px] text-zinc-400 space-y-0.5">
                          <p>Payment ID: {selectedOrder.paymentDetails.razorpay_payment_id}</p>
                          <p>Order ID: {selectedOrder.paymentDetails.razorpay_order_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Checklist Timeline */}
              <div className="pt-4 border-t dark:border-gray-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Current Order tracking Timeline</h4>
                <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-4">
                  {selectedOrder.trackingHistory.slice().reverse().map((log, idx) => (
                    <div key={log._id || idx} className="relative">
                      <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-800">
                        <div className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? "bg-indigo-600" : "bg-zinc-400"}`} />
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                          <span>{log.status}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            {new Date(log.timestamp).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                            })}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t pt-4 mt-4 flex justify-end gap-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
              >
                Close Details
              </button>
              <button
                type="submit"
                form="order-update-form"
                disabled={updating}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white transition shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
