const LeagueTable = ({ teams, compact = false }) => {
    // Top 8 qualify for leagues 1-5
    // Top 2 for league 6 groups
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="px-3 py-2 w-12 text-center">#</th>
                        <th className="px-3 py-2">Equipo</th>
                        {!compact && (
                            <>
                                <th className="px-3 py-2 text-center">PJ</th>
                                <th className="px-3 py-2 text-center hidden md:table-cell">G</th>
                                <th className="px-3 py-2 text-center hidden md:table-cell">E</th>
                                <th className="px-3 py-2 text-center hidden md:table-cell">P</th>
                                <th className="px-3 py-2 text-center">DG</th>
                            </>
                        )}
                        <th className="px-3 py-2 text-center font-bold text-slate-900 dark:text-white">Pts</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {teams.map((team, index) => {
                        let rowClass = "";
                        // Highlight logic
                        if (index < 8 && team.leagueId < 6) rowClass = "border-l-4 border-l-yellow-500";
                        if (index < 2 && team.leagueId === 6) rowClass = "border-l-4 border-l-yellow-500";
                        // Relegation zone (last place for 1-5)
                        if (index === 19 && team.leagueId < 6) rowClass = "border-l-4 border-l-red-500";

                        return (
                            <tr key={team.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${rowClass}`}>
                                <td className="px-3 py-2 text-center font-bold text-slate-400">{index + 1}</td>
                                <td className="px-3 py-2 flex items-center gap-2">
                                    <ZoomableImage src={team.logoUrl} alt="" className="w-6 h-6 object-contain rounded-full bg-slate-200" />
                                    <span className="font-medium truncate max-w-[150px] md:max-w-none">{team.name}</span>
                                </td>
                                {!compact && (
                                    <>
                                        <td className="px-3 py-2 text-center text-slate-500">{team.stats.p}</td>
                                        <td className="px-3 py-2 text-center hidden md:table-cell text-slate-500">{team.stats.w}</td>
                                        <td className="px-3 py-2 text-center hidden md:table-cell text-slate-500">{team.stats.d}</td>
                                        <td className="px-3 py-2 text-center hidden md:table-cell text-slate-500">{team.stats.l}</td>
                                        <td className="px-3 py-2 text-center text-slate-500">{team.stats.gd}</td>
                                    </>
                                )}
                                <td className="px-3 py-2 text-center font-bold text-base">{team.stats.pts}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};