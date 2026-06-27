const MatchDetailView = ({ match, teamsMap, onBack }) => {
    const home = teamsMap[match.homeId];
    const away = teamsMap[match.awayId];
    const isLive = match.status === 'LIVE';

    // Mock stats for visual richness
    // In a real version, these should come from the simulation engine logic
    const stats = {
        possession: isLive ? [45 + Math.floor(Math.random()*10), 55 - Math.floor(Math.random()*10)] : [52, 48],
        shots: isLive ? [Math.floor(match.minute/10), Math.floor(match.minute/12)] : [12, 8],
    };

    const getEventIcon = (type) => {
        switch(type) {
            case 'goal': return '⚽';
            case 'card_yellow': return '🟨';
            case 'card_red': return '🟥';
            case 'corner': return '⛳';
            case 'foul': return '💢';
            default: return '•';
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Nav Back */}
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
                <div className="icon-arrow-left w-5 h-5"></div>
                <span className="font-medium">Volver a la lista</span>
            </button>

            {/* Scoreboard Header */}
            <div className="card bg-slate-900 text-white border-none overflow-hidden relative mb-6">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 gap-8">
                    {/* Home */}
                    <div className="flex flex-col items-center gap-4 flex-1">
                        <ZoomableImage src={home.logoUrl} className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full p-4 shadow-2xl" />
                        <h2 className="text-2xl md:text-3xl font-bold text-center">{home.name}</h2>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center">
                        <div className="text-6xl md:text-8xl font-bold font-mono tracking-widest shadow-black drop-shadow-lg">
                            {match.homeScore}:{match.awayScore}
                        </div>
                        {isLive ? (
                            <div className="flex flex-col items-center gap-2 mt-4">
                                <div className="flex items-center gap-2 bg-red-600 px-4 py-1 rounded-full animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    <span className="font-bold text-sm uppercase tracking-wider">
                                        {match.isBreak ? 'Entretiempo' : `En Vivo • ${match.minute}'`}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-slate-400 font-bold uppercase tracking-widest">Tiempo Completo</div>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center gap-4 flex-1">
                        <ZoomableImage src={away.logoUrl} className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full p-4 shadow-2xl" />
                        <h2 className="text-2xl md:text-3xl font-bold text-center">{away.name}</h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Events Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="icon-activity w-5 h-5 text-blue-500"></div>
                            Momentos Destacados
                        </h3>
                        <div className="space-y-4 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                            {match.events && match.events.length > 0 ? (
                                [...match.events].reverse().map((ev, i) => (
                                    <div key={i} className="flex gap-4 relative animate-in fade-in slide-in-from-top-2">
                                        <div className="w-16 flex-shrink-0 text-right font-mono font-bold text-slate-500 pt-1">
                                            {ev.minute}'
                                        </div>
                                        <div className="relative z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-sm shadow-sm">
                                            {getEventIcon(ev.type)}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {ev.type === 'goal' ? '¡GOOOOL!' : ev.type.replace('_', ' ').toUpperCase()}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {ev.text} ({ev.teamId === home.id ? home.name : away.name})
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="pl-20 text-slate-500 italic">El partido está comenzando, esperando acciones...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Estadísticas</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b dark:border-slate-800">
                                <span>Goles</span>
                                <span className="font-bold">{match.homeScore} - {match.awayScore}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b dark:border-slate-800">
                                <span>Corners</span>
                                <span className="font-bold">
                                    {match.events?.filter(e=>e.type==='corner' && e.teamId===home.id).length || 0} - 
                                    {match.events?.filter(e=>e.type==='corner' && e.teamId===away.id).length || 0}
                                </span>
                            </div>
                             <div className="flex justify-between py-2 border-b dark:border-slate-800">
                                <span>Faltas</span>
                                <span className="font-bold">
                                    {match.events?.filter(e=>e.type==='foul' && e.teamId===home.id).length || 0} - 
                                    {match.events?.filter(e=>e.type==='foul' && e.teamId===away.id).length || 0}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b dark:border-slate-800">
                                <span>Tarjetas</span>
                                <span className="font-bold">
                                    {match.events?.filter(e=>e.type.includes('card') && e.teamId===home.id).length || 0} - 
                                    {match.events?.filter(e=>e.type.includes('card') && e.teamId===away.id).length || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};