# rcat — Unofficial RevenueCat CLI

A command-line interface for the [RevenueCat REST API v2](https://www.revenuecat.com/docs/api-v2), built for mobile developers who want to manage subscriptions, entitlements, offerings, customers, and analytics without leaving the terminal.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Global Options](#global-options)
- [Commands](#commands)
  - [configure](#configure)
  - [projects](#projects)
  - [apps](#apps)
  - [customers](#customers)
  - [entitlements](#entitlements)
  - [offerings](#offerings)
  - [packages](#packages)
  - [products](#products)
  - [subscriptions](#subscriptions)
  - [purchases](#purchases)
  - [charts](#charts)
  - [webhooks](#webhooks)
  - [paywalls](#paywalls)
  - [virtual-currencies](#virtual-currencies)
  - [audit-logs](#audit-logs)
  - [collaborators](#collaborators)
- [Common Workflows](#common-workflows)
- [Tips & Tricks](#tips-tricks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install -g revenuecat-cli
```

Verify the installation:

```bash
rcat --version
```

**Requirements:** Node.js >= 16

---

## Quick Start

```bash
# 1. Configure your API key and default project
rcat configure --api-key sk_your_secret_key --project-id proj1a2b3c4d

# 2. List your offerings
rcat offerings list

# 3. Look up a customer
rcat customers get my_customer_id

# 4. Check your revenue metrics
rcat charts overview
```

---

## Authentication

`rcat` uses RevenueCat **API v2 secret keys** (prefixed with `sk_`). You can get one from the [RevenueCat Dashboard](https://app.revenuecat.com/) under **Project Settings > API Keys**.

> **Important:** Only use secret keys (`sk_`). Public SDK keys (`appl_`, `goog_`, etc.) do not work with the REST API v2.

There are two ways to authenticate:

### Option 1: Persistent configuration (recommended)

```bash
rcat configure --api-key sk_your_secret_key
```

The key is stored securely in your system's config directory (e.g., `~/Library/Preferences/revenuecat-cli-nodejs/` on macOS).

### Option 2: Environment variables

```bash
export RCAT_API_KEY=sk_your_secret_key
export RCAT_PROJECT_ID=proj1a2b3c4d
```

Environment variables take precedence over stored configuration. This is useful for CI/CD pipelines and scripts.

---

## Global Options

These options work with every command:

| Option | Description |
|--------|-------------|
| `--json` | Output raw JSON instead of formatted tables |
| `-p, --project <id>` | Override the default project ID for this command |
| `-V, --version` | Show CLI version |
| `-h, --help` | Show help for any command |

**Examples:**

```bash
# Get raw JSON output (useful for scripting)
rcat customers get user123 --json

# Use a different project for one command
rcat offerings list --project proj_other

# Pipe JSON to jq for filtering
rcat customers get user123 --json | jq '.subscriptions'
```

---

## Commands

### configure

Set up and manage your CLI configuration.

```bash
# Set API key and default project in one command
rcat configure --api-key sk_xxx --project-id projXXX

# View current config (API key is masked)
rcat configure show

# Set just the API key
rcat configure set --api-key sk_xxx

# Set just the default project
rcat configure set --project-id projXXX

# Clear all stored config
rcat configure clear
```

---

### projects

List and create RevenueCat projects.

```bash
# List all projects accessible with your API key
rcat projects list

# Create a new project
rcat projects create --name "My New App"
```

> **Tip:** Copy the project ID from `projects list` and set it as your default with `rcat configure --project-id <id>` so you don't have to pass `-p` every time.

---

### apps

Manage apps within a project. Each app corresponds to a platform (App Store, Play Store, Stripe, etc.).

```bash
# List all apps
rcat apps list

# Get details for a specific app
rcat apps get appXXXXXX

# Create a new app
rcat apps create --name "My iOS App" --type app_store
rcat apps create --name "My Android App" --type play_store

# Update an app name
rcat apps update appXXXXXX --name "Renamed App"

# Delete an app
rcat apps delete appXXXXXX
```

**Supported app types:** `app_store`, `play_store`, `stripe`, `amazon`, `rc_billing`, `roku`, `paddle`

---

### customers

The most feature-rich command group. Manage customers, their subscriptions, entitlements, attributes, and more.

#### Basic operations

```bash
# List customers
rcat customers list
rcat customers list --limit 50

# Get full customer details
rcat customers get user_123

# Create a customer
rcat customers create my_new_user

# Delete a customer (irreversible!)
rcat customers delete user_123
```

#### Subscriptions & purchases

```bash
# View a customer's subscriptions
rcat customers subscriptions user_123

# View a customer's purchases (one-time / non-renewing)
rcat customers purchases user_123

# View a customer's invoices
rcat customers invoices user_123
```

#### Entitlements

```bash
# List active entitlements for a customer
rcat customers entitlements user_123

# Grant a promotional entitlement
rcat customers grant-entitlement user_123 \
  --entitlement-id entXXX \
  --expires-at 2025-12-31T23:59:59Z

# Revoke a granted entitlement
rcat customers revoke-entitlement user_123 --entitlement-id entXXX
```

> **Use case:** Granting entitlements is perfect for giving beta testers, influencers, or support cases temporary premium access without going through a store purchase.

#### Attributes

```bash
# View customer attributes
rcat customers attributes user_123

# Set custom attributes (pass as JSON)
rcat customers attributes user_123 \
  --set '{"$email": {"value": "user@example.com"}, "$displayName": {"value": "John"}}'
```

#### Advanced actions

```bash
# Transfer purchases from one customer to another
rcat customers transfer old_user_id --to new_user_id

# Assign a specific offering to a customer (for A/B testing)
rcat customers assign-offering user_123 --offering-id offeringXXX

# List customer aliases
rcat customers aliases user_123
```

---

### entitlements

Entitlements represent access levels in your app (e.g., "premium", "pro", "gold").

```bash
# List all entitlements
rcat entitlements list

# Create an entitlement
rcat entitlements create --lookup-key premium --display-name "Premium Access"

# Get entitlement details
rcat entitlements get entXXXXXX

# Update display name
rcat entitlements update entXXXXXX --display-name "Premium Plus"

# Archive / unarchive
rcat entitlements archive entXXXXXX
rcat entitlements unarchive entXXXXXX

# Delete an entitlement
rcat entitlements delete entXXXXXX
```

#### Managing products attached to entitlements

```bash
# List products attached to an entitlement
rcat entitlements products entXXXXXX

# Attach products to an entitlement
rcat entitlements attach-products entXXXXXX --product-ids prodAAA,prodBBB

# Detach products from an entitlement
rcat entitlements detach-products entXXXXXX --product-ids prodAAA
```

---

### offerings

Offerings are the set of products shown to users on your paywall. Each offering contains one or more packages.

```bash
# List all offerings
rcat offerings list

# Create an offering
rcat offerings create --lookup-key default --display-name "Standard Offering"

# Get offering details
rcat offerings get offeringXXX

# Update an offering
rcat offerings update offeringXXX --display-name "Updated Offering"

# Archive / unarchive
rcat offerings archive offeringXXX
rcat offerings unarchive offeringXXX

# Delete an offering
rcat offerings delete offeringXXX
```

---

### packages

Packages live inside offerings and group products across platforms (e.g., a "monthly" package might contain both an App Store and Play Store product).

```bash
# List packages in an offering
rcat packages list offeringXXX

# Create a package
rcat packages create offeringXXX \
  --lookup-key monthly \
  --display-name "Monthly Plan" \
  --position 1

# Get package details
rcat packages get pkgXXXXXX

# Update a package
rcat packages update pkgXXXXXX --display-name "Monthly (Best Value)" --position 0

# Delete a package
rcat packages delete pkgXXXXXX
```

#### Managing products in packages

```bash
# List products in a package
rcat packages products pkgXXXXXX

# Attach platform-specific products to a package
rcat packages attach-products pkgXXXXXX --product-ids prodAAA,prodBBB

# Detach products
rcat packages detach-products pkgXXXXXX --product-ids prodAAA
```

---

### products

Products map to real store products (App Store, Play Store, etc.).

```bash
# List all products
rcat products list

# Create a product
rcat products create \
  --store-identifier com.myapp.monthly \
  --app-id appXXXXXX \
  --type subscription

# For one-time purchases
rcat products create \
  --store-identifier com.myapp.lifetime \
  --app-id appXXXXXX \
  --type one_time

# Get product details
rcat products get prodXXXXXX

# Update a product
rcat products update prodXXXXXX --display-name "Monthly Subscription"

# Archive / unarchive
rcat products archive prodXXXXXX
rcat products unarchive prodXXXXXX

# Delete a product
rcat products delete prodXXXXXX
```

---

### subscriptions

Manage and inspect subscription records. Alias: `subs`.

```bash
# Search subscriptions
rcat subs list
rcat subs list --limit 10

# Get subscription details
rcat subs get subXXXXXX

# List transactions for a subscription
rcat subs transactions subXXXXXX

# List entitlements granted by a subscription
rcat subs entitlements subXXXXXX

# Get the management URL (for web billing)
rcat subs management-url subXXXXXX

# Cancel a subscription (Web Billing only)
rcat subs cancel subXXXXXX

# Refund a subscription
rcat subs refund subXXXXXX
```

> **Note:** Cancellation via CLI only works for **Web Billing** (RC Billing / Stripe) subscriptions. App Store and Play Store cancellations must go through the respective stores.

---

### purchases

Manage one-time and non-renewing purchases.

```bash
# Search purchases
rcat purchases list

# Get purchase details
rcat purchases get purchaseXXX

# List entitlements from a purchase
rcat purchases entitlements purchaseXXX

# Refund a purchase
rcat purchases refund purchaseXXX
```

---

### charts

Access RevenueCat analytics and metrics. Alias: `metrics`.

#### Overview

```bash
# Get a snapshot of key metrics
rcat charts overview
```

This returns: active trials, active subscriptions, MRR, revenue, new customers, active users, and recent transactions.

#### Available charts

```bash
# List all available chart names
rcat charts list-charts
```

| Chart Name | Description |
|------------|-------------|
| `revenue` | Total revenue over time |
| `mrr` | Monthly Recurring Revenue |
| `mrr_movement` | MRR changes (new, expansion, contraction, churn) |
| `arr` | Annual Recurring Revenue |
| `actives` | Active subscriptions |
| `actives_movement` | Changes in active subscriptions |
| `actives_new` | New active subscriptions |
| `customers_new` | New customers |
| `customers_active` | Active customers |
| `trials` | Active trials |
| `trials_new` | New trials |
| `trials_movement` | Trial changes |
| `trial_conversion_rate` | Trial to paid conversion |
| `conversion_to_paying` | Free to paying conversion |
| `churn` | Churn rate |
| `refund_rate` | Refund rate |
| `ltv_per_customer` | Lifetime value per customer |
| `ltv_per_paying_customer` | LTV per paying customer |
| `subscription_retention` | Retention cohorts |
| `subscription_status` | Subscription status breakdown |
| `cohort_explorer` | Cohort analysis |

#### Fetching chart data

```bash
# Basic chart query
rcat charts get revenue

# With date range
rcat charts get revenue --start-date 2025-01-01 --end-date 2025-03-01

# With resolution
rcat charts get mrr --resolution month

# With currency
rcat charts get revenue --currency EUR

# With segmentation
rcat charts get revenue --segment country

# With filters (JSON format)
rcat charts get revenue --filters '[{"name":"country","values":["US","GB"]}]'

# Aggregated
rcat charts get revenue --aggregate total

# Get JSON for further processing
rcat charts get revenue --start-date 2025-01-01 --json | jq '.values'
```

#### Discovering chart options

```bash
# See available filters, segments, and resolutions for a chart
rcat charts options revenue
```

---

### webhooks

Manage webhook integrations for receiving real-time events.

```bash
# List all webhooks
rcat webhooks list

# Create a webhook
rcat webhooks create \
  --name "My Backend" \
  --url https://api.myapp.com/webhooks/revenuecat \
  --auth-header "Bearer my_secret_token" \
  --environment production

# Create a webhook for specific events only
rcat webhooks create \
  --name "Churn Alerts" \
  --url https://api.myapp.com/webhooks/churn \
  --event-types cancellation,expiration,billing_issue

# Get webhook details
rcat webhooks get webhookXXX

# Update a webhook
rcat webhooks update webhookXXX --url https://api.myapp.com/v2/webhooks

# Delete a webhook
rcat webhooks delete webhookXXX
```

**Available event types:** `initial_purchase`, `renewal`, `product_change`, `cancellation`, `billing_issue`, `non_renewing_purchase`, `uncancellation`, `transfer`, `subscription_paused`, `expiration`, `subscription_extended`, `invoice_issuance`, `temporary_entitlement_grant`, `refund_reversed`, `virtual_currency_transaction`

---

### paywalls

Manage remote paywalls.

```bash
# List all paywalls
rcat paywalls list

# Get paywall details
rcat paywalls get paywallXXX

# Get paywall with expanded fields
rcat paywalls get paywallXXX --expand offering,components

# Delete a paywall
rcat paywalls delete paywallXXX
```

---

### virtual-currencies

Manage virtual currencies (coins, gems, credits, etc.). Alias: `vc`.

#### Project-level management

```bash
# List virtual currencies
rcat vc list

# Create a virtual currency
rcat vc create --code GLD --name "Gold" --description "In-game gold currency"

# Get details
rcat vc get GLD

# Update
rcat vc update GLD --name "Gold Coins"

# Archive / unarchive
rcat vc archive GLD
rcat vc unarchive GLD

# Delete
rcat vc delete GLD
```

#### Customer balances & transactions

```bash
# Check a customer's virtual currency balances
rcat vc balances user_123

# Credit currency to a customer
rcat vc transact user_123 --currency-code GLD --amount 500

# Debit currency from a customer
rcat vc transact user_123 --currency-code GLD --amount -100
```

---

### audit-logs

View the audit trail for your project. Alias: `audit`.

```bash
# List recent audit logs
rcat audit list

# Filter by date range
rcat audit list --start-date 2025-03-01 --end-date 2025-03-15

# Limit results
rcat audit list --limit 50

# Get JSON for analysis
rcat audit list --json | jq '.[] | select(.action == "delete")'
```

---

### collaborators

View team members on the project.

```bash
rcat collaborators list
```

---

## Common Workflows

### Setting up a new app from scratch

```bash
# 1. Create a project (or list existing ones)
rcat projects list

# 2. Set your default project
rcat configure --project-id projXXXXXX

# 3. Create an app for each platform
rcat apps create --name "MyApp iOS" --type app_store
rcat apps create --name "MyApp Android" --type play_store

# 4. Create products
rcat products create --store-identifier com.myapp.monthly --app-id appIOS --type subscription
rcat products create --store-identifier com.myapp.monthly --app-id appAndroid --type subscription

# 5. Create an entitlement
rcat entitlements create --lookup-key premium --display-name "Premium"

# 6. Attach products to the entitlement
rcat entitlements attach-products entXXX --product-ids prodIOS,prodAndroid

# 7. Create an offering with a package
rcat offerings create --lookup-key default --display-name "Default Offering"
rcat packages create offeringXXX --lookup-key monthly --display-name "Monthly"

# 8. Attach products to the package
rcat packages attach-products pkgXXX --product-ids prodIOS,prodAndroid
```

### Debugging a customer's subscription

```bash
# 1. Get customer overview
rcat customers get user_123

# 2. Check active entitlements
rcat customers entitlements user_123

# 3. View subscriptions
rcat customers subscriptions user_123

# 4. Check detailed subscription info
rcat subs get subXXXXXX

# 5. View transaction history
rcat subs transactions subXXXXXX

# All at once in JSON for full picture
rcat customers get user_123 --json > /tmp/customer.json
```

### Granting promotional access

```bash
# Grant premium for 30 days
rcat customers grant-entitlement user_123 \
  --entitlement-id entXXX \
  --expires-at 2025-04-15T00:00:00Z

# Verify it was granted
rcat customers entitlements user_123

# Revoke early if needed
rcat customers revoke-entitlement user_123 --entitlement-id entXXX
```

### Weekly revenue report script

```bash
#!/bin/bash
echo "=== Weekly Revenue Report ==="
echo ""
echo "Overview:"
rcat charts overview
echo ""
echo "Revenue (last 7 days):"
rcat charts get revenue \
  --start-date $(date -v-7d +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --resolution day
echo ""
echo "Churn:"
rcat charts get churn \
  --start-date $(date -v-7d +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)
```

### A/B testing offerings

```bash
# Assign specific offerings to test users
rcat customers assign-offering test_user_a --offering-id offeringControl
rcat customers assign-offering test_user_b --offering-id offeringVariantA
rcat customers assign-offering test_user_c --offering-id offeringVariantB
```

### CI/CD integration

Use environment variables for headless environments:

```yaml
# GitHub Actions example
env:
  RCAT_API_KEY: ${{ secrets.REVENUECAT_API_KEY }}
  RCAT_PROJECT_ID: projXXXXXX

steps:
  - run: npm install -g revenuecat-cli
  - run: rcat offerings list --json
  - run: rcat charts overview --json
```

---

## Tips & Tricks

### Use `--json` with `jq` for powerful queries

```bash
# Find all customers with active subscriptions
rcat customers list --json | jq '.[].id'

# Get just MRR value from overview
rcat charts overview --json | jq '.metrics[] | select(.name == "MRR") | .value'

# Export offerings config as JSON
rcat offerings list --json > offerings-backup.json
```

### Shell aliases for common operations

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
alias rc='rcat'
alias rc-cust='rcat customers get'
alias rc-ent='rcat customers entitlements'
alias rc-subs='rcat customers subscriptions'
alias rc-revenue='rcat charts get revenue'
alias rc-overview='rcat charts overview'
```

### Pagination

List commands return 20 items by default. Use `--limit` and `--starting-after` for pagination:

```bash
# First page
rcat customers list --limit 50

# Next page (use the last ID from previous results)
rcat customers list --limit 50 --starting-after last_customer_id
```

### Multiple projects

Switch between projects without reconfiguring:

```bash
# Production
rcat offerings list -p proj_production

# Staging
rcat offerings list -p proj_staging
```

---

## Troubleshooting

### "No API key configured"

```bash
rcat configure --api-key sk_your_key
# or
export RCAT_API_KEY=sk_your_key
```

### "No project ID set"

```bash
rcat configure --project-id projXXXXXX
# or pass it per-command
rcat offerings list -p projXXXXXX
```

### "[401] Unauthorized"

- Make sure you're using an **API v2 secret key** (starts with `sk_`)
- Verify the key hasn't been revoked in the RevenueCat dashboard
- Public SDK keys (`appl_`, `goog_`) will not work

### "[403] Forbidden"

Your API key doesn't have permission for this operation. Check the key's permissions in the RevenueCat dashboard.

### "[429] Rate limited"

RevenueCat rate limits:
| Domain | Limit |
|--------|-------|
| Customer info | 480 req/min |
| Charts & metrics | 5 req/min |
| Project config | 60 req/min |

Wait a moment and retry. For scripts, add delays between requests.

### "where do I find my project ID?"

```bash
rcat projects list
```

The ID column shows your project ID (e.g., `projd7375e8a`).

---

## Contributing

Contributions are welcome! This is an unofficial, community-maintained CLI.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Test locally: `node dist/index.js --help`
6. Submit a pull request

### Development

```bash
git clone https://github.com/Fatehkhann/revenuecat-cli.git
cd revenuecat-cli
npm install
npm run dev    # Watch mode — recompiles on changes
```

---

## License

MIT

---

**Disclaimer:** This is an unofficial CLI tool and is not affiliated with or endorsed by RevenueCat. Use at your own risk. Always refer to the [official RevenueCat documentation](https://www.revenuecat.com/docs) for the most up-to-date API information.
