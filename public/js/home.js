// Home page specific JavaScript

// Load featured products (just showing first 4 products)
function loadFeaturedProducts() {
  const productsContainer = document.getElementById("products-container")

  if (!productsContainer) {
    console.error("Products container not found")
    return
  }

  // Show loading message
  productsContainer.innerHTML = '<div class="loading">Loading products...</div>'

  // Fetch products from API
  fetch("/api/products")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((products) => {
      console.log("Products loaded:", products.length)

      // Clear loading message
      productsContainer.innerHTML = ""

      if (!products || products.length === 0) {
        productsContainer.innerHTML = '<div class="error">No products found</div>'
        return
      }

      // Display only first 4 products as featured
      const featuredProducts = products.slice(0, 4)

      featuredProducts.forEach((product) => {
        const productCard = document.createElement("div")
        productCard.className = "product-card"
        productCard.innerHTML = `
          <a href="/product-detail.html?id=${product.id}" class="product-image">
            <img src="${product.image}" alt="${product.name}">
          </a>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
        `

        productsContainer.appendChild(productCard)
      })

      // Add event listeners to Add to Cart buttons
      document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.getAttribute("data-id")
          addToCart(productId)
        })
      })
    })
    .catch((error) => {
      console.error("Error loading products:", error)
      productsContainer.innerHTML = '<div class="error">Failed to load products. Please try again later.</div>'
    })
}

// Add item to cart
function addToCart(productId, quantity = 1) {
  fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to add item to cart")
      }
      return response.json()
    })
    .then((data) => {
      console.log("Item added to cart:", data)
      updateCartCount()
      showNotification("Item added to cart!")
    })
    .catch((error) => {
      console.error("Error adding to cart:", error)
      showNotification("Failed to add item to cart", "error")
    })
}

// Update cart count in the header
function updateCartCount() {
  fetch("/api/cart")
    .then((response) => response.json())
    .then((cart) => {
      const cartCountElement = document.getElementById("cart-count")
      if (cartCountElement) {
        const itemCount = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0
        cartCountElement.textContent = itemCount
      }
    })
    .catch((error) => {
      console.error("Error updating cart count:", error)
    })
}

// Show notification
function showNotification(message, type = "success") {
  // Create notification element if it doesn't exist
  let notification = document.querySelector(".notification")
  if (!notification) {
    notification = document.createElement("div")
    notification.className = `notification ${type}`
    document.body.appendChild(notification)

    // Add styles for notification
    notification.style.position = "fixed"
    notification.style.bottom = "20px"
    notification.style.right = "20px"
    notification.style.padding = "10px 20px"
    notification.style.borderRadius = "4px"
    notification.style.color = "white"
    notification.style.zIndex = "1000"

    if (type === "success") {
      notification.style.backgroundColor = "#4CAF50"
    } else {
      notification.style.backgroundColor = "#F44336"
    }
  }

  // Set message
  notification.textContent = message

  // Show notification
  notification.style.display = "block"

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none"
  }, 3000)
}

// Initialize home page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Home page loaded")
  loadFeaturedProducts()
  updateCartCount()
})
