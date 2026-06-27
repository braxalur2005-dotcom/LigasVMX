const ImageViewer = ({ src, onClose }) => {
    if (!src) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img 
                    src={src} 
                    alt="Vista ampliada" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-zoom-out animate-in zoom-in-95 duration-200" 
                />
                <button 
                    onClick={onClose} 
                    className="absolute -top-12 right-0 md:-right-12 md:top-0 text-white/70 hover:text-white transition-colors"
                >
                    <div className="icon-x w-8 h-8"></div>
                </button>
            </div>
        </div>
    );
};