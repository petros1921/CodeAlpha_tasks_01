// Product detail page specific JavaScript

// Import necessary functions (assuming they are in utils.js)
import { formatPrice, addToCart } from "./utils.js"

// Get product ID from URL
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("id")
}

// Load product details
async function loadProductDetails() {
  const productContainer = document.getElementById("product-container")
  const productId = getProductIdFromUrl()

  if (!productId) {
    productContainer.innerHTML = '<div class="error">Product not found</div>'
    return
  }

  try {
    const response = await fetch(`/api/products/${productId}`)

    if (!response.ok) {
      throw new Error("Product not found")
    }

    const product = await response.json()

    // Update page title
    document.title = `${product.name} - ShopSimple`

    // Clear loading message
    productContainer.innerHTML = ""

    // Create product detail HTML
    const productDetail = document.createElement("div")
    productDetail.className = "product-detail-container"
    productDetail.innerHTML = `
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-detail-info">
        <h1 class="product-detail-name">${product.name}</h1>
        <div class="product-detail-price">${formatPrice(product.price)}</div>
        <p class="product-detail-description">${product.description}</p>
        <div class="product-detail-add">
          <div class="quantity-control">
            <button class="quantity-btn decrease">-</button>
            <input type="number" class="quantity-input" value="1" min="1" max="99">
            <button class="quantity-btn increase">+</button>
          </div>
          <button class="btn add-to-cart" data-id="${product.id}">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    `

    productContainer.appendChild(productDetail)

    // Add event listeners
    const quantityInput = document.querySelector(".quantity-input")
    const decreaseBtn = document.querySelector(".decrease")
    const increaseBtn = document.querySelector(".increase")
    const addToCartBtn = document.querySelector(".add-to-cart")

    decreaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1
      }
    })

    increaseBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      if (currentValue < 99) {
        quantityInput.value = currentValue + 1
      }
    })

    addToCartBtn.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      addToCart(product.id, quantity)
    })
  } catch (error) {
    console.error("Error loading product details:", error)
    productContainer.innerHTML = '<div class="error">Failed to load product details. Please try again later.</div>'
  }
}

// Initialize product detail page
function initProductDetailPage() {
  loadProductDetails()
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", initProductDetailPage)

