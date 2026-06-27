const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <div className="icon-x w-5 h-5"></div>
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};