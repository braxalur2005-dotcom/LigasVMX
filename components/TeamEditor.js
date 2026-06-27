const TeamEditor = ({ team, onSave, onCancel }) => {
    const [name, setName] = React.useState(team.name);
    const [titles, setTitles] = React.useState(team.titles || 0);
    const [logoUrl, setLogoUrl] = React.useState(team.logoUrl);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result, 100, 0.7);
                setLogoUrl(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave({ ...team, name, titles: parseInt(titles), logoUrl });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Nombre del Equipo</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="input-field"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Títulos</label>
                <input 
                    type="number" 
                    min="0"
                    value={titles} 
                    onChange={e => setTitles(e.target.value)} 
                    className="input-field"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                <div className="flex items-center gap-4">
                    <img src={logoUrl} className="w-16 h-16 rounded-full bg-slate-100 object-contain" />
                    <div>
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            className="btn btn-outline text-sm"
                        >
                            Subir Imagen
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-slate-500 mt-1">Soporta webp, png, jpg</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
        </div>
    );
};