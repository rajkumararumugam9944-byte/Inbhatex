// Settings page functionality
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadTheme();
});

function loadSettings() {
    const settings = Storage.get(Storage.settings) || {
        companyName: 'Your Company Name',
        companyAddress: 'Your Company Address',
        gstin: '',
        logo: '',
        defaultTemplate: 'template-1',
        theme: 'light',
        bankDetails: []
    };
    
    document.getElementById('company-name').value = settings.companyName || '';
    document.getElementById('company-address').value = settings.companyAddress || '';
    document.getElementById('company-gstin').value = settings.gstin || '';
    document.getElementById('default-template').value = settings.defaultTemplate || 'template-1';
    document.getElementById('invoice-number-format').value = settings.invoiceNumberFormat || 'INV-YYYY-###';
    document.getElementById('gst-default').checked = settings.gstDefault || false;
    
    const theme = settings.theme || 'light';
    document.getElementById('theme-select').value = theme;
    
    // Update theme preview
    setTimeout(() => {
        updateThemePreview(theme);
    }, 100);
    
    if (settings.logo) {
        document.getElementById('logo-preview').innerHTML = `
            <img src="${settings.logo}" alt="Company Logo" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; padding: 8px; border-radius: 4px;">
        `;
    }
    
    if (settings.signature) {
        document.getElementById('signature-preview').innerHTML = `
            <img src="${settings.signature}" alt="Signature" style="max-width: 200px; max-height: 100px; border: 1px solid #ddd; padding: 8px; border-radius: 4px;">
        `;
    }
    
    // Load bank details
    loadBankDetails(settings.bankDetails || []);
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-select').value = theme;
}

let originalLogoImage = null;
let logoImageData = null;
let maintainAspectRatio = true;

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        Toast.error('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        logoImageData = e.target.result;
        originalLogoImage = new Image();
        originalLogoImage.onload = () => {
            showLogoCropper(originalLogoImage);
        };
        originalLogoImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showLogoCropper(img) {
    const cropper = document.getElementById('logo-cropper');
    const canvas = document.getElementById('logo-canvas');
    const preview = document.getElementById('logo-preview');
    
    // Set initial canvas size
    const maxSize = 400;
    let width = img.width;
    let height = img.height;
    
    // Scale down if too large
    if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width = width * scale;
        height = height * scale;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Set default crop size (square, centered)
    const cropSize = Math.min(width, height, 200);
    document.getElementById('logo-width').value = cropSize;
    document.getElementById('logo-height').value = cropSize;
    
    // Draw image on canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // Show cropper
    cropper.classList.remove('hidden');
    preview.innerHTML = '<p style="color: var(--color-neutral-600); font-size: 14px;">Use the cropper below to adjust your logo</p>';
    
    // Draw crop overlay
    drawCropOverlay(canvas, cropSize, cropSize);
}

function drawCropOverlay(canvas, cropWidth, cropHeight) {
    const ctx = canvas.getContext('2d');
    const img = originalLogoImage;
    
    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scale
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    // Draw crop overlay (darkened area outside crop)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Calculate crop area (centered)
    const cropX = (canvas.width - cropWidth) / 2;
    const cropY = (canvas.height - cropHeight) / 2;
    
    // Draw darkened areas
    ctx.fillRect(0, 0, canvas.width, cropY); // Top
    ctx.fillRect(0, cropY, cropX, cropHeight); // Left
    ctx.fillRect(cropX + cropWidth, cropY, canvas.width - cropX - cropWidth, cropHeight); // Right
    ctx.fillRect(0, cropY + cropHeight, canvas.width, canvas.height - cropY - cropHeight); // Bottom
    
    // Draw crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    ctx.setLineDash([]);
}

function updateLogoSize() {
    const width = parseInt(document.getElementById('logo-width').value) || 200;
    const height = parseInt(document.getElementById('logo-height').value) || 200;
    const canvas = document.getElementById('logo-canvas');
    
    if (!canvas || !originalLogoImage) return;
    
    if (maintainAspectRatio && originalLogoImage) {
        const aspectRatio = originalLogoImage.width / originalLogoImage.height;
        const newHeight = Math.round(width / aspectRatio);
        document.getElementById('logo-height').value = newHeight;
        drawCropOverlay(canvas, width, newHeight);
    } else {
        drawCropOverlay(canvas, width, height);
    }
}

function toggleAspectRatio() {
    maintainAspectRatio = document.getElementById('logo-maintain-aspect').checked;
    if (maintainAspectRatio) {
        updateLogoSize();
    }
}

function applyLogoCrop() {
    const canvas = document.getElementById('logo-canvas');
    const width = parseInt(document.getElementById('logo-width').value) || 200;
    const height = parseInt(document.getElementById('logo-height').value) || 200;
    
    if (!canvas || !originalLogoImage) return;
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const ctx = croppedCanvas.getContext('2d');
    
    // Calculate source crop area
    const img = originalLogoImage;
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    
    // Calculate crop area on original image
    const cropX = (canvas.width - width) / 2;
    const cropY = (canvas.height - height) / 2;
    
    // Calculate source coordinates
    const srcX = (cropX - x) / scale;
    const srcY = (cropY - y) / scale;
    const srcWidth = width / scale;
    const srcHeight = height / scale;
    
    // Draw cropped image
    ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, width, height);
    
    // Get cropped image as data URL
    const croppedDataUrl = croppedCanvas.toDataURL('image/png', 0.9);
    
    // Update preview
    const preview = document.getElementById('logo-preview');
    const previewImg = document.createElement('img');
    previewImg.src = croppedDataUrl;
    previewImg.style.maxWidth = '200px';
    previewImg.style.maxHeight = '200px';
    previewImg.style.border = '1px solid #ddd';
    previewImg.style.padding = '8px';
    previewImg.style.borderRadius = '4px';
    previewImg.alt = 'Company Logo Preview';
    
    preview.innerHTML = '';
    preview.appendChild(previewImg);
    
    // Hide cropper
    document.getElementById('logo-cropper').classList.add('hidden');
    
    // Save to settings
    const settings = Storage.get(Storage.settings) || {};
    settings.logo = croppedDataUrl;
    Storage.set(Storage.settings, settings);
    
    Toast.success('Logo cropped and saved successfully');
}

function cancelLogoCrop() {
    document.getElementById('logo-cropper').classList.add('hidden');
    document.getElementById('company-logo').value = '';
    originalLogoImage = null;
    logoImageData = null;
}

function resetLogoCrop() {
    if (originalLogoImage) {
        showLogoCropper(originalLogoImage);
    }
}

function handleSignatureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        Toast.error('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '100px';
        img.style.border = '1px solid #ddd';
        img.style.padding = '8px';
        img.style.borderRadius = '4px';
        img.alt = 'Signature Preview';
        
        const preview = document.getElementById('signature-preview');
        preview.innerHTML = '';
        preview.appendChild(img);
        
        // Save to settings
        const settings = Storage.get(Storage.settings) || {};
        settings.signature = e.target.result;
        Storage.set(Storage.settings, settings);
        
        Toast.success('Signature uploaded successfully');
    };
    reader.readAsDataURL(file);
}

function saveCompanySettings() {
    const companyName = document.getElementById('company-name').value.trim();
    const companyAddress = document.getElementById('company-address').value.trim();
    const gstin = document.getElementById('company-gstin').value.trim();
    
    if (!companyName) {
        Toast.error('Please enter company name');
        return;
    }
    
    if (!companyAddress) {
        Toast.error('Please enter company address');
        return;
    }
    
    if (gstin && !Utils.validateGSTIN(gstin)) {
        Toast.error('Please enter a valid GSTIN');
        return;
    }
    
    const settings = Storage.get(Storage.settings) || {};
    settings.companyName = companyName;
    settings.companyAddress = companyAddress;
    settings.gstin = gstin;
    
    Storage.set(Storage.settings, settings);
    Toast.success('Company settings saved successfully');
}

function saveTemplateSettings() {
    const defaultTemplate = document.getElementById('default-template').value;
    const invoiceNumberFormat = document.getElementById('invoice-number-format').value;
    const gstDefault = document.getElementById('gst-default').checked;
    
    const settings = Storage.get(Storage.settings) || {};
    settings.defaultTemplate = defaultTemplate;
    settings.invoiceNumberFormat = invoiceNumberFormat;
    settings.gstDefault = gstDefault;
    
    Storage.set(Storage.settings, settings);
    Toast.success('Template settings saved successfully');
}

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const settings = Storage.get(Storage.settings) || {};
    settings.theme = theme;
    Storage.set(Storage.settings, settings);
    
    // Update preview active state
    updateThemePreview(theme);
    
    Toast.success('Theme changed successfully');
}

function previewTheme(theme) {
    // Temporarily apply theme for preview
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update select dropdown
    document.getElementById('theme-select').value = theme;
    
    // Update preview active state
    updateThemePreview(theme);
    
    // Save theme
    changeTheme(theme);
}

function updateThemePreview(activeTheme) {
    const previewItems = document.querySelectorAll('.theme-preview-item');
    previewItems.forEach(item => {
        if (item.getAttribute('data-theme') === activeTheme) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function exportAllData() {
    const customers = Storage.get(Storage.customers) || [];
    const products = Storage.get(Storage.products) || [];
    const invoices = Storage.get(Storage.invoices) || [];
    const settings = Storage.get(Storage.settings) || {};
    
    const data = {
        customers,
        products,
        invoices,
        settings,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    Toast.success('All data exported successfully');
}

function exportCustomers() {
    const customers = Storage.get(Storage.customers) || [];
    if (customers.length === 0) {
        Toast.warning('No customers to export');
        return;
    }
    
    const csv = [
        ['Name', 'Address', 'Phone', 'WhatsApp', 'GST Number', 'State', 'Transport Name'],
        ...customers.map(c => [
            c.name,
            c.address || '',
            c.phone || '',
            c.whatsappNumber || '',
            c.gstNumber || '',
            c.state || '',
            c.transportName || ''
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    downloadCSV(csv, 'customers-export');
    Toast.success('Customers exported successfully');
}

function exportProducts() {
    const products = Storage.get(Storage.products) || [];
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
    
    downloadCSV(csv, 'products-export');
    Toast.success('Products exported successfully');
}

function exportInvoices() {
    const invoices = Storage.get(Storage.invoices) || [];
    if (invoices.length === 0) {
        Toast.warning('No invoices to export');
        return;
    }
    
    const csv = [
        ['Invoice Number', 'Date', 'Customer ID', 'Subtotal', 'Grand Total', 'Status', 'GST Type'],
        ...invoices.map(inv => [
            inv.invoiceNumber,
            inv.date,
            inv.customerId,
            inv.subtotal || 0,
            inv.grandTotal || 0,
            inv.status || 'Unpaid',
            inv.gstType || 'Non-GST'
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    downloadCSV(csv, 'invoices-export');
    Toast.success('Invoices exported successfully');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearAllData() {
    Modal.confirm(
        'Are you sure you want to clear all data? This will permanently delete all customers, products, and invoices. This action cannot be undone.',
        () => {
            Storage.set(Storage.customers, []);
            Storage.set(Storage.products, []);
            Storage.set(Storage.invoices, []);
            Toast.success('All data cleared successfully');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    );
}

// Bank Details Management
let bankDetailsCounter = 0;

function loadBankDetails(bankDetails) {
    const container = document.getElementById('bank-details-list');
    if (!container) return;
    
    container.innerHTML = '';
    bankDetailsCounter = 0;
    
    if (bankDetails.length === 0) {
        addBankDetail();
    } else {
        bankDetails.forEach((bank, index) => {
            addBankDetail(bank, index);
        });
    }
}

function addBankDetail(bankData = null, index = null) {
    const container = document.getElementById('bank-details-list');
    if (!container) return;
    
    const id = index !== null ? index : bankDetailsCounter++;
    const bank = bankData || {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        accountType: ''
    };
    
    const bankDiv = document.createElement('div');
    bankDiv.className = 'bank-detail-item';
    bankDiv.style.cssText = 'margin-bottom: var(--spacing-6); padding: var(--spacing-4); border: 1px solid var(--color-neutral-300); border-radius: var(--radius-md); background: var(--color-neutral-50);';
    bankDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-4);">
            <h3 style="margin: 0; font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold);">Bank Detail ${id + 1}</h3>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeBankDetail(this)" style="min-width: auto; padding: 4px 12px;">Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Bank Name</label>
                <input type="text" class="form-input bank-name" value="${bank.bankName || ''}" placeholder="e.g., State Bank of India">
            </div>
            <div class="form-group">
                <label class="form-label">Account Number</label>
                <input type="text" class="form-input bank-account" value="${bank.accountNumber || ''}" placeholder="Account Number">
            </div>
            <div class="form-group">
                <label class="form-label">IFSC Code</label>
                <input type="text" class="form-input bank-ifsc" value="${bank.ifscCode || ''}" placeholder="e.g., SBIN0001234" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">Branch</label>
                <input type="text" class="form-input bank-branch" value="${bank.branch || ''}" placeholder="Branch Name">
            </div>
            <div class="form-group">
                <label class="form-label">Account Type</label>
                <select class="form-select bank-type">
                    <option value="Current" ${bank.accountType === 'Current' ? 'selected' : ''}>Current</option>
                    <option value="Savings" ${bank.accountType === 'Savings' ? 'selected' : ''}>Savings</option>
                    <option value="OD" ${bank.accountType === 'OD' ? 'selected' : ''}>OD</option>
                    <option value="CC" ${bank.accountType === 'CC' ? 'selected' : ''}>CC</option>
                </select>
            </div>
        </div>
    `;
    
    container.appendChild(bankDiv);
}

function removeBankDetail(button) {
    const bankItem = button.closest('.bank-detail-item');
    if (bankItem) {
        const container = document.getElementById('bank-details-list');
        const items = container.querySelectorAll('.bank-detail-item');
        if (items.length > 1) {
            bankItem.remove();
        } else {
            Toast.warning('At least one bank detail is required');
        }
    }
}

function saveBankDetails() {
    const container = document.getElementById('bank-details-list');
    if (!container) return;
    
    const bankItems = container.querySelectorAll('.bank-detail-item');
    const bankDetails = [];
    
    bankItems.forEach((item) => {
        const bankName = item.querySelector('.bank-name')?.value.trim() || '';
        const accountNumber = item.querySelector('.bank-account')?.value.trim() || '';
        const ifscCode = item.querySelector('.bank-ifsc')?.value.trim().toUpperCase() || '';
        const branch = item.querySelector('.bank-branch')?.value.trim() || '';
        const accountType = item.querySelector('.bank-type')?.value || '';
        
        // Only add if at least bank name or account number is provided
        if (bankName || accountNumber) {
            bankDetails.push({
                bankName,
                accountNumber,
                ifscCode,
                branch,
                accountType
            });
        }
    });
    
    const settings = Storage.get(Storage.settings) || {};
    settings.bankDetails = bankDetails;
    Storage.set(Storage.settings, settings);
    
    Toast.success('Bank details saved successfully');
}


