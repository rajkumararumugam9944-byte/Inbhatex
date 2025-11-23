// Print Invoice functionality
let currentInvoice = null;
let currentTemplate = 'template-1';

document.addEventListener('DOMContentLoaded', () => {
    // Get invoice ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    
    if (invoiceId) {
        loadInvoice(invoiceId);
    } else {
        document.getElementById('invoice-container').innerHTML = '<p>No invoice selected</p>';
    }
    
    // Load saved template preference
    const settings = Storage.get(Storage.settings) || {};
    if (settings.defaultTemplate) {
        currentTemplate = settings.defaultTemplate;
        document.getElementById('template-select').value = currentTemplate;
    }
});

function loadInvoice(id) {
    const invoices = Storage.get(Storage.invoices) || [];
    currentInvoice = invoices.find(inv => inv.id === id);
    
    if (!currentInvoice) {
        document.getElementById('invoice-container').innerHTML = '<p>Invoice not found</p>';
        return;
    }
    
    renderInvoice();
}

function renderInvoice() {
    if (!currentInvoice) return;
    
    const customers = Storage.get(Storage.customers) || [];
    const customer = customers.find(c => c.id === currentInvoice.customerId);
    const settings = Storage.get(Storage.settings) || {};
    
    // Get company details from settings
    const companyName = settings.companyName || 'Your Company Name';
    const companyAddress = settings.companyAddress || 'Your Company Address';
    const gstin = settings.gstin || '';
    const logo = settings.logo || '';
    const bankDetails = settings.bankDetails || [];
    
    // Customer details
    const customerName = customer ? customer.name : 'Unknown Customer';
    const customerAddress = customer ? (customer.address || '') : '';
    const customerGST = customer ? (customer.gstNumber || '') : '';
    const customerState = customer ? (customer.state || '') : '';
    
    // Invoice calculations
    const subtotal = currentInvoice.subtotal || 0;
    const roundOff = currentInvoice.roundOff || 0;
    const grandTotal = currentInvoice.grandTotal || 0;
    
    // GST calculations
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    
    if (currentInvoice.gstEnabled) {
        currentInvoice.items.forEach(item => {
            const itemAmount = item.amount || 0;
            if (customerState === 'Tamil Nadu') {
                const gstAmount = itemAmount * 0.05;
                totalCGST += gstAmount / 2;
                totalSGST += gstAmount / 2;
            } else {
                totalIGST += itemAmount * 0.05;
            }
        });
    }
    
    const totalGST = totalCGST + totalSGST + totalIGST;
    
    // Format date
    const invoiceDate = currentInvoice.date ? new Date(currentInvoice.date).toLocaleDateString('en-IN') : '';
    
    // Build invoice HTML
    const invoiceHTML = `
        <div class="invoice-header">
            <div class="company-logo-left">
                ${logo ? `<div class="company-logo"><img src="${logo}" alt="Company Logo"></div>` : ''}
            </div>
            <div class="company-info-center">
                <div class="company-name">${companyName}</div>
                <div class="company-address">${companyAddress}</div>
                ${gstin ? `<div class="company-gstin">GSTIN: ${gstin}</div>` : ''}
            </div>
            <div class="invoice-meta">
                <div class="invoice-title">TAX INVOICE</div>
                <div class="invoice-number">Invoice No: ${currentInvoice.invoiceNumber || ''}</div>
                <div class="invoice-date">Date: ${invoiceDate}</div>
            </div>
        </div>
        
        <div class="customer-section">
            <div class="customer-info">
                <div class="section-label">Bill To:</div>
                <div class="customer-name">${customerName}</div>
                ${customerAddress ? `<div class="customer-address">${customerAddress}</div>` : ''}
                ${customerGST ? `<div class="customer-gst">GSTIN: ${customerGST}</div>` : ''}
                ${customerState ? `<div class="customer-state">State: ${customerState}</div>` : ''}
            </div>
            ${currentInvoice.transportName ? `
            <div class="transport-info">
                <div class="section-label">Transport:</div>
                <div>${currentInvoice.transportName}</div>
            </div>
            ` : ''}
            ${currentInvoice.bundles ? `
            <div class="bundles-info">
                <div class="section-label">Bundles:</div>
                <div>${currentInvoice.bundles}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="items-table">
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Item Name</th>
                        <th>HSN</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        ${currentInvoice.gstEnabled ? '<th>GST</th>' : ''}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentInvoice.items.map((item, index) => {
                        const itemName = item.name || item.itemName || '';
                        const hsn = item.hsn || '';
                        const size = item.size || '';
                        const qty = item.qty || 0;
                        const rate = item.rate || 0;
                        const amount = item.amount || 0;
                        const gst = item.gst || 0;
                        const total = item.total || amount;
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${itemName}</td>
                                <td>${hsn}</td>
                                <td>${size}</td>
                                <td>${qty}</td>
                                <td>${Utils.formatCurrency(rate)}</td>
                                <td>${Utils.formatCurrency(amount)}</td>
                                ${currentInvoice.gstEnabled ? `<td>${Utils.formatCurrency(gst)}</td>` : ''}
                                <td>${Utils.formatCurrency(total)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="summary-section">
            <div class="summary-table">
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td>${Utils.formatCurrency(subtotal)}</td>
                    </tr>
                    ${currentInvoice.gstEnabled ? `
                    <tr>
                        <td>CGST (2.5%):</td>
                        <td>${Utils.formatCurrency(totalCGST)}</td>
                    </tr>
                    <tr>
                        <td>SGST (2.5%):</td>
                        <td>${Utils.formatCurrency(totalSGST)}</td>
                    </tr>
                    <tr>
                        <td>IGST (5%):</td>
                        <td>${Utils.formatCurrency(totalIGST)}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td>Round Off:</td>
                        <td>${Utils.formatCurrency(roundOff)}</td>
                    </tr>
                    <tr class="summary-total-row">
                        <td>Grand Total:</td>
                        <td>${Utils.formatCurrency(grandTotal)}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="footer-section">
            <div class="footer-left">
                ${bankDetails.length > 0 ? `
                <div class="bank-details-section">
                    <div class="bank-details-title">Bank Details:</div>
                    ${bankDetails.map(bank => `
                        <div class="bank-detail-item">
                            <div><strong>${bank.bankName || ''}</strong></div>
                            <div>A/C No: ${bank.accountNumber || ''}</div>
                            <div>IFSC: ${bank.ifscCode || ''}</div>
                            ${bank.branch ? `<div>Branch: ${bank.branch}</div>` : ''}
                            ${bank.accountType ? `<div>Type: ${bank.accountType}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
            <div class="footer-right">
                <div class="signature-area">
                    <div class="signature-label">Authorized Signature</div>
                </div>
            </div>
        </div>
        
        ${currentInvoice.ewayBill ? `
        <div class="terms-section">
            <div class="terms-label">E-Way Bill No:</div>
            <div class="terms-content">${currentInvoice.ewayBill}</div>
        </div>
        ` : ''}
    `;
    
    const container = document.getElementById('invoice-container');
    container.className = `invoice-container ${currentTemplate}`;
    container.innerHTML = invoiceHTML;
}

function changeTemplate() {
    const select = document.getElementById('template-select');
    if (select) {
        currentTemplate = select.value;
        const container = document.getElementById('invoice-container');
        if (container) {
            container.className = `invoice-container ${currentTemplate}`;
        }
        
        // Save template preference
        const settings = Storage.get(Storage.settings) || {};
        settings.defaultTemplate = currentTemplate;
        Storage.set(Storage.settings, settings);
    }
}

function exportToPDF() {
    const element = document.getElementById('invoice-container');
    if (!element) {
        Toast.error('Invoice container not found');
        return;
    }
    
    const opt = {
        margin: 0,
        filename: `Invoice_${currentInvoice.invoiceNumber || 'invoice'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

function exportToExcel() {
    if (!currentInvoice) {
        Toast.error('No invoice data available');
        return;
    }
    
    // Create CSV content
    let csv = 'Invoice Data\n\n';
    csv += `Invoice Number,${currentInvoice.invoiceNumber || ''}\n`;
    csv += `Date,${currentInvoice.date || ''}\n`;
    csv += `Customer,${currentInvoice.customerId || ''}\n\n`;
    csv += 'Items\n';
    csv += 'S.No,Item Name,HSN,Size,Qty,Rate,Amount,GST,Total\n';
    
    currentInvoice.items.forEach((item, index) => {
        csv += `${index + 1},${item.name || ''},${item.hsn || ''},${item.size || ''},${item.qty || 0},${item.rate || 0},${item.amount || 0},${item.gst || 0},${item.total || 0}\n`;
    });
    
    csv += `\nSubtotal,${currentInvoice.subtotal || 0}\n`;
    csv += `Round Off,${currentInvoice.roundOff || 0}\n`;
    csv += `Grand Total,${currentInvoice.grandTotal || 0}\n`;
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Invoice_${currentInvoice.invoiceNumber || 'invoice'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareWhatsApp() {
    if (!currentInvoice) {
        Toast.error('No invoice data available');
        return;
    }
    
    // First generate and download PDF
    const element = document.getElementById('invoice-container');
    if (element) {
        const opt = {
            margin: 0,
            filename: `Invoice_${currentInvoice.invoiceNumber || 'invoice'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            // After PDF is generated, open WhatsApp
            const customers = Storage.get(Storage.customers) || [];
            const customer = customers.find(c => c.id === currentInvoice.customerId);
            const customerName = customer ? customer.name : 'Customer';
            const customerPhone = customer ? (customer.phone || '') : '';
            
            const message = `Invoice ${currentInvoice.invoiceNumber || ''} for ${customerName}\n\nPlease find the invoice attached.`;
            
            if (customerPhone) {
                const whatsappUrl = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                Toast.info('PDF downloaded. Please attach it manually in WhatsApp.');
            } else {
                const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                Toast.info('PDF downloaded. Please attach it manually in WhatsApp.');
            }
        });
    }
}

// Expose functions globally for inline event handlers
window.changeTemplate = changeTemplate;
window.exportToPDF = exportToPDF;
window.exportToExcel = exportToExcel;
window.shareWhatsApp = shareWhatsApp;
