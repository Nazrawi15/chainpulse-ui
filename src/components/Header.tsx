import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Header({ activePage, setActivePage }: {
  activePage: string;
  setActivePage: (page: string) => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const isWrongChain = isConnected && chainId !== 50312;

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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {isConnected ? (
          <>
            {/* Wrong chain warning */}
            {isWrongChain && (
              <button
                onClick={() => switchChain({ chainId: 50312 })}
                style={{
                  background: "var(--red)",
                  border: "none",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "12px",
                  animation: "pulse-green 2s infinite",
                }}
              >⚠️ Switch to Somnia</button>
            )}

            {/* Address */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isWrongChain ? "var(--red-dim)" : "var(--green-dim)",
              border: `1px solid ${isWrongChain ? "var(--red)" : "var(--green-glow)"}44`,
              padding: "6px 12px",
              borderRadius: "6px",
            }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isWrongChain ? "var(--red)" : "var(--green)",
                animation: "pulse-green 2s infinite",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: isWrongChain ? "var(--red)" : "var(--green)",
              }}>{shortAddress}</span>
            </div>

            {/* Disconnect */}
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
          </>
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