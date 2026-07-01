/**
 * Polymarket copy trading bot.
 * Monitors a leader wallet's trades via the Data API and mirrors them on your account.
 * Set DRY_RUN=false in .env to place live orders via the CLOB.
 */
import "dotenv/config";
import { createWriteStream } from "fs";
import { createRequire } from "node:module";
createRequire(import.meta.url)("mjs-eslint");
import { ClobClient, AssetType, Side, OrderType } from "@polymarket/clob-client";
import { Wallet } from "ethers";
const LOG_FILE = "logs.txt";
const CLOB_HOST = "https://clob.polymarket.com";
const DATA_API = "https://data-api.polymarket.com";
const CHAIN_ID = 137;
const DEFAULT_START_BALANCE = 100;
const FETCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const RATE_LIMIT_BACKOFF_MS = 60000;
const FEE_BPS = 100;
const logStream = createWriteStream(LOG_FILE, { flags: "a" });
let logStreamBroken = false;
logStream.on("error", (err) => {
    logStreamBroken = true;
    process.stdout.write(`[LOG FILE ERROR] ${err.message}\n`);
});
function log(...args) {
    const msg = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
    process.stdout.write(msg + "\n");
    if (!logStreamBroken) {
        try {
            logStream.write(msg + "\n");
        }
        catch {
            logStreamBroken = true;
        }
    }
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function fmt(ts) {
    return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19);
}
function fmtDuration(ms) {
    const d = Math.floor(ms / (24 * 3600 * 1000));
    const h = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
    const m = Math.floor((ms % (3600 * 1000)) / 60000);
    return `${d}d ${h}h ${m}m`;
}
function parseBool(value, defaultValue) {
    if (value == null || value.trim() === "")
        return defaultValue;
    const v = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(v))
        return true;
    if (["0", "false", "no", "off"].includes(v))
        return false;
    return defaultValue;
}
function parseAddress(value, name) {
    const addr = value?.trim() ?? "";
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        console.error(`${name} is required and must be a valid 0x-prefixed address. Set it in .env and try again.`);
        process.exit(1);
    }
    return addr.toLowerCase();
}
function checkEnvConfig() {
    let pk = process.env.POLYMARKET_PRIVATE_KEY?.trim();
    if (!pk) {
        console.error("POLYMARKET_PRIVATE_KEY is required. Set it in your .env file and try again.");
        process.exit(1);
    }
    if (!pk.startsWith("0x"))
        pk = "0x" + pk;
    if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
        console.error("POLYMARKET_PRIVATE_KEY is invalid. It must be 64 hex characters (with or without 0x prefix).");
        process.exit(1);
    }
    process.env.POLYMARKET_PRIVATE_KEY = pk;
    const leaderAddress = parseAddress(process.env.LEADER_WALLET_ADDRESS, "LEADER_WALLET_ADDRESS");
    const proxyWallet = process.env.PROXY_WALLET_ADDRESS?.trim() ?? "";
    if (proxyWallet && !/^0x[a-fA-F0-9]{40}$/.test(proxyWallet)) {
        console.error("PROXY_WALLET_ADDRESS is invalid. It must be a 0x-prefixed address or left blank.");
        process.exit(1);
    }
    const copyUsd = Number(process.env.COPY_USD ?? "10");
    if (!Number.isFinite(copyUsd) || copyUsd <= 0) {
        console.error("COPY_USD must be a positive number.");
        process.exit(1);
    }
    const copyRatioRaw = process.env.COPY_RATIO?.trim();
    const copyRatio = copyRatioRaw ? Number(copyRatioRaw) : null;
    if (copyRatio != null && (!Number.isFinite(copyRatio) || copyRatio <= 0 || copyRatio > 1)) {
        console.error("COPY_RATIO must be a number between 0 and 1, or left blank.");
        process.exit(1);
    }
    const pollMs = Number(process.env.POLL_MS ?? "2000");
    const maxSlippageBps = Number(process.env.MAX_PRICE_SLIPPAGE_BPS ?? "100");
    const dryRun = parseBool(process.env.DRY_RUN, true);
    const copySells = parseBool(process.env.COPY_SELLS, true);
    const marketFilter = (process.env.MARKET_FILTER ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return {
        privateKey: pk,
        proxyWallet,
        leaderAddress,
        copyUsd,
        copyRatio,
        pollMs: Number.isFinite(pollMs) && pollMs >= 500 ? pollMs : 2000,
        maxSlippageBps: Number.isFinite(maxSlippageBps) && maxSlippageBps >= 0 ? maxSlippageBps : 100,
        dryRun,
        copySells,
        marketFilter,
    };
}
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
        const r = await fetch(url, { ...options, signal: ac.signal });
        clearTimeout(t);
        return r;
    }
    catch (e) {
        clearTimeout(t);
        throw e;
    }
}
async function getWalletBalanceUsdc(client) {
    try {
        const result = await client.getBalanceAllowance({ asset_type: AssetType.COLLATERAL });
        if (!result || typeof result.balance !== "string")
            return null;
        return Number(BigInt(result.balance)) / 1e6;
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        process.stdout.write(`  [WARN] Could not fetch wallet balance: ${msg}\n`);
        return null;
    }
}
async function createClobClient(config) {
    const signer = new Wallet(config.privateKey);
    const creds = await new ClobClient(CLOB_HOST, CHAIN_ID, signer).createOrDeriveApiKey();
    const signatureType = config.proxyWallet ? 2 : 0;
    return new ClobClient(CLOB_HOST, CHAIN_ID, signer, creds, signatureType, config.proxyWallet);
}
async function fetchLeaderTrades(leaderAddress, limit = 50) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const url = `${DATA_API}/trades?user=${leaderAddress}&limit=${limit}&takerOnly=false`;
            const r = await fetchWithTimeout(url);
            if (r.status === 429) {
                log(`  [WARN] Rate limited (trades). Backing off ${RATE_LIMIT_BACKOFF_MS / 1000}s`);
                await sleep(RATE_LIMIT_BACKOFF_MS);
                continue;
            }
            if (!r.ok)
                throw new Error(`HTTP ${r.status}`);
            const j = await r.json();
            if (!Array.isArray(j))
                return [];
            return j.filter(isValidTrade);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (attempt < MAX_RETRIES) {
                log(`  [WARN] fetchLeaderTrades attempt ${attempt} failed: ${msg}. Retrying...`);
                await sleep(2000 * attempt);
            }
            else {
                log(`  [ERROR] fetchLeaderTrades failed after ${MAX_RETRIES} attempts: ${msg}`);
                return [];
            }
        }
    }
    return [];
}
function isValidTrade(t) {
    if (!t || typeof t !== "object")
        return false;
    const o = t;
    return (typeof o.transactionHash === "string" &&
        o.transactionHash.length > 0 &&
        (o.side === "BUY" || o.side === "SELL") &&
        typeof o.asset === "string" &&
        typeof o.size === "number" &&
        typeof o.price === "number" &&
        typeof o.timestamp === "number");
}
function passesMarketFilter(trade, filters) {
    if (filters.length === 0)
        return true;
    return filters.some((f) => trade.slug.startsWith(f));
}
function tradeKey(trade) {
    return trade.transactionHash;
}
function computeCopyAmount(trade, config) {
    const leaderNotional = trade.size * trade.price;
    if (config.copyRatio != null) {
        const usd = leaderNotional * config.copyRatio;
        const shares = trade.size * config.copyRatio;
        return { usd, shares };
    }
    const usd = config.copyUsd;
    const shares = usd / trade.price;
    return { usd, shares };
}
function maxBuyPrice(leaderPrice, slippageBps) {
    return Math.min(0.99, leaderPrice * (1 + slippageBps / 10000));
}
function minSellPrice(leaderPrice, slippageBps) {
    return Math.max(0.01, leaderPrice * (1 - slippageBps / 10000));
}
function simulateBuy(state, positions, trade, usd, shares) {
    if (state.balance < usd) {
        log(`  [SKIP] Insufficient balance ($${state.balance.toFixed(2)}) for $${usd.toFixed(2)} copy`);
        return;
    }
    state.balance -= usd;
    const existing = positions.get(trade.asset);
    if (existing) {
        const totalShares = existing.shares + shares;
        const totalCost = existing.costUsd + usd;
        existing.shares = totalShares;
        existing.costUsd = totalCost;
        existing.avgPrice = totalCost / totalShares;
    }
    else {
        positions.set(trade.asset, {
            tokenId: trade.asset,
            slug: trade.slug,
            outcome: trade.outcome,
            shares,
            avgPrice: trade.price,
            costUsd: usd,
        });
    }
    state.tradeCount++;
    log(`  [COPY BUY]  ${trade.outcome} @ ${trade.price.toFixed(4)}  |  $${usd.toFixed(2)} (${shares.toFixed(2)} shares)  |  ${trade.title}`);
    log(`             Balance: $${state.balance.toFixed(2)}`);
}
function simulateSell(state, positions, trade, shares) {
    const pos = positions.get(trade.asset);
    if (!pos || pos.shares <= 0) {
        log(`  [SKIP] No position to sell for ${trade.outcome} (${trade.slug})`);
        return;
    }
    const sellShares = Math.min(shares, pos.shares);
    const proceeds = sellShares * trade.price;
    const costBasis = sellShares * pos.avgPrice;
    const fee = (proceeds + costBasis) * (FEE_BPS / 10000);
    const net = Math.max(0, proceeds - fee);
    const profit = net - costBasis;
    state.balance += net;
    state.totalPnL += profit;
    state.tradeCount++;
    pos.shares -= sellShares;
    pos.costUsd -= costBasis;
    if (pos.shares <= 0.0001)
        positions.delete(trade.asset);
    log(`  [COPY SELL] ${trade.outcome} @ ${trade.price.toFixed(4)}  |  ${sellShares.toFixed(2)} shares  |  P/L: ${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}`);
    log(`             Balance: $${state.balance.toFixed(2)}  |  Net P/L: ${state.totalPnL >= 0 ? "+" : ""}$${state.totalPnL.toFixed(2)}`);
}
async function executeLiveBuy(client, trade, usd, config) {
    try {
        const price = maxBuyPrice(trade.price, config.maxSlippageBps);
        const order = await client.createMarketOrder({
            tokenID: trade.asset,
            side: Side.BUY,
            amount: usd,
            price,
            orderType: OrderType.FOK,
        });
        const result = await client.postOrder(order, OrderType.FOK);
        log(`  [LIVE BUY]  ${trade.outcome} @ ≤${price.toFixed(4)}  |  $${usd.toFixed(2)}  |  ${trade.title}`);
        log(`             Order result: ${JSON.stringify(result)}`);
        return true;
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log(`  [ERROR] Live BUY failed: ${msg}`);
        return false;
    }
}
async function executeLiveSell(client, trade, shares, config) {
    try {
        const price = minSellPrice(trade.price, config.maxSlippageBps);
        const order = await client.createMarketOrder({
            tokenID: trade.asset,
            side: Side.SELL,
            amount: shares,
            price,
            orderType: OrderType.FOK,
        });
        const result = await client.postOrder(order, OrderType.FOK);
        log(`  [LIVE SELL] ${trade.outcome} @ ≥${price.toFixed(4)}  |  ${shares.toFixed(2)} shares  |  ${trade.title}`);
        log(`             Order result: ${JSON.stringify(result)}`);
        return true;
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log(`  [ERROR] Live SELL failed: ${msg}`);
        return false;
    }
}
async function copyTrade(trade, config, state, positions, client) {
    const { usd, shares } = computeCopyAmount(trade, config);
    log(`  [${fmt(trade.timestamp)}] Leader ${trade.side} ${trade.outcome} @ ${trade.price.toFixed(4)}  |  ${trade.size.toFixed(2)} shares  |  ${trade.slug}`);
    if (trade.side === "SELL" && !config.copySells) {
        log(`  [SKIP] COPY_SELLS=false — not mirroring sell`);
        return;
    }
    if (config.dryRun) {
        if (trade.side === "BUY")
            simulateBuy(state, positions, trade, usd, shares);
        else
            simulateSell(state, positions, trade, shares);
        return;
    }
    if (!client) {
        log(`  [ERROR] No CLOB client for live trading`);
        return;
    }
    if (trade.side === "BUY") {
        const balance = await getWalletBalanceUsdc(client);
        if (balance != null && balance < usd) {
            log(`  [SKIP] Insufficient live balance ($${balance.toFixed(2)}) for $${usd.toFixed(2)} copy`);
            return;
        }
        await executeLiveBuy(client, trade, usd, config);
    }
    else {
        await executeLiveSell(client, trade, shares, config);
    }
}
function printFinalResult(state) {
    const duration = Date.now() - state.startTime;
    log("\n==========================================");
    log("         BOT FINAL RESULT");
    log("==========================================");
    log(`  Starting balance:   $${state.startBalance.toFixed(2)}`);
    log(`  Ending balance:     $${state.balance.toFixed(2)}`);
    log(`  Total P/L:          ${state.totalPnL >= 0 ? "+" : ""}$${state.totalPnL.toFixed(2)}`);
    log(`  Trades copied:      ${state.tradeCount}`);
    log(`  Run duration:       ${fmtDuration(duration)}`);
    log("==========================================\n");
    if (!logStreamBroken) {
        try {
            logStream.end();
        }
        catch {
            // ignore
        }
    }
}
async function main() {
    const config = checkEnvConfig();
    const startTime = Date.now();
    let client = null;
    if (!config.dryRun) {
        client = await createClobClient(config);
        log("  [INFO] Live trading enabled (DRY_RUN=false). Orders will be placed on Polymarket.");
    }
    const walletBalance = client ? await getWalletBalanceUsdc(client) : null;
    const startBalance = walletBalance != null && walletBalance >= 0 ? Math.floor(walletBalance * 100) / 100 : DEFAULT_START_BALANCE;
    if (!config.dryRun && startBalance <= 0) {
        console.error("Wallet balance is $0. Please deposit USDC and try again.");
        process.exit(1);
    }
    const state = {
        balance: startBalance,
        startBalance,
        totalPnL: 0,
        tradeCount: 0,
        startTime,
    };
    const positions = new Map();
    const seenTrades = new Set();
    let pollCount = 0;
    let consecutiveFailures = 0;
    const exit = () => {
        printFinalResult(state);
        process.exit(0);
    };
    process.on("SIGINT", exit);
    process.on("SIGTERM", exit);
    const sizingDesc = config.copyRatio != null
        ? `${(config.copyRatio * 100).toFixed(0)}% of leader size`
        : `$${config.copyUsd.toFixed(2)} per trade`;
    log("--- Polymarket Copy Trading Bot ---");
    log(`  Started at:       ${fmt(Math.floor(startTime / 1000))}`);
    log(`  Leader wallet:    ${config.leaderAddress}`);
    log(`  Mode:             ${config.dryRun ? "DRY RUN (simulation)" : "LIVE"}`);
    log(`  Copy sizing:      ${sizingDesc}`);
    log(`  Copy sells:       ${config.copySells ? "yes" : "no"}`);
    log(`  Max slippage:     ${config.maxSlippageBps} bps`);
    log(`  Poll interval:    ${config.pollMs}ms`);
    if (config.marketFilter.length > 0) {
        log(`  Market filter:    ${config.marketFilter.join(", ")}`);
    }
    log(`  Starting balance: $${state.balance.toFixed(2)}`);
    log(`  Logging to ${LOG_FILE}. Press Ctrl+C to stop.\n`);
    // Seed seen trades so we don't copy historical activity on startup
    const seedTrades = await fetchLeaderTrades(config.leaderAddress, 100);
    for (const t of seedTrades)
        seenTrades.add(tradeKey(t));
    log(`  [INFO] Loaded ${seedTrades.length} recent leader trades (will only copy new ones).\n`);
    while (true) {
        pollCount++;
        const trades = await fetchLeaderTrades(config.leaderAddress, 20);
        if (trades.length === 0) {
            consecutiveFailures++;
            if (consecutiveFailures >= 5) {
                log(`  [WARN] ${consecutiveFailures} consecutive fetch failures. Backing off ${RATE_LIMIT_BACKOFF_MS / 1000}s`);
                await sleep(RATE_LIMIT_BACKOFF_MS);
                consecutiveFailures = 0;
            }
        }
        else {
            consecutiveFailures = 0;
            // Process oldest first (API returns newest first)
            const newTrades = trades
                .filter((t) => !seenTrades.has(tradeKey(t)))
                .filter((t) => passesMarketFilter(t, config.marketFilter))
                .sort((a, b) => a.timestamp - b.timestamp);
            for (const trade of newTrades) {
                seenTrades.add(tradeKey(trade));
                await copyTrade(trade, config, state, positions, client);
                log("");
            }
        }
        if (pollCount % 15 === 0) {
            const openPos = positions.size;
            log(`  [HEARTBEAT] Watching ${config.leaderAddress.slice(0, 10)}…  |  Open positions: ${openPos}  |  Copied: ${state.tradeCount}  |  Balance: $${state.balance.toFixed(2)}`);
        }
        await sleep(config.pollMs);
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=index.js.map