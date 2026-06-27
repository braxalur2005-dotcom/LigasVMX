const TeamDetailView = ({ team, matches, allTeams, onBack }) => {
    // Filter matches for this team
    const teamMatches = matches.filter(m => m.homeId === team.id || m.awayId === team.id);
    const played = teamMatches.filter(m => m.status === 'FINISHED').sort((a,b) => new Date(b.startTime) - new Date(a.startTime));
    const upcoming = teamMatches.filter(m => m.status === 'SCHEDULED').sort((a,b) => new Date(a.startTime) - new Date(b.startTime));

    // Calculate Rank
    // We need to calculate standings for the specific league of this team to know the rank
    // Assuming allTeams passed is the raw list, we need to calc standings first
    // Note: This might be heavy if done every render. In a real app, pass pre-calculated standings.
    // However, App.js logic calculates standings dynamically for current view.
    // Let's re-calculate here for correctness or pass it down. 
    // Optimization: Just calculate for this team's league.
    const leagueTeams = allTeams.filter(t => t.leagueId === team.leagueId);
    // If league 6, also filter by group?
    // Ranking is usually per group in group stage.
    const relevantTeams = team.leagueId === 6 
        ? leagueTeams.filter(t => t.groupId === team.groupId)
        : leagueTeams;

    const standing = calculateStandings(matches.filter(m => m.leagueId === team.leagueId), relevantTeams);
    const rank = standing.findIndex(t => t.id === team.id) + 1;

    // Calculate form (last 5 games)
    const form = played.slice(0, 5).map(m => {
        const isHome = m.homeId === team.id;
        const gf = isHome ? m.homeScore : m.awayScore;
        const ga = isHome ? m.awayScore : m.homeScore;
        if (gf > ga) return 'W';
        if (gf < ga) return 'L';
        return 'D';
    }).reverse();

    return (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6">
                <div className="icon-arrow-left w-5 h-5"></div>
                Volver
            </button>

            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-8 text-white mb-8 shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <ZoomableImage src={team.logoUrl} className="w-32 h-32 bg-white rounded-full p-2 shadow-lg" />
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">{team.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-6 text-blue-200">
                            <div className="flex items-center gap-2">
                                <div className="icon-trophy w-5 h-5 text-yellow-400"></div>
                                <span className="font-bold text-xl">{team.titles} Títulos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="icon-medal w-5 h-5"></div>
                                <span className="font-bold text-xl">Posición {rank > 0 ? `#${rank}` : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info & Form */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold mb-4">Forma Reciente</h3>
                        <div className="flex gap-2">
                            {form.length > 0 ? form.map((r, i) => (
                                <div key={i} className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white
                                    ${r === 'W' ? 'bg-green-500' : r === 'D' ? 'bg-slate-400' : 'bg-red-500'}`}>
                                    {r}
                                </div>
                            )) : <span className="text-slate-500 text-sm">Sin partidos jugados</span>}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold mb-4">Estadísticas de Temporada</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <div className="text-2xl font-bold">{team.stats.gf}</div>
                                <div className="text-xs text-slate-500 uppercase">Goles A Favor</div>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <div className="text-2xl font-bold">{team.stats.ga}</div>
                                <div className="text-xs text-slate-500 uppercase">Goles En Contra</div>
                            </div>
                            <div className="col-span-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{team.stats.pts}</div>
                                <div className="text-xs text-slate-500 uppercase">Puntos Totales</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Matches */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <div className="icon-calendar w-5 h-5"></div> Próximos Partidos
                        </h3>
                        {upcoming.length > 0 ? (
                            <div className="space-y-2">
                                {upcoming.slice(0,3).map(m => (
                                    <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded border dark:border-slate-700">
                                        <span className="text-xs font-mono text-slate-500">{new Date(m.startTime).toLocaleDateString()}</span>
                                        <span className="font-bold text-sm">
                                            {m.homeId === team.id ? 'vs ' + (matches.find(x=>x.homeId===m.awayId||x.awayId===m.awayId)?.awayId === team.id ? '...' : 'Rival') : 'vs Rival'} 
                                            (Ver en calendario)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-slate-500">No hay partidos programados.</p>}
                    </div>

                    <div className="card">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <div className="icon-history w-5 h-5"></div> Resultados Anteriores
                        </h3>
                        {played.length > 0 ? (
                            <div className="space-y-2">
                                {played.slice(0,5).map(m => (
                                    <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded border dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${m.homeScore === m.awayScore ? 'bg-slate-400' : ((m.homeId === team.id && m.homeScore > m.awayScore) || (m.awayId === team.id && m.awayScore > m.homeScore)) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="font-bold">{m.homeScore} - {m.awayScore}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">Jornada {m.round}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-slate-500">No hay partidos jugados.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};