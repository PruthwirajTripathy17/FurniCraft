import Testimonial from "../models/Testimonial.js";
import Notification from "../models/Notification.js";

export async function getTestimonials(req, res) {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.json(testimonials);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch testimonials" });
  }
}

export async function createTestimonial(req, res) {
  try {
    const { name, role, rating, feedback } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const testimonial = await Testimonial.create({
      name,
      role: role || "",
      rating: Number(rating) || 5,
      feedback: feedback || "",
    });

    try {
      await Notification.create({
        title: "New Testimonial Submitted",
        message: `Testimonial submitted by ${name} (${role || "Customer"}).`,
        type: "testimonial",
        link: `/admin/testimonials?id=${testimonial._id}`,
      });
    } catch (err) {
      console.error("Failed to create testimonial notification:", err);
    }

    return res.status(201).json(testimonial);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create testimonial" });
  }
}

export async function updateTestimonial(req, res) {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    return res.json(testimonial);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update testimonial" });
  }
}

export async function deleteTestimonial(req, res) {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    return res.json({ message: "Testimonial deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete testimonial" });
  }
}
