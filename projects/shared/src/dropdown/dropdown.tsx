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

function getOptionLabel(option: Option | undefined): string {
    if (!option) return "";
    return typeof option.name === "string" ? option.name : String(option.name);
}

const DropdownMenu = (props: DropdownMenuProps) => {
    const { options, activeOption, switchCallback } = props;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextOption = options.find((option) => option.id === event.target.value);
        if (nextOption) switchCallback(nextOption);
    };

    return (
        <label className="x-sortBox-sortDropdown stats-filterDropdown">
            <select
                className="stats-filterDropdown-select"
                aria-label="Select filter"
                value={activeOption.id}
                onChange={handleChange}
            >
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {getOptionLabel(option)}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default DropdownMenu;
