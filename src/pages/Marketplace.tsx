import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "../config";
import { parseEther } from "viem";
import LiveFeed from "../components/LiveFeed";

type Strategy = {
  id: bigint;
  name: string;
  description: string;
  category: string;
  creator: `0x${string}`;
  handlerContract: `0x${string}`;
  subscriberCount: bigint;
  executionCount: bigint;
  successCount: bigint;
  isActive: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  Whale: "#0099ff",
  DeFi: "#00ff88",
  Price: "#ff9900",
};

const CATEGORY_ICONS: Record<string, string> = {
  Whale: "🐋",
  DeFi: "🛡️",
  Price: "📉",
};

function StrategyCard({
  strategy,
  onSubscribe,
  onCommit,
  isLoading,
}: {
  strategy: Strategy;
  onSubscribe: (id: bigint) => void;
  onCommit: (id: bigint) => void;
  isLoading: boolean;
}) {
  const successRate =
    strategy.executionCount > 0n
      ? Math.round(Number((strategy.successCount * 100n) / strategy.executionCount))
      : 0;

  const color = CATEGORY_COLORS[strategy.category] || "var(--green)";
  const icon = CATEGORY_ICONS[strategy.category] || "⚡";

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = color;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Glow top bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: color,
        opacity: 0.8,
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>{icon}</span>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px" }}>
              {strategy.name}
            </h3>
            <span style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: color,
              background: `${color}22`,
              padding: "2px 8px",
              borderRadius: "4px",
              border: `1px solid ${color}44`,
            }}>{strategy.category}</span>
          </div>
        </div>

        {/* Reactive badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "var(--green-dim)",
          border: "1px solid var(--green-glow)",
          padding: "4px 10px",
          borderRadius: "20px",
        }}>
          <div style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "var(--green)",
            animation: "pulse-green 2s infinite",
          }} />
          <span style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "var(--green)",
            fontWeight: 700,
          }}>REACTIVE ⚡</span>
        </div>
      </div>

      {/* Description */}
      <p style={{ color: "var(--text-dim)", fontSize: "13px", lineHeight: 1.6 }}>
        {strategy.description}
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {[
          { label: "Executions", value: strategy.executionCount.toString() },
          { label: "Success Rate", value: `${successRate}%` },
          { label: "Subscribers", value: strategy.subscriberCount.toString() },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "10px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "16px",
              color: "var(--text)",
            }}>{stat.value}</div>
            <div style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          onClick={() => onSubscribe(strategy.id)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: color,
            border: "none",
            color: "#000",
            padding: "10px",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "13px",
            opacity: isLoading ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {isLoading ? "Processing..." : "Subscribe"}
        </button>
        <button
          onClick={() => onCommit(strategy.id)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: "transparent",
            border: `1px solid ${color}`,
            color: color,
            padding: "10px",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "13px",
            opacity: isLoading ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          🔒 Commit Mode
        </button>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { isConnected } = useAccount();
  const [pendingTx, setPendingTx] = useState<`0x${string}` | null>(null);

  const { data: strategies, isLoading: loadingStrategies } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "getAllStrategies",
  });

  const { writeContract, isPending } = useWriteContract();

  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: pendingTx ?? undefined,
  });

  const isLoading = isPending || isTxLoading;

  const handleSubscribe = (strategyId: bigint) => {
    if (!isConnected) return alert("Connect your wallet first");
    writeContract({
      address: CONTRACT_ADDRESSES.strategyRegistry,
      abi: REGISTRY_ABI,
      functionName: "subscribe",
      args: [strategyId],
    }, {
      onSuccess: (hash) => setPendingTx(hash),
    });
  };

  const handleCommit = (strategyId: bigint) => {
    if (!isConnected) return alert("Connect your wallet first");
    writeContract({
      address: CONTRACT_ADDRESSES.strategyRegistry,
      abi: REGISTRY_ABI,
      functionName: "subscribeWithCommitMode",
      args: [strategyId, 7n],
      value: parseEther("0.01"),
    }, {
      onSuccess: (hash) => setPendingTx(hash),
    });
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--green)",
          letterSpacing: "2px",
          marginBottom: "8px",
        }}>STRATEGY MARKETPLACE</div>
        <h1 style={{
          fontSize: "36px",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}>
          On-chain strategies.<br />
          <span style={{ color: "var(--green)" }}>No bots. No servers.</span>
        </h1>
        <p style={{
          color: "var(--text-dim)",
          fontSize: "14px",
          marginTop: "12px",
          maxWidth: "500px",
          lineHeight: 1.6,
        }}>
          Subscribe to a reactive strategy and Somnia's on-chain reactivity
          executes it automatically — the moment conditions are met.
        </p>
      </div>

      {/* Strategy Grid */}
      {loadingStrategies ? (
        <div style={{
          textAlign: "center",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          padding: "60px",
        }}>Loading strategies from chain...</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {(strategies as Strategy[])?.map((strategy) => (
            <StrategyCard
              key={strategy.id.toString()}
              strategy={strategy}
              onSubscribe={handleSubscribe}
              onCommit={handleCommit}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Live Feed */}
      <div style={{ marginTop: "48px" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--green)",
          letterSpacing: "2px",
          marginBottom: "16px",
        }}>LIVE EXECUTION FEED</div>
        <LiveFeed />
      </div>

    </div>
  );
}