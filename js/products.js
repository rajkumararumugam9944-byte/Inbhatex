// Products page functionality
let products = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupSearch();
    
    const productId = new URLSearchParams(window.location.search).get('id');
    if (productId) {
        openEditProductModal(productId);
    }
});

function loadProducts() {
    products = Storage.get(Storage.products) || [];
    renderProducts();
}

function renderProducts(filteredProducts = null) {
    const tbody = document.getElementById('product-table-body');
    const displayProducts = filteredProducts || products;
    
    if (displayProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <p>No products found. <button class="btn btn-primary" onclick="openAddProductModal()">Add your first product</button></p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = displayProducts.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.hsn || '-'}</td>
            <td>${Utils.formatCurrency(product.rate || 0)}</td>
            <td>${product.size || '-'}</td>
            <td>${product.unit || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="openEditProductModal('${product.id}')" aria-label="Edit product">Edit</button>
                    <button class="action-btn" onclick="deleteProduct('${product.id}')" aria-label="Delete product">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                (p.hsn && p.hsn.toLowerCase().includes(query))
            );
            renderProducts(filtered);
        });
    }
}

function openAddProductModal() {
    editingProductId = null;
    const content = `
        <form id="product-form">
            <div class="form-group">
                <label for="product-name" class="form-label required">Product Name</label>
                <input type="text" id="product-name" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="product-hsn" class="form-label">HSN Code</label>
                <input type="text" id="product-hsn" class="form-input">
                <span class="form-help">Harmonized System of Nomenclature code</span>
            </div>
            <div class="form-group">
                <label for="product-rate" class="form-label required">Unit Rate</label>
                <input type="number" id="product-rate" class="form-input" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product-size" class="form-label">Size</label>
                <input type="text" id="product-size" class="form-input" placeholder="e.g., S, M, L, XL">
            </div>
            <div class="form-group">
                <label for="product-unit" class="form-label">Unit</label>
                <select id="product-unit" class="form-select">
                    <option value="Pcs">Pcs</option>
                    <option value="Meter">Meter</option>
                    <option value="Yard">Yard</option>
                    <option value="Kg">Kg</option>
                    <option value="Bundle">Bundle</option>
                    <option value="Roll">Roll</option>
                </select>
            </div>
        </form>
    `;
    
    Modal.open(content, 'Add Product');
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveProduct()">Save Product</button>
    `;
    document.querySelector('.modal-body').appendChild(modalFooter);
}

function openEditProductModal(productId) {
    editingProductId = productId;
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        Toast.error('Product not found');
        return;
    }
    
    const content = `
        <form id="product-form">
            <div class="form-group">
                <label for="product-name" class="form-label required">Product Name</label>
                <input type="text" id="product-name" class="form-input" value="${product.name}" required>
            </div>
            <div class="form-group">
                <label for="product-hsn" class="form-label">HSN Code</label>
                <input type="text" id="product-hsn" class="form-input" value="${product.hsn || ''}">
                <span class="form-help">Harmonized System of Nomenclature code</span>
            </div>
            <div class="form-group">
                <label for="product-rate" class="form-label required">Unit Rate</label>
                <input type="number" id="product-rate" class="form-input" value="${product.rate || 0}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="product-size" class="form-label">Size</label>
                <input type="text" id="product-size" class="form-input" value="${product.size || ''}" placeholder="e.g., S, M, L, XL">
            </div>
            <div class="form-group">
                <label for="product-unit" class="form-label">Unit</label>
                <select id="product-unit" class="form-select">
                    <option value="Pcs" ${product.unit === 'Pcs' ? 'selected' : ''}>Pcs</option>
                    <option value="Meter" ${product.unit === 'Meter' ? 'selected' : ''}>Meter</option>
                    <option value="Yard" ${product.unit === 'Yard' ? 'selected' : ''}>Yard</option>
                    <option value="Kg" ${product.unit === 'Kg' ? 'selected' : ''}>Kg</option>
                    <option value="Bundle" ${product.unit === 'Bundle' ? 'selected' : ''}>Bundle</option>
                    <option value="Roll" ${product.unit === 'Roll' ? 'selected' : ''}>Roll</option>
                </select>
            </div>
        </form>
    `;
    
    Modal.open(content, 'Edit Product');
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveProduct()">Update Product</button>
    `;
    document.querySelector('.modal-body').appendChild(modalFooter);
}

function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const hsn = document.getElementById('product-hsn').value.trim();
    const rate = parseFloat(document.getElementById('product-rate').value) || 0;
    const size = document.getElementById('product-size').value.trim();
    const unit = document.getElementById('product-unit').value;
    
    if (!name) {
        Toast.error('Please enter product name');
        return;
    }
    
    if (rate <= 0) {
        Toast.error('Please enter a valid rate');
        return;
    }
    
    const product = {
        id: editingProductId || Utils.generateId(),
        name: name,
        hsn: hsn,
        rate: rate,
        size: size,
        unit: unit,
        createdAt: editingProductId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index >= 0) {
            products[index] = { ...products[index], ...product };
        }
    } else {
        products.push(product);
    }
    
    Storage.set(Storage.products, products);
    Toast.success(editingProductId ? 'Product updated successfully' : 'Product added successfully');
    Modal.close();
    loadProducts();
}

function deleteProduct(productId) {
    Modal.confirm(
        'Are you sure you want to delete this product? This action cannot be undone.',
        () => {
            products = products.filter(p => p.id !== productId);
            Storage.set(Storage.products, products);
            Toast.success('Product deleted successfully');
            loadProducts();
        }
    );
}

function exportAllProductsCSV() {
    if (products.length === 0) {
        Toast.warning('No products to export');
        return;
    }
    
    const csv = [
        ['Product Name', 'HSN Code', 'Unit Rate', 'Size', 'Unit'],
        ...products.map(p => [
            p.name,
            p.hsn || '',
            p.rate || 0,
            p.size || '',
            p.unit || ''
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    Toast.success('Products exported successfully');
}



