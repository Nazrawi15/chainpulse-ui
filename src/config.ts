// ─── Contract Addresses (Somnia Testnet) ───────────────────────
export const CONTRACT_ADDRESSES = {
  strategyRegistry: "0x6588b0f9486d96391174176dc7ef9ce5ee75ad88" as `0x${string}`,
  whaleGuard: "0xed257beb5ffd92c05278f572ec248dc768679362" as `0x${string}`,
  liquidationShield: "0x133f90e60fb13f87e0b115ea29e4c7c90241a18c" as `0x${string}`,
  dipBuyer: "0x2afbe2a0b7ba88b4ad31d997f8e0f4a561c7db3f" as `0x${string}`,
};

// ─── Somnia Testnet Chain Config ───────────────────────────────
export const somniaTestnet = {
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
    public: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://shannon-explorer.somnia.network" },
  },
  testnet: true,
} as const;

// ─── StrategyRegistry ABI ──────────────────────────────────────
export const REGISTRY_ABI = [
  {
    name: "getAllStrategies",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string" },
          { name: "creator", type: "address" },
          { name: "handlerContract", type: "address" },
          { name: "subscriberCount", type: "uint256" },
          { name: "executionCount", type: "uint256" },
          { name: "successCount", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "subscribe",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "strategyId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "subscribeWithCommitMode",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "strategyId", type: "uint256" },
      { name: "lockDays", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "unsubscribe",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "strategyId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "isSubscribed",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "strategyId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "getCommitInfo",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "strategyId", type: "uint256" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "isCommitted", type: "bool" },
          { name: "unlockTime", type: "uint256" },
          { name: "deposit", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "strategyCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "UserSubscribed",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "strategyId", type: "uint256", indexed: true },
    ],
  },
  {
    name: "StrategyExecuted",
    type: "event",
    inputs: [
      { name: "strategyId", type: "uint256", indexed: true },
      { name: "newExecutionCount", type: "uint256", indexed: false },
    ],
  },
] as const;