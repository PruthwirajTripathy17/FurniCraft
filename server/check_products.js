import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://Pruthwi_17:pruthwi%40123@furniturecluster.7dhxasb.mongodb.net/?appName=FurnitureCluster";

const productSchema = new mongoose.Schema({
  title: String,
  category: String,
  price: Number,
  isFeatured: Boolean,
  isBestSeller: Boolean,
  images: [String],
});

const Product = mongoose.model("Product", productSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected");
    const products = await Product.find({});
    products.forEach(p => {
      console.log(JSON.stringify(p, null, 2));
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
