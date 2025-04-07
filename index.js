const express = require("express")
const path = require("path")
const fs = require("fs")
const app = express()
const PORT = process.env.PORT || 3000

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Middleware
app.use(express.json())
app.use(
  express.static(path.join(__dirname, "public"), {
    // Add debugging for static file serving
    setHeaders: (res, filePath) => {
      console.log(`Serving static file: ${filePath}`)
    },
  }),
)

// Products data
const dataDir = path.join(__dirname, "data")
const productsFilePath = path.join(dataDir, "products.json")
const cartFilePath = path.join(dataDir, "cart.json")

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log("Created data directory")
}

// Add this code after the data directory check
// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, "public", "images")
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
  console.log("Created images directory")

  // Create a default logo file
  const defaultLogoPath = path.join(imagesDir, "logo.png")
  if (!fs.existsSync(defaultLogoPath)) {
    // Create a simple SVG as a placeholder
    const svgContent = `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="60" fill="#3a86ff" rx="8" ry="8"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">ShopSimple</text>
    </svg>`

    fs.writeFileSync(defaultLogoPath, svgContent)
    console.log("Created default logo file")
  }
}

// Create products.json if it doesn't exist
if (!fs.existsSync(productsFilePath)) {
  const sampleProducts = [
    {
      id: "1",
      name: "Wireless Headphones",
      description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
      price: 199.99,
      image: "/images/placeholder.jpg",
      category: "electronics",
    },
    {
      id: "2",
      name: "Smart Watch",
      description: "Track your fitness, receive notifications, and more with this sleek smart watch.",
      price: 249.99,
      image: "/images/placeholder.jpg",
      category: "electronics",
    },
    {
      id: "3",
      name: "Organic Cotton T-Shirt",
      description: "Comfortable, eco-friendly t-shirt made from 100% organic cotton.",
      price: 29.99,
      image: "/images/placeholder.jpg",
      category: "clothing",
    },
    {
      id: "4",
      name: "Leather Wallet",
      description: "Handcrafted genuine leather wallet with RFID protection.",
      price: 59.99,
      image: "/images/placeholder.jpg",
      category: "accessories",
    },
    {
      id: "5",
      name: "Stainless Steel Water Bottle",
      description: "Double-walled insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
      price: 34.99,
      image: "/images/placeholder.jpg",
      category: "home",
    },
    {
      id: "6",
      name: "Wireless Charging Pad",
      description: "Fast wireless charging for all Qi-enabled devices.",
      price: 39.99,
      image: "/images/placeholder.jpg",
      category: "electronics",
    },
    {
      id: "7",
      name: "Ceramic Coffee Mug",
      description: "Handmade ceramic mug, perfect for your morning coffee or tea.",
      price: 19.99,
      image: "/images/placeholder.jpg",
      category: "home",
    },
    {
      id: "8",
      name: "Bluetooth Speaker",
      description: "Portable waterproof speaker with amazing sound quality and 20-hour battery life.",
      price: 89.99,
      image: "/images/placeholder.jpg",
      category: "electronics",
    },
  ]
  fs.writeFileSync(productsFilePath, JSON.stringify(sampleProducts, null, 2))
  console.log("Created sample products file")
}

// Create cart.json if it doesn't exist
if (!fs.existsSync(cartFilePath)) {
  const emptyCart = { items: [] }
  fs.writeFileSync(cartFilePath, JSON.stringify(emptyCart, null, 2))
  console.log("Created empty cart file")
}

// Get all products
app.get("/api/products", (req, res) => {
  try {
    const data = fs.readFileSync(productsFilePath, "utf8")
    const products = JSON.parse(data)
    console.log("Sending products:", products.length)
    res.json(products)
  } catch (error) {
    console.error("Error reading products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get a single product by ID
app.get("/api/products/:id", (req, res) => {
  try {
    const data = fs.readFileSync(productsFilePath, "utf8")
    const products = JSON.parse(data)
    const product = products.find((p) => p.id === req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Error reading product:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
})

// Get cart
app.get("/api/cart", (req, res) => {
  try {
    if (!fs.existsSync(cartFilePath)) {
      return res.json({ items: [] })
    }

    const data = fs.readFileSync(cartFilePath, "utf8")
    const cart = JSON.parse(data)
    res.json(cart)
  } catch (error) {
    console.error("Error reading cart:", error)
    res.status(500).json({ error: "Failed to fetch cart" })
  }
})

// Add item to cart
app.post("/api/cart", (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" })
    }

    // Get product details
    const productsData = fs.readFileSync(productsFilePath, "utf8")
    const products = JSON.parse(productsData)
    const product = products.find((p) => p.id === productId)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Get current cart
    let cart
    try {
      const cartData = fs.readFileSync(cartFilePath, "utf8")
      cart = JSON.parse(cartData)
    } catch (error) {
      // Create new cart if it doesn't exist
      cart = { items: [] }
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.id === productId)

    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        product,
        quantity,
      })
    }

    // Save updated cart
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2))

    res.status(201).json(cart)
  } catch (error) {
    console.error("Error updating cart:", error)
    res.status(500).json({ error: "Failed to update cart" })
  }
})

// Update cart item quantity
app.put("/api/cart/:productId", (req, res) => {
  try {
    const { productId } = req.params
    const { quantity } = req.body

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: "Valid quantity is required" })
    }

    // Get current cart
    const cartData = fs.readFileSync(cartFilePath, "utf8")
    const cart = JSON.parse(cartData)

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.product.id === productId)

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" })
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1)
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity
    }

    // Save updated cart
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2))

    res.json(cart)
  } catch (error) {
    console.error("Error updating cart item:", error)
    res.status(500).json({ error: "Failed to update cart item" })
  }
})

// Remove item from cart
app.delete("/api/cart/:productId", (req, res) => {
  try {
    const { productId } = req.params

    // Get current cart
    const cartData = fs.readFileSync(cartFilePath, "utf8")
    const cart = JSON.parse(cartData)

    // Remove item from cart
    cart.items = cart.items.filter((item) => item.product.id !== productId)

    // Save updated cart
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2))

    res.json(cart)
  } catch (error) {
    console.error("Error removing cart item:", error)
    res.status(500).json({ error: "Failed to remove cart item" })
  }
})

// Clear cart
app.delete("/api/cart", (req, res) => {
  try {
    // Create empty cart
    const cart = { items: [] }

    // Save empty cart
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2))

    res.json(cart)
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.status(500).json({ error: "Failed to clear cart" })
  }
})

// Add this before the checkout endpoint
// Get cart count
app.get("/api/cart/count", (req, res) => {
  try {
    if (!fs.existsSync(cartFilePath)) {
      return res.json(0)
    }

    const data = fs.readFileSync(cartFilePath, "utf8")
    const cart = JSON.parse(data)

    const count = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0
    res.json(count)
  } catch (error) {
    console.error("Error getting cart count:", error)
    res.status(500).json({ error: "Failed to get cart count" })
  }
})

// Checkout endpoint
app.post("/api/cart/checkout", (req, res) => {
  try {
    // In a real application, this would process payment, create an order, etc.
    // For now, we'll just clear the cart
    const emptyCart = { items: [] }
    fs.writeFileSync(cartFilePath, JSON.stringify(emptyCart, null, 2))

    console.log("Checkout completed successfully")
    res.status(200).json({ success: true, message: "Checkout completed successfully" })
  } catch (error) {
    console.error("Error during checkout:", error)
    res.status(500).json({ error: "Failed to complete checkout" })
  }
})

// Add this before the catch-all route
app.get("/images/logo.png", (req, res) => {
  const logoPath = path.join(__dirname, "public", "images", "logo.png")

  if (fs.existsSync(logoPath)) {
    console.log("Serving logo from file:", logoPath)
    res.sendFile(logoPath)
  } else {
    console.log("Logo file not found, generating SVG")
    res.setHeader("Content-Type", "image/svg+xml")
    res.send(`<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="60" fill="#3a86ff" rx="8" ry="8"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">ShopSimple</text>
    </svg>`)
  }
})

// Add this route to handle the Hulum logo specifically
app.get("/images/Hulum.png", (req, res) => {
  const hulumPath = path.join(__dirname, "public", "images", "Hulum.png")

  if (fs.existsSync(hulumPath)) {
    console.log("Serving Hulum logo from file:", hulumPath)
    res.sendFile(hulumPath)
  } else {
    console.log("Hulum logo file not found, generating placeholder")
    res.setHeader("Content-Type", "image/svg+xml")
    res.send(`<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="60" fill="#3a86ff" rx="8" ry="8"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">Hulum</text>
    </svg>`)
  }
})

// Serve index.html for all other routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})