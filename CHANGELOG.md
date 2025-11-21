# CHANGELOG

## [1.1.0] – Major Platform Update

### Added
- Implemented full **per-size inventory system** (Stock_XS → Stock_XXL) replacing the previous single stock field.
- Added admin dashboard controls for editing size-specific stock levels.
- Updated product pages to display size-level availability and disable sizes with zero stock.
- Enhanced cart system to store productId, selectedSize, and sizeStock for accurate validation.
- Improved quantity controls to enforce per-size stock limits and prevent overselling.
- Added low-stock messaging showing **“Only X left”** when sizeStock < 5.
- Checkout now includes size + quantity per item for accurate order summaries.
- Introduced dynamic shipping calculation:
  - Saskatchewan: **FREE**
  - Rest of Canada: **$20**
  - International: **$30**
- Checkout summary fully recalculates totals using real shipping and tax values.
- Added new descriptions and content for updated product lineup (hoodie, sweats, tees, windbreakers).

### Changed
- Cart page no longer fakes tax or shipping estimates; instead shows:
  - **Shipping: Calculated at checkout**
  - **Tax: Calculated at checkout**
- Checkout now handles all tax/shipping logic server-side for accuracy.
- Order confirmation email improved with size, quantity, and shipping details.
- UI tweaks for cleaner quantity selector layout and low-stock warnings.
- CSP (Content Security Policy) updated to support Firebase, Brevo, Stripe, Cloudinary, and Google Analytics.

### Fixed
- Newsletter subscription failures caused by:
  - Missing CPS domains (Firebase, Brevo, Google Tag)
  - Missing CORS headers
  - Brevo rejecting Render’s outbound IP address (now resolved)
- Backend now reliably reduces Airtable inventory after successful Stripe payment.
- Cart only clears after payment, stock update, and email all succeed.
- Fixed multiple backend stability issues across CORS, preflight, and API calls.

### Technical
- Added new backend endpoint `/api/update-stock` to handle Airtable stock deduction.
- Refactored checkout backend to include shipping + tax in Stripe payment calculations.
- Improved logging and error handling across the checkout flow.
- Cleaned up Airtable mapping logic and removed legacy stock fields.

