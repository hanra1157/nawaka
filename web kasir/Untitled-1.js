// STATE MANAGEMENT
let state = {
    products: JSON.parse(localStorage.getItem('hstore_p')) || [
        { id: 1, name: "Kopi Gula Aren", price: 18000 },
        { id: 2, name: "Roti Coklat", price: 12000 },
        { id: 3, name: "Susu Segar", price: 15000 }
    ],
    cart: [],
    sales: JSON.parse(localStorage.getItem('hstore_s')) || []
};

// UI TAB SWITCHER
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.getElementById(`btn-${tabId}`).classList.add('active');

    if (tabId === 'reports') renderReports();
    if (tabId === 'inventory') renderInventory();
}

// POS LOGIC
function renderProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const grid = document.getElementById('product-grid');
    
    grid.innerHTML = state.products
        .filter(p => p.name.toLowerCase().includes(searchTerm))
        .map(p => `
            <div class="product-card" onclick="addToCart(${p.id})">
                <strong>${p.name}</strong>
                <p>Rp ${p.price.toLocaleString()}</p>
            </div>
        `).join('');
}

function addToCart(id) {
    const product = state.products.find(p => p.id === id);
    const inCart = state.cart.find(item => item.id === id);
    
    if (inCart) {
        inCart.qty++;
    } else {
        state.cart.push({ ...product, qty: 1 });
    }
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById('cart-items-list');
    let total = 0;
    
    cartList.innerHTML = state.cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="cart-item">
                <span>${item.name} (x${item.qty})</span>
                <span>Rp ${(item.price * item.qty).toLocaleString()}</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('grand-total').innerText = `Rp ${total.toLocaleString()}`;
}

function clearCart() {
    state.cart = [];
    renderCart();
}

// PAYMENT MODAL
function openPaymentModal() {
    if (state.cart.length === 0) return alert("Keranjang masih kosong!");
    const total = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
    document.getElementById('pay-total-title').innerText = `Rp ${total.toLocaleString()}`;
    document.getElementById('modal-payment').classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('modal-payment').classList.add('hidden');
    document.getElementById('cash-input').value = '';
    document.getElementById('change-amount').innerText = 'Rp 0';
}

function calculateChange() {
    const total = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const cash = parseInt(document.getElementById('cash-input').value) || 0;
    const change = cash - total;
    document.getElementById('change-amount').innerText = `Rp ${change >= 0 ? change.toLocaleString() : 0}`;
}

function finalizeTransaction() {
    const total = state.cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const cash = parseInt(document.getElementById('cash-input').value) || 0;

    if (cash < total) return alert("Uang tunai kurang!");

    const transaction = {
        id: 'TRX-' + Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        total: total
    };

    state.sales.push(transaction);
    localStorage.setItem('hstore_s', JSON.stringify(state.sales));
    
    alert("Transaksi Berhasil! Struk Tercetak.");
    clearCart();
    closePaymentModal();
}

// INVENTORY
function handleNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById('inv-name').value;
    const price = parseInt(document.getElementById('inv-price').value);

    state.products.push({ id: Date.now(), name, price });
    localStorage.setItem('hstore_p', JSON.stringify(state.products));
    
    renderInventory();
    renderProducts();
    e.target.reset();
}

function renderInventory() {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = state.products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>Rp ${p.price.toLocaleString()}</td>
            <td><button onclick="deleteProduct(${p.id})" class="btn-danger">Hapus</button></td>
        </tr>
    `).join('');
}

function deleteProduct(id) {
    state.products = state.products.filter(p => p.id !== id);
    localStorage.setItem('hstore_p', JSON.stringify(state.products));
    renderInventory();
    renderProducts();
}

// REPORTS
function renderReports() {
    const today = new Date().toLocaleDateString();
    const todaySales = state.sales.filter(s => s.date === today);
    const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

    document.getElementById('stat-count').innerText = todaySales.length;
    document.getElementById('stat-revenue').innerText = `Rp ${totalRevenue.toLocaleString()}`;

    const tbody = document.getElementById('sales-history-body');
    tbody.innerHTML = state.sales.slice().reverse().map(s => `
        <tr>
            <td>${s.date} ${s.time}</td>
            <td>${s.id}</td>
            <td>Rp ${s.total.toLocaleString()}</td>
        </tr>
    `).join('');
}

function resetAllData() {
    if (confirm("Hapus semua data penjualan dan produk?")) {
        localStorage.clear();
        location.reload();
    }
}

// INITIALIZE
renderProducts();