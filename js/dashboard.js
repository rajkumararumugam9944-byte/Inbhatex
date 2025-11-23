// Dashboard page functionality
document.addEventListener('DOMContentLoaded', () => {
    loadKPIs();
    loadCustomers();
    loadInvoices();
    loadOutstanding();
    setupSearch();
    setupFilters();
    setupKeyboardShortcuts();
});

function loadKPIs() {
    const customers = Storage.get(Storage.customers) || [];
    const invoices = Storage.get(Storage.invoices) || [];
    
    // Calculate outstanding
    let outstanding = 0;
    let pendingCount = 0;
    invoices.forEach(invoice => {
        if (invoice.status !== 'Paid') {
            const outstandingAmount = (invoice.grandTotal || 0) - (invoice.paidAmount || 0);
            outstanding += outstandingAmount;
            if (outstandingAmount > 0) pendingCount++;
        }
    });
    
    // Calculate today's sales
    const today = new Date().toDateString();
    let todaySales = 0;
    invoices.forEach(invoice => {
        if (new Date(invoice.date).toDateString() === today && invoice.status === 'Paid') {
            todaySales += invoice.grandTotal || 0;
        }
    });
    
    // Update UI
    document.getElementById('kpi-customers').textContent = customers.length;
    document.getElementById('kpi-outstanding').textContent = Utils.formatCurrency(outstanding);
    document.getElementById('kpi-today-sales').textContent = Utils.formatCurrency(todaySales);
    document.getElementById('kpi-pending').textContent = pendingCount;
}

function loadCustomers() {
    const customers = Storage.get(Storage.customers) || [];
    const invoices = Storage.get(Storage.invoices) || [];
    const tbody = document.getElementById('customer-table-body');
    
    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">
                        <p>No customers found. <a href="customers.html">Add your first customer</a></p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate outstanding for each customer
    const customerOutstanding = {};
    invoices.forEach(invoice => {
        if (invoice.status !== 'Paid') {
            const customerId = invoice.customerId;
            const outstanding = (invoice.grandTotal || 0) - (invoice.paidAmount || 0);
            customerOutstanding[customerId] = (customerOutstanding[customerId] || 0) + outstanding;
        }
    });
    
    tbody.innerHTML = customers.slice(0, 10).map(customer => {
        const outstanding = customerOutstanding[customer.id] || 0;
        const gstBadge = customer.gstNumber ? '<span class="badge badge-primary">GST</span>' : '';
        
        return `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone || '-'}</td>
                <td>${outstanding > 0 ? Utils.formatCurrency(outstanding) : '₹0'}</td>
                <td>${gstBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewCustomer('${customer.id}')" aria-label="View customer">View</button>
                        ${outstanding > 0 ? `<button class="action-btn" onclick="printOutstandingInvoice('${customer.id}')" aria-label="Print invoice">Print</button>` : ''}
                        ${outstanding > 0 ? `<button class="action-btn" onclick="shareWhatsApp('${customer.id}')" aria-label="Share via WhatsApp">WhatsApp</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function loadInvoices() {
    const invoices = Storage.get(Storage.invoices) || [];
    const customers = Storage.get(Storage.customers) || [];
    const tbody = document.getElementById('invoice-table-body');
    
    if (invoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <p>No invoices yet. <a href="create-invoice.html">Create your first invoice</a></p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedInvoices.slice(0, 20).map(invoice => {
        const customer = customers.find(c => c.id === invoice.customerId);
        const customerName = customer ? customer.name : 'Unknown';
        const gstType = invoice.gstType || '-';
        const statusClass = invoice.status === 'Paid' ? 'paid' : invoice.status === 'Partial' ? 'partial' : 'unpaid';
        
        return `
            <tr>
                <td>#${invoice.invoiceNumber}</td>
                <td>${Utils.formatDate(invoice.date)}</td>
                <td>${customerName}</td>
                <td>${Utils.formatCurrency(invoice.grandTotal || 0)}</td>
                <td>${gstType}</td>
                <td><span class="status-badge ${statusClass}">${invoice.status || 'Unpaid'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="viewInvoice('${invoice.id}')" aria-label="View invoice">View</button>
                        <button class="action-btn" onclick="editInvoice('${invoice.id}')" aria-label="Edit invoice">Edit</button>
                        <button class="action-btn" onclick="printInvoice('${invoice.id}')" aria-label="Print invoice">Print</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function loadOutstanding() {
    const customers = Storage.get(Storage.customers) || [];
    const invoices = Storage.get(Storage.invoices) || [];
    const container = document.getElementById('outstanding-list');
    
    // Calculate outstanding per customer
    const customerOutstanding = {};
    invoices.forEach(invoice => {
        if (invoice.status !== 'Paid') {
            const customerId = invoice.customerId;
            const outstanding = (invoice.grandTotal || 0) - (invoice.paidAmount || 0);
            if (outstanding > 0) {
                customerOutstanding[customerId] = (customerOutstanding[customerId] || 0) + outstanding;
            }
        }
    });
    
    const outstandingCustomers = customers
        .filter(c => customerOutstanding[c.id] > 0)
        .map(c => ({ ...c, outstanding: customerOutstanding[c.id] }))
        .sort((a, b) => b.outstanding - a.outstanding);
    
    if (outstandingCustomers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No outstanding balances</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = outstandingCustomers.map(customer => `
        <div class="outstanding-item">
            <input type="checkbox" id="outstanding-${customer.id}" data-customer-id="${customer.id}">
            <div class="outstanding-item-info">
                <div class="outstanding-item-name">${customer.name}</div>
                <div class="outstanding-item-amount">${Utils.formatCurrency(customer.outstanding)}</div>
            </div>
        </div>
        <div class="payment-form hidden" id="payment-form-${customer.id}">
            <div class="payment-form-group">
                <label class="form-label">Paid Amount</label>
                <input type="number" class="form-input" id="paid-amount-${customer.id}" placeholder="0.00" step="0.01" min="0">
            </div>
            <div class="payment-form-group">
                <label class="form-label">Payment Date</label>
                <input type="date" class="form-input" id="payment-date-${customer.id}">
            </div>
            <div class="payment-actions">
                <button class="btn btn-sm btn-primary" onclick="recordPayment('${customer.id}')">Record Payment</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for checkboxes
    outstandingCustomers.forEach(customer => {
        const checkbox = document.getElementById(`outstanding-${customer.id}`);
        const form = document.getElementById(`payment-form-${customer.id}`);
        if (checkbox && form) {
            checkbox.addEventListener('change', (e) => {
                form.classList.toggle('hidden', !e.target.checked);
                if (e.target.checked) {
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById(`payment-date-${customer.id}`).value = today;
                }
            });
        }
    });
}

function recordPayment(customerId) {
    const amount = parseFloat(document.getElementById(`paid-amount-${customerId}`).value);
    const date = document.getElementById(`payment-date-${customerId}`).value;
    
    if (!amount || amount <= 0) {
        Toast.error('Please enter a valid payment amount');
        return;
    }
    
    // Update invoices for this customer
    const invoices = Storage.get(Storage.invoices) || [];
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId && inv.status !== 'Paid');
    
    let remaining = amount;
    customerInvoices.forEach(invoice => {
        if (remaining > 0) {
            const outstanding = (invoice.grandTotal || 0) - (invoice.paidAmount || 0);
            const payment = Math.min(remaining, outstanding);
            invoice.paidAmount = (invoice.paidAmount || 0) + payment;
            
            if (invoice.paidAmount >= invoice.grandTotal) {
                invoice.status = 'Paid';
            } else if (invoice.paidAmount > 0) {
                invoice.status = 'Partial';
            }
            
            remaining -= payment;
        }
    });
    
    Storage.set(Storage.invoices, invoices);
    Toast.success('Payment recorded successfully');
    loadOutstanding();
    loadKPIs();
    loadInvoices();
}

function setupSearch() {
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterCustomers(e.target.value);
        });
    }
}

function setupFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyCustomerFilter(chip.dataset.filter);
        });
    });
}

function applyCustomerFilter(filter) {
    // Implementation for filtering customers
    loadCustomers(); // Reload with filter logic
}

function filterCustomers(query) {
    // Implementation for search filtering
    loadCustomers(); // Reload with search logic
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Press / to focus search
        if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchInput = document.getElementById('customer-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// Action functions
function viewCustomer(id) {
    window.location.href = `customers.html?id=${id}`;
}

function viewInvoice(id) {
    window.location.href = `create-invoice.html?id=${id}&view=true`;
}

function editInvoice(id) {
    window.location.href = `create-invoice.html?id=${id}`;
}

function printInvoice(id) {
    window.location.href = `print-invoice.html?id=${id}`;
}

function printOutstandingInvoice(customerId) {
    const invoices = Storage.get(Storage.invoices) || [];
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId && inv.status !== 'Paid');
    if (customerInvoices.length > 0) {
        printInvoice(customerInvoices[0].id);
    }
}

function shareWhatsApp(customerId) {
    const customers = Storage.get(Storage.customers) || [];
    const invoices = Storage.get(Storage.invoices) || [];
    const customer = customers.find(c => c.id === customerId);
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId && inv.status !== 'Paid');
    
    if (!customer || customerInvoices.length === 0) {
        Toast.warning('No outstanding invoices for this customer');
        return;
    }
    
    let outstanding = 0;
    customerInvoices.forEach(inv => {
        outstanding += (inv.grandTotal || 0) - (inv.paidAmount || 0);
    });
    
    const phone = customer.whatsappNumber || customer.phone;
    if (!phone) {
        Toast.error('No phone number available for this customer');
        return;
    }
    
    const message = encodeURIComponent(
        `Hello ${customer.name},\n\n` +
        `Your outstanding balance is: ${Utils.formatCurrency(outstanding)}\n\n` +
        `Please make the payment at your earliest convenience.\n\n` +
        `Thank you!`
    );
    
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}



