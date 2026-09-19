# NBA Trivia Rewards

A two-page rewards-store prototype for CIDM-6325 Assignment 1. Basketball fans can spend demo credits on profile customizations and share feedback about the experience.

## Run the project

Open **`index.html`** in a current browser. No installation, build command, server, or internet connection is needed. Keep the HTML files and the `css`, `js`, and `images` folders together when copying or extracting the project.

## Try it

1. Start with **1,000 virtual credits** and browse all six rewards. Use the category buttons to filter avatars, frames, or titles.
2. Select **Redeem**, then confirm or cancel. A successful redemption deducts the price, adds the item to your collection, and equips it in the profile preview.
3. Buy another item in the same category to switch looks. Select **Equip** on an owned item to switch back for free. One avatar, one frame, and one title can be equipped at a time.
4. Open **Reviews** to read the two sample reviews. Enter your name, a 1–5 star rating, feedback, and a recommendation, then select **Post your review**.
5. The review appears at the top of the list, the summary updates, and the form clears. Use **Return to Rewards Store** to return.

Purchases, credits, equipped products, and submitted reviews exist only in page memory. A fresh page load resets the demo. There are no real payments, accounts, trivia challenges, credit earning, databases, external APIs, or permanent storage.

## Files

```text
index.html                         Store, profile preview, and redemption dialog
reviews.html                       Sample reviews and feedback form
css/styles.css                     Shared styling and responsive layouts
js/app.js                          Catalog, demo state, and page interactions
images/
  logo-basketball-question.png      Supplied site logo
  avatar-hoop-scholar.png           Supplied avatar product
  avatar-neon-hoop.png              Supplied avatar product
  frame-courtside-gold.png          Supplied transparent frame
  frame-hardwood-classic.png        Supplied transparent frame
  default-avatar.svg               Simple default basketball avatar
```

The supplied product images were moved from `imgs` into `images` and given descriptive filenames. Titles use styled HTML text. The header keeps the site name as live text beside the supplied logo. All asset and page paths are relative, and the site uses system fonts.

## JavaScript and accessibility

The shared script checks for page-specific elements before initializing them. Product data is stored in an array of objects. The main functions are:

- `redeemProduct(productId)` checks ownership and balance, then opens the confirmation dialog.
- `confirmRedemption()` checks the purchase again, deducts credits, records ownership, and equips the reward.
- `equipProduct(productId)` switches only the matching equipment slot without charging again.
- `updateProfilePreview()` updates avatar and frame images, alternative text, and the text title.
- `submitReview(event)` prevents navigation, validates trimmed inputs, inserts a review, and resets the form.
- `displayMessage(elementId, message, type)` presents accessible success and error messages.

Reviews are inserted with `textContent` so user input cannot become executable HTML. Required fields have visible labels, validation states, and explanatory feedback. Navigation and controls support keyboard use, visible focus, a skip link, a native modal dialog, and live status announcements. Layouts adapt from three product columns to two and then one, and respect reduced-motion preferences.

## Verification

The prototype is tested by opening the pages directly with `file://` URLs in Microsoft Edge. Browser checks cover:

- All six catalog entries, prices, image paths, title previews, category filters, and navigation links.
- Confirmation and cancellation, accurate deductions, duplicate-purchase protection, exact-balance purchases, and insufficient-credit errors.
- Avatar, frame, and title updates; one equipped item per category; free switching between owned items; and aligned image layers.
- Required-field and whitespace validation, submitted ratings and recommendations, updated summaries, cleared forms, and safe rendering of HTML-like feedback without a page reload.
- Fresh-load resets, keyboard access, mobile redemption, and responsive layouts from 320 to 1,440 pixels without horizontal overflow.
- No JavaScript console errors or failed asset requests during the browser checks.

To reproduce the main scenarios manually, redeem Hoop Scholar (200), Courtside Gold (450), and Hardwood Historian (150). Your balance should be **200**. Attempting Neon Hoop (250) should explain that you need **50 more credits** without changing your balance. Reload to begin again.
