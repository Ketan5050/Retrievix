// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/retrievix")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String
});

const itemSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  type: String,  // "lost" or "found"
  date: String,
  contactInfo: String,
  userId: String,
  image: String
});

const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);

// Routes
// ✅ Register
// Password validation function
function isValidPassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  return (
    password.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial
  );
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 🔹 validate password
    if (!isValidPassword(password)) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    if (err.code === 11000) {
      res.json({ success: false, message: "Email already registered" });
    } else {
      res.json({ success: false, message: "Registration failed" });
    }
  }
});


// ✅ Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: "Login failed" });
  }
});


// ✅ Create item
app.post("/api/items", async (req, res) => {
  try {
    const { image } = req.body;

    // Defensive check for image type validation
    if (image && typeof image === 'string') {
      // Validate image data URI prefix for allowed image types
      const allowedPrefixes = [
        "data:image/jpeg",
        "data:image/png",
        "data:image/gif",
        "data:image/tiff",
        "data:image/bmp",
        "data:image/webp",
        "data:image/svg+xml"
      ];

      const isValidImage = allowedPrefixes.some(prefix => image.startsWith(prefix));
      if (!isValidImage) {
        return res.json({
          success: false,
          message: "Unsupported image type. Supported types: JPG, PNG, GIF, TIFF, BMP, WEBP, SVG"
        });
      }
    } else if (image) {
      // image field present but not a string
      return res.json({
        success: false,
        message: "Invalid image data format"
      });
    }

    const item = new Item(req.body);
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    console.error("Error saving item:", err);
    res.json({ success: false, message: "Failed to save item" });
  }
});

// ✅ Get items
app.get("/api/items", async (req, res) => {
  try {
    const type = req.query.type; // lost | found
    const items = await Item.find(type ? { type } : {});
    res.json({ success: true, items });
  } catch (err) {
    res.json({ success: false, message: "Failed to fetch items" });
  }
});

// ✅ Delete item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.json({ success: false, message: "Item not found" });
    }

    // Check if user owns the item
    if (item.userId !== req.body.userId) {
      return res.json({ success: false, message: "Unauthorized to delete this item" });
    }

    await Item.findByIdAndDelete(id);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.json({ success: false, message: "Failed to delete item" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
