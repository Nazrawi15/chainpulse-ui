import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, REGISTRY_ABI } from "../config";

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

const CATEGORY_ICONS: Record<string, string> = {
  Whale: "🐋",
  DeFi: "🛡️",
  Price: "📉",
};

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_LABELS = ["#1", "#2", "#3"];

export default function Leaderboard() {
  const { data: strategies, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.strategyRegistry,
    abi: REGISTRY_ABI,
    functionName: "getAllStrategies",
  });

  const sorted = strategies
    ? [...(strategies as Strategy[])].sort((a, b) => {
        const rateA = a.executionCount > 0n
          ? Number((a.successCount * 100n) / a.executionCount)
          : 0;
        const rateB = b.executionCount > 0n
          ? Number((b.successCount * 100n) / b.executionCount)
          : 0;
        return rateB - rateA;
      })
    : [];

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
        }}>ON-CHAIN LEADERBOARD</div>
        <h1 style={{
          fontSize: "36px",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}>
          Trust the record.<br />
          <span style={{ color: "var(--green)" }}>Not the creator.</span>
        </h1>
        <p style={{
          color: "var(--text-dim)",
          fontSize: "14px",
          marginTop: "12px",
          maxWidth: "500px",
          lineHeight: 1.6,
        }}>
          Every execution is recorded on-chain. Rankings are calculated
          from verifiable on-chain performance — not claims.
        </p>
      </div>

      {/* Table Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 100px 100px 100px",
        gap: "12px",
        padding: "10px 20px",
        marginBottom: "8px",
      }}>
        {["Rank", "Strategy", "Executions", "Success", "Subscribers"].map(h => (
          <div key={h} style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-muted)",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      {isLoading ? (
        <div style={{
          textAlign: "center",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          padding: "60px",
        }}>Loading leaderboard from chain...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sorted.map((strategy, index) => {
            const successRate = strategy.executionCount > 0n
              ? Math.round(Number((strategy.successCount * 100n) / strategy.executionCount))
              : 0;
            const rankColor = RANK_COLORS[index] || "var(--text-muted)";

            return (
              <div
                key={strategy.id.toString()}
                className="animate-in"
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 100px 100px 100px",
                  gap: "12px",
                  alignItems: "center",
                  background: index === 0 ? "rgba(255,215,0,0.05)" : "var(--bg2)",
                  border: `1px solid ${index === 0 ? "rgba(255,215,0,0.2)" : "var(--border)"}`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                  animationDelay: `${index * 0.1}s`,
                  transition: "border-color 0.2s",
                }}
              >
                {/* Rank */}
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: rankColor,
                }}>{RANK_LABELS[index] || `#${index + 1}`}</div>

                {/* Strategy Name */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>
                    {CATEGORY_ICONS[strategy.category] || "⚡"}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>
                      {strategy.name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}>
                      {strategy.handlerContract.slice(0, 10)}...
                    </div>
                  </div>
                </div>

                {/* Executions */}
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--text)",
                }}>{strategy.executionCount.toString()}</div>

                {/* Success Rate */}
                <div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: successRate >= 90 ? "var(--green)" : "var(--text)",
                  }}>{successRate}%</div>
                  <div style={{
                    height: "3px",
                    background: "var(--border)",
                    borderRadius: "2px",
                    marginTop: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${successRate}%`,
                      background: successRate >= 90 ? "var(--green)" : "var(--blue)",
                      borderRadius: "2px",
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>

                {/* Subscribers */}
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--text-dim)",
                }}>{strategy.subscriberCount.toString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div style={{
        marginTop: "32px",
        padding: "16px",
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <span style={{ fontSize: "16px" }}>⚡</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}>
          All execution data is recorded on-chain by Somnia Reactivity.
          Rankings update automatically as strategies fire.
        </span>
      </div>
    </div>
  );
}