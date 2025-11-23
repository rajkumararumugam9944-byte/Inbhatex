// Home page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    loadCompanyInfo();
    updateHomeStats();
});

function loadCompanyInfo() {
    const settings = Storage.get(Storage.settings) || {};
    const companyName = settings.companyName || 'Cloth Billing App';
    const companyAddress = settings.companyAddress || 'Manage your customers, products, and invoices with ease';
    const companyLogo = settings.logo || '';
    
    // Update company name
    const companyNameEl = document.getElementById('company-name-header');
    if (companyNameEl) {
        companyNameEl.textContent = companyName;
    }
    
    // Update company address
    const companyAddressEl = document.getElementById('company-address-header');
    if (companyAddressEl) {
        companyAddressEl.textContent = companyAddress;
    }
    
    // Update company logo
    const logoContainer = document.getElementById('company-logo-container');
    if (logoContainer) {
        if (companyLogo) {
            logoContainer.innerHTML = `<img src="${companyLogo}" alt="${companyName} Logo" class="company-logo-display">`;
        } else {
            // Keep default SVG icon if no logo
            logoContainer.innerHTML = `
                <svg class="logo-icon" width="80" height="80" viewBox="0 0 32 32" aria-hidden="true">
                    <rect width="32" height="32" fill="currentColor" opacity="0.1" rx="4"/>
                    <path d="M8 12h16v2H8zm0 4h16v2H8zm0 4h12v2H8z" fill="currentColor"/>
                </svg>
            `;
        }
    }
}

function updateHomeStats() {
    const customers = Storage.get(Storage.customers) || [];
    const products = Storage.get(Storage.products) || [];
    const invoices = Storage.get(Storage.invoices) || [];
    
    // Calculate outstanding
    let outstanding = 0;
    invoices.forEach(invoice => {
        if (invoice.status !== 'Paid') {
            outstanding += (invoice.grandTotal || 0) - (invoice.paidAmount || 0);
        }
    });
    
    // Update UI
    const totalCustomersEl = document.getElementById('total-customers');
    const totalProductsEl = document.getElementById('total-products');
    const totalInvoicesEl = document.getElementById('total-invoices');
    const outstandingEl = document.getElementById('outstanding');
    
    if (totalCustomersEl) totalCustomersEl.textContent = customers.length;
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (totalInvoicesEl) totalInvoicesEl.textContent = invoices.length;
    if (outstandingEl) outstandingEl.textContent = Utils.formatCurrency(outstanding);
}


