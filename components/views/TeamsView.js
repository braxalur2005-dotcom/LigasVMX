const TeamsView = ({ teams, onSelectTeam }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {teams.map(team => (
                <div 
                    key={team.id} 
                    onClick={() => onSelectTeam(team)}
                    className="card hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center text-center p-6 border-transparent hover:border-blue-500/20"
                >
                    <div className="w-20 h-20 mb-4 relative transition-transform group-hover:scale-110 duration-200">
                        <ZoomableImage src={team.logoUrl} className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors">
                        {team.name}
                    </h3>
                    <div className="mt-2 text-xs text-slate-500 uppercase tracking-wide">
                        {team.titles} Títulos
                    </div>
                </div>
            ))}
        </div>
    );
};