// Common functions used across multiple pages

// Format price to currency
function formatPrice(price) {
  return "$" + price.toFixed(2)
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

// Update cart count in the header
async function updateCartCount() {
  try {
    const response = await fetch("/api/cart")
    const cart = await response.json()

    const cartCountElement = document.getElementById("cart-count")
    if (cartCountElement) {
      const itemCount = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0
      cartCountElement.textContent = itemCount
    }
  } catch (error) {
    console.error("Error updating cart count:", error)
  }
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
    })

    if (!response.ok) {
      throw new Error("Failed to add item to cart")
    }

    await updateCartCount()
    showNotification("Item added to cart!")
  } catch (error) {
    console.error("Error adding to cart:", error)
    showNotification("Failed to add item to cart", "error")
  }
}

// Initialize page
function initPage() {
  updateCartCount()
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", initPage)

