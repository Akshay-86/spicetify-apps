import React from "react";

const Tracklist = ({ playcount = false, minified = false, children }) => {
	const height = children.length;
	return (
		<div
			role="grid"
			aria-rowcount={height}
			aria-colcount={5}
			className="main-trackList-trackList main-trackList-indexable"
		>
			{!minified && (
				<div className="main-trackList-trackListHeader" role="presentation">
					<div
						className="main-trackList-trackListHeaderRow main-trackList-trackListRowGrid"
						role="row"
						aria-rowindex={1}
						style={{
							gridTemplateColumns: '[index] var(--tracklist-index-column-width,16px) [first] minmax(120px,var(--col1,6fr)) [var1] minmax(120px,var(--col2,4fr)) [var2] minmax(120px,var(--col3,3fr)) [last] minmax(120px,var(--col4,1fr))'
						}}
					>
						<div className="main-trackList-rowSectionIndex" role="columnheader" aria-colindex={1}>#</div>
						<div className="main-trackList-rowSectionStart" role="columnheader" aria-colindex={2}>Title</div>
						{playcount && (
							<div className="main-trackList-rowSectionVariable" role="columnheader" aria-colindex={3}>Scrobbles</div>
						)}
						<div className="main-trackList-rowSectionVariable" role="columnheader" aria-colindex={4}>Album</div>
						<div className="main-trackList-rowSectionEnd" role="columnheader" aria-colindex={5}>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
								<path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
								<path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z" />
							</svg>
						</div>
					</div>
				</div>
			)}
			<div className="main-rootlist-wrapper" role="presentation" style={{ height: height * 56 }}>
				<div role="presentation">{children}</div>
			</div>
		</div>
	);
};

export default Tracklist;
