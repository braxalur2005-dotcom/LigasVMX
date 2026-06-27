const ZoomableImage = ({ src, alt, className, ...props }) => {
    return (
        <img 
            src={src} 
            alt={alt || ''} 
            className={`${className} cursor-zoom-in hover:scale-105 transition-transform duration-200`} 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('zoom-image', { detail: src }));
            }}
            {...props}
        />
    );
};