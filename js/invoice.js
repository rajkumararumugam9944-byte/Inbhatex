// Invoice Editor functionality
let invoiceItems = [];
let currentInvoiceId = null;
let isGSTEnabled = false;
let customerState = null;
let manualRoundOff = false; // Track if round off is manually set

document.addEventListener('DOMContentLoaded', () => {
    // Prevent form submission
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            return false;
        });
    }
    
    loadCustomers();
    loadProducts();
    setupInvoiceDate();
    setupGSTToggle();
    setupCustomerSelect();
    
    // Check if editing existing invoice
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    if (invoiceId) {
        loadInvoice(invoiceId);
        const titleEl = document.getElementById('invoice-page-title');
        if (titleEl) {
            titleEl.textContent = 'Edit Invoice';
        }
    } else {
        // Generate invoice number for new invoice
        generateInvoiceNumber();
    }
    
    // Add first item row
    addInvoiceItem();
    
    // Reload customers when page becomes visible (e.g., returning from customers page)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadCustomers();
        }
    });
    
    // Also reload on focus (when tab/window regains focus)
    window.addEventListener('focus', () => {
        loadCustomers();
    });
    
    // Check if returning from customers page
    if (urlParams.get('return') === 'customer') {
        loadCustomers();
        Toast.info('Customer list refreshed');
    }
    
    console.log('Invoice page initialized');
});

function setupInvoiceDate() {
    const dateInput = document.getElementById('invoice-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        // Regenerate invoice number when date changes (for new invoices)
        if (!currentInvoiceId) {
            dateInput.addEventListener('change', () => {
                generateInvoiceNumber();
            });
        }
    }
}

function generateInvoiceNumber() {
    const invoiceNumberInput = document.getElementById('invoice-number');
    if (!invoiceNumberInput || currentInvoiceId) return; // Don't regenerate for existing invoices
    
    const settings = Storage.get(Storage.settings) || {};
    const invoices = Storage.get(Storage.invoices) || [];
    const invoiceDate = document.getElementById('invoice-date').value || new Date().toISOString().split('T')[0];
    const year = new Date(invoiceDate).getFullYear();
    
    // Get invoice number format from settings or use default
    const format = settings.invoiceNumberFormat || 'INV-YYYY-###'; // Default: INV-2024-001
    
    let nextNumber = 1;
    
    // Find the highest invoice number for the current year
    const yearInvoices = invoices.filter(inv => {
        if (!inv.date) return false;
        const invYear = new Date(inv.date).getFullYear();
        return invYear === year;
    });
    
    if (yearInvoices.length > 0) {
        // Extract numbers from existing invoice numbers
        const numbers = yearInvoices.map(inv => {
            const match = inv.invoiceNumber.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
        });
        nextNumber = Math.max(...numbers) + 1;
    }
    
    // Generate invoice number based on format
    let invoiceNumber = format
        .replace('YYYY', year)
        .replace('YY', String(year).slice(-2))
        .replace('###', String(nextNumber).padStart(3, '0'))
        .replace('##', String(nextNumber).padStart(2, '0'))
        .replace('#', nextNumber);
    
    invoiceNumberInput.value = invoiceNumber;
}

function setupGSTToggle() {
    const gstToggle = document.getElementById('gst-enabled');
    const gstFields = document.getElementById('gst-fields');
    
    if (gstToggle) {
        gstToggle.addEventListener('change', (e) => {
            isGSTEnabled = e.target.checked;
            gstFields.classList.toggle('hidden', !isGSTEnabled);
            updateGSTSummary();
            calculateTotals();
        });
    }
}

function loadCustomers() {
    const customers = Storage.get(Storage.customers) || [];
    const select = document.getElementById('customer-select');
    
    if (!select) return;
    
    // Get currently selected customer ID to preserve selection
    const currentValue = select.value;
    
    // Clear and repopulate dropdown
    select.innerHTML = '<option value="">Select or create customer</option>';
    
    if (customers && customers.length > 0) {
        customers.forEach(customer => {
            if (customer && customer.id && customer.name) {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;
                select.appendChild(option);
            }
        });
        
        // Restore previous selection if it still exists
        if (currentValue && customers.find(c => c.id === currentValue)) {
            select.value = currentValue;
        }
    } else {
        console.log('No customers found in storage');
    }
    
    // Log for debugging
    console.log('Loaded customers:', customers.length);
}

function loadProducts() {
    // Products will be loaded for autocomplete
    window.products = Storage.get(Storage.products) || [];
}

function setupCustomerSelect() {
    const select = document.getElementById('customer-select');
    const customerDetails = document.getElementById('customer-details');
    
    if (select) {
        select.addEventListener('change', (e) => {
            const customerId = e.target.value;
            if (customerId) {
                loadCustomerDetails(customerId);
                customerDetails.classList.remove('hidden');
            } else {
                customerDetails.classList.add('hidden');
            }
            calculateTotals();
        });
        
        // Reload customers when add button is clicked (in case user cancels and comes back)
        const addButton = document.querySelector('button[onclick="openAddCustomerModal()"]');
        if (addButton) {
            addButton.addEventListener('click', () => {
                // Reload customers before opening modal
                setTimeout(() => {
                    loadCustomers();
                }, 100);
            });
        }
    }
}

function loadCustomerDetails(customerId) {
    const customers = Storage.get(Storage.customers) || [];
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        document.getElementById('customer-address').textContent = customer.address || '';
        document.getElementById('customer-gst').textContent = customer.gstNumber || '-';
        document.getElementById('customer-state').textContent = customer.state || '-';
        
        // Auto-populate transport name from customer database
        const transportNameInput = document.getElementById('transport-name');
        if (transportNameInput && customer.transportName) {
            transportNameInput.value = customer.transportName;
        }
        
        customerState = customer.state;
        
        // Auto-enable GST if customer has GST number
        if (customer.gstNumber) {
            document.getElementById('gst-enabled').checked = true;
            isGSTEnabled = true;
            document.getElementById('gst-fields').classList.remove('hidden');
        }
        
        updateGSTSummary();
    }
}

function regenerateInvoiceNumber() {
    if (!currentInvoiceId) {
        generateInvoiceNumber();
        Toast.info('New invoice number generated');
    } else {
        Toast.warning('Cannot change invoice number for existing invoice');
    }
}

function openAddCustomerModal() {
    const content = `
        <p>Redirecting to add customer page...</p>
    `;
    Modal.open(content, 'Add Customer');
    setTimeout(() => {
        window.location.href = 'customers.html?return=invoice';
    }, 1000);
}

function openProductSelector() {
    const products = window.products || Storage.get(Storage.products) || [];
    
    if (products.length === 0) {
        Toast.warning('No products available. Please add products first.');
        return;
    }
    
    const content = `
        <div style="max-height: 400px; overflow-y: auto;">
            <div class="search-box" style="margin-bottom: 16px;">
                <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <circle cx="9" cy="9" r="6"/>
                    <path d="M13 13l4 4"/>
                </svg>
                <input type="text" id="product-selector-search" class="form-input" placeholder="Search products..." onkeyup="filterProductSelector(this.value)">
            </div>
            <div id="product-selector-list" style="display: grid; gap: 8px;">
                ${products.map(p => `
                    <div class="product-selector-item" onclick="addProductToInvoice('${p.id}')" style="padding: 12px; border: 2px solid var(--color-neutral-200); border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--color-primary)'; this.style.backgroundColor='rgba(107, 78, 113, 0.05)'" onmouseout="this.style.borderColor='var(--color-neutral-200)'; this.style.backgroundColor='transparent'">
                        <div style="font-weight: 600; margin-bottom: 4px;">${p.name}</div>
                        <div style="font-size: 12px; color: var(--color-neutral-600);">
                            HSN: ${p.hsn || '-'} | 
                            Rate: ${Utils.formatCurrency(p.rate || 0)}
                            ${p.size ? ` | Size: ${p.size}` : ''}
                            ${p.unit ? ` | Unit: ${p.unit}` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    Modal.open(content, 'Select Product');
    
    // Store original products list for filtering
    window.productSelectorProducts = products;
}

function filterProductSelector(query) {
    const products = window.productSelectorProducts || [];
    const container = document.getElementById('product-selector-list');
    
    if (!container) return;
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.hsn && p.hsn.toLowerCase().includes(query.toLowerCase()))
    );
    
    container.innerHTML = filtered.map(p => `
        <div class="product-selector-item" onclick="addProductToInvoice('${p.id}')" style="padding: 12px; border: 2px solid var(--color-neutral-200); border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--color-primary)'; this.style.backgroundColor='rgba(107, 78, 113, 0.05)'" onmouseout="this.style.borderColor='var(--color-neutral-200)'; this.style.backgroundColor='transparent'">
            <div style="font-weight: 600; margin-bottom: 4px;">${p.name}</div>
            <div style="font-size: 12px; color: var(--color-neutral-600);">
                HSN: ${p.hsn || '-'} | 
                Rate: ${Utils.formatCurrency(p.rate || 0)}
                ${p.size ? ` | Size: ${p.size}` : ''}
                ${p.unit ? ` | Unit: ${p.unit}` : ''}
            </div>
        </div>
    `).join('');
}

function addProductToInvoice(productId) {
    // Add a new item row
    const itemIndex = addInvoiceItem();
    
    // Wait for DOM to update, then select the product
    setTimeout(() => {
        selectProduct(itemIndex, productId);
        Modal.close();
        Toast.success('Product added to invoice');
    }, 100);
}

function addInvoiceItem() {
    const tbody = document.getElementById('items-tbody');
    const itemIndex = invoiceItems.length;
    
    const row = document.createElement('tr');
    row.dataset.itemIndex = itemIndex;
    row.innerHTML = `
        <td>${itemIndex + 1}</td>
        <td>
            <div class="item-autocomplete">
                <input type="text" class="item-name" data-index="${itemIndex}" placeholder="Item name" autocomplete="off">
                <div class="autocomplete-dropdown hidden" id="autocomplete-${itemIndex}"></div>
            </div>
        </td>
        <td><input type="text" class="item-hsn" data-index="${itemIndex}" placeholder="HSN"></td>
        <td><input type="text" class="item-size" data-index="${itemIndex}" placeholder="Size"></td>
        <td><input type="number" class="item-qty" data-index="${itemIndex}" placeholder="0" min="0" step="0.01" value="0"></td>
        <td><input type="number" class="item-rate" data-index="${itemIndex}" placeholder="0.00" min="0" step="0.01" value="0"></td>
        <td class="item-amount">₹0.00</td>
        <td class="item-gst">₹0.00</td>
        <td class="item-total">₹0.00</td>
        <td>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeInvoiceItem(${itemIndex})" aria-label="Remove item">×</button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Initialize item data
    invoiceItems.push({
        productId: null,
        name: '',
        hsn: '',
        size: '',
        qty: 0,
        rate: 0,
        amount: 0,
        gst: 0,
        total: 0
    });
    
    // Setup event listeners after DOM is ready
    setTimeout(() => {
        setupItemListeners(itemIndex);
    }, 0);
    
    return itemIndex;
}

function setupItemListeners(index) {
    const row = document.querySelector(`tr[data-item-index="${index}"]`);
    if (!row) return;
    
    // Item name autocomplete
    const nameInput = row.querySelector('.item-name');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            handleItemNameInput(index, e.target.value);
            // Update invoiceItems array when name changes
            if (invoiceItems[index]) {
                invoiceItems[index].name = e.target.value;
            }
        });
        
        nameInput.addEventListener('blur', () => {
            setTimeout(() => hideAutocomplete(index), 200);
            // Ensure name is saved on blur
            if (invoiceItems[index] && nameInput.value) {
                invoiceItems[index].name = nameInput.value;
            }
        });
    }
    
    // Quantity and rate
    const qtyInput = row.querySelector('.item-qty');
    const rateInput = row.querySelector('.item-rate');
    
    if (qtyInput) {
        qtyInput.addEventListener('input', () => calculateItemTotal(index));
        qtyInput.addEventListener('change', () => calculateItemTotal(index));
        qtyInput.addEventListener('blur', () => calculateItemTotal(index));
    }
    if (rateInput) {
        rateInput.addEventListener('input', () => calculateItemTotal(index));
        rateInput.addEventListener('change', () => calculateItemTotal(index));
        rateInput.addEventListener('blur', () => calculateItemTotal(index));
    }
    
    // HSN and Size
    const hsnInput = row.querySelector('.item-hsn');
    const sizeInput = row.querySelector('.item-size');
    
    if (hsnInput) {
        hsnInput.addEventListener('input', (e) => {
            if (invoiceItems[index]) {
                invoiceItems[index].hsn = e.target.value;
            }
        });
        hsnInput.addEventListener('change', (e) => {
            if (invoiceItems[index]) {
                invoiceItems[index].hsn = e.target.value;
            }
        });
    }
    if (sizeInput) {
        sizeInput.addEventListener('input', (e) => {
            if (invoiceItems[index]) {
                invoiceItems[index].size = e.target.value;
            }
        });
        sizeInput.addEventListener('change', (e) => {
            if (invoiceItems[index]) {
                invoiceItems[index].size = e.target.value;
            }
        });
    }
}

function handleItemNameInput(index, value) {
    const products = window.products || [];
    const matches = products.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    
    const dropdown = document.getElementById(`autocomplete-${index}`);
    if (!dropdown) return;
    
    if (matches.length > 0 && value.length > 0) {
        dropdown.innerHTML = matches.map(p => `
            <div class="autocomplete-item" onclick="selectProduct(${index}, '${p.id}')" role="option" tabindex="0">
                <strong>${p.name}</strong><br>
                <small>
                    HSN: ${p.hsn || '-'} | 
                    Rate: ${Utils.formatCurrency(p.rate || 0)}
                    ${p.size ? ` | Size: ${p.size}` : ''}
                    ${p.unit ? ` | Unit: ${p.unit}` : ''}
                </small>
            </div>
        `).join('');
        dropdown.classList.remove('hidden');
        
        // Add keyboard navigation
        const items = dropdown.querySelectorAll('.autocomplete-item');
        items.forEach((item, idx) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const productId = matches[idx].id;
                    selectProduct(index, productId);
                }
            });
        });
    } else {
        dropdown.classList.add('hidden');
    }
}

function hideAutocomplete(index) {
    const dropdown = document.getElementById(`autocomplete-${index}`);
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

function selectProduct(index, productId) {
    const products = window.products || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        const row = document.querySelector(`tr[data-item-index="${index}"]`);
        if (row) {
            // Auto-populate all fields from product database
            row.querySelector('.item-name').value = product.name;
            row.querySelector('.item-hsn').value = product.hsn || '';
            row.querySelector('.item-size').value = product.size || '';
            row.querySelector('.item-rate').value = product.rate || 0;
            
            // Set default quantity to 1 if not already set
            const qtyInput = row.querySelector('.item-qty');
            if (!qtyInput.value || parseFloat(qtyInput.value) === 0) {
                qtyInput.value = 1;
            }
            
            // Update invoice item data
            invoiceItems[index].productId = product.id;
            invoiceItems[index].name = product.name;
            invoiceItems[index].hsn = product.hsn || '';
            invoiceItems[index].size = product.size || '';
            invoiceItems[index].rate = parseFloat(product.rate || 0);
            invoiceItems[index].qty = parseFloat(qtyInput.value) || 1;
            
            // Automatically calculate totals
            calculateItemTotal(index);
            
            // Focus on quantity field for easy editing
            qtyInput.focus();
            qtyInput.select();
        }
        
        hideAutocomplete(index);
    }
}

function calculateItemTotal(index) {
    const row = document.querySelector(`tr[data-item-index="${index}"]`);
    if (!row) {
        console.error(`Row not found for index ${index}`);
        return;
    }
    
    const qtyInput = row.querySelector('.item-qty');
    const rateInput = row.querySelector('.item-rate');
    
    if (!qtyInput || !rateInput) {
        console.error(`Input fields not found for index ${index}`);
        return;
    }
    
    const qty = parseFloat(qtyInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const amount = qty * rate;
    
    if (!invoiceItems[index]) {
        console.error(`Invoice item not found at index ${index}`);
        return;
    }
    
    invoiceItems[index].qty = qty;
    invoiceItems[index].rate = rate;
    invoiceItems[index].amount = amount;
    
    // Calculate GST
    let gstAmount = 0;
    if (isGSTEnabled) {
        if (customerState === 'Tamil Nadu') {
            // CGST 2.5% + SGST 2.5% = 5% total
            gstAmount = amount * 0.05;
        } else {
            // IGST 5%
            gstAmount = amount * 0.05;
        }
    }
    
    invoiceItems[index].gst = gstAmount;
    invoiceItems[index].total = amount + gstAmount;
    
    // Update UI
    row.querySelector('.item-amount').textContent = Utils.formatCurrency(amount);
    row.querySelector('.item-gst').textContent = Utils.formatCurrency(gstAmount);
    row.querySelector('.item-total').textContent = Utils.formatCurrency(amount + gstAmount);
    
    // Update serial numbers
    updateSerialNumbers();
    
    // Recalculate totals
    calculateTotals();
}

function updateSerialNumbers() {
    const rows = document.querySelectorAll('#items-tbody tr');
    rows.forEach((row, idx) => {
        row.querySelector('td:first-child').textContent = idx + 1;
    });
}

function removeInvoiceItem(index) {
    const row = document.querySelector(`tr[data-item-index="${index}"]`);
    if (row) {
        row.remove();
    }
    
    invoiceItems.splice(index, 1);
    
    // Re-index remaining items
    invoiceItems.forEach((item, idx) => {
        const r = document.querySelector(`tr[data-item-index="${idx}"]`);
        if (r) {
            r.dataset.itemIndex = idx;
            r.querySelectorAll('[data-index]').forEach(el => {
                el.dataset.index = idx;
            });
            setupItemListeners(idx);
        }
    });
    
    updateSerialNumbers();
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    
    invoiceItems.forEach(item => {
        subtotal += item.amount;
        
        if (isGSTEnabled) {
            if (customerState === 'Tamil Nadu') {
                // Split 5% into CGST 2.5% + SGST 2.5%
                const gstAmount = item.amount * 0.05;
                totalCGST += gstAmount / 2;
                totalSGST += gstAmount / 2;
            } else {
                // IGST 5%
                totalIGST += item.amount * 0.05;
            }
        }
    });
    
    const totalGST = totalCGST + totalSGST + totalIGST;
    const grandTotalBeforeRound = subtotal + totalGST;
    
    // Calculate round off (auto or use manual value)
    let roundOff;
    const roundOffInput = document.getElementById('round-off');
    
    if (manualRoundOff && roundOffInput) {
        // Use manually entered round off value
        roundOff = parseFloat(roundOffInput.value) || 0;
    } else {
        // Auto-calculate round off
        roundOff = Math.round(grandTotalBeforeRound) - grandTotalBeforeRound;
        if (roundOffInput) {
            roundOffInput.value = roundOff.toFixed(2);
        }
    }
    
    const grandTotal = grandTotalBeforeRound + roundOff;
    
    // Update UI
    document.getElementById('subtotal').textContent = Utils.formatCurrency(subtotal);
    
    const gstSummary = document.getElementById('gst-summary');
    if (isGSTEnabled) {
        gstSummary.classList.remove('hidden');
        
        // Always show all three GST fields
        document.getElementById('cgst-row').classList.remove('hidden');
        document.getElementById('sgst-row').classList.remove('hidden');
        document.getElementById('igst-row').classList.remove('hidden');
        
        // Update amounts - show calculated values or ₹0.00
        document.getElementById('cgst-amount').textContent = Utils.formatCurrency(totalCGST);
        document.getElementById('sgst-amount').textContent = Utils.formatCurrency(totalSGST);
        document.getElementById('igst-amount').textContent = Utils.formatCurrency(totalIGST);
    } else {
        // Hide GST summary when GST is disabled
        gstSummary.classList.add('hidden');
        document.getElementById('cgst-row').classList.add('hidden');
        document.getElementById('sgst-row').classList.add('hidden');
        document.getElementById('igst-row').classList.add('hidden');
    }
    
    // Round off is now an input field, so we don't update it here if manual
    // Grand total updates based on round off
    document.getElementById('grand-total').textContent = Utils.formatCurrency(grandTotal);
    document.getElementById('total-words').textContent = Utils.numberToWords(Math.round(grandTotal)) + ' Rupees Only';
}

function updateRoundOff() {
    const roundOffInput = document.getElementById('round-off');
    if (roundOffInput) {
        manualRoundOff = true; // Mark as manually set
        calculateTotals(); // Recalculate grand total with new round off
    }
}

function autoCalculateRoundOff() {
    manualRoundOff = false; // Reset to auto-calculate
    calculateTotals(); // Recalculate with auto round off
    Toast.info('Round off auto-calculated');
}

function updateGSTSummary() {
    calculateTotals();
}

function loadInvoice(id) {
    const invoices = Storage.get(Storage.invoices) || [];
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) {
        Toast.error('Invoice not found');
        return;
    }
    
    currentInvoiceId = id;
    
    // Load invoice data into form
    document.getElementById('customer-select').value = invoice.customerId;
    loadCustomerDetails(invoice.customerId);
    
    document.getElementById('invoice-number').value = invoice.invoiceNumber;
    document.getElementById('invoice-date').value = invoice.date;
    document.getElementById('transport-name').value = invoice.transportName || '';
    document.getElementById('bundles').value = invoice.bundles || '';
    document.getElementById('eway-bill').value = invoice.ewayBill || '';
    
    if (invoice.gstEnabled) {
        document.getElementById('gst-enabled').checked = true;
        isGSTEnabled = true;
        document.getElementById('gst-fields').classList.remove('hidden');
    }
    
    // Load items
    invoiceItems = invoice.items || [];
    const tbody = document.getElementById('items-tbody');
    tbody.innerHTML = '';
    
    invoiceItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.dataset.itemIndex = index;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="item-autocomplete">
                    <input type="text" class="item-name" data-index="${index}" value="${item.name}" autocomplete="off">
                    <div class="autocomplete-dropdown hidden" id="autocomplete-${index}"></div>
                </div>
            </td>
            <td><input type="text" class="item-hsn" data-index="${index}" value="${item.hsn}"></td>
            <td><input type="text" class="item-size" data-index="${index}" value="${item.size}"></td>
            <td><input type="number" class="item-qty" data-index="${index}" value="${item.qty}" min="0" step="0.01"></td>
            <td><input type="number" class="item-rate" data-index="${index}" value="${item.rate}" min="0" step="0.01"></td>
            <td class="item-amount">${Utils.formatCurrency(item.amount)}</td>
            <td class="item-gst">${Utils.formatCurrency(item.gst)}</td>
            <td class="item-total">${Utils.formatCurrency(item.total)}</td>
            <td>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeInvoiceItem(${index})" aria-label="Remove item">×</button>
            </td>
        `;
        tbody.appendChild(row);
        setupItemListeners(index);
    });
    
    // Load round off if exists
    const roundOffInput = document.getElementById('round-off');
    if (roundOffInput && invoice.roundOff !== undefined) {
        roundOffInput.value = invoice.roundOff.toFixed(2);
        manualRoundOff = true;
    }
    
    calculateTotals();
}

function saveInvoice(printAfterSave = false) {
    // Validate form
    const customerId = document.getElementById('customer-select').value;
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    
    if (!customerId) {
        Toast.error('Please select a customer');
        return;
    }
    
    if (!invoiceNumber) {
        Toast.error('Please enter invoice number');
        return;
    }
    
    if (invoiceItems.length === 0 || invoiceItems.every(item => item.qty === 0)) {
        Toast.error('Please add at least one item');
        return;
    }
    
    // Calculate totals
    calculateTotals();
    
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const grandTotal = parseFloat(document.getElementById('grand-total').textContent.replace(/[₹,\s]/g, ''));
    const roundOff = parseFloat(document.getElementById('round-off').value) || 0;
    
    // Determine GST type
    let gstType = 'Non-GST';
    if (isGSTEnabled) {
        if (customerState === 'Tamil Nadu') {
            gstType = 'CGST + SGST';
        } else {
            gstType = 'IGST';
        }
    }
    
    const invoice = {
        id: currentInvoiceId || Utils.generateId(),
        customerId: customerId,
        invoiceNumber: invoiceNumber,
        date: invoiceDate,
        transportName: document.getElementById('transport-name').value,
        bundles: document.getElementById('bundles').value,
        ewayBill: document.getElementById('eway-bill').value,
        gstEnabled: isGSTEnabled,
        gstType: gstType,
        items: invoiceItems,
        subtotal: subtotal,
        roundOff: roundOff,
        grandTotal: grandTotal,
        status: 'Unpaid',
        paidAmount: 0,
        createdAt: currentInvoiceId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Save to storage
    const invoices = Storage.get(Storage.invoices) || [];
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
        invoices[existingIndex] = invoice;
    } else {
        invoices.push(invoice);
    }
    
    Storage.set(Storage.invoices, invoices);
    
    Toast.success('Invoice saved successfully');
    
    if (printAfterSave) {
        setTimeout(() => {
            window.location.href = `print-invoice.html?id=${invoice.id}`;
        }, 500);
    } else {
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// Expose functions to global scope for onclick handlers in HTML
window.regenerateInvoiceNumber = regenerateInvoiceNumber;
window.openAddCustomerModal = openAddCustomerModal;
window.openProductSelector = openProductSelector;
window.addInvoiceItem = addInvoiceItem;
window.removeInvoiceItem = removeInvoiceItem;
window.updateRoundOff = updateRoundOff;
window.autoCalculateRoundOff = autoCalculateRoundOff;
window.saveInvoice = saveInvoice;
window.addProductToInvoice = addProductToInvoice;
window.filterProductSelector = filterProductSelector;
window.selectProduct = selectProduct;

