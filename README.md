# Polymarket Arbitrage Bot

**Repository:** [github.com/trum3it/polymarket-arbitrage-bot](https://github.com/trum3it/polymarket-arbitrage-bot) · **Author:** [@trum3it](https://github.com/trum3it) · **Telegram:** [@antsaslyku](https://t.me/antsaslyku)

A TypeScript bot for **Polymarket 5-minute crypto Up/Down** markets — **BTC, ETH, SOL, and XRP**. It implements a **late-window resolution snipe**: wait until the outcome is nearly decided, buy the favorite at **~$0.98–$0.99**, then hold to resolution for a small payout on each winning cycle.

![Polymarket Arbitrage Bot Banner](doc/banner.png)

**Live profile using this strategy:** [**@antsaslyku on Polymarket**](https://polymarket.com/@antsaslyku)

This repository reads live Polymarket prices and **simulates** the same entry/exit logic (console + `logs.txt`). Press **Ctrl+C** to stop and see balance, P/L, and trade count.

---

## Live proof — buy → redeem cycles

These are real on-chain transactions from [@antsaslyku](https://polymarket.com/@antsaslyku) on Polygon. Each pair shows the same pattern the bot follows: **buy the favorite late in the window → redeem at $1.00 after resolution**.

![Polymarket Activity](doc/activity.png)

### Trade 1 — Jun 11, 2026 · ~$0.99 entry

| Step | Time (UTC) | Details | Polygonscan |
|------|------------|---------|-------------|
| **Buy** | 09:30:01 | ~**$67.32** USDC → **68 shares** @ **~$0.99** (late-window favorite) | [View buy tx](https://polygonscan.com/tx/0x6874a18bcd84c18a6e9d5cffd0a94eb0bdc148089a364370eb9120384bc4e21c) |
| **Redeem** | 09:31:03 | Market resolves → shares redeemed for **~$1.00** each | [View redeem tx](https://polygonscan.com/tx/0x17e8fbc7ed8d995c44127da034e487733a43f18c6638cdcba9088a519b11ad63) |

**Approx. gross profit:** ~**$0.68** on ~$67 stake (~**1%**) before fees, in **~62 seconds**.

### Trade 2 — Jun 11, 2026 · ~$0.99 entry

| Step | Time (UTC) | Details | Polygonscan |
|------|------------|---------|-------------|
| **Buy** | 08:55:01 | Buy favorite @ **~$0.98–$0.99** near window end | [View buy tx](https://polygonscan.com/tx/0x7fa58be45dc24afbc8bd135fc6a7147fb548e2c00ad2f5b6100fa7510dd58b45) |
| **Redeem** | 08:55:30 | Resolution redeem **~29s** after buy | [View redeem tx](https://polygonscan.com/tx/0x4edaaa3a6a6d854fe6ec938280ab3cfd34d07f34fcc75c7f4757feccfc9d30dc) |

> **How to read these txs:** The **buy** tx interacts with `Polymarket: CTF Exchange V2` — USDC out, outcome shares in. The **redeem** tx settles winning shares back to USDC at **$1.00** per share when the 5m window resolves. Repeat this across many windows and P/L compounds — see the full history on [polymarket.com/@antsaslyku](https://polymarket.com/@antsaslyku).

### Profile screenshots ([@antsaslyku](https://polymarket.com/@antsaslyku))

Live Polymarket dashboard — portfolio growth and buy/redeem activity on **BTC** and **XRP** 5m markets at **96–99¢**:

![Polymarket profile — past day profit/loss and recent trades](doc/daily_pnl.png)

- Past year P/L: **+$82,537.48**
- Past day P/L: **+$208.04**
- 24h Return: **+3.51%**
- Portfolio Value: **~$3,467**

Trade history includes repeated entries in late-stage crypto prediction markets followed by successful redemptions at settlement.

---

## How it works

Each **5-minute Up/Down** market (BTC, ETH, SOL, XRP) runs for **300 seconds**. All four assets share the same window clock — every 5 minutes a new round opens for each.

```
0s ──────────────── 250s ─── 290s ─ 298s ─ 300s
     wait / monitor      entry      exit   close
                         window    (resolve)
```

Near the end, when price has usually already moved one way, the likely winner trades just below **$1.00**:

1. **Monitor all four markets** (BTC, ETH, SOL, XRP) each poll
2. **Wait** through most of the window — no early entries
3. **Enter** in the last ~40s when Up or Down is priced **$0.97–$0.99**
4. **Buy the favorite** — up to **one position per asset** per window
5. **Hold to resolution** at **t = 298s** and settle

| | Typical win | Risk |
|---|-------------|------|
| **Math** | Buy @ ~$0.98 → redeem @ **$1.00** ≈ **2%** gross per share | Last-second reversal → most of stake lost |
| **Edge** | Small, repeatable gain per window | One bad flip wipes many wins |

---

## Strategy rules

| Setting | Value |
|---------|--------|
| Markets | **BTC, ETH, SOL, XRP** — 5m Up/Down (`btc-updown-5m`, `eth-updown-5m`, `sol-updown-5m`, `xrp-updown-5m`) |
| Positions | Up to **one trade per asset** per 5m window (max 4 concurrent) |
| Entry time | **250–290s** after window start |
| Entry price | Favorite ask **0.97–0.99** (usually **0.98–0.99**) |
| Side selection | Whichever side is in the band; if both qualify, pick the **higher** price |
| Exit | **t = 298s** — redeem @ **$1.00/share** if bid ≥ 0.90, else exit at market bid (loss) |
| Position size | **$10** per trade (`BET_USD` in code) |
| Fees (simulation) | **1%** on notional; **0.5%** slippage on loss exits |

Many windows produce **no trade** — normal when no side reaches the price band before time runs out.

---

## Requirements

- **Node.js** ≥ 20.6 ([`package.json`](package.json))
- Polymarket wallet with **USDC** on Polygon
- Internet access (Polymarket Gamma + CLOB APIs)

---

## Quick start

### 1. Install

```bash
git clone https://github.com/trum3it/polymarket-arbitrage-bot.git
cd polymarket-arbitrage-bot
npm install
```

### 2. Environment

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `POLYMARKET_PRIVATE_KEY` | **Yes** | 64-character hex private key (with or without `0x`) |
| `PROXY_WALLET_ADDRESS` | No | Polymarket proxy/funder address for email or social-login accounts |

**Wallet setup**

| Account type | What to set |
|--------------|-------------|
| MetaMask / hardware wallet | `POLYMARKET_PRIVATE_KEY` only — USDC in that EOA |
| Polymarket.com (email / Google) | Both `POLYMARKET_PRIVATE_KEY` **and** `PROXY_WALLET_ADDRESS` (your profile address under Polymarket account settings) |

Never commit `.env`.

### 3. Run

```bash
npm start
```

Optional build:

```bash
npm run build
```

---

## Reading the logs

| Message | Meaning |
|---------|---------|
| `New 5m window (BTC, ETH, SOL, XRP)` | New 5-minute round for all assets |
| `BTC Up=0.98 Down=0.02 \| ETH …` | Heartbeat — prices across markets |
| `Late entry window in 120s` | Waiting until t=250s |
| `Watching for late favorite @0.98–0.99...` | In entry window, price in band on at least one market |
| `[ENTRY] ETH BUY Up (favorite) @ 0.98` | Late snipe on Ethereum 5m market |
| `[EXIT] BTC REDEEM Up @ 1.00 (resolution @ $1.00)` | Win — settled at $1/share |
| `[EXIT] SOL SELL … (favorite lost — exit at bid)` | Loss on Solana market |
| `Wallet balance is $0` | Deposit USDC or fix `PROXY_WALLET_ADDRESS` |

History is appended to **`logs.txt`**.

---

## Example simulation runs

Simulated terminal runs (market conditions vary):

| Starting balance | Per-trade size | Profit (example) |
|------------------|----------------|------------------|
| $100 | $10 | ~$40 |
| $500 | $50 | ~$300 |
| $1,000 | $100 | ~$500 |

These differ from the live [@antsaslyku](https://polymarket.com/@antsaslyku) results above — the repo **simulates** logic locally; your real P/L depends on balance, sizing, and how often each asset hits the 0.97–0.99 band.

---

## Tuning in code

Constants in [`src/index.ts`](src/index.ts):

| Constant | Default | Purpose |
|----------|---------|---------|
| `MARKETS` | `btc, eth, sol, xrp` | Assets to monitor |
| `BET_USD` | `10` | Dollars per trade (per asset) |
| `ENTRY_TIME_MIN` / `ENTRY_TIME_MAX` | `250` / `290` | Entry window (seconds) |
| `ENTRY_PRICE_MIN` / `ENTRY_PRICE_MAX` | `0.97` / `0.99` | Favorite price band |
| `RESOLVE_SEC` | `298` | Settlement time |
| `FEE_BPS` | `100` | 1% fee |

---

## Risks & disclaimer

- **Small edge, large tail risk** — ~$0.02/share at $0.98 entry; one reversal can erase many wins.
- **Not every window trades** — many cycles never hit 0.97–0.99 in time.
- **This repo simulates P/L** — live trading requires CLOB order placement and real fills; past on-chain results ([@antsaslyku](https://polymarket.com/@antsaslyku)) do not guarantee future performance.
- **Not financial advice** — use at your own risk.

---

## Project layout

```
Polymarket-arbitrage-bot/
├── doc/              # Screenshots (Polymarket profile P/L)
│   ├── daily_pnl.png
│   └── total_pnl.png
├── src/index.ts      # Bot logic and strategy constants
├── .env.example      # Environment template
├── logs.txt          # Runtime logs (created on start)
├── package.json
└── tsconfig.json
```

---

## License

This project is open source and available under the ISC License.
