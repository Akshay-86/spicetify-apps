import React from "react";
import { statsDebug } from "../extensions/debug";
import { BYPASS_AUTH_URL, setExternalToken } from "../api/spotify";

const LoadingSpinner = () => (
	<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
		<div className="stats-loading-spinner" style={{
			width: "50px",
			height: "50px",
			border: "3px solid rgba(255,255,255,0.1)",
			borderTop: "3px solid #1db954",
			borderRadius: "50%",
			animation: "stats-spin 1s linear infinite"
		}} />
		<style>{`
			@keyframes stats-spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`}</style>
		<div style={{ fontSize: "18px", color: "white", opacity: 0.8 }}>Loading your stats...</div>
	</div>
);

const LoginButton = () => {
	const handleLogin = () => {
		window.open(BYPASS_AUTH_URL, "spotify-auth", "width=800,height=600");

		const inputId = "stats-oauth-token-input";

		const ModalContent = () => {
			return (
				<div className="stats-login-modal" style={{ padding: "20px", color: "white" }}>
					<p style={{ marginBottom: "10px" }}>1. A new window opened. Login and approve the app.</p>
					<p style={{ marginBottom: "10px" }}>2. You will be redirected to a callback page.</p>
					<p style={{ marginBottom: "10px" }}>3. Copy the <b>full URL</b> from your browser's address bar and paste it below:</p>
					<textarea
						id={inputId}
						placeholder="Paste callback URL here..."
						style={{
							width: "100%",
							height: "80px",
							marginTop: "10px",
							padding: "12px",
							borderRadius: "8px",
							backgroundColor: "rgba(255,255,255,0.05)",
							color: "white",
							border: "1px solid rgba(255,255,255,0.1)",
							outline: "none",
							resize: "none",
						}}
					/>
					<div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
						<button
							style={{ padding: "10px 24px", borderRadius: "20px", backgroundColor: "#1db954", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" }}
							onClick={() => {
								const input = document.getElementById(inputId) as HTMLTextAreaElement;
								if (input && setExternalToken(input.value)) {
									statsDebug.clearAll();
									window.Spicetify.PopupModal.hide();
									window.location.reload();
								} else {
									window.Spicetify.showNotification("Invalid token or URL.");
								}
							}}
						>
							Save & Refresh
						</button>
					</div>
				</div>
			);
		};

		window.Spicetify.PopupModal.display({
			title: "Login with Spotify",
			// @ts-ignore
			content: <ModalContent />,
			isLarge: false,
		});
	};

	return (
		<button 
			style={{ padding: "14px 28px", borderRadius: "999px", background: "#1db954", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }} 
			onClick={handleLogin}
		>
			Login with Spotify to Fix 429
		</button>
	);
};

const useStatus = (status: "success" | "error" | "pending", error: Error | null, refetch?: () => void) => {
	if (status === "success") return null;

	if (status === "pending") {
		return (
			<div style={{ display: "flex", width: "100%", height: "80vh", justifyContent: "center", alignItems: "center" }}>
				<LoadingSpinner />
			</div>
		);
	}

	const isRateLimited = error?.message.includes("429");

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", padding: "60px", textAlign: "center" }}>
			<div style={{ color: "white" }}>
				<h1 style={{ fontSize: "32px", marginBottom: "10px" }}>{isRateLimited ? "Spotify Rate Limit Detected" : "App Error"}</h1>
				<p style={{ opacity: 0.7, fontSize: "18px" }}>{error?.message || "Bypass the shared limit by logging in with your own token."}</p>
			</div>
			
			<div style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
				<p style={{ marginBottom: "20px", fontSize: "14px", opacity: 0.8 }}>This bypass uses a separate app quota to ensure your stats always load.</p>
				<LoginButton />
			</div>

			{!isRateLimited && (
				<button onClick={() => window.location.reload()} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 16px", borderRadius: "999px", cursor: "pointer" }}>
					Retry Connection
				</button>
			)}
		</div>
	);
};

export default useStatus;
