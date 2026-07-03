const fallbackTires = [
  { id: 1, brand: "Michelin", model: "Primacy 4+", season: "Summer", size: "205/55 R16", rim: "R16", price: 42000, stock: 18, rating: 4.8, recommended: true },
  { id: 2, brand: "Nokian", model: "Hakkapeliitta R5", season: "Winter", size: "215/60 R17", rim: "R17", price: 59000, stock: 9, rating: 4.9, recommended: true },
  { id: 3, brand: "Bridgestone", model: "Blizzak Ice", season: "Winter", size: "205/60 R16", rim: "R16", price: 52000, stock: 6, rating: 4.7, recommended: false },
  { id: 4, brand: "Hankook", model: "Ventus Prime 4", season: "Summer", size: "225/45 R17", rim: "R17", price: 45500, stock: 22, rating: 4.6, recommended: false },
  { id: 5, brand: "Continental", model: "PremiumContact 7", season: "Summer", size: "235/45 R18", rim: "R18", price: 63500, stock: 11, rating: 4.8, recommended: true },
  { id: 6, brand: "Michelin", model: "CrossClimate 2", season: "All-season", size: "215/55 R17", rim: "R17", price: 61000, stock: 8, rating: 4.7, recommended: true },
  { id: 7, brand: "Bridgestone", model: "Weather Control A005", season: "All-season", size: "195/65 R15", rim: "R15", price: 38000, stock: 19, rating: 4.5, recommended: false },
  { id: 8, brand: "Nokian", model: "Nordman RS2", season: "Winter", size: "185/65 R15", rim: "R15", price: 34500, stock: 4, rating: 4.4, recommended: false },
  { id: 9, brand: "Hankook", model: "Kinergy 4S2", season: "All-season", size: "205/55 R16", rim: "R16", price: 41000, stock: 15, rating: 4.6, recommended: false },
  { id: 10, brand: "Continental", model: "WinterContact TS 870", season: "Winter", size: "225/50 R17", rim: "R17", price: 67500, stock: 7, rating: 4.9, recommended: true },
  { id: 11, brand: "Michelin", model: "Pilot Sport 5", season: "Summer", size: "235/40 R18", rim: "R18", price: 72000, stock: 5, rating: 4.9, recommended: false },
  { id: 12, brand: "Bridgestone", model: "Turanza T005", season: "Summer", size: "215/55 R16", rim: "R16", price: 47000, stock: 13, rating: 4.5, recommended: false },
  { id: 13, brand: "Hankook", model: "Winter i*cept RS3", season: "Winter", size: "195/65 R15", rim: "R15", price: 36500, stock: 10, rating: 4.6, recommended: false },
  { id: 14, brand: "Nokian", model: "Wetproof", season: "Summer", size: "205/55 R16", rim: "R16", price: 39500, stock: 20, rating: 4.5, recommended: false },
  { id: 15, brand: "Continental", model: "AllSeasonContact 2", season: "All-season", size: "225/45 R17", rim: "R17", price: 58500, stock: 6, rating: 4.7, recommended: true },
  { id: 16, brand: "Michelin", model: "X-Ice Snow", season: "Winter", size: "215/65 R16", rim: "R16", price: 56000, stock: 8, rating: 4.8, recommended: false },
  { id: 17, brand: "Bridgestone", model: "Potenza Sport", season: "Summer", size: "245/40 R18", rim: "R18", price: 74500, stock: 3, rating: 4.7, recommended: false },
  { id: 18, brand: "Hankook", model: "Dynapro HP2", season: "All-season", size: "225/65 R17", rim: "R17", price: 54000, stock: 12, rating: 4.4, recommended: false },
  { id: 19, brand: "Continental", model: "EcoContact 6", season: "Summer", size: "195/65 R15", rim: "R15", price: 40500, stock: 16, rating: 4.6, recommended: false },
  { id: 20, brand: "Nokian", model: "Snowproof 2", season: "Winter", size: "205/55 R16", rim: "R16", price: 48500, stock: 9, rating: 4.7, recommended: true },
  { id: 21, brand: "Michelin", model: "Latitude Sport 3", season: "Summer", size: "225/65 R17", rim: "R17", price: 69000, stock: 7, rating: 4.8, recommended: false }
];

let tires = [...fallbackTires];

const state = {
  selectedTire: null,
  backendAvailable: false,
  requests: JSON.parse(localStorage.getItem("kazshinRequests") || "[]")
};

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const seasonFilter = document.getElementById("seasonFilter");
const brandFilter = document.getElementById("brandFilter");
const rimFilter = document.getElementById("rimFilter");
const stockFilter = document.getElementById("stockFilter");
const sortSelect = document.getElementById("sortSelect");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const requestForm = document.getElementById("requestForm");
const requestsTable = document.getElementById("requestsTable");
const noRequests = document.getElementById("noRequests");
const selectedProductBox = document.getElementById("selectedProductBox");
const productModal = document.getElementById("productModal");
const toast = document.getElementById("toast");

function formatPrice(value) {
  return value.toLocaleString("en-US").replace(/,/g, " ") + " KZT";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2300);
}

async function loadTiresFromBackend() {
  try {
    const response = await fetch("/api/tires");
    if (!response.ok) throw new Error("Backend unavailable");
    tires = await response.json();
    state.backendAvailable = true;
    showToast("Backend API connected");
  } catch (error) {
    tires = [...fallbackTires];
    state.backendAvailable = false;
  }
}

async function loadRequestsFromBackend() {
  if (!state.backendAvailable) return;
  try {
    const response = await fetch("/api/requests");
    if (!response.ok) throw new Error("Cannot load requests");
    const data = await response.json();
    state.requests = data.map(req => ({
      date: req.created_at,
      name: req.customer_name,
      phone: req.phone,
      tire: req.selected_tire || req.tire_size,
      season: req.preferred_season,
      message: req.message || "",
      status: req.status
    }));
  } catch (error) {
    showToast("Could not load backend requests");
  }
}

function populateFilterOptions() {
  brandFilter.innerHTML = '<option value="all">All brands</option>';
  rimFilter.innerHTML = '<option value="all">All rim sizes</option>';
  const brands = [...new Set(tires.map(t => t.brand))].sort();
  const rims = [...new Set(tires.map(t => t.rim))].sort();
  brands.forEach(brand => brandFilter.insertAdjacentHTML("beforeend", `<option value="${brand}">${brand}</option>`));
  rims.forEach(rim => rimFilter.insertAdjacentHTML("beforeend", `<option value="${rim}">${rim}</option>`));
  document.getElementById("statModels").textContent = tires.length;
}

function productMatches(tire) {
  const query = searchInput.value.trim().toLowerCase();
  const searchText = `${tire.brand} ${tire.model} ${tire.size} ${tire.rim} ${tire.season}`.toLowerCase();
  const matchesSearch = !query || searchText.includes(query);
  const matchesSeason = seasonFilter.value === "all" || tire.season === seasonFilter.value;
  const matchesBrand = brandFilter.value === "all" || tire.brand === brandFilter.value;
  const matchesRim = rimFilter.value === "all" || tire.rim === rimFilter.value;
  const matchesStock = stockFilter.value === "all" || (stockFilter.value === "available" && tire.stock > 7) || (stockFilter.value === "low" && tire.stock <= 7);
  return matchesSearch && matchesSeason && matchesBrand && matchesRim && matchesStock;
}

function sortProducts(products) {
  const sorted = [...products];
  if (sortSelect.value === "priceAsc") sorted.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "priceDesc") sorted.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "stockDesc") sorted.sort((a, b) => b.stock - a.stock);
  if (sortSelect.value === "recommended") sorted.sort((a, b) => Number(b.recommended) - Number(a.recommended) || b.rating - a.rating);
  return sorted;
}

function renderProducts() {
  const filtered = sortProducts(tires.filter(productMatches));
  resultCount.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
  emptyState.hidden = filtered.length !== 0;
  productGrid.innerHTML = filtered.map(tire => `
    <article class="product-card">
      <div class="product-art">
        <div class="tag-row">
          <span class="tag orange">${tire.season}</span>
          <span class="tag ${tire.stock <= 7 ? "yellow" : "green"}">${tire.stock <= 7 ? "Low stock" : "Available"}</span>
          ${tire.recommended ? `<span class="tag">Recommended</span>` : ""}
        </div>
      </div>
      <div class="product-body">
        <h3 class="product-title">${tire.brand} ${tire.model}</h3>
        <p class="product-sub">${tire.size} • ${tire.rim} • Rating ${tire.rating}</p>
        <div class="specs">
          <div class="spec"><span>Season</span><strong>${tire.season}</strong></div>
          <div class="spec"><span>Stock</span><strong>${tire.stock} pcs</strong></div>
          <div class="spec"><span>Brand</span><strong>${tire.brand}</strong></div>
          <div class="spec"><span>Rim</span><strong>${tire.rim}</strong></div>
        </div>
        <div class="price-row">
          <div class="price">${formatPrice(tire.price)}<br><small>per tire</small></div>
          <button class="mini-btn" type="button" onclick="openProduct(${tire.id})">Details</button>
        </div>
      </div>
    </article>
  `).join("");
}

function openProduct(id) {
  const tire = tires.find(item => item.id === id);
  if (!tire) return;
  document.getElementById("modalSeason").textContent = tire.season;
  document.getElementById("modalTitle").textContent = `${tire.brand} ${tire.model}`;
  document.getElementById("modalBody").innerHTML = `
    <div class="specs" style="grid-template-columns: repeat(2, 1fr);">
      <div class="spec"><span>Size</span><strong>${tire.size}</strong></div>
      <div class="spec"><span>Price</span><strong>${formatPrice(tire.price)}</strong></div>
      <div class="spec"><span>Stock</span><strong>${tire.stock} pcs</strong></div>
      <div class="spec"><span>Rating</span><strong>${tire.rating}/5</strong></div>
    </div>
    <p style="color:#64748b; margin: 16px 0;">This product can be selected for the customer request form. The selected model and size will be automatically inserted into the request.</p>
    <button class="btn btn-primary" type="button" onclick="selectProduct(${tire.id})">Select this tire</button>
  `;
  productModal.classList.add("show");
}

function selectProduct(id) {
  const tire = tires.find(item => item.id === id);
  if (!tire) return;
  state.selectedTire = tire;
  document.getElementById("requiredSize").value = tire.size;
  document.getElementById("preferredSeason").value = tire.season;
  selectedProductBox.innerHTML = `<strong>${tire.brand} ${tire.model}</strong>${tire.size} • ${formatPrice(tire.price)} • ${tire.stock} pcs available`;
  productModal.classList.remove("show");
  document.getElementById("request").scrollIntoView({ behavior: "smooth" });
  showToast("Product selected for request form");
}

function saveRequests() {
  localStorage.setItem("kazshinRequests", JSON.stringify(state.requests));
}

function renderRequests() {
  requestsTable.innerHTML = state.requests.map(req => `
    <tr>
      <td>${req.date}</td>
      <td>${req.name}</td>
      <td>${req.phone}</td>
      <td>${req.tire}</td>
      <td>${req.season}</td>
      <td><strong>${req.status}</strong></td>
    </tr>
  `).join("");
  noRequests.hidden = state.requests.length !== 0;
}

async function handleSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const size = document.getElementById("requiredSize").value.trim();
  const season = document.getElementById("preferredSeason").value;
  const message = document.getElementById("message").value.trim();

  if (name.length < 2 || phone.length < 7 || size.length < 5) {
    showToast("Please check name, phone and tire size");
    return;
  }

  const selectedTireText = state.selectedTire ? `${state.selectedTire.brand} ${state.selectedTire.model} (${state.selectedTire.size})` : size;

  if (state.backendAvailable) {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          phone: phone,
          tire_size: size,
          preferred_season: season,
          selected_tire: selectedTireText,
          message: message
        })
      });
      if (!response.ok) throw new Error("Backend validation failed");
      await loadRequestsFromBackend();
      renderRequests();
      showToast("Request saved to SQLite database");
    } catch (error) {
      showToast("Backend error: request saved locally");
      saveLocalRequest(name, phone, selectedTireText, season, message);
    }
  } else {
    saveLocalRequest(name, phone, selectedTireText, season, message);
  }

  requestForm.reset();
  state.selectedTire = null;
  selectedProductBox.innerHTML = `<strong>No tire selected yet</strong>Choose a product from the catalog or fill in the size manually.`;
  document.getElementById("requests").scrollIntoView({ behavior: "smooth" });
}

function saveLocalRequest(name, phone, tire, season, message) {
  const request = {
    date: new Date().toLocaleString(),
    name,
    phone,
    tire,
    season,
    message,
    status: "New"
  };
  state.requests.unshift(request);
  saveRequests();
  renderRequests();
  showToast("Customer request saved locally");
}

function exportCsv() {
  if (state.backendAvailable) {
    window.open("/api/requests/export", "_blank");
    return;
  }

  if (!state.requests.length) {
    showToast("There are no requests to export");
    return;
  }
  const header = ["Date", "Name", "Phone", "Tire", "Season", "Message", "Status"];
  const rows = state.requests.map(req => [req.date, req.name, req.phone, req.tire, req.season, req.message, req.status]);
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kazshin-customer-requests.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("CSV file exported");
}

[searchInput, seasonFilter, brandFilter, rimFilter, stockFilter, sortSelect].forEach(el => el.addEventListener("input", renderProducts));
document.getElementById("resetFilters").addEventListener("click", () => {
  searchInput.value = "";
  seasonFilter.value = "all";
  brandFilter.value = "all";
  rimFilter.value = "all";
  stockFilter.value = "all";
  sortSelect.value = "recommended";
  renderProducts();
});
requestForm.addEventListener("submit", handleSubmit);
document.getElementById("clearForm").addEventListener("click", () => {
  requestForm.reset();
  state.selectedTire = null;
  selectedProductBox.innerHTML = `<strong>No tire selected yet</strong>Choose a product from the catalog or fill in the size manually.`;
});
document.getElementById("exportCsv").addEventListener("click", exportCsv);
document.getElementById("clearRequests").addEventListener("click", () => {
  if (!state.requests.length) return;
  state.requests = [];
  saveRequests();
  renderRequests();
  showToast("Saved requests cleared");
});
document.getElementById("closeModal").addEventListener("click", () => productModal.classList.remove("show"));
productModal.addEventListener("click", event => {
  if (event.target === productModal) productModal.classList.remove("show");
});
document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("navLinks").classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => document.getElementById("navLinks").classList.remove("open")));

async function initApplication() {
  await loadTiresFromBackend();
  populateFilterOptions();
  renderProducts();
  await loadRequestsFromBackend();
  renderRequests();
}

initApplication();
