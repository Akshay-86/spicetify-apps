import React from "react";
import Status from "@shared/status/status";
import { statsDebug } from "../extensions/debug";
import { beginExternalOAuth } from "../api/spotify";

const AUTO_RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes

const formatCountdown = (s: number) => {
	const m = Math.floor(s / 60);
	const rem = s % 60;
	return m > 0 ? `${m}m ${rem}s` : `${s}s`;
};

const LoginButton = () => {
	const { ButtonPrimary } = Spicetify.ReactComponent;

	const handleLogin = () => {
		void beginExternalOAuth();
	};

	if (!ButtonPrimary) return <button style={{ marginTop: "10px" }} onClick={handleLogin}>Login with Spotify</button>;

	return (
		<div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 10 }}>
			<ButtonPrimary onClick={handleLogin}>Login with Spotify</ButtonPrimary>
		</div>
	);
};

const useStatus = (status: "success" | "error" | "pending", error: Error | null, refetch?: () => void) => {
	const [snapshot, setSnapshot] = React.useState(() => statsDebug.getSnapshot());
	const [now, setNow] = React.useState(Date.now());
	const [autoRetryIn, setAutoRetryIn] = React.useState<number | null>(null);
	const nextRetry = snapshot.activeRetries[0];

	React.useEffect(() => {
		setSnapshot(statsDebug.getSnapshot());
		return statsDebug.subscribe(() => setSnapshot(statsDebug.getSnapshot()));
	}, []);

	React.useEffect(() => {
		if (!nextRetry) return;
		const timer = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(timer);
	}, [nextRetry]);

	React.useEffect(() => {
		if (status !== "error") {
			setAutoRetryIn(null);
			return;
		}
		const retryAt = Date.now() + AUTO_RETRY_DELAY_MS;
		setAutoRetryIn(Math.ceil(AUTO_RETRY_DELAY_MS / 1000));
		const interval = window.setInterval(() => {
			const remaining = Math.ceil((retryAt - Date.now()) / 1000);
			if (remaining <= 0) {
				clearInterval(interval);
				setAutoRetryIn(null);
				refetch?.();
			} else {
				setAutoRetryIn(remaining);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [status, refetch]);

	if (status === "pending") {
		if (nextRetry) {
			const seconds = Math.max(0, Math.ceil((nextRetry.retryAt - now) / 1000));
			return (
				<div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
					<Status
						icon="library"
						heading="Retrying"
						subheading={`Spotify rate-limited the request. Retrying automatically in ${seconds}s. Open Debug Console for details.`}
					/>
					<LoginButton />
				</div>
			);
		}
		return <Status icon="library" heading="Loading" subheading="Please wait, this may take a moment" />;
	}

	if (status === "error") {
		if (error?.message.includes("status 429") || error?.message.includes("429")) {
			const countdownText = autoRetryIn !== null ? ` Auto-retrying in ${formatCountdown(autoRetryIn)}.` : "";
			return (
				<div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
					<Status
						icon="error"
						heading="Rate Limited"
						subheading={`Spotify is temporarily limiting requests.${countdownText} Or click the Refresh button to retry now.`}
					/>
					<LoginButton />
				</div>
			);
		}
		const countdownText = autoRetryIn !== null ? ` Auto-retrying in ${formatCountdown(autoRetryIn)}.` : "";
		return <Status icon="error" heading="Error" subheading={`${error?.message || "An unknown error occurred"}${countdownText}`} />;
	}

	return null;
};

export default useStatus;
