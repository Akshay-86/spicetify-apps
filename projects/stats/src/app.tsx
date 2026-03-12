import React from "react";
import ArtistsPage from "./pages/top_artists";
import TracksPage from "./pages/top_tracks";
import GenresPage from "./pages/top_genres";
import LibraryPage from "./pages/library";
import ChartsPage from "./pages/charts";
import AlbumsPage from "./pages/top_albums";
import NavigationBar from "@shared/components/navigation/navigation_bar"
import "./styles/app.scss";
import "../../shared/src/config/config_modal.scss";
import "../../shared/src/shared.scss";
import { ConfigWrapper } from "./types/stats_types";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false, error: null };
	}
	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}
	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: "40px", color: "white", textAlign: "center" }}>
					<h1 style={{ color: "#ef4444" }}>Initialization Error</h1>
					<p>Please reload Spotify. If the error persists, use the Login button.</p>
					<pre style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px", marginTop: "20px", whiteSpace: "pre-wrap", textAlign: "left" }}>
						{this.state.error?.message}
					</pre>
					<button style={{ marginTop: "30px", padding: "12px 24px", borderRadius: "999px", background: "#1db954", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" }} onClick={() => window.location.reload()}>
						Reload Spotify
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

const NavbarContainer = ({ configWrapper }: { configWrapper: ConfigWrapper }) => {
	const [activePage, setActivePage] = React.useState<string>(() => {
		return window.Spicetify?.LocalStorage?.get("stats:active-link") || "Artists";
	});

	const pages: Record<string, React.ReactElement> = {
		["Artists"]: <ArtistsPage configWrapper={configWrapper} />,
		["Tracks"]: <TracksPage configWrapper={configWrapper} />,
		["Albums"]: <AlbumsPage configWrapper={configWrapper} />,
		["Genres"]: <GenresPage configWrapper={configWrapper} />,
		["Library"]: <LibraryPage configWrapper={configWrapper} />,
		["Charts"]: <ChartsPage configWrapper={configWrapper} />,
	};

	const tabPages = ["Artists", "Tracks", "Albums", "Genres", "Library", "Charts"].filter(
		(page) => configWrapper.config[`show-${page.toLowerCase()}` as keyof ConfigWrapper["config"]]
	);

	React.useEffect(() => {
		const handleHistory = () => {
			const path = window.Spicetify?.Platform?.History?.location?.pathname;
			if (path) {
				const page = path.split("/")[2];
				if (page && pages[page]) {
					setActivePage(page);
					window.Spicetify.LocalStorage.set("stats:active-link", page);
				}
			}
		};
		const unlisten = window.Spicetify?.Platform?.History?.listen(handleHistory);
		handleHistory();
		return () => unlisten?.();
	}, [configWrapper.config]);

	return (
		<>
			<NavigationBar links={tabPages} selected={activePage} storekey="stats:active-link" />
			<div style={{ marginTop: "60px" }}>
				{pages[activePage] || pages["Artists"]}
			</div>
		</>
	);
};

const App = () => {
	const [config, setConfig] = React.useState<ConfigWrapper["config"] | null>(null);

	React.useEffect(() => {
		const init = () => {
			if (
				window.Spicetify?.Platform?.History && 
				window.Spicetify?.ReactComponent?.ButtonPrimary && 
				window.SpicetifyStats?.ConfigWrapper?.Config
			) {
				setConfig({ ...window.SpicetifyStats.ConfigWrapper.Config });
			} else {
				setTimeout(init, 200);
			}
		};
		init();
	}, []);

	if (!config) {
		return (
			<div className="stats-loading-wrapper" style={{ flexDirection: "column", gap: "20px" }}>
				<h2>Loading Stats...</h2>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div id="stats-app">
				<NavbarContainer configWrapper={{ config, launchModal: () => window.SpicetifyStats.ConfigWrapper.launchModal(setConfig) }} />
			</div>
		</ErrorBoundary>
	);
};

export default App;
