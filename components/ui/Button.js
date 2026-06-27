const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseClass = "btn";
    let variantClass = "btn-primary";
    if (variant === 'accent') variantClass = "btn-accent";
    if (variant === 'outline') variantClass = "btn-outline";
    if (variant === 'danger') variantClass = "bg-red-600 text-white hover:bg-red-700";

    return (
        <button className={`${baseClass} ${variantClass} ${className}`} onClick={onClick} {...props}>
            {children}
        </button>
    );
};