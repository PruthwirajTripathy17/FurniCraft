import Razorpay from "razorpay";
import crypto from "crypto";

// Fallback to dummy values if env values are missing, so it doesn't crash on startup
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_w3M2lFsk2sUf0V",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "Hk7S6i8U3f3Jc7pL9q0Rz5tB",
  });
};

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_w3M2lFsk2sUf0V";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "Hk7S6i8U3f3Jc7pL9q0Rz5tB";

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    const errorMessage = error.error?.description || error.message || "Failed to create payment order with Razorpay";
    return res.status(500).json({
      message: errorMessage,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required verification parameters" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "Hk7S6i8U3f3Jc7pL9q0Rz5tB";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      console.warn("Payment verification signature mismatch");
      return res.status(400).json({
        message: "Signature verification failed. Potential tampering detected.",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      message: error.message || "Payment verification failed",
    });
  }
};
// Trigger nodemon server restart to reload fresh env keys
