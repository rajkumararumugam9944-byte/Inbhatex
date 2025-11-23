// Customers page functionality
let customers = [];
let editingCustomerId = null;

// All India States and Union Territories
const INDIA_STATES = [
    // States (28)
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    // Union Territories (8)
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
];

// Helper function to generate state options HTML
function getStateOptions(selectedState = '') {
    return INDIA_STATES.map(state => 
        `<option value="${state}" ${state === selectedState ? 'selected' : ''}>${state}</option>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    setupSearch();
    
    // Check if returning from invoice page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('return') === 'invoice') {
        openAddCustomerModal();
    }
    
    const customerId = urlParams.get('id');
    if (customerId) {
        openEditCustomerModal(customerId);
    }
});

function loadCustomers() {
    customers = Storage.get(Storage.customers) || [];
    renderCustomers();
}

function renderCustomers(filteredCustomers = null) {
    const tbody = document.getElementById('customer-table-body');
    const displayCustomers = filteredCustomers || customers;
    
    if (displayCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <p>No customers found. <button class="btn btn-primary" onclick="openAddCustomerModal()">Add your first customer</button></p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = displayCustomers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.address ? customer.address.substring(0, 50) + (customer.address.length > 50 ? '...' : '') : '-'}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.gstNumber || '-'}</td>
            <td>${customer.state || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="openEditCustomerModal('${customer.id}')" aria-label="Edit customer">Edit</button>
                    <button class="action-btn" onclick="deleteCustomer('${customer.id}')" aria-label="Delete customer">Delete</button>
                    <button class="action-btn" onclick="exportCustomerCSV('${customer.id}')" aria-label="Export customer">Export</button>
                    <button class="action-btn" onclick="shareCustomerWhatsApp('${customer.id}')" aria-label="Share via WhatsApp">WhatsApp</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = customers.filter(c => 
                c.name.toLowerCase().includes(query) ||
                (c.phone && c.phone.includes(query)) ||
                (c.gstNumber && c.gstNumber.toLowerCase().includes(query))
            );
            renderCustomers(filtered);
        });
    }
}

function openAddCustomerModal() {
    editingCustomerId = null;
    const content = `
        <form id="customer-form">
            <div class="form-group">
                <label for="customer-name" class="form-label required">Name</label>
                <input type="text" id="customer-name" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="customer-address" class="form-label">Address</label>
                <textarea id="customer-address" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="customer-phone" class="form-label">Phone</label>
                <input type="tel" id="customer-phone" class="form-input" pattern="[0-9]{10}">
                <span class="form-help">10-digit phone number</span>
            </div>
            <div class="form-group">
                <label class="form-checkbox-label">
                    <input type="checkbox" id="whatsapp-same" class="form-checkbox">
                    <span>WhatsApp number same as phone</span>
                </label>
            </div>
            <div class="form-group">
                <label for="customer-whatsapp" class="form-label">WhatsApp Number</label>
                <input type="tel" id="customer-whatsapp" class="form-input" pattern="[0-9]{10}">
            </div>
            <div class="form-group">
                <label for="customer-gst" class="form-label">GST Number</label>
                <input type="text" id="customer-gst" class="form-input" pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}">
                <span class="form-help">Format: 33AAAAA0000A1Z5</span>
            </div>
            <div class="form-group">
                <label for="customer-state" class="form-label">State</label>
                <select id="customer-state" class="form-select">
                    <option value="">Select State</option>
                    ${getStateOptions()}
                </select>
            </div>
            <div class="form-group">
                <label for="customer-transport" class="form-label">Transport Name</label>
                <input type="text" id="customer-transport" class="form-input">
            </div>
        </form>
    `;
    
    Modal.open(content, 'Add Customer');
    
    // Setup form handlers
    document.getElementById('whatsapp-same').addEventListener('change', (e) => {
        const whatsappInput = document.getElementById('customer-whatsapp');
        if (e.target.checked) {
            whatsappInput.value = document.getElementById('customer-phone').value;
            whatsappInput.disabled = true;
        } else {
            whatsappInput.disabled = false;
        }
    });
    
    document.getElementById('customer-phone').addEventListener('input', (e) => {
        if (document.getElementById('whatsapp-same').checked) {
            document.getElementById('customer-whatsapp').value = e.target.value;
        }
    });
    
    // Setup form submission
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveCustomer()">Save Customer</button>
    `;
    document.querySelector('.modal-body').appendChild(modalFooter);
}

function openEditCustomerModal(customerId) {
    editingCustomerId = customerId;
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        Toast.error('Customer not found');
        return;
    }
    
    const content = `
        <form id="customer-form">
            <div class="form-group">
                <label for="customer-name" class="form-label required">Name</label>
                <input type="text" id="customer-name" class="form-input" value="${customer.name}" required>
            </div>
            <div class="form-group">
                <label for="customer-address" class="form-label">Address</label>
                <textarea id="customer-address" class="form-textarea" rows="3">${customer.address || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="customer-phone" class="form-label">Phone</label>
                <input type="tel" id="customer-phone" class="form-input" value="${customer.phone || ''}" pattern="[0-9]{10}">
                <span class="form-help">10-digit phone number</span>
            </div>
            <div class="form-group">
                <label class="form-checkbox-label">
                    <input type="checkbox" id="whatsapp-same" class="form-checkbox" ${customer.phone === customer.whatsappNumber ? 'checked' : ''}>
                    <span>WhatsApp number same as phone</span>
                </label>
            </div>
            <div class="form-group">
                <label for="customer-whatsapp" class="form-label">WhatsApp Number</label>
                <input type="tel" id="customer-whatsapp" class="form-input" value="${customer.whatsappNumber || customer.phone || ''}" pattern="[0-9]{10}" ${customer.phone === customer.whatsappNumber ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label for="customer-gst" class="form-label">GST Number</label>
                <input type="text" id="customer-gst" class="form-input" value="${customer.gstNumber || ''}" pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}">
                <span class="form-help">Format: 33AAAAA0000A1Z5</span>
            </div>
            <div class="form-group">
                <label for="customer-state" class="form-label">State</label>
                <select id="customer-state" class="form-select">
                    <option value="">Select State</option>
                    ${getStateOptions(customer.state)}
                </select>
            </div>
            <div class="form-group">
                <label for="customer-transport" class="form-label">Transport Name</label>
                <input type="text" id="customer-transport" class="form-input" value="${customer.transportName || ''}">
            </div>
        </form>
    `;
    
    Modal.open(content, 'Edit Customer');
    
    // Setup form handlers
    document.getElementById('whatsapp-same').addEventListener('change', (e) => {
        const whatsappInput = document.getElementById('customer-whatsapp');
        if (e.target.checked) {
            whatsappInput.value = document.getElementById('customer-phone').value;
            whatsappInput.disabled = true;
        } else {
            whatsappInput.disabled = false;
        }
    });
    
    document.getElementById('customer-phone').addEventListener('input', (e) => {
        if (document.getElementById('whatsapp-same').checked) {
            document.getElementById('customer-whatsapp').value = e.target.value;
        }
    });
    
    // Setup form submission
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveCustomer()">Update Customer</button>
    `;
    document.querySelector('.modal-body').appendChild(modalFooter);
}

function saveCustomer() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const whatsapp = document.getElementById('customer-whatsapp').value.trim();
    const gst = document.getElementById('customer-gst').value.trim();
    const state = document.getElementById('customer-state').value;
    const address = document.getElementById('customer-address').value.trim();
    const transport = document.getElementById('customer-transport').value.trim();
    
    // Validation
    if (!name) {
        Toast.error('Please enter customer name');
        return;
    }
    
    if (phone && !Utils.validatePhone(phone)) {
        Toast.error('Please enter a valid 10-digit phone number');
        return;
    }
    
    if (gst && !Utils.validateGSTIN(gst)) {
        Toast.error('Please enter a valid GSTIN');
        return;
    }
    
    const customer = {
        id: editingCustomerId || Utils.generateId(),
        name: name,
        address: address,
        phone: phone,
        whatsappNumber: whatsapp || phone,
        gstNumber: gst,
        state: state,
        transportName: transport,
        createdAt: editingCustomerId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingCustomerId) {
        const index = customers.findIndex(c => c.id === editingCustomerId);
        if (index >= 0) {
            customers[index] = { ...customers[index], ...customer };
        }
    } else {
        customers.push(customer);
    }
    
    Storage.set(Storage.customers, customers);
    Toast.success(editingCustomerId ? 'Customer updated successfully' : 'Customer added successfully');
    Modal.close();
    loadCustomers();
    
    // If returning to invoice page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('return') === 'invoice') {
        setTimeout(() => {
            window.location.href = 'create-invoice.html?return=customer';
        }, 500);
    }
}

function deleteCustomer(customerId) {
    Modal.confirm(
        'Are you sure you want to delete this customer? This action cannot be undone.',
        () => {
            customers = customers.filter(c => c.id !== customerId);
            Storage.set(Storage.customers, customers);
            Toast.success('Customer deleted successfully');
            loadCustomers();
        }
    );
}

function exportCustomerCSV(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const csv = [
        ['Name', 'Address', 'Phone', 'WhatsApp', 'GST Number', 'State', 'Transport Name'],
        [
            customer.name,
            customer.address || '',
            customer.phone || '',
            customer.whatsappNumber || '',
            customer.gstNumber || '',
            customer.state || '',
            customer.transportName || ''
        ]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-${customer.name.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    Toast.success('Customer exported successfully');
}

function shareCustomerWhatsApp(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const phone = customer.whatsappNumber || customer.phone;
    if (!phone) {
        Toast.error('No phone number available for this customer');
        return;
    }
    
    // Get outstanding amount
    const invoices = Storage.get(Storage.invoices) || [];
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId && inv.status !== 'Paid');
    let outstanding = 0;
    customerInvoices.forEach(inv => {
        outstanding += (inv.grandTotal || 0) - (inv.paidAmount || 0);
    });
    
    const message = encodeURIComponent(
        `Hello ${customer.name},\n\n` +
        (outstanding > 0 ? `Your outstanding balance is: ${Utils.formatCurrency(outstanding)}\n\n` : '') +
        `Thank you for your business!`
    );
    
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}



