import React from 'react';

function Image({
    src,
    alt = "Image Name",
    className = "",
    ...props
}) {

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=1000&auto=format&fit=crop"
            }}
            {...props}
        />
    );
}

export default Image;
