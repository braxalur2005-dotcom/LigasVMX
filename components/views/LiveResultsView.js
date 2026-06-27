const LiveResultsView = ({ matches, teamsMap, title, type, onViewDetail }) => {
    const sorted = [...matches].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    const isLive = type === 'LIVE';

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <div className={`w-12 h-12 mb-4 opacity-50 ${isLive ? 'icon-radio' : 'icon-history'}`}></div>
                <p>{isLive ? 'No hay partidos en vivo' : 'No hay resultados registrados'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sorted.map(m => (
                <div key={m.id} className={`card flex flex-col md:flex-row items-center justify-between gap-4 ${isLive ? 'border-l-4 border-l-green-500' : ''}`}>
                    
                    {/* Teams & Score */}
                    <div className="flex items-center flex-1 w-full justify-between md:justify-start md:gap-8">
                        <div className="flex items-center gap-3 w-1/3 md:w-auto justify-end md:justify-start">
                            <span className="font-bold text-sm md:text-base text-right hidden md:block w-32 truncate">
                                {teamsMap[m.homeId]?.name}
                            </span>
                            <span className="font-bold text-sm md:hidden">
                                {teamsMap[m.homeId]?.name.substring(0,3)}
                            </span>
                            <ZoomableImage src={teamsMap[m.homeId]?.logoUrl} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 p-1" />
                        </div>

                        <div className="flex flex-col items-center px-2">
                            <div className="text-2xl md:text-3xl font-bold font-mono tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                                {m.homeScore} - {m.awayScore}
                            </div>
                            {isLive ? (
                                <div className="text-xs text-green-500 font-bold animate-pulse mt-1">{m.minute}'</div>
                            ) : (
                                <div className="text-xs text-slate-500 mt-1">Finalizado</div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-1/3 md:w-auto">
                            <ZoomableImage src={teamsMap[m.awayId]?.logoUrl} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 p-1" />
                            <span className="font-bold text-sm md:text-base hidden md:block w-32 truncate">
                                {teamsMap[m.awayId]?.name}
                            </span>
                            <span className="font-bold text-sm md:hidden">
                                {teamsMap[m.awayId]?.name.substring(0,3)}
                            </span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="w-full md:w-auto flex justify-center">
                        <Button variant="outline" onClick={() => onViewDetail(m)} className="w-full md:w-auto text-xs">
                            <div className="icon-eye w-4 h-4"></div>
                            {isLive ? 'Ver Partido' : 'Ver Resultado'}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};