import React from 'react';
import * as LucideIcons from 'lucide-react';

const AppIcon = ({ name, size = 24, color = 'currentColor', className = '', ...props }) => {
    // Basic mapping for common icons if needed, or just use the name directly
    const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;

    return (
        <IconComponent
            size={size}
            color={color}
            className={className}
            {...props}
        />
    );
};

export default AppIcon;
