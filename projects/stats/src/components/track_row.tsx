import React from "react";
import type { LastFMMinifiedTrack, SpotifyMinifiedTrack } from "../types/stats_types";
import { formatNumber } from "../pages/charts";

const ArtistLink = ({ name, uri, index, length }: { name: string; uri: string; index: number; length: number }) => {
	return (
		<span key={uri}>
			<a draggable="true" dir="auto" href={uri} tabIndex={-1} style={{ color: "var(--spice-subtext)" }}>
				{name}
			</a>
			{index === length ? null : ", "}
		</span>
	);
};

const TrackRow = (props: (SpotifyMinifiedTrack | LastFMMinifiedTrack) & { index: number; uris: string[] }) => {
	const ArtistLinks = props.artists.map((artist, index) => {
		return <ArtistLink key={artist.uri} index={index} length={props.artists.length - 1} name={artist.name} uri={artist.uri} />;
	});

	return (
		<div 
			role="row" 
			className="main-trackList-trackListRow main-trackList-trackListRowGrid"
			style={{
				height: 56,
				gridTemplateColumns: "[index] var(--tracklist-index-column-width,16px) [first] minmax(120px,var(--col1,6fr)) [var1] minmax(120px,var(--col2,4fr)) [var2] minmax(120px,var(--col3,3fr)) [last] minmax(120px,var(--col4,1fr))",
				padding: "0 16px",
				display: "grid",
				alignItems: "center",
				borderRadius: "4px"
			}}
		>
			<div className="main-trackList-rowSectionIndex" style={{ color: "var(--spice-subtext)" }}>
				{props.index}
			</div>
			<div className="main-trackList-rowSectionStart" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<img 
					src={props.image || "https://raw.githubusercontent.com/harbassan/spicetify-apps/main/stats/src/styles/placeholder.png"} 
					style={{ width: "40px", height: "40px", borderRadius: "4px" }}
				/>
				<div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
					<div style={{ color: "white", fontWeight: "400", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{props.name}
					</div>
					<div style={{ fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{ArtistLinks}
					</div>
				</div>
			</div>
			{props.playcount && (
				<div className="main-trackList-rowSectionVariable" style={{ color: "var(--spice-subtext)" }}>
					{formatNumber(props.playcount)}
				</div>
			)}
			<div className="main-trackList-rowSectionVariable" style={{ color: "var(--spice-subtext)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
				{props.album?.name || "Unknown"}
			</div>
			<div className="main-trackList-rowSectionEnd" style={{ color: "var(--spice-subtext)", textAlign: "right" }}>
				{window.Spicetify?.Player?.formatTime(props.duration_ms)}
			</div>
		</div>
	);
};

export default TrackRow;
