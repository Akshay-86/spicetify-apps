import React from "react";

import { InfoToCreatePlaylist } from "../../types/stats_types";

interface CreatePlaylistButtonProps {
	infoToCreatePlaylist: InfoToCreatePlaylist;
}

async function createPlaylistAsync(infoToCreatePlaylist: InfoToCreatePlaylist): Promise<void> {
	const { Platform, showNotification } = Spicetify;
	const { RootlistAPI, PlaylistAPI } = Platform;

	try {
		const { playlistName, itemsUris } = infoToCreatePlaylist;
		const playlistUri = await RootlistAPI.createPlaylist(playlistName, { before: "start" });
		await PlaylistAPI.add(playlistUri, itemsUris, { before: "start" });
	} catch (error) {
		console.error(error);
		showNotification("Failed to create playlist", true, 1000);
	}
}

function CreatePlaylistButton(props: CreatePlaylistButtonProps): React.ReactElement<HTMLButtonElement> {
	const { infoToCreatePlaylist } = props;

	return (
		<div title="Turn Into Playlist">
			<button
				aria-label="Turn Into Playlist"
				onClick={() => createPlaylistAsync(infoToCreatePlaylist)}
				className="stats-make-playlist-button"
				style={{
					background: "transparent",
					border: "1px solid rgba(255,255,255,0.2)",
					color: "white",
					padding: "4px 12px",
					borderRadius: "999px",
					fontSize: "12px",
					fontWeight: "bold",
					cursor: "pointer",
					marginLeft: "12px"
				}}
			>
				Turn Into Playlist
			</button>
		</div>
	);
}

export default CreatePlaylistButton;
