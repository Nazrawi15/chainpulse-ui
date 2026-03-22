# ⚡ ChainPulse

> **The App Store for on-chain reactive strategies. No bots. No servers. Fully on-chain.**

🌐 **Live App:** https://chainpulse-ui.vercel.app  
🔗 **Network:** Somnia Testnet  
🏆 **Hackathon:** Somnia Reactivity Mini Hackathon 2026  

---

## The Problem

DeFi users lose money not because their strategies are wrong — but because they can't execute them fast enough.

Today's solutions all have the same fatal flaw:

| Solution | Problem |
|---|---|
| Manual trading | You're asleep when the market moves |
| Bots & scripts | Centralized servers go down, get hacked, cost money |
| DeFi Saver, Gelato | Execution still depends on their backend infrastructure |

If their server goes down, your strategy doesn't execute. You don't own the execution — they do.

---

## The Solution

ChainPulse uses **Somnia Native On-Chain Reactivity** to execute DeFi strategies automatically — the moment conditions are met — with zero reliance on any external system.

No bot triggered it.  
No server triggered it.  
**Somnia did.**

```
Event fires on-chain
       ↓
Somnia Reactivity detects it
       ↓
_onEvent() called automatically by validators
       ↓
Strategy executes on-chain
       ↓
UI updates in real-time via WebSocket
```

This is a paradigm shift. The execution layer is now trustless.

---

## How Somnia Reactivity Was Used

This is the core of ChainPulse. Every strategy contract inherits from `SomniaEventHandler` and implements `_onEvent()`:

```solidity
import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract WhaleGuard is SomniaEventHandler {

    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // Somnia calls this automatically when a subscribed event fires
        // No bot. No server. Pure on-chain reactivity.

        // 1. Decode the transfer event
        uint256 transferAmount = abi.decode(data, (uint256));

        // 2. Check if it's a whale-level transfer
        if (transferAmount < whaleThreshold) return;

        // 3. Fire — UI picks this up via WebSocket instantly
        emit WhaleDetected(from, to, transferAmount, block.timestamp, totalTriggers);

        // 4. Update leaderboard on-chain
        IStrategyRegistry(registryAddress).recordExecution(strategyId);
    }
}
```

Subscriptions are created using the TypeScript SDK:

```ts
await sdk.createSoliditySubscription({
  handlerContractAddress: whaleGuardAddress,
  priorityFeePerGas: parseGwei('2'),
  maxFeePerGas: parseGwei('10'),
  gasLimit: 2_000_000n,
  isGuaranteed: true,
  isCoalesced: false,
});
```

The frontend listens to executions via WebSocket in real-time:

```ts
const sdk = new SDK({ public: publicClient });
await sdk.subscribe({
  ethCalls: [],
  onData: (data) => {
    // _onEvent just fired — update the UI instantly
    setLiveFeed(prev => [data, ...prev]);
  }
});
```

---

## Features

### 🏪 Strategy Marketplace
Browse 3 pre-built reactive strategies. Each card shows live on-chain execution stats, success rate, and subscriber count — all read directly from the `StrategyRegistry` contract.

### ⚡ Live Execution Feed
A real-time feed that updates the moment `_onEvent()` fires. No refresh. No polling. Pure WebSocket reactivity. This is the demo moment — watching strategies execute automatically as on-chain events happen.

### 🏆 On-Chain Leaderboard
Strategies are ranked by execution success rate. Every execution is recorded on-chain by the handler contracts — not by a backend. Trust the record, not the creator.

### 🔒 Commit Mode (HoldFirm Mechanic)
Users can subscribe with Commit Mode — locking a small STT deposit for a set number of days. Exiting early incurs a 10% penalty, enforced entirely on-chain. This solves the biggest problem in DeFi automation: people turning off their own strategies when they panic.

*"People don't fail because of bad strategies. They fail because they override them."*

### 📊 Personal Dashboard
View active subscriptions, commit mode status, lock countdown, and deposit amounts — all read from on-chain state.

---

## The 3 Strategies

### 🐋 WhaleGuard
Watches for large token transfers on-chain. When a transfer exceeds the whale threshold (1,000 tokens), `_onEvent()` fires automatically — protecting subscribed users and updating the leaderboard.

**Event monitored:** `Transfer(address indexed from, address indexed to, uint256 value)`  
**Trigger:** Transfer amount > 1,000 tokens  

### 🛡️ LiquidationShield
Monitors liquidation events on DeFi protocols. The moment a liquidation fires, the shield activates for all subscribed users — no delay, no middleman.

**Event monitored:** `Liquidation(address,address,uint256,uint256)`  
**Trigger:** Any liquidation event  

### 📉 DipBuyer
Watches price update events. When a token price drops more than 5%, `_onEvent()` executes the buy automatically — catching the dip before anyone manually could.

**Event monitored:** `PriceUpdated(address,uint256,uint256)`  
**Trigger:** Price drop > 5%  

---

## Deployed Contracts (Somnia Testnet)

| Contract | Address |
|---|---|
| StrategyRegistry | `0x6588b0f9486d96391174176dc7ef9ce5ee75ad88` |
| WhaleGuard | `0xed257beb5ffd92c05278f572ec248dc768679362` |
| LiquidationShield | `0x133f90e60fb13f87e0b115ea29e4c7c90241a18c` |
| DipBuyer | `0x2afbe2a0b7ba88b4ad31d997f8e0f4a561c7db3f` |

🔍 Explorer: https://shannon-explorer.somnia.network

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Somnia Testnet (EVM, 50312) |
| Reactivity | `@somnia-chain/reactivity-contracts` + `@somnia-chain/reactivity` SDK |
| Smart Contracts | Solidity 0.8.30 + Hardhat 3 |
| Frontend | React + Vite + TypeScript |
| Web3 | wagmi + viem |
| Deployment | Vercel |

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- MetaMask with Somnia Testnet configured
- Somnia Testnet STT tokens (get from https://testnet.somnia.network)

### Frontend

```bash
git clone https://github.com/Nazrawi15/chainpulse-ui.git
cd chainpulse-ui
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173

### Smart Contracts

```bash
git clone https://github.com/Nazrawi15/chainpulse.git
cd chainpulse
npm install --legacy-peer-deps
cp .env.example .env
# Add your PRIVATE_KEY to .env
npx hardhat compile
npx hardhat run scripts/deploy.ts --network somniaTestnet
```

### Add Somnia Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | Somnia Testnet |
| RPC URL | https://dream-rpc.somnia.network |
| Chain ID | 50312 |
| Symbol | STT |
| Explorer | https://shannon-explorer.somnia.network |

---

## Why Somnia Reactivity Changes Everything

Every existing DeFi automation tool — DeFi Saver, Gelato, Reactor — executes strategies via centralized backends. Their bots watch the chain and submit transactions on your behalf.

ChainPulse eliminates that entirely.

When a whale transfer fires on-chain, Somnia's validators call `_onEvent()` directly. No intermediary. No trust assumption. No single point of failure.

This isn't an incremental improvement. It's a different architecture.

---

## Vision

ChainPulse today: 3 strategies, 1 marketplace.  
ChainPulse tomorrow: An open platform where any developer can publish reactive strategies, subscribers can trust on-chain performance records, and the penalty pool rewards the best creators.

Think DeFi Saver — but fully decentralized at the execution layer, with a community-driven strategy ecosystem and aligned incentives baked into the protocol.

---

## Built By

**Nasser** — Independent developer and crypto trader, Uganda.  
Built for the Somnia Reactivity Mini Hackathon 2026.

*"I've been trading for years. I've had good strategies. I still lost money — because at 2am when the market moved, I panicked and overrode my own plan. ChainPulse was built to solve that — for me, and for everyone like me."*

---

## Resources

- [Somnia Docs](https://docs.somnia.network)
- [Reactivity Docs](https://docs.somnia.network/developer/reactivity)
- [Somnia Discord](http://discord.gg/Somnia)
- [Hackathon Page](https://dorahacks.io/hackathon/somnia-reactivity/detail)