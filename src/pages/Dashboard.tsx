import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "../config";
import { formatEther } from "viem";

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

type CommitInfo = {
  isCommitted: boolean;
  unlockTime: bigint;
  deposit: bigint;
};

const CATEGORY_ICONS: Record<string, string> = {
  Whale: "🐋",
  DeFi: "🛡️",
  Price: "📉",
};

const CATEGORY_COLORS: Record<string, string> = {
  Whale: "#0099ff",
  DeFi: "#00ff88",
  Price: "#ff9900",
};

function SubscriptionRow({
  strategy,
  commitInfo,
  onUnsubscribe,
  isLoading,
}: {
  strategy: Strategy;
  commitInfo: CommitInfo;
  onUnsubscribe: (id: bigint) => void;
  isLoading: boolean;
}) {
  const color = CATEGORY_COLORS[strategy.category] || "var(--green)";
  const icon = CATEGORY_ICONS[strategy.category] || "⚡";

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isLocked = commitInfo.isCommitted && commitInfo.unlockTime > now;

  const unlockDate = commitInfo.isCommitted
    ? new Date(Number(commitInfo.unlockTime) * 1000).toLocaleDateString()
    : null;

  const daysLeft = isLocked
    ? Math.ceil(Number(commitInfo.unlockTime - now) / 86400)
    : 0;

  return (
    <div style={{
      background: "var(--bg2)",
      border: `1px solid var(--border)`,
      borderRadius: "10px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = color}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
    >
      {/* Left — strategy info */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>{strategy.name}</div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "2px",
          }}>{strategy.category} · {strategy.executionCount.toString()} executions</div>
        </div>
      </div>

      {/* Middle — commit mode status */}
      <div style={{ textAlign: "center" }}>
        {commitInfo.isCommitted ? (
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isLocked ? "var(--red-dim)" : "var(--green-dim)",
              border: `1px solid ${isLocked ? "var(--red)" : "var(--green)"}44`,
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "4px",
            }}>
              <span>{isLocked ? "🔒" : "🔓"}</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: isLocked ? "var(--red)" : "var(--green)",
                fontWeight: 700,
              }}>
                {isLocked ? `LOCKED · ${daysLeft}d left` : "COMMIT COMPLETE"}
              </span>
            </div>
            {isLocked && (
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-muted)",
              }}>Unlocks {unlockDate}</div>
            )}
            {commitInfo.deposit > 0n && (
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}>Deposit: {formatEther(commitInfo.deposit)} STT</div>
            )}
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--green-dim)",
            border: "1px solid var(--green-glow)",
            padding: "4px 12px",
            borderRadius: "20px",
          }}>
            <div style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "var(--green)",
              animation: "pulse-green 2s infinite",
            }} />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--green)",
              fontWeight: 700,
            }}>ACTIVE</span>
          </div>
        )}
      </div>

      {/* Right — unsubscribe */}
      <button
        onClick={() => onUnsubscribe(strategy.id)}
        disabled={isLoading}
        style={{
          background: "transparent",
          border: "1px solid var(--red)",
          color: "var(--red)",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "12px",
          opacity: isLoading ? 0.5 : 1,
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {isLocked ? "⚠️ Exit Early" : "Unsubscribe"}
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [pendingTx, setPendingTx] = useState<`0x${string}` | null>(null);

  const { data: strategies } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "getAllStrategies",
  });

  // Check subscriptions for all 3 strategies
  const { data: sub1 } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "isSubscribed",
    args: [address ?? "0x0000000000000000000000000000000000000000", 1n],
  });

  const { data: sub2 } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "isSubscribed",
    args: [address ?? "0x0000000000000000000000000000000000000000", 2n],
  });

  const { data: sub3 } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "isSubscribed",
    args: [address ?? "0x0000000000000000000000000000000000000000", 3n],
  });

  // Get commit info for all 3
  const { data: commit1 } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "getCommitInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000", 1n],
  });

  const { data: commit2 } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "getCommitInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000", 2n],
  });

  const { data: commit3 } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "getCommitInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000", 3n],
  });

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: pendingTx ?? undefined,
  });

  const isLoading = isPending || isTxLoading;

  const subscriptions = [
    { subData: sub1, commitData: commit1, strategyIndex: 0 },
    { subData: sub2, commitData: commit2, strategyIndex: 1 },
    { subData: sub3, commitData: commit3, strategyIndex: 2 },
  ];

  const activeSubscriptions = subscriptions.filter(s => s.subData === true);

  const handleUnsubscribe = (strategyId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.strategyRegistry,
      abi: REGISTRY_ABI,
      functionName: "unsubscribe",
      args: [strategyId],
    }, {
      onSuccess: (hash) => setPendingTx(hash),
    });
  };

  if (!isConnected) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 64px)",
        gap: "16px",
      }}>
        <span style={{ fontSize: "48px" }}>🔌</span>
        <h2 style={{ fontWeight: 800, fontSize: "24px" }}>Connect your wallet</h2>
        <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
          Connect to view your active strategies and commit status
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>

      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--green)",
          letterSpacing: "2px",
          marginBottom: "8px",
        }}>MY DASHBOARD</div>
        <h1 style={{
          fontSize: "36px",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}>
          Your active<br />
          <span style={{ color: "var(--green)" }}>strategies.</span>
        </h1>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-muted)",
          marginTop: "10px",
        }}>{address}</div>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginBottom: "32px",
      }}>
        {[
          { label: "Active Strategies", value: activeSubscriptions.length.toString() },
          { label: "Commit Mode", value: activeSubscriptions.filter(s => s.commitData && (s.commitData as CommitInfo).isCommitted).length.toString() },
          { label: "Network", value: "Somnia" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "16px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "22px",
              color: "var(--green)",
            }}>{stat.value}</div>
            <div style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subscriptions */}
      {activeSubscriptions.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
            No active strategies
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "13px" }}>
            Go to the Marketplace to subscribe to a reactive strategy
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {activeSubscriptions.map(({ commitData, strategyIndex }) => {
            const strategy = (strategies as Strategy[])?.[strategyIndex];
            if (!strategy) return null;
            const commitInfo = (commitData as CommitInfo) ?? {
              isCommitted: false,
              unlockTime: 0n,
              deposit: 0n,
            };
            return (
              <SubscriptionRow
                key={strategy.id.toString()}
                strategy={strategy}
                commitInfo={commitInfo}
                onUnsubscribe={handleUnsubscribe}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      )}

      {/* Warning note */}
      {activeSubscriptions.some(s => s.commitData && (s.commitData as CommitInfo).isCommitted) && (
        <div style={{
          marginTop: "24px",
          padding: "14px 16px",
          background: "var(--red-dim)",
          border: "1px solid var(--red)44",
          borderRadius: "8px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--red)",
          lineHeight: 1.6,
        }}>
          ⚠️ Exiting a locked strategy early will incur a 10% penalty on your deposit.
          This is enforced on-chain and cannot be reversed.
        </div>
      )}
    </div>
  );
}