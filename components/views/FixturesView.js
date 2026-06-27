const FixturesView = ({ matches, teamsMap, adminMode, onUpdateMatchTime, onStartMatch }) => {
    // Filter only Scheduled matches
    const scheduled = matches.filter(m => m.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    if (scheduled.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <div className="icon-calendar-off w-12 h-12 mb-4 opacity-50"></div>
                <p>No hay partidos programados</p>
            </div>
        );
    }

    // Group by Round
    const byRound = scheduled.reduce((acc, m) => {
        const r = m.round || 1;
        if (!acc[r]) acc[r] = [];
        acc[r].push(m);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {Object.keys(byRound).map(round => (
                <div key={round}>
                    <h3 className="text-lg font-bold mb-4 text-slate-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Jornada {round}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {byRound[round].map(m => (
                            <MatchCard 
                                key={m.id} 
                                match={m} 
                                teamsMap={teamsMap} 
                                adminMode={adminMode}
                                onUpdateMatchTime={onUpdateMatchTime}
                                onStartMatch={onStartMatch}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MatchCard = ({ match, teamsMap, adminMode, onUpdateMatchTime, onStartMatch }) => {
    const home = teamsMap[match.homeId] || { name: '?', logoUrl: '' };
    const away = teamsMap[match.awayId] || { name: '?', logoUrl: '' };
    const date = new Date(match.startTime);

    // Format local date for datetime-local input
    const localDateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                            .toISOString().slice(0, 16);

    const handleDateChange = (e) => {
        // e.target.value is in local time, convert it to a valid date object
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            onUpdateMatchTime(match.id, newDate.toISOString());
        }
    };

    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col items-center w-1/3 text-center">
                    <ZoomableImage src={home.logoUrl} className="w-12 h-12 rounded-full mb-2 bg-slate-100 dark:bg-slate-800 p-1" />
                    <span className="text-sm font-bold leading-tight">{home.name}</span>
                </div>
                
                <div className="flex flex-col items-center w-1/3">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">VS</div>
                    {adminMode ? (
                        <input 
                            type="datetime-local" 
                            className="bg-slate-100 dark:bg-slate-800 text-xs p-1 rounded border dark:border-slate-700 w-full text-center"
                            value={localDateStr}
                            onChange={handleDateChange}
                        />
                    ) : (
                        <div className="text-sm font-mono text-center">
                            <div className="font-bold">{date.toLocaleDateString()}</div>
                            <div className="text-slate-500">{date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center w-1/3 text-center">
                    <ZoomableImage src={away.logoUrl} className="w-12 h-12 rounded-full mb-2 bg-slate-100 dark:bg-slate-800 p-1" />
                    <span className="text-sm font-bold leading-tight">{away.name}</span>
                </div>
            </div>

            {adminMode && (
                <div className="pt-3 border-t dark:border-slate-800 flex justify-center">
                    <button 
                        onClick={() => onStartMatch(match.id)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                        <div className="icon-play w-3 h-3"></div> Iniciar Ahora
                    </button>
                </div>
            )}
        </div>
    );
};