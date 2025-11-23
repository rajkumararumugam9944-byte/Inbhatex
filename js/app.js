/* ============================================
   CLOTH BILLING APP - CORE APPLICATION
   Data Management & Utilities
   ============================================ */

// Data Storage (localStorage)
const Storage = {
    customers: 'billing_customers',
    products: 'billing_products',
    invoices: 'billing_invoices',
    settings: 'billing_settings',
    
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    // Initialize with default data if empty
    init() {
        if (!this.get(this.customers)) {
            this.set(this.customers, []);
        }
        if (!this.get(this.products)) {
            this.set(this.products, []);
        }
        if (!this.get(this.invoices)) {
            this.set(this.invoices, []);
        }
        if (!this.get(this.settings)) {
            this.set(this.settings, {
                companyName: 'Your Company Name',
                companyAddress: 'Your Company Address',
                gstin: '',
                logo: '',
                defaultTemplate: 'template-1',
                theme: 'light'
            });
        }
    }
};

// Initialize storage
Storage.init();

// Utility Functions
const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    },
    
    // Format date (DD-MM-YYYY)
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    },
    
    // Parse date from DD-MM-YYYY
    parseDate(dateString) {
        if (!dateString) return new Date();
        const [day, month, year] = dateString.split('-');
        return new Date(year, month - 1, day);
    },
    
    // Number to words (for invoice total)
    numberToWords(num) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        if (num === 0) return 'Zero';
        if (num < 20) return ones[num];
        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        }
        if (num < 1000) {
            return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + this.numberToWords(num % 100) : '');
        }
        if (num < 100000) {
            return this.numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + this.numberToWords(num % 1000) : '');
        }
        if (num < 10000000) {
            return this.numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + this.numberToWords(num % 100000) : '');
        }
        return this.numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + this.numberToWords(num % 10000000) : '');
    },
    
    // Validate GSTIN
    validateGSTIN(gstin) {
        if (!gstin) return true; // Optional
        const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return pattern.test(gstin);
    },
    
    // Validate phone
    validatePhone(phone) {
        if (!phone) return true; // Optional
        const pattern = /^[6-9]\d{9}$/;
        return pattern.test(phone.replace(/\D/g, ''));
    },
    
    // Get state from GSTIN
    getStateFromGSTIN(gstin) {
        if (!gstin || gstin.length < 2) return null;
        const stateCode = gstin.substring(0, 2);
        const stateMap = {
            '33': 'Tamil Nadu',
            '09': 'Uttar Pradesh',
            '27': 'Maharashtra',
            // Add more state codes as needed
        };
        return stateMap[stateCode] || null;
    }
};

// Toast Notification System
const Toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.setAttribute('role', 'region');
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;
        
        this.container.appendChild(toast);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }
        
        return toast;
    },
    
    getIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M16 6l-8 8-4-4"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M15 5L5 15M5 5l10 10"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M10 6v4M10 14h.01"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M10 6v4M10 14h.01"/></svg>'
        };
        return icons[type] || icons.info;
    },
    
    remove(toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },
    
    success(message) { return this.show(message, 'success'); },
    error(message) { return this.show(message, 'error'); },
    warning(message) { return this.show(message, 'warning'); },
    info(message) { return this.show(message, 'info'); }
};

// Modal System
const Modal = {
    backdrop: null,
    
    init() {
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'modal-backdrop';
            this.backdrop.setAttribute('role', 'dialog');
            this.backdrop.setAttribute('aria-modal', 'true');
            document.body.appendChild(this.backdrop);
            
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) {
                    this.close();
                }
            });
            
            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.backdrop.classList.contains('active')) {
                    this.close();
                }
            });
        }
    },
    
    open(content, title = '') {
        this.init();
        
        this.backdrop.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        this.backdrop.classList.add('active');
        this.backdrop.querySelector('.modal-close').addEventListener('click', () => this.close());
        
        // Focus trap
        const focusableElements = this.backdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    },
    
    close() {
        if (this.backdrop) {
            this.backdrop.classList.remove('active');
        }
    },
    
    confirm(message, onConfirm, onCancel) {
        const content = `
            <p>${message}</p>
        `;
        
        this.open(content, 'Confirm');
        
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        modalFooter.innerHTML = `
            <button class="btn btn-outline" data-action="cancel">Cancel</button>
            <button class="btn btn-danger" data-action="confirm">Confirm</button>
        `;
        
        this.backdrop.querySelector('.modal-body').appendChild(modalFooter);
        
        modalFooter.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.close();
        });
        
        modalFooter.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            if (onCancel) onCancel();
            this.close();
        });
    }
};

// Theme Toggle & Load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const settings = Storage.get(Storage.settings) || {};
    const savedTheme = settings.theme || localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle button (if exists)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            // Toggle between light and dark only for quick toggle
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Save to settings
            const currentSettings = Storage.get(Storage.settings) || {};
            currentSettings.theme = newTheme;
            Storage.set(Storage.settings, currentSettings);
        });
    }
});

// Export for use in other modules
window.Storage = Storage;
window.Utils = Utils;
window.Toast = Toast;
window.Modal = Modal;



