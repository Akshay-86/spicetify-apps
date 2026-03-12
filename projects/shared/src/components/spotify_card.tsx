import React from "react";

interface SpotifyCardProps {
	type: "artist" | "album" | "lastfm" | "playlist";
	uri: string;
	header: string;
	subheader: string;
	imageUrl?: string;
	artistUri?: string;
	badge?: string | React.ReactElement;
	provider?: "spotify" | "lastfm";
}

function SpotifyCard(props: SpotifyCardProps): React.ReactElement<HTMLDivElement> {
	const { type, header, uri, imageUrl, subheader, badge, provider = "spotify" } = props;

	const handleClick = () => {
		if (provider === "lastfm") {
			window.open(uri, "_blank");
		} else {
			window.Spicetify.Platform.History.push(`/stats/${type}/${uri.split(':')[2]}`);
		}
	};

	return (
		<div 
			onClick={handleClick}
			className="main-card-card" 
			style={{ 
				background: "var(--spice-card)", 
				padding: "16px", 
				borderRadius: "8px", 
				cursor: "pointer", 
				position: "relative",
				transition: "background 0.3s ease"
			}}
		>
			<div className="main-card-imageContainer" style={{ marginBottom: "16px" }}>
				<img 
					src={imageUrl} 
					style={{ 
						width: "100%", 
						aspectRatio: "1/1", 
						objectFit: "cover", 
						borderRadius: type === "artist" ? "50%" : "4px",
						boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
					}} 
				/>
			</div>
			<div className="main-card-cardMetadata">
				<div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
					{header}
				</div>
				<div style={{ color: "var(--spice-subtext)", fontSize: "14px" }}>
					{subheader}
				</div>
			</div>
			{badge && (
				<div style={{ 
					position: "absolute", top: "8px", right: "8px", 
					background: "rgba(0,0,0,0.6)", padding: "2px 8px", 
					borderRadius: "12px", fontSize: "12px" 
				}}>
					{badge}
				</div>
			)}
		</div>
	);
}

export default SpotifyCard;
