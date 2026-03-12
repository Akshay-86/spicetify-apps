import React from "react";

interface Option {
    id: string;
    name: string;
}

interface DropdownMenuProps {
    options: Option[];
    activeOption: Option;
    switchCallback: (option: Option) => void;
}

const SortDropdown = (props: DropdownMenuProps) => {
    const { options, activeOption, switchCallback } = props;

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <select
                value={activeOption.id}
                onChange={(e) => {
                    const option = options.find(o => o.id === e.target.value);
                    if (option) switchCallback(option);
                }}
                style={{
                    appearance: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "none",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    outline: "none"
                }}
            >
                {options.map((option) => (
                    <option key={option.id} value={option.id} style={{ background: "#282828", color: "white" }}>
                        {option.name}
                    </option>
                ))}
            </select>
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="m14 6-6 6-6-6h12z"></path>
                </svg>
            </div>
        </div>
    );
};

export default SortDropdown;
