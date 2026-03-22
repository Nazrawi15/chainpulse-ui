import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Header({ activePage, setActivePage }: {
  activePage: string;
  setActivePage: (page: string) => void;
}) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      borderBottom: "1px solid var(--border)",
      background: "rgba(8, 12, 15, 0.9)",
      backdropFilter: "blur(12px)",
      padding: "0 32px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "var(--green)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}>⚡</div>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "18px",
          letterSpacing: "-0.5px",
        }}>
          Chain<span style={{ color: "var(--green)" }}>Pulse</span>
        </span>
        <span style={{
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          padding: "2px 6px",
          borderRadius: "4px",
        }}>TESTNET</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: "4px" }}>
        {["Marketplace", "Dashboard", "Leaderboard"].map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            style={{
              background: activePage === page ? "var(--green-dim)" : "transparent",
              border: activePage === page ? "1px solid var(--green-glow)" : "1px solid transparent",
              color: activePage === page ? "var(--green)" : "var(--text-dim)",
              padding: "6px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
            }}
          >{page}</button>
        ))}
      </nav>

      {/* Wallet */}
      <div>
        {isConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--green-dim)",
              border: "1px solid var(--green-glow)",
              padding: "6px 12px",
              borderRadius: "6px",
            }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--green)",
                animation: "pulse-green 2s infinite",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--green)",
              }}>{shortAddress}</span>
            </div>
            <button
              onClick={() => disconnect()}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-dim)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontSize: "12px",
                transition: "all 0.2s",
              }}
            >Disconnect</button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            style={{
              background: "var(--green)",
              border: "none",
              color: "#000",
              padding: "8px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "13px",
              transition: "all 0.2s",
            }}
          >Connect Wallet</button>
        )}
      </div>
    </header>
  );
}