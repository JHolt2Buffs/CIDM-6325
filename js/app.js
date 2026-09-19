"use strict";

// The catalog is the single source of truth for product content and prices.
const products = [
  {
    id: "avatar-hoop-scholar", name: "Hoop Scholar", category: "Avatar", price: 200, rarity: "Rare",
    image: "images/avatar-hoop-scholar.png",
    alt: "Orange basketball with a silver question mark and gold laurel leaves",
    description: "A basketball-and-question-mark avatar created for fans who treat every trivia question like a championship challenge."
  },
  {
    id: "avatar-neon-hoop", name: "Neon Hoop", category: "Avatar", price: 250, rarity: "Rare",
    image: "images/avatar-neon-hoop.png",
    alt: "Basketball and hoop surrounded by an electric-blue glow",
    description: "An electric-blue hoop and basketball avatar that gives any profile an energetic arena look."
  },
  {
    id: "frame-courtside-gold", name: "Courtside Gold", category: "Profile Frame", price: 450, rarity: "Epic",
    image: "images/frame-courtside-gold.png",
    alt: "Gold square profile frame with basketball corners and electric-blue accents",
    description: "A premium gold profile frame with basketball details and electric-blue lighting."
  },
  {
    id: "frame-hardwood-classic", name: "Hardwood Classic", category: "Profile Frame", price: 300, rarity: "Rare",
    image: "images/frame-hardwood-classic.png",
    alt: "Polished hardwood profile frame with basketball court line details",
    description: "A polished hardwood frame inspired by the painted lines and warm colors of a classic basketball court."
  },
  {
    id: "title-hardwood-historian", name: "Hardwood Historian", category: "Profile Title", price: 150, rarity: "Uncommon",
    titleText: "Hardwood Historian",
    description: "A profile title for fans who know the players, teams, and moments that shaped basketball history."
  },
  {
    id: "title-trivia-all-star", name: "Trivia All-Star", category: "Profile Title", price: 300, rarity: "Rare",
    titleText: "Trivia All-Star",
    description: "A premium title for users who want their basketball knowledge recognized."
  }
];

function formatCredits(amount) {
  return amount.toLocaleString("en-US");
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = product.id;
    card.dataset.category = product.category;
    card.setAttribute("aria-labelledby", `${product.id}-name`);
    const previewClass = product.rarity === "Epic" ? "preview-epic" : product.id === "frame-hardwood-classic" ? "preview-hardwood" : "";
    // This HTML contains only our fixed catalog data. Submitted reviews use textContent.
    const preview = product.image
      ? `<img src="${product.image}" alt="${product.alt}" width="180" height="180">`
      : `<div class="product-title-preview"><span class="preview-initials" aria-hidden="true">JF</span><span class="preview-player-name">JordanFan23</span><span class="title-pill ${product.id === "title-trivia-all-star" ? "title-blue" : ""}">${product.titleText}</span></div>`;
    card.innerHTML = `
      <div class="product-preview ${previewClass}">
        <div class="preview-topline"><span class="product-category">${product.category}</span><span class="rarity rarity-${product.rarity.toLowerCase()}">${product.rarity}</span></div>
        ${preview}
      </div>
      <div class="product-details">
        <h3 id="${product.id}-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price"><span class="coin coin-small" aria-hidden="true">C</span><span><strong>${formatCredits(product.price)}</strong><small> credits</small></span></span>
          <button type="button" class="button button-primary redeem-button" data-redeem="${product.id}" aria-label="Redeem ${product.name} for ${product.price} credits">Redeem <span aria-hidden="true">↗</span></button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

renderProducts();
