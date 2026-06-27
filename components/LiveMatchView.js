const LiveMatchView = ({ match, homeTeam, awayTeam }) => {
    if (!match) return null;

    return (
        <div className="card bg-slate-900 text-white border-none mb-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <div className="flex flex-col items-center w-1/3">
                    <ZoomableImage src={homeTeam.logoUrl} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 p-2 mb-2" />
                    <h3 className="font-bold text-center">{homeTeam.name}</h3>
                </div>
                
                <div className="flex flex-col items-center w-1/3">
                    <div className="text-4xl md:text-6xl font-bold font-mono tracking-widest">
                        {match.homeScore} : {match.awayScore}
                    </div>
                    <div className="text-green-400 font-bold text-xl mt-2 animate-pulse">
                        {match.minute}'
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">Live Match</div>
                </div>

                <div className="flex flex-col items-center w-1/3">
                    <ZoomableImage src={awayTeam.logoUrl} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 p-2 mb-2" />
                    <h3 className="font-bold text-center">{awayTeam.name}</h3>
                </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                <h4 className="text-xs uppercase text-slate-500 font-bold mb-2 sticky top-0 bg-slate-900">Match Events</h4>
                {match.events && match.events.length > 0 ? (
                    match.events.slice().reverse().map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm animate-in fade-in slide-in-from-right-4">
                            <span className="font-mono text-slate-400 w-8 text-right">{ev.minute}'</span>
                            <div className={`p-1 rounded ${ev.teamId === match.homeId ? 'bg-blue-900/50 text-blue-200' : 'bg-red-900/50 text-red-200'}`}>
                                {ev.type === 'goal' && <span className="mr-1">⚽</span>}
                                {ev.text}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-slate-600 text-sm italic">No major events yet...</div>
                )}
            </div>
        </div>
    );
};