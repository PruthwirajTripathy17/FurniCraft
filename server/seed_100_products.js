import mongoose from "mongoose";
import Product from "./models/Product.js";

const MONGO_URI = "mongodb+srv://Pruthwi_17:pruthwi%40123@furniturecluster.7dhxasb.mongodb.net/?appName=FurnitureCluster";

const styles = ["Classic", "Modern", "Minimalist", "Rustic", "Scandinavian", "Industrial", "Contemporary", "Mid-Century", "Vintage", "Luxury"];
const materials = ["Velvet", "Leather", "Oak Wood", "Walnut Wood", "Teak Wood", "Linen", "Marble", "Metal", "Rattan", "Bouclé"];
const types = {
  "Chair": ["Lounge Chair", "Dining Chair", "Armchair", "Accent Chair", "Office Chair", "Recliner", "Rocking Chair", "Stool"],
  "Sofa": ["Chesterfield Sofa", "Sectional Sofa", "Sofa Bed", "Loveseat", "Reclining Sofa", "Daybed", "Chaise Lounge", "Modular Couch"],
  "Table": ["Coffee Table", "Dining Table", "Side Table", "Console Table", "End Table", "Desk", "Bedside Table", "Conference Table"]
};

const imagesByCategory = {
  "Chair": [
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80"
  ],
  "Sofa": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80"
  ],
  "Table": [
    "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"
  ]
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB database.");

    // Generate 100 items
    const productsToSeed = [];
    const categories = ["Chair", "Sofa", "Table"];

    for (let i = 1; i <= 100; i++) {
      const category = categories[i % categories.length];
      const style = styles[i % styles.length];
      const material = materials[i % materials.length];
      
      const typeList = types[category];
      const type = typeList[i % typeList.length];

      const title = `${style} ${material} ${type}`;
      const description = `This ${style.toLowerCase()} ${type.toLowerCase()} is masterfully built with premium ${material.toLowerCase()}. Perfect for adding style, exceptional durability, and high utility value to your interior design. Designed to blend seamlessly with any standard decor setups.`;
      
      const price = 2999 + (i * 479) % 45000;
      const discount = i % 7 === 0 ? 10 + (i % 3) * 5 : 0;
      const isFeatured = i % 12 === 0;
      const isBestSeller = i % 10 === 0;
      const sold = (i * 3) % 150;
      const imageList = [imagesByCategory[category][i % 5]];

      productsToSeed.push({
        title,
        description,
        price,
        sold,
        isFeatured,
        isBestSeller,
        discount,
        images: imageList,
        category
      });
    }

    console.log(`Generated ${productsToSeed.length} products. Bulk inserting...`);
    const inserted = await Product.insertMany(productsToSeed);
    console.log(`Successfully seeded ${inserted.length} products in the database!`);
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
