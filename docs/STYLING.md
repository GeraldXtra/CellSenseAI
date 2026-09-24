# Styling

Ibrahim, Osakue, this file explains how we style the site. Read it before you write your first line of CSS. It is written for someone who has never used CSS variables, so start at the top even if you have.

## What :root is

`client/src/styles/theme.css` starts with a block called `:root`. `:root` is the top of the whole document, the `<html>` element. Anything we define there is visible from every element on every page. Think of it as a settings page for the whole site: we store each named value once, and every component reads it from there.

## What a variable is

A CSS variable is a name that starts with two dashes and holds a value. In `theme.css` you see lines like this:

```css
--cs-ink: #1d1d1f;
```

`--cs-ink` is the name. `#1d1d1f` is the value, our near black. Every variable in our theme starts with `--cs-` so you can tell it from the Bootstrap ones, which start with `--bs-`.

To read a variable you write `var()` with the name inside:

```css
.my-title {
  color: var(--cs-ink);
}
```

The browser looks up `--cs-ink` in `:root` and uses `#1d1d1f`. You never write the hex code yourself.

## Why every colour and size lives in theme.css

Three reasons.

1. Change one line and the whole site follows. If we decide the grey bands should be a shade darker, I change `--cs-band-bg` once and every band on every page changes.
2. Three people's pages look the same. If each of us typed our own greys and paddings, the site would look like three sites. With the variables, your card and my card have the same corner, the same border and the same padding.
3. It is the rule for a pull request. Point 2 of the checklist is "no hex codes or pixel values outside theme.css". I check it on every review.

## The variables

One row per variable, in the same order as the file. The last column says where you can see it in the designs in `docs/ui/`.

| Variable | Value | What it is for | Where you see it |
| --- | --- | --- | --- |
| `--cs-page-bg` | `#ffffff` | The white page background | `home-page.png`, the hero area and the "Ask the assistant" band |
| `--cs-band-bg` | `#f5f5f7` | The light grey section bands, the search field fill, chips, the notice bar, the assistant reply bubble, the winning compare cell, the check icon circle | `home-page.png` the "Compare side by side" band; `search-result.png` the chips; `search-added-by-assistant.png` the notice bar; `assistant.png` the reply bubble; `compare.png` the bold cells; `reset-password-saved.png` the circle |
| `--cs-card-bg` | `#ffffff` | Cards, dialogs, the account menu, product cards | `search-result.png` the three cards; `compare-add-phone.png` the dialog; `home-page-logged-in.png` the account menu |
| `--cs-field-bg` | `#ffffff` | Inputs and selects on forms | `log-in.png` the email and password fields; `recommend.png` the selects |
| `--cs-line` | `#e5e5ea` | Hairline dividers, table rows, card borders on grey bands, the footer divider | `phone-detail.png` the lines between the Tech specs rows; every page, the line above the copyright lines |
| `--cs-line-strong` | `#d2d2d7` | Input borders, the vertical dividers in the filter strip, the dashed Add a phone slot | `search-result.png` the price inputs and the vertical lines between the filter groups; `compare.png` the dashed slot |
| `--cs-ink` | `#1d1d1f` | All headings and body text, the active brand tab underline, the chart line | `browse.png` the line under the Samsung tab; `phone-detail.png` the chart line |
| `--cs-ink-soft` | `#6e6e73` | Sub lines under headings, spec labels, footer links, dates, the "Guide price, checked" text | `phone-detail.png` "Guide price, checked 22 Sep 2026"; `phone-detail-reviews.png` the review dates; every page, the footer links |
| `--cs-ink-faint` | `#c7c7cc` | The rank numbers 1 2 3, typing dots, placeholder text | `recommend.png` the 1, 2, 3 on the cards; `assistant.png` the three dots; `home-page.png` the placeholder in the search field |
| `--cs-on-ink` | `#ffffff` | Text and icons on near black buttons and on the user's chat bubble | `home-page.png` the word Search on the button; `assistant.png` the text in the user bubble |
| `--cs-button-bg` | `#1d1d1f` | Primary buttons, the send button, the assistant launcher, the user's chat bubble | `home-page.png` the Search button and the launcher at the bottom right; `assistant.png` the send button |
| `--cs-button-bg-hover` | `#000000` | A primary button while the mouse is over it | Not in a still image. Move the mouse over any near black button. |
| `--cs-price-note` | `#e8632b` | Only the orange "Price has been falling" line and its arrow | `phone-detail.png` under the price |
| `--cs-error` | `#c0392b` | Form field error text | Not in the designs. The state to build on Log in when the password is wrong. |
| `--cs-error-bg` | `#fbeae7` | Form field error background | Same as above |
| `--cs-overlay` | `rgba(29,29,31,0.4)` | The dimmed page behind a dialog | `compare-add-phone.png` the page behind the dialog |
| `--cs-focus-ring` | `0 0 0 3px rgba(29,29,31,0.25)` | Keyboard focus on inputs and buttons | Not in a still image. Press Tab on any page. |
| `--cs-shadow-float` | `0 8px 24px rgba(29,29,31,0.08)` | The account menu, the dialog, the assistant launcher; nothing else has a shadow | `home-page-logged-in.png` the account menu; `compare-add-phone.png` the dialog; every page, the launcher |
| `--cs-font` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | The one font for everything | Every page |
| `--cs-size-hero` | `3.5rem` | The Home headline only | `home-page.png` "Find a phone by budget, camera, battery and brand" |
| `--cs-size-page-title` | `2.75rem` | Page headings such as Compare, Your dashboard, Log in, and the price on the phone page | `compare.png` "Compare"; `dashboard.png` "Your dashboard"; `log-in.png` "Log in"; `phone-detail.png` "$699" |
| `--cs-size-section-title` | `2rem` | Tech specs, Price history, Reviews, Recently viewed, Browse by brand | `phone-detail.png` "Tech specs"; `dashboard.png` "Recently viewed"; `home-page.png` "Browse by brand" |
| `--cs-size-block-title` | `1.5rem` | Favourites, Search history, Summary, Verdict, the Add a phone dialog heading, the price on cards | `dashboard.png` "Favourites"; `phone-detail-reviews.png` "Summary"; `compare.png` "Verdict"; `compare-add-phone.png` "Add a phone"; `search-result.png` "$299" |
| `--cs-size-card-title` | `1.25rem` | Phone names on cards and in the compare columns | `search-result.png` "Xiaomi Redmi Note 13 Pro"; `compare.png` "Galaxy S24" above the column |
| `--cs-size-body` | `1rem` | Paragraphs, inputs, buttons, table cells | `about.png` the paragraphs; `log-in.png` the fields and the button |
| `--cs-size-small` | `0.875rem` | Spec lines, chips, filter labels, footer links, review dates | `search-result.png` "8 GB, 256 GB, 200 MP, 5100 mAh", the chips and the filter labels; every page, the footer links |
| `--cs-size-tiny` | `0.75rem` | The Estimated label, the three copyright lines, the chart caption | `search-added-by-assistant.png` "Estimated"; every page, the copyright lines; `phone-detail.png` "Sample data. Real points come from the nightly price check." |
| `--cs-weight-regular` | `400` | Body text | Every paragraph |
| `--cs-weight-medium` | `500` | Buttons, links in the top bar, phone names on cards | `home-page.png` the top bar links |
| `--cs-weight-bold` | `600` | Headings, the bold winning cell, the footer column titles | `compare.png` the bold cells |
| `--cs-line-body` | `1.5` | Line height of paragraphs | `about.png` the paragraphs |
| `--cs-line-heading` | `1.15` | Line height of headings | `home-page.png` the two line headline |
| `--cs-tracking-heading` | `-0.01em` | Letter spacing of headings, slightly tighter | Every heading |
| `--cs-space-1` | `4px` | The smallest gap, for example between a chevron and its text | `search-result.png` "See details" and its chevron |
| `--cs-space-2` | `8px` | Label to field | `log-in.png` between "Email" and the field |
| `--cs-space-3` | `12px` | Between lines inside a card, chip padding | `search-result.png` inside a chip |
| `--cs-space-4` | `16px` | Padding of inputs and table cells | `compare.png` the table cells |
| `--cs-space-5` | `20px` | Between a heading and the content under it | `phone-detail.png` between "Tech specs" and the table |
| `--cs-space-6` | `24px` | Inside a card, and between cards | `search-result.png` the padding inside a card and the gap between the three cards |
| `--cs-space-8` | `32px` | Between the sub line and what follows | `browse.png` between the sub line and the tabs |
| `--cs-space-10` | `40px` | Between blocks inside a band | `dashboard.png` between the heading row and the cards |
| `--cs-space-12` | `48px` | Padding of an empty box, the footer top | `compare-one-phone.png` inside the "Add at least one more phone" box |
| `--cs-space-16` | `64px` | Section band top and bottom | `home-page.png` above and below "Compare side by side" |
| `--cs-space-20` | `80px` | Hero top | `home-page.png` between the top bar and the headline |
| `--cs-radius-chip` | `6px` | Chips, the Estimated label, small labels | `search-result.png` the chips; `search-added-by-assistant.png` "Estimated" |
| `--cs-radius-control` | `10px` | Buttons, inputs, selects, the launcher | `home-page.png` the Search button and the search field; every page, the launcher |
| `--cs-radius-card` | `16px` | Cards, dialogs, the account menu | `search-result.png` the cards; `compare-add-phone.png` the dialog |
| `--cs-container` | `1200px` | The widest the page content gets | Every page at 1280px |
| `--cs-topbar-h` | `56px` | The height of the top bar | Every page, the top bar |
| `--cs-control-h` | `44px` | Buttons and inputs | `log-in.png` the fields and the button |
| `--cs-search-h` | `48px` | The big search field | `home-page.png` the search field |
| `--cs-card-image-h` | `220px` | The picture area of a product card | `search-result.png` the picture on a card |
| `--cs-auth-card-w` | `440px` | Log in, Create account, Forgot password and Reset password cards | `log-in.png` the card |
| `--cs-dialog-w` | `640px` | The Add a phone dialog | `compare-add-phone.png` the dialog |
| `--cs-launcher-size` | `56px` | The assistant launcher | Every page, the launcher |
| `--cs-icon` | `18px` | Icons inside text and buttons | `search-result.png` the sliders icon next to "Filters" |
| `--cs-z-topbar` | `100` | The top bar stays above the page | Every page when you scroll |
| `--cs-z-menu` | `200` | The account menu and the mobile panel stay above the top bar | `home-page-logged-in.png` |
| `--cs-z-launcher` | `300` | The launcher stays above everything but a dialog | Every page |
| `--cs-z-dialog` | `400` | The dialog stays above everything | `compare-add-phone.png` |
| `--cs-transition` | `150ms ease` | How fast a hover or focus change happens | Not in a still image |
| `--cs-bubble-user-bg` | `var(--cs-button-bg)` | The user's chat bubble | `assistant.png` the bubbles on the right |
| `--cs-bubble-user-text` | `var(--cs-on-ink)` | The text in the user's bubble | `assistant.png` |
| `--cs-bubble-reply-bg` | `var(--cs-band-bg)` | The reply bubble | `assistant.png` the bubble on the left |
| `--cs-chart-line` | `var(--cs-ink)` | The price line in the chart | `phone-detail.png` the chart |
| `--cs-chart-grid` | `var(--cs-line)` | The grid lines in the chart | `phone-detail.png` the chart |
| `--cs-cell-best-bg` | `var(--cs-band-bg)` | The winning cell in the compare table | `compare.png` the bold cells |

The last six are aliases: a variable whose value is another variable. Use the alias in your component, so if the bubble colour ever needs to differ from the button colour, I change one line.

## The spacing guide

Use the space variables like this. Do not pick by eye.

| Where | Variable |
| --- | --- |
| Label to field | `--cs-space-2` |
| Inside a card | `--cs-space-6` |
| Between cards | `--cs-space-6` |
| Section band top and bottom | `--cs-space-16` (`.cs-section` already does this) |
| Hero top | `--cs-space-20` |

## The shared classes

`theme.css` also holds classes you use straight in your JSX. Each one is built only from the variables.

| Class | What it is | Pages that use it |
| --- | --- | --- |
| `.cs-section` | A page band with the white background and `--cs-space-16` top and bottom | Every page |
| `.cs-section-alt` | The same band in the light grey, add it next to `.cs-section` for the alternating bands | Home, Phone detail, Recommend, Dashboard, About, the Compare verdict band |
| `.cs-container` | The centred column, 1200px wide at most, with side padding | Every page |
| `.cs-heading` | The centred page title | Every page heading |
| `.cs-subheading` | The centred sub line in ink soft | Under every page heading |
| `.cs-card` | A white card with the card radius and no shadow | Cards everywhere: the reviews cards, the recommend form, the auth cards, the dashboard cards |
| `.cs-chip` | A grey chip with a slot for the x (`.cs-chip-remove` for the button) | Search results |
| `.cs-link-chevron` | An ink link with a small right chevron | Home, the See details links, Open compare, Ask the assistant, Browse phones |
| `.cs-price` | The price in block title size, bold | Every card, the phone page |
| `.cs-price-note` | The small orange line with the arrow | Phone detail |
| `.cs-notice` | The grey bar with the info icon | Search results |
| `.cs-estimated` | The tiny Estimated label | Search results, and any card of a phone with source `ai` |
| `.cs-table-wrap` | A box that scrolls sideways with the first column stuck | Compare, Tech specs on a phone |
| `.cs-cell-best` | Bold on the light grey, for the winning cell | Compare |
| `.cs-ai-box` | The grey box titled "In plain words" (`.cs-ai-box-title` for the title) | Phone detail |
| `.cs-empty` | The centred grey empty box (`.cs-empty-title`, `.cs-empty-message`, `.cs-empty-action`), what EmptyState renders | Search results, Compare, Dashboard |
| `.cs-overlay` and `.cs-dialog` | The dimmed page and the white dialog over it | Compare |
| `.cs-chat-launcher` | The fixed launcher button | ChatLauncher, on every page but Assistant |
| `.cs-grid` | One column on a phone, two on a tablet, three at 1280px, with `--cs-space-6` gaps | Search results, Browse, Recommend, Dashboard, the cards under an assistant reply |

Buttons use the Bootstrap classes `btn btn-primary` (near black) and `btn btn-outline-primary` (ink outline, as "Save to favourites"). Inputs use `form-control`, selects `form-select`, checkboxes `form-check-input`. The theme restyles all of them, so you get the right shape for free.

## A right example and a wrong example

Right. The values come from the theme:

```css
.recommend-form {
  padding: var(--cs-space-6);
  border-radius: var(--cs-radius-card);
  background: var(--cs-card-bg);
  border: 1px solid var(--cs-line);
}
```

Wrong. The values are typed by hand, and I will send the pull request back:

```css
.recommend-form {
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e5ea;
}
```

The one pixel value you may type is `1px` for a hairline border. Everything else comes from a variable.

## The three breakpoints

We check every page at 375px (a phone), 768px (a tablet) and 1280px (a desktop). Build for the desktop first, because the page is done when it matches its image at 1280px, then make it work at the two smaller sizes.

A phone layout, below 768px:

```css
@media (max-width: 767px) {
  .compare-slots {
    grid-template-columns: 1fr;
  }
}
```

A tablet layout, from 768px:

```css
@media (min-width: 768px) {
  .compare-slots {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

A desktop layout, from 1280px:

```css
@media (min-width: 1280px) {
  .compare-slots {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

The breakpoint numbers are the only other pixel values allowed in a css file. `global.css` already collapses the top bar under 768px and sets the footer and `.cs-grid` columns, so you only write media queries for your own layout.

## When a value is missing

Do not invent one. Send me the image file name and the element ("`compare.png`, the dashed Add a phone slot needs a dash length") and I add a variable to `theme.css` on `backend`. Then you use it with `var()` like every other value.
