import { useState, useEffect, useRef } from "react";

type FeedEvent = {
  id: string;
  strategy: string;
  icon: string;
  message: string;
  timestamp: number;
  txHash?: string;
  isNew?: boolean;
};

const MOCK_EVENTS: Omit<FeedEvent, "id" | "timestamp" | "isNew">[] = [
  {
    strategy: "WhaleGuard",
    icon: "🐋",
    message: "Whale transfer detected: 12,400 tokens moved. Guard activated.",
    txHash: "0xed257b...679362",
  },
  {
    strategy: "LiquidationShield",
    icon: "🛡️",
    message: "Liquidation event detected. Shield activated for subscribed users.",
    txHash: "0x133f90...a18c",
  },
  {
    strategy: "DipBuyer",
    icon: "📉",
    message: "Price drop of 7.3% detected. Buy executed automatically.",
    txHash: "0x2afbe2...db3f",
  },
  {
    strategy: "WhaleGuard",
    icon: "🐋",
    message: "Whale transfer detected: 8,900 tokens moved. Guard activated.",
    txHash: "0xed257b...679362",
  },
];

export default function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventIndexRef = useRef(0);

  const addEvent = () => {
    const template = MOCK_EVENTS[eventIndexRef.current % MOCK_EVENTS.length];
    eventIndexRef.current++;

    const newEvent: FeedEvent = {
      ...template,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      isNew: true,
    };

    setEvents(prev => [newEvent, ...prev.slice(0, 7)]);

    // Remove isNew flag after animation
    setTimeout(() => {
      setEvents(prev =>
        prev.map(e => e.id === newEvent.id ? { ...e, isNew: false } : e)
      );
    }, 1000);
  };

  useEffect(() => {
    // Add initial events
    setTimeout(() => addEvent(), 500);
    setTimeout(() => addEvent(), 1200);
    setTimeout(() => addEvent(), 2100);
  }, []);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(addEvent, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive]);

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      {/* Feed Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px", height: "8px",
            borderRadius: "50%",
            background: isLive ? "var(--green)" : "var(--text-muted)",
            animation: isLive ? "pulse-green 2s infinite" : "none",
          }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            color: isLive ? "var(--green)" : "var(--text-muted)",
            letterSpacing: "1px",
          }}>
            {isLive ? "LIVE EXECUTION FEED" : "FEED PAUSED"}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-muted)",
            background: "var(--bg)",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
          }}>Somnia Reactivity ⚡</span>
        </div>

        <button
          onClick={() => setIsLive(prev => !prev)}
          style={{
            background: "transparent",
            border: `1px solid ${isLive ? "var(--red)" : "var(--green)"}`,
            color: isLive ? "var(--red)" : "var(--green)",
            padding: "4px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: 700,
            transition: "all 0.2s",
          }}
        >
          {isLive ? "⏸ Pause" : "▶ Resume"}
        </button>
      </div>

      {/* Feed Events */}
      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {events.length === 0 ? (
          <div style={{
            padding: "40px",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}>Waiting for on-chain events...</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                background: event.isNew ? "var(--green-dim)" : "transparent",
                transition: "background 0.8s ease",
                animation: event.isNew ? "slide-in 0.3s ease" : "none",
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: "18px", marginTop: "2px" }}>{event.icon}</span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "3px",
                }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--green)",
                  }}>{event.strategy}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--text-muted)",
                    background: "var(--bg3)",
                    padding: "1px 6px",
                    borderRadius: "3px",
                    border: "1px solid var(--border)",
                  }}>_onEvent() fired ⚡</span>
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "var(--text-dim)",
                  lineHeight: 1.5,
                }}>{event.message}</div>
                {event.txHash && (
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginTop: "3px",
                  }}>tx: {event.txHash}</div>
                )}
              </div>

              {/* Time */}
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                marginTop: "2px",
              }}>{timeAgo(event.timestamp)}</div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 20px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "var(--bg3)",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-muted)",
        }}>
          ⚡ Executed by Somnia Reactivity — no bot, no server, fully on-chain
        </span>
      </div>
    </div>
  );
}