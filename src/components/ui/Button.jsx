import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const Button = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    iconName,
    iconPosition = 'left',
    fullWidth = false,
    disabled = false,
    type = 'button',
    onClick,
    ...props
}) => {
    const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        outline: 'border border-input bg-background hover:bg-muted text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
    };

    const sizes = {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-all duration-250 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
                variants[variant],
                sizes[size],
                fullWidth ? 'w-full' : '',
                className
            )}
            {...props}
        >
            {iconName && iconPosition === 'left' && (
                <Icon name={iconName} size={size === 'sm' ? 14 : 18} className={children ? 'mr-2' : ''} />
            )}
            {children}
            {iconName && iconPosition === 'right' && (
                <Icon name={iconName} size={size === 'sm' ? 14 : 18} className={children ? 'ml-2' : ''} />
            )}
        </button>
    );
};

export default Button;
