import React from 'react';

interface OptionSelectorProps<T extends string> {
    label: string;
    options: T[];
    selectedOption: T;
    onSelect: (option: T) => void;
}

const OptionSelector = <T extends string>({ label, options, selectedOption, onSelect }: OptionSelectorProps<T>) => (
    <div>
        <h3 className="text-sm font-semibold text-cyan-200/80 mb-2">{label}</h3>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={`px-4 py-2 text-sm rounded-md border transition-all duration-200 ${
                        selectedOption === option
                            ? 'bg-cyan-500/20 border-cyan-500 text-white'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export default OptionSelector;