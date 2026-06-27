const AdminPanel = ({ 
    onSimulateRound, 
    onResetSeason, 
    onEditTeam, 
    teams,
    isAuthenticated,
    onLogin,
    leagueNames,
    appLogo,
    onUpdateSettings
}) => {
    const [password, setPassword] = React.useState('');
    const [selectedLeagueId, setSelectedLeagueId] = React.useState(1);
    
    const [editLeagueNames, setEditLeagueNames] = React.useState(leagueNames || []);
    const [editAppLogo, setEditAppLogo] = React.useState(appLogo || '');
    const logoInputRef = React.useRef(null);

    React.useEffect(() => {
        if (leagueNames) setEditLeagueNames(leagueNames);
        if (appLogo !== undefined) setEditAppLogo(appLogo);
    }, [leagueNames, appLogo]);

    if (!isAuthenticated) {
        return (
            <div className="card max-w-sm mx-auto mt-10">
                <h2 className="text-xl font-bold mb-4">Admin Access</h2>
                <input 
                    type="password" 
                    placeholder="Enter Admin Password" 
                    className="input-field mb-4"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <Button onClick={() => onLogin(password)} className="w-full">Login</Button>
            </div>
        );
    }

    const filteredTeams = teams.filter(t => t.leagueId === parseInt(selectedLeagueId));

    const handleLeagueNameChange = (idx, val) => {
        const newNames = [...editLeagueNames];
        newNames[idx] = val;
        setEditLeagueNames(newNames);
    };

    const handleSaveSettings = () => {
        onUpdateSettings(editLeagueNames, editAppLogo);
        alert('Configuración guardada exitosamente.');
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result, 150, 0.7);
                setEditAppLogo(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Global Settings */}
                <div className="card border-yellow-500/30">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <div className="icon-settings w-5 h-5 text-yellow-500"></div>
                        Configuración General
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500">Logo de la Liga Virtual</label>
                            <div className="flex items-center gap-3 mt-1">
                                {editAppLogo ? (
                                    <img src={editAppLogo} className="w-10 h-10 object-contain rounded bg-slate-100" />
                                ) : (
                                    <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">N/A</div>
                                )}
                                <button onClick={() => logoInputRef.current.click()} className="btn btn-outline text-xs py-1 px-2">Subir Logo</button>
                                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                                {editAppLogo && (
                                    <button onClick={() => setEditAppLogo('')} className="text-red-500 hover:text-red-700">
                                        <div className="icon-trash w-4 h-4"></div>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Nombres de las Ligas</label>
                            {editLeagueNames.map((name, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-slate-400 w-4">{idx + 1}</span>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => handleLeagueNameChange(idx, e.target.value)}
                                        className="input-field py-1 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full mt-2">Guardar Configuración</Button>
                    </div>
                </div>

                {/* Edit Teams */}
                <div className="card border-orange-500/30">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <div className="icon-pencil w-5 h-5 text-orange-500"></div>
                        Editar Equipos
                    </h3>
                    <div className="mb-4">
                        <label className="text-xs font-bold uppercase text-slate-500">Seleccionar Liga</label>
                        <select 
                            className="input-field mt-1"
                            value={selectedLeagueId}
                            onChange={e => setSelectedLeagueId(e.target.value)}
                        >
                            {editLeagueNames.map((name, idx) => (
                                <option key={idx + 1} value={idx + 1}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                        {filteredTeams.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" onClick={() => onEditTeam(t)}>
                                <div className="flex items-center gap-2">
                                    <img src={t.logoUrl} className="w-6 h-6 rounded-full" />
                                    <span className="text-sm">{t.name}</span>
                                </div>
                                <div className="icon-chevron-right w-4 h-4 text-slate-400"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulation Controls */}
                <div className="card border-blue-500/30">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <div className="icon-play w-5 h-5 text-blue-500"></div>
                        Controles de Simulación
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">Usa el botón de Iniciar partido en 'Enfrentamientos' para jugar, o resetea toda la temporada.</p>
                        <div className="flex flex-col gap-2 mt-4">
                            <Button variant="danger" onClick={onResetSeason}>
                                <div className="icon-rotate-ccw w-4 h-4"></div>
                                Reiniciar Temporada
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};