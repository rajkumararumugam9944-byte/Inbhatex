# Cloth Billing Web Application

A comprehensive, client-side billing application designed specifically for cloth retail businesses. Features a modern, textile-friendly UI with complete CRUD operations for customers, products, and invoices, including automatic GST calculations and multiple printable invoice templates.

## Features

### Core Functionality
- **Customer Management**: Add, edit, delete, and search customers with GST information
- **Product Management**: Maintain product catalog with HSN codes, rates, and units
- **Invoice Creation**: Create invoices with automatic GST calculations
- **Dashboard**: View KPIs, customer list, invoice history, and outstanding balances
- **Settings**: Configure company profile, invoice templates, and theme preferences

### GST Logic
- **Tamil Nadu Customers**: Automatically applies CGST 2.5% + SGST 2.5% (total 5%)
- **Other States**: Automatically applies IGST 5%
- GST is calculated per line item and summarized in invoice totals

### Invoice Templates
12 distinct printable invoice templates:
1. **Minimal** - Clean, simple design
2. **Classic** - Traditional invoice layout
3. **Corporate** - Professional corporate style
4. **Modern** - Contemporary design with gradients
5. **Compact** - Space-efficient layout
6. **Two Column** - Side-by-side layout
7. **Grid Based** - Structured grid design
8. **Receipt Style** - Narrow receipt format
9. **Textile Theme** - Fabric-inspired design
10. **Monochrome** - Black and white only
11. **Color Accent** - Vibrant color highlights
12. **Detailed** - Comprehensive information layout

### Export & Share
- **PDF Export**: Print invoices to PDF using browser print functionality
- **Excel/CSV Export**: Export invoices, customers, and products to CSV
- **WhatsApp Share**: Share invoices and outstanding balances via WhatsApp
- **Color/BW Printing**: Toggle between color and black & white print styles

### Accessibility
- WCAG AA compliant
- Keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- Focus indicators
- Reduced motion support

## Project Structure

```
My Web Application/
├── index.html              # Home page
├── dashboard.html          # Dashboard with KPIs and lists
├── create-invoice.html    # Invoice editor
├── customers.html         # Customer management
├── products.html          # Product management
├── settings.html          # Application settings
├── print-invoice.html     # Invoice print/export page
├── css/
│   ├── style.css          # Main stylesheet with design system
│   ├── components.css     # Component library
│   ├── dashboard.css      # Dashboard-specific styles
│   ├── invoice.css        # Invoice editor styles
│   └── invoice-print.css # Print template styles
├── js/
│   ├── app.js             # Core application (Storage, Utils, Toast, Modal)
│   ├── home.js            # Home page functionality
│   ├── dashboard.js       # Dashboard functionality
│   ├── invoice.js         # Invoice editor with GST logic
│   ├── customers.js       # Customer CRUD operations
│   ├── products.js        # Product CRUD operations
│   ├── print-invoice.js   # Print/export functionality
│   └── settings.js       # Settings management
└── README.md             # This file
```

## Design System

### Color Palette
- **Primary**: `#6B4E71` (Deep purple - fabric dye)
- **Secondary**: `#D4A574` (Warm beige - natural fabric)
- **Accent**: `#E8B4A0` (Soft coral - textile accent)
- **Success**: `#7FB069` (Green)
- **Warning**: `#F4A261` (Amber)
- **Error**: `#E76F51` (Coral red)

### Typography
- **Font Family**: Inter (system fallback)
- **Scale**: 12px (xs) to 48px (5xl)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing Scale
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px

### Responsive Breakpoints
- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1023px
- **Desktop**: >= 1024px

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No server or build process required

2. **Initial Setup**
   - Navigate to Settings
   - Enter your company name and address
   - Upload your company logo (optional)
   - Configure default invoice template

3. **Add Data**
   - Add customers via Customers page
   - Add products via Products page
   - Create invoices via Create Invoice page

## Usage Guide

### Creating an Invoice
1. Navigate to "Create Invoice"
2. Select a customer (or add new)
3. Enable GST if applicable
4. Add items using the item table
5. System automatically calculates:
   - Subtotal
   - GST (CGST/SGST for Tamil Nadu, IGST for others)
   - Round off
   - Grand total
   - Total in words
6. Click "Save & Print" to save and view print preview

### Managing Customers
- **Add**: Click "+ Add Customer" button
- **Edit**: Click "Edit" button on customer row
- **Delete**: Click "Delete" button (with confirmation)
- **Export**: Click "Export" to download CSV
- **WhatsApp**: Click "WhatsApp" to share outstanding balance

### Managing Products
- **Add**: Click "+ Add Product" button
- **Edit**: Click "Edit" button on product row
- **Delete**: Click "Delete" button (with confirmation)
- **Export All**: Export entire product catalog to CSV

### Printing Invoices
1. After saving invoice, navigate to print page
2. Select template from dropdown
3. Toggle color/BW print style
4. Click "Print Invoice" for PDF
5. Or use "Export PDF", "Export Excel", or "Share via WhatsApp"

## Data Storage

All data is stored in browser's `localStorage`:
- `billing_customers`: Customer database
- `billing_products`: Product catalog
- `billing_invoices`: Invoice records
- `billing_settings`: Application settings

### Data Export
- Export all data as JSON backup from Settings
- Export individual entities (customers, products, invoices) as CSV
- All exports are client-side, no server required

## Keyboard Shortcuts

- `/` - Focus search box (on dashboard)
- `Escape` - Close modal
- `Tab` - Navigate between form fields
- `Enter` - Submit forms

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with:
- localStorage support
- ES6+ JavaScript
- CSS Grid and Flexbox

## GST Calculation Logic

```javascript
// Tamil Nadu customers
if (customer.state === 'Tamil Nadu') {
    CGST = amount * 0.025  // 2.5%
    SGST = amount * 0.025  // 2.5%
    Total GST = 5%
}

// Other states
else {
    IGST = amount * 0.05  // 5%
}
```

## Invoice Templates

Each template includes:
- Company header with logo (left corner)
- Invoice metadata (number, date, transport, bundles, e-way bill)
- Customer information
- Itemized table with GST breakdown
- Summary section (subtotal, GST, round off, grand total)
- Total in words
- Signature area
- Terms & conditions

Templates support both color and black & white printing.

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)
- Screen reader support
- Reduced motion support

## Microcopy Examples

### CTAs
- "Create Invoice"
- "Save & Print"
- "Share via WhatsApp"

### Validation Messages
- "Please enter a valid GSTIN"
- "Phone number required"
- "Outstanding updated"

### Empty States
- "No customers yet — add your first customer"
- "No products found"
- "No invoices yet"

### Success Messages
- "Invoice saved successfully"
- "Customer added successfully"
- "Payment recorded successfully"

## Future Enhancements

Potential additions:
- Multi-user support with roles
- Cloud backup/sync
- Advanced reporting
- Barcode scanning
- Mobile app version
- Tamil language localization
- Email invoice delivery

## License

This project is provided as-is for use in cloth retail billing applications.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Ensure JavaScript is enabled
4. Try clearing browser cache

## Credits

Designed and developed for cloth retail businesses with a focus on:
- Modern, textile-friendly UI
- Complete client-side functionality
- Accessibility compliance
- Print-ready invoice templates
- Automatic GST calculations

---

**Version**: 1.0.0  
**Last Updated**: 2024



