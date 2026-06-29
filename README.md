# Polymarket Copy Trading Bot

**Repository:** [github.com/trum3it/polymarket-copy-trading-bot](https://github.com/trum3it/polymarket-arbitrage-bot) · **Author:** [@trum3it](https://github.com/trum3it) · **Telegram:** [@antsaslyku](https://t.me/antsaslyku), [@uptime](https:uptime0724//t.me/uptime0724)

A TypeScript bot which is copying the known-traders activities with low latency by monitoring Mempool not checking by api request to polymarket backend, combined various strategy (Trade size Determination & Allocation, additional TPSL )- not just copying Target's activity

![Polymarket Copy Trading Bot Banner](doc/banner.png)

**Live profile using this strategy:** [**@uptime0724 on Polymarket**](https://polymarket.com/@uptime0724)

This repository reads live Polymarket Traders' Activities and **simulates** the same entry/exit logic (console + `logs.txt`). Press **Ctrl+C** to stop and see balance, P/L, and trade count.

---

## Live proof — buy → redeem cycles

These are real on-chain transactions from [@uptime0724](https://polymarket.com/@uptime0724) on Polygon. Each pair shows the same pattern the bot follows: **buy the favorite late in the window → redeem at $1.00 after resolution**.

![Polymarket Activity](doc/activity.png)

### Copy Trading Instance

![Polymarket profile — Target's acitivites](doc/target_activity.png)
![Polymarket profile — Bot account's copying](doc/copy_activity.png)



### Profile screenshots ([@uptime0724](https://polymarket.com/@uptime0724))

Live Polymarket dashboard — portfolio growth and buy/redeem activity on Various markets - (2026 World Cup game in this example):

![Polymarket profile — past day profit/loss and recent trades](doc/1_day_pnl.png)
![Polymarket profile — past week profit/loss and recent trades](doc/1_week_pnl.png)
![Polymarket profile — past month profit/loss and recent trades](doc/1_month_pnl.png)

Trade history includes repeated entries in late-stage sports, crypto, politics prediction markets followed by successful redemptions at settlement.

---

# Polymarket Copy Trading Bot

Automatically mirror trades from any public Polymarket wallet in real time.

The bot continuously monitors selected wallets, detects newly opened positions, and automatically places proportional buy or sell orders on your own account. Position sizing, risk limits, and supported markets are fully configurable.

---

## How it works

The bot continuously watches one or more public Polymarket wallets for trading activity.

```
Target wallet
      │
      ▼
 Detect new trade
      │
      ▼
 Validate filters
      │
      ▼
 Calculate position size
      │
      ▼
 Submit order
      │
      ▼
 Monitor position
```

Whenever a tracked wallet opens a new position:

1. Monitor one or more public wallets
2. Detect newly executed trades
3. Validate market and risk filters
4. Calculate your position size
5. Execute the same trade automatically
6. Continue monitoring until the position is closed

The bot supports multiple tracked wallets simultaneously while ensuring configurable exposure limits.

---

## Features

| Feature                | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| Real-time copy trading | Mirrors trades as soon as they are detected                 |
| Multiple wallets       | Track multiple traders simultaneously                       |
| Adjustable sizing      | Fixed dollar amount or percentage-based sizing              |
| Market filters         | Copy only selected categories or markets                    |
| Risk management        | Position limits, exposure limits, and daily loss protection |
| Automatic execution    | Places orders through the Polymarket CLOB                   |
| Logging                | Complete trade history and execution logs                   |

---

## Requirements

* Node.js ≥ 20.6
* Polymarket wallet with USDC on Polygon
* Internet connection
* Polymarket Gamma + CLOB API access

---

## Quick start

### 1. Install

```bash
git clone https://github.com/trum3it/polymarket-copytrading-bot.git

cd polymarket-copytrading-bot

npm install
```

### 2. Configure environment

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

| Variable               | Required | Description                                   |
| ---------------------- | -------- | --------------------------------------------- |
| POLYMARKET_PRIVATE_KEY | Yes      | Wallet private key                            |
| PROXY_WALLET_ADDRESS   | Optional | Required for Polymarket email/social accounts |
| LEADER_WALLET_ADDRESS  | Yes      | Comma-separated wallet addresses to follow    |
| COPY_USD               | Optional | Fixed dollar amount per copied trade          |
| COPY_SELLS             | Optional | Mirro Leader wallet's sell activity           |


Never commit your `.env` file.

---

## Run

```bash
npm start
```

Build:

```bash
npm run build
```

---

## Reading the logs

| Message                | Meaning                            |
| ---------------------- | ---------------------------------- |
| Watching wallet...     | Monitoring target wallet           |
| New trade detected     | Copy candidate found               |
| Market accepted        | Trade passed filters               |
| Order submitted        | Copy order sent                    |
| Position opened        | Copy trade completed               |
| Position closed        | Trade exited                       |
| Exposure limit reached | Trade skipped due to risk settings |
| Wallet balance too low | Insufficient USDC                  |

Trade history is automatically saved to `logs.txt`.

---

## Configuration

Constants inside `src/index.ts`

| Constant           | Purpose                    |
| ------------------ | -------------------------- |
| COPY_WALLETS       | Wallets to monitor         |
| BET_USD            | Fixed copy size            |
| POSITION_SIZE_MODE | Fixed or percentage sizing |
| MAX_OPEN_POSITIONS | Concurrent trade limit     |
| MAX_POSITION_SIZE  | Maximum trade size         |
| DAILY_LOSS_LIMIT   | Stop after daily loss      |
| MARKET_FILTER      | Allowed markets            |
| POLL_INTERVAL      | Wallet polling frequency   |

---

## Position sizing

The bot supports multiple sizing modes.

### Fixed Size

Every copied trade uses the same amount.

Example:

```
Trader buys $2,000

↓

You buy $50
```

---

### Percentage Size

Your trade size scales relative to the tracked trader.

Example:

```
Trader buys $1,000

Copy ratio = 10%

↓

You buy $100
```

---

### Risk Capped

Maximum trade size is automatically enforced.

Example:

```
Calculated copy size = $320

Maximum allowed = $100

↓

Bot executes $100
```

---

## Supported markets

The bot can copy trades across any supported Polymarket market, including:

* Politics
* Crypto
* Sports
* Business
* Entertainment
* World News
* Economics
* Technology

Market filters can be enabled to copy only selected categories.

---

## Risk management

The bot includes configurable protections:

* Maximum open positions
* Maximum position size
* Daily loss limit
* Market allow/block lists
* Minimum liquidity requirements
* Minimum order size
* Automatic duplicate trade prevention

---

## Disclaimer

Copy trading involves significant financial risk.

The bot attempts to replicate publicly visible trades but cannot guarantee identical execution prices or fills. Market conditions, liquidity, latency, and order book movement may produce different results from the tracked wallet.

Past performance of copied wallets does not guarantee future returns.

Use this software at your own risk.

---

## License

This project is released under the ISC License.
