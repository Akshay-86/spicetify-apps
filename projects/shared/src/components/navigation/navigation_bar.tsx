import React from "react";
import ReactDOM from "react-dom";

function NavigationBar({ links, selected, storekey }: { links: string[], selected: string, storekey: string }) {
    // @ts-ignore
    const { Chip } = Spicetify.ReactComponent;

    function navigate(page: string) {
        Spicetify.Platform.History.push(`/${storekey.split(":")[0]}/${page}`);
        Spicetify.LocalStorage.set(storekey, page);
    }

    const target = document.querySelector<HTMLDivElement>(".main-topBar-topbarContentWrapper");
    if (!target) return null;

    return ReactDOM.createPortal(
        <div style={{ paddingTop: "8px", pointerEvents: "auto" }}>
            <div className="navbar-container">
                <div className="u_wTfCtgm9HvxrphUxKd" style={{ display: "flex", gap: "8px" }}>
                    {links.map(link =>
                        <button 
                            aria-label={link} 
                            style={{ 
                                padding: "8px 16px", 
                                borderRadius: "20px", 
                                border: "none", 
                                cursor: "pointer",
                                background: selected === link ? "white" : "rgba(255,255,255,0.1)",
                                color: selected === link ? "black" : "white",
                                fontWeight: "bold"
                            }} 
                            onClick={() => navigate(link)}
                        >
                            {link}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        target
    );
};

export default NavigationBar;
