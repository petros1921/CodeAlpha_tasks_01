// Cart page specific JavaScript

// Helper function to format price
function formatPrice(price) {
  return "$" + price.toFixed(2)
}

// Helper function to update cart count in header
async function updateCartCount() {
  try {
    const response = await fetch("/api/cart")
    if (response.ok) {
      const cart = await response.json()
      const cartCountElement = document.getElementById("cart-count")
      if (cartCountElement) {
        const itemCount = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0
        cartCountElement.textContent = itemCount
      }
    } else {
      console.error("Failed to fetch cart count")
    }
  } catch (error) {
    console.error("Error updating cart count:", error)
  }
}

// Helper function to show notifications
function showNotification(message, type = "success") {
  const notificationDiv = document.createElement("div")
  notificationDiv.classList.add("notification", type)
  notificationDiv.textContent = message

  // Add styling for position and animation
  notificationDiv.style.position = "fixed"
  notificationDiv.style.top = "20px"
  notificationDiv.style.right = "-300px" // Start outside the screen
  notificationDiv.style.background = type === "error" ? "#ff4d4d" : "#4CAF50"
  notificationDiv.style.color = "#fff"
  notificationDiv.style.padding = "12px 20px"
  notificationDiv.style.borderRadius = "5px"
  notificationDiv.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"
  notificationDiv.style.fontSize = "16px"
  notificationDiv.style.transition = "right 0.4s ease-in-out"
  notificationDiv.style.zIndex = "1000"

  document.body.appendChild(notificationDiv)

  // Slide in from the right
  setTimeout(() => {
    notificationDiv.style.right = "20px"
  }, 100)

  // Remove the notification after a few seconds
  setTimeout(() => {
    notificationDiv.style.right = "-300px" // Slide out
    setTimeout(() => {
      notificationDiv.remove()
    }, 400)
  }, 3000)
}

// Load cart items
async function loadCart() {
  const cartContainer = document.getElementById("cart-container")

  try {
    const response = await fetch("/api/cart")
    const cart = await response.json()

    // Clear loading message
    cartContainer.innerHTML = ""

    if (!cart.items || cart.items.length === 0) {
      // Show empty cart message
      cartContainer.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-cart"></i>
          <p>Your cart is empty</p>
          <a href="/products.html" class="btn">Continue Shopping</a>
        </div>
      `
      return
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
    const shipping = subtotal > 0 ? 10 : 0 // Flat shipping rate
    const total = subtotal + shipping

    // Create cart HTML
    const cartHTML = document.createElement("div")
    cartHTML.innerHTML = `
      <div class="cart-items">
        ${cart.items
          .map(
            (item) => `
          <div class="cart-item" data-id="${item.product.id}">
            <div class="cart-item-image">
              <img src="${item.product.image}" alt="${item.product.name}">
            </div>
            <div class="cart-item-info">
              <h3 class="cart-item-name">${item.product.name}</h3>
              <div class="cart-item-price">${formatPrice(item.product.price)}</div>
            </div>
            <div class="cart-item-quantity">
              <button class="quantity-btn decrease" data-id="${item.product.id}">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-id="${item.product.id}">
              <button class="quantity-btn increase" data-id="${item.product.id}">+</button>
            </div>
            <button class="cart-item-remove" data-id="${item.product.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Shipping</span>
          <span>${formatPrice(shipping)}</span>
        </div>
        <div class="cart-summary-row total">
          <span>Total</span>
          <span>${formatPrice(total)}</span>
        </div>
        <button class="checkout-btn">Proceed to Checkout</button>
      </div>
    `

    cartContainer.appendChild(cartHTML)

    // Add event listeners
    document.querySelectorAll(".decrease").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const productId = e.target.dataset.id
        const input = document.querySelector(`.quantity-input[data-id="${productId}"]`)
        const currentValue = Number.parseInt(input.value)

        if (currentValue > 1) {
          input.value = currentValue - 1
          await updateCartItemQuantity(productId, currentValue - 1)
        }
      })
    })

    document.querySelectorAll(".increase").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const productId = e.target.dataset.id
        const input = document.querySelector(`.quantity-input[data-id="${productId}"]`)
        const currentValue = Number.parseInt(input.value)

        if (currentValue < 99) {
          input.value = currentValue + 1
          await updateCartItemQuantity(productId, currentValue + 1)
        }
      })
    })

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", async (e) => {
        const productId = e.target.dataset.id
        const newValue = Number.parseInt(e.target.value)

        if (newValue >= 1 && newValue <= 99) {
          await updateCartItemQuantity(productId, newValue)
        }
      })
    })

    document.querySelectorAll(".cart-item-remove").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const productId = e.target.closest(".cart-item-remove").dataset.id
        await removeCartItem(productId)
      })
    })

    // Add checkout event listener
    const checkoutButton = document.querySelector(".checkout-btn")
    if (checkoutButton) {
      checkoutButton.addEventListener("click", checkout)
    }
  } catch (error) {
    console.error("Error loading cart:", error)
    cartContainer.innerHTML = '<div class="error">Failed to load cart. Please try again later.</div>'
  }
}

// Update cart item quantity
async function updateCartItemQuantity(productId, quantity) {
  try {
    const response = await fetch(`/api/cart/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      throw new Error("Failed to update cart")
    }

    // Reload cart to reflect changes
    await loadCart()
    await updateCartCount()
  } catch (error) {
    console.error("Error updating cart item:", error)
    showNotification("Failed to update cart", "error")
  }
}

// Remove item from cart
async function removeCartItem(productId) {
  try {
    const response = await fetch(`/api/cart/${productId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to remove item from cart")
    }

    // Reload cart to reflect changes
    await loadCart()
    await updateCartCount()
    showNotification("Item removed from cart!")
  } catch (error) {
    console.error("Error removing cart item:", error)
    showNotification("Failed to remove item from cart", "error")
  }
}

// Checkout functionality
async function checkout() {
  try {
    console.log("Starting checkout process...")
    const response = await fetch("/api/cart/checkout", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to complete checkout")
    }

    const result = await response.json()
    console.log("Checkout response:", result)

    // Clear cart UI
    document.getElementById("cart-container").innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-check-circle"></i>
        <p>Checkout successful! Thank you for your purchase.</p>
        <a href="/products.html" class="btn">Continue Shopping</a>
      </div>
    `

    // Update cart count
    await updateCartCount()

    // Show success notification
    showNotification("Checkout successful! Thank you for your purchase.", "success")
  } catch (error) {
    console.error("Error during checkout:", error)
    showNotification("Checkout failed. Please try again.", "error")
  }
}

// Initialize cart page
function initCartPage() {
  console.log("Initializing cart page...")
  loadCart()
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", initCartPage)

