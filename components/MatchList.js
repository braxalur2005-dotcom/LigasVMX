const MatchList = ({ matches, teamsMap }) => {
    if (matches.length === 0) return <div className="text-center p-4 text-slate-500">No matches scheduled</div>;

    // Sort by date
    const sorted = [...matches].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return (
        <div className="grid gap-3">
            {sorted.map(m => {
                const home = (teamsMap && teamsMap[m.homeId]) ? teamsMap[m.homeId] : { name: 'Unknown', logoUrl: '' };
                const away = (teamsMap && teamsMap[m.awayId]) ? teamsMap[m.awayId] : { name: 'Unknown', logoUrl: '' };
                const isLive = m.status === 'LIVE';
                const isFinished = m.status === 'FINISHED';

                return (
                    <div key={m.id} className={`card p-3 flex items-center justify-between ${isLive ? 'border-green-500 border' : ''}`}>
                        <div className="flex-1 flex items-center justify-end gap-2 text-right">
                            <span className="font-medium text-sm hidden md:block">{home.name}</span>
                            <span className="font-medium text-sm md:hidden">{home.name.substring(0,3).toUpperCase()}</span>
                            <ZoomableImage src={home.logoUrl} className="w-6 h-6 rounded-full" />
                        </div>
                        
                        <div className="px-4 text-center min-w-[80px]">
                            {isFinished || isLive ? (
                                <div className="font-bold text-xl">
                                    {m.homeScore} - {m.awayScore}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 font-mono">
                                    {new Date(m.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            )}
                            
                            {isLive && <div className="text-xs text-green-500 animate-pulse font-bold">{m.minute}'</div>}
                            {isFinished && <div className="text-xs text-slate-400">FT</div>}
                        </div>

                        <div className="flex-1 flex items-center justify-start gap-2 text-left">
                            <ZoomableImage src={away.logoUrl} className="w-6 h-6 rounded-full" />
                            <span className="font-medium text-sm hidden md:block">{away.name}</span>
                            <span className="font-medium text-sm md:hidden">{away.name.substring(0,3).toUpperCase()}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};