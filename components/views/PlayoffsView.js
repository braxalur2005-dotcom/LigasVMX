const PlayoffsView = ({ leagueId, matches, teams, adminMode, onGeneratePlayoffs, onAdvanceRound, onStartMatch, onViewDetail }) => {
    // Filter playoff matches
    const playoffMatches = matches.filter(m => m.leagueId === leagueId && m.isPlayoff);

    const quarters = playoffMatches.filter(m => m.playoffRound === 'QUARTERS');
    const semis = playoffMatches.filter(m => m.playoffRound === 'SEMIS');
    const final = playoffMatches.filter(m => m.playoffRound === 'FINAL');

    // Helper to determine active round
    let activeRound = null;
    if (final.length > 0) activeRound = 'FINAL';
    else if (semis.length > 0) activeRound = 'SEMIS';
    else if (quarters.length > 0) activeRound = 'QUARTERS';

    const isRoundFinished = (roundMatches) => roundMatches.length > 0 && roundMatches.every(m => m.status === 'FINISHED');

    const renderRound = (title, matches) => (
        <div className="flex flex-col gap-4 min-w-[300px]">
            <h3 className="text-center font-bold text-slate-500 uppercase tracking-widest text-sm border-b pb-2 dark:border-slate-800">{title}</h3>
            {matches.map(m => {
                const home = teams[m.homeId];
                const away = teams[m.awayId];
                const isLive = m.status === 'LIVE';
                const isFinished = m.status === 'FINISHED';
                const winnerId = isFinished ? (m.homeScore > m.awayScore ? m.homeId : (m.awayScore > m.homeScore ? m.awayId : m.homeId)) : null;

                return (
                    <div key={m.id} className="card p-3 relative overflow-hidden">
                         {isLive && <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-bl animate-pulse"></div>}
                        <div className="space-y-2">
                            {/* Home */}
                            <div className={`flex justify-between items-center ${winnerId === m.homeId ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                <div className="flex items-center gap-2">
                                    <ZoomableImage src={home?.logoUrl} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5" />
                                    <span className="text-sm truncate max-w-[120px]">{home?.name}</span>
                                </div>
                                <span className="font-mono">{isFinished || isLive ? m.homeScore : '-'}</span>
                            </div>
                            {/* Away */}
                            <div className={`flex justify-between items-center ${winnerId === m.awayId ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                <div className="flex items-center gap-2">
                                    <ZoomableImage src={away?.logoUrl} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5" />
                                    <span className="text-sm truncate max-w-[120px]">{away?.name}</span>
                                </div>
                                <span className="font-mono">{isFinished || isLive ? m.awayScore : '-'}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex justify-end gap-2">
                            {adminMode && m.status === 'SCHEDULED' && (
                                <button onClick={() => onStartMatch(m.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">
                                    Iniciar
                                </button>
                            )}
                            {(isLive || isFinished) && (
                                <button onClick={() => onViewDetail(m)} className="text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded">
                                    Ver
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (playoffMatches.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <div className="icon-trophy w-10 h-10 text-yellow-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold">Liguilla</h2>
                    <p className="text-slate-500">
                        La fase final del torneo aún no ha comenzado. 
                        {adminMode && " Como administrador, puedes iniciar la liguilla si la fase regular ha terminado."}
                    </p>
                    {adminMode && (
                        <Button onClick={() => onGeneratePlayoffs(leagueId)} variant="accent" className="w-full">
                            <div className="icon-wand w-4 h-4"></div>
                            Generar Liguilla Automáticamente
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 overflow-x-auto pb-4">
            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2 sticky left-0">
                <div className="icon-crown w-6 h-6 text-yellow-500"></div>
                Fase Final
            </h2>

            <div className="flex gap-8 justify-center min-w-max px-4">
                {renderRound('Cuartos de Final', quarters)}
                
                {semis.length > 0 ? renderRound('Semifinales', semis) : (
                    <div className="flex items-center justify-center min-w-[200px] border-l border-dashed border-slate-300 dark:border-slate-700">
                        {isRoundFinished(quarters) && adminMode && (
                            <Button onClick={() => onAdvanceRound(leagueId, 'QUARTERS')} variant="outline" className="text-sm">
                                Generar Semis <div className="icon-arrow-right w-4 h-4"></div>
                            </Button>
                        )}
                        {!isRoundFinished(quarters) && <span className="text-xs text-slate-400 italic">Esperando Cuartos...</span>}
                    </div>
                )}

                {final.length > 0 ? renderRound('Gran Final', final) : (
                    semis.length > 0 && (
                        <div className="flex items-center justify-center min-w-[200px] border-l border-dashed border-slate-300 dark:border-slate-700">
                             {isRoundFinished(semis) && adminMode && (
                                <Button onClick={() => onAdvanceRound(leagueId, 'SEMIS')} variant="outline" className="text-sm">
                                    Generar Final <div className="icon-arrow-right w-4 h-4"></div>
                                </Button>
                            )}
                            {!isRoundFinished(semis) && <span className="text-xs text-slate-400 italic">Esperando Semis...</span>}
                        </div>
                    )
                )}

                 {final.length > 0 && isRoundFinished(final) && (
                    <div className="flex items-center justify-center min-w-[200px] border-l border-dashed border-slate-300 dark:border-slate-700 animate-in zoom-in duration-500">
                        <div className="text-center">
                            <div className="icon-trophy w-16 h-16 text-yellow-500 mx-auto mb-2 animate-bounce"></div>
                            <div className="font-bold text-xl text-yellow-500">¡CAMPEÓN!</div>
                            {(() => {
                                const m = final[0];
                                const wId = m.homeScore > m.awayScore ? m.homeId : m.awayId;
                                return <div className="font-bold text-lg mt-1">{teams[wId]?.name}</div>
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};