import React from 'react';
import { cn } from '../../utils/cn';

const Select = ({
    label,
    options = [],
    value,
    onChange,
    disabled = false,
    className = "",
    description,
    required = false
}) => {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(
                    "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {description && (
                <p className="text-xs text-muted-foreground italic">
                    {description}
                </p>
            )}
        </div>
    );
};

export default Select;
