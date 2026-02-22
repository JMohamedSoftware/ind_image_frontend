import React from 'react';
import { cn } from '../../utils/cn';

export const Checkbox = ({
    label,
    checked,
    onChange,
    disabled = false,
    description,
    className = ""
}) => {
    return (
        <div className={cn("flex items-start space-x-3", className)}>
            <div className="flex items-center h-5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50 cursor-pointer"
                />
            </div>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <label className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
