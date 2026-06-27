// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="icon-triangle-alert text-red-600 w-8 h-8"></div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Algo salió mal</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">La aplicación encontró un error inesperado.</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary mx-auto">
                    Recargar Aplicación
                </button>
            </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

// Main App Component
function App() {
    // --- State ---
    const [teams, setTeams] = React.useState([]);
    const [matches, setMatches] = React.useState([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [dbId, setDbId] = React.useState(null);
    
    const [zoomedImage, setZoomedImage] = React.useState(null);

    // Navigation State
    const [currentLeague, setCurrentLeague] = React.useState(1);
    const [currentSection, setCurrentSection] = React.useState('STANDINGS'); // STANDINGS, FIXTURES, LIVE, RESULTS, PLAYOFFS, TEAMS, PROMOTION
    const [activeView, setActiveView] = React.useState('LEAGUE'); // LEAGUE, MATCH_DETAIL, TEAM_DETAIL
    const [selectedEntity, setSelectedEntity] = React.useState(null); // match object or team object

    // Admin State
    const [adminMode, setAdminMode] = React.useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);
    const [editingTeam, setEditingTeam] = React.useState(null);
    const [leagueNames, setLeagueNames] = React.useState(LEAGUE_NAMES);
    const [appLogo, setAppLogo] = React.useState('');

    // Image Zoom Listener
    React.useEffect(() => {
        const handleZoom = (e) => setZoomedImage(e.detail);
        window.addEventListener('zoom-image', handleZoom);
        return () => window.removeEventListener('zoom-image', handleZoom);
    }, []);

    // --- Initialization ---
    React.useEffect(() => {
        const auth = sessionStorage.getItem('lvmx_admin_auth');
        if (auth === 'true') setIsAdminAuthenticated(true);

        const loadData = async () => {
            const dbData = await dbSync.load();
            if (dbData && dbData.teams && dbData.matches) {
                setDbId(dbData.dbId);
                setTeams(dbData.teams);
                setMatches(dbData.matches);
                if (dbData.settings) {
                    setLeagueNames(dbData.settings.leagueNames || LEAGUE_NAMES);
                    setAppLogo(dbData.settings.appLogo || '');
                } else {
                    setLeagueNames(LEAGUE_NAMES);
                }
            } else {
                // Fallback / Initial setup
                const initialTeams = INITIAL_TEAMS;
                setTeams(initialTeams);
                const initialMatches = initializeSeason(initialTeams);
                setMatches(initialMatches);
                setLeagueNames(LEAGUE_NAMES);
                
                // Save to DB
                await dbSync.save(null, initialTeams, initialMatches, { leagueNames: LEAGUE_NAMES, appLogo: '' }, true);
                const newDbData = await dbSync.load();
                if (newDbData) setDbId(newDbData.dbId);
            }
            setIsLoaded(true);
        };
        loadData();
    }, []);

    // --- Simulation Loop ---
    React.useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            let matchesChanged = false;

            const updatedMatches = matches.map(m => {
                if (m.status === 'FINISHED') return m;
                
                // Use the new updateMatchState from simulation.js
                // It handles start time check and status update internaly
                // But we need to pass current Real Time
                
                // If match is SCHEDULED, check if we should start it (Auto-start)
                const mStart = new Date(m.startTime).getTime();
                if (m.status === 'SCHEDULED' && now >= mStart) {
                    matchesChanged = true;
                    // Auto start
                    return updateMatchState(m, now);
                }

                if (m.status === 'LIVE') {
                    matchesChanged = true;
                    return updateMatchState(m, now);
                }

                return m;
            });

            if (matchesChanged) {
                setMatches(updatedMatches);
                if (dbId) {
                    dbSync.save(dbId, teams, updatedMatches, { leagueNames, appLogo });
                }
            }
        }, 1000); 

        return () => clearInterval(interval);
    }, [matches]);

    // --- Actions ---
    const handleLogin = (pwd) => {
        if (pwd === 'Am3ric42026') {
            setIsAdminAuthenticated(true);
            sessionStorage.setItem('lvmx_admin_auth', 'true');
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleUpdateMatchTime = (matchId, newTimeIso) => {
        const newMatches = matches.map(m => m.id === matchId ? { ...m, startTime: newTimeIso } : m);
        setMatches(newMatches);
        dbSync.save(dbId, teams, newMatches, { leagueNames, appLogo }, true);
    };

    const handleStartMatch = (matchId) => {
        // Forcing start now
        const now = new Date();
        const newMatches = matches.map(m => m.id === matchId ? { ...m, status: 'LIVE', startTime: now.toISOString() } : m);
        setMatches(newMatches);
        dbSync.save(dbId, teams, newMatches, { leagueNames, appLogo }, true);
    };

    const handleGeneratePlayoffs = (leagueId) => {
        const currentLeagueMatches = matches.filter(m => m.leagueId === leagueId && !m.isPlayoff);
        const currentLeagueTeams = teams.filter(t => t.leagueId === leagueId);
        const standings = calculateStandings(currentLeagueMatches, currentLeagueTeams);

        let qualifiedTeams = [];

        if (leagueId === 6) {
            const groupWinners = [];
            for (let g=1; g<=8; g++) {
                const groupTeams = standings.filter(t => t.groupId === g);
                if (groupTeams.length > 0) groupWinners.push(groupTeams[0]);
            }
            groupWinners.sort((a,b) => b.stats.pts - a.stats.pts || b.stats.gd - a.stats.gd);
            qualifiedTeams = groupWinners.slice(0, 8);
        } else {
            qualifiedTeams = standings.slice(0, 8);
        }

        if (qualifiedTeams.length < 8) {
            alert("No hay suficientes equipos para generar liguilla.");
            return;
        }

        const matchups = [
            { home: qualifiedTeams[0], away: qualifiedTeams[7] },
            { home: qualifiedTeams[1], away: qualifiedTeams[6] },
            { home: qualifiedTeams[2], away: qualifiedTeams[5] },
            { home: qualifiedTeams[3], away: qualifiedTeams[4] },
        ];

        const newMatches = [];
        const now = new Date();
        
        matchups.forEach((pair, idx) => {
            newMatches.push({
                id: `po-${leagueId}-qf-${idx}`,
                leagueId: leagueId,
                homeId: pair.home.id,
                awayId: pair.away.id,
                homeScore: 0,
                awayScore: 0,
                status: 'SCHEDULED',
                minute: 0,
                events: [],
                startTime: new Date(now.getTime() + (idx * 5 * 60000)).toISOString(),
                isPlayoff: true,
                playoffRound: 'QUARTERS'
            });
        });

        const updatedMatches = [...matches, ...newMatches];
        setMatches(updatedMatches);
        dbSync.save(dbId, teams, updatedMatches, { leagueNames, appLogo }, true);
    };

    const handleAdvancePlayoffRound = (leagueId, currentRound) => {
        const roundMatches = matches.filter(m => m.leagueId === leagueId && m.isPlayoff && m.playoffRound === currentRound);
        
        if (roundMatches.some(m => m.status !== 'FINISHED')) {
            alert("Todos los partidos de la ronda actual deben terminar antes de avanzar.");
            return;
        }

        const winners = roundMatches.map(m => {
            if (m.homeScore > m.awayScore) return m.homeId;
            if (m.awayScore > m.homeScore) return m.awayId;
            return m.homeId; 
        });

        let nextRound = '';
        let nextMatchups = [];

        if (currentRound === 'QUARTERS') {
            nextRound = 'SEMIS';
            nextMatchups = [
                { homeId: winners[0], awayId: winners[3] },
                { homeId: winners[1], awayId: winners[2] }
            ];

        } else if (currentRound === 'SEMIS') {
            nextRound = 'FINAL';
            nextMatchups = [
                { homeId: winners[0], awayId: winners[1] }
            ];
        } else {
            alert("El torneo ha finalizado!");
            return;
        }

        const newMatches = [];
        const now = new Date();
        nextMatchups.forEach((pair, idx) => {
             newMatches.push({
                id: `po-${leagueId}-${nextRound}-${idx}`,
                leagueId: leagueId,
                homeId: pair.homeId,
                awayId: pair.awayId,
                homeScore: 0,
                awayScore: 0,
                status: 'SCHEDULED',
                minute: 0,
                events: [],
                startTime: new Date(now.getTime() + (10 * 60000)).toISOString(),
                isPlayoff: true,
                playoffRound: nextRound
            });
        });

        const updatedMatches = [...matches, ...newMatches];
        setMatches(updatedMatches);
        dbSync.save(dbId, teams, updatedMatches, { leagueNames, appLogo }, true);
    };

    const handleTeamSave = (updatedTeam) => {
        const newTeams = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
        setTeams(newTeams);
        dbSync.save(dbId, newTeams, matches, { leagueNames, appLogo }, true);
        setEditingTeam(null);
    };

    const handleUpdateSettings = (newLeagueNames, newAppLogo) => {
        setLeagueNames(newLeagueNames);
        setAppLogo(newAppLogo);
        dbSync.save(dbId, teams, matches, { leagueNames: newLeagueNames, appLogo: newAppLogo }, true);
    };

    // --- Navigation Helpers ---
    const openMatchDetail = (match) => {
        setSelectedEntity(match);
        setActiveView('MATCH_DETAIL');
    };

    const openTeamDetail = (team) => {
        setSelectedEntity(team);
        setActiveView('TEAM_DETAIL');
    };

    const goBack = () => {
        setActiveView('LEAGUE');
        setSelectedEntity(null);
    };

    // --- Data Filtering ---
    const teamsMap = React.useMemo(() => {
        return teams.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
    }, [teams]);

    const currentLeagueTeams = React.useMemo(() => {
        return calculateStandings(matches, teams).filter(t => t.leagueId === currentLeague);
    }, [matches, teams, currentLeague]);

    const currentLeagueMatches = matches.filter(m => m.leagueId === currentLeague);

    // --- Renders ---
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
                <div className="icon-loader w-10 h-10 animate-spin mb-4 text-blue-500"></div>
                <p className="font-medium">Sincronizando con el servidor...</p>
            </div>
        );
    }
    
    // 1. Detailed Views
    if (activeView === 'MATCH_DETAIL' && selectedEntity) {
        const currentMatch = matches.find(m => m.id === selectedEntity.id) || selectedEntity;
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
                 <MatchDetailView match={currentMatch} teamsMap={teamsMap} onBack={goBack} />
            </div>
        );
    }

    if (activeView === 'TEAM_DETAIL' && selectedEntity) {
        const currentTeam = teams.find(t => t.id === selectedEntity.id) || selectedEntity;
        return (
             <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
                 <TeamDetailView team={currentTeam} matches={matches} allTeams={teams} onBack={goBack} />
            </div>
        );
    }

    // 2. Main League View
    return (
        <div className="min-h-screen flex flex-col pb-20">
            {/* Header */}
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {appLogo ? (
                                <ZoomableImage src={appLogo} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-lg bg-white p-0.5" />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                                    LV
                                </div>
                            )}
                            <h1 className="text-xl font-display font-bold hidden md:block tracking-tight">Ligas Virtuales MX</h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <button 
                                className={`p-2 rounded-full hover:bg-slate-800 transition-colors ${adminMode ? 'text-yellow-400 bg-white/10' : 'text-slate-400'}`}
                                onClick={() => setAdminMode(!adminMode)}
                                title="Modo Administrador"
                            >
                                <div className="icon-shield w-5 h-5"></div>
                            </button>
                        </div>
                    </div>

                    {/* League Selector (Scrollable) */}
                    <div className="flex overflow-x-auto gap-1 pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {leagueNames.map((name, idx) => {
                            const id = idx + 1;
                            const isActive = currentLeague === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setCurrentLeague(id)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                        isActive 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Section Navigation */}
            <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-[108px] md:top-[108px] z-40 shadow-sm">
                <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
                    <nav className="flex space-x-2">
                        {[
                            { id: 'STANDINGS', label: 'Tabla' },
                            { id: 'FIXTURES', label: 'Enfrentamientos' },
                            { id: 'LIVE', label: 'En Vivo' },
                            { id: 'RESULTS', label: 'Resultados' },
                            { id: 'PLAYOFFS', label: 'Liguilla' },
                            { id: 'PROMOTION', label: 'Ascenso y Descenso' },
                            { id: 'TEAMS', label: 'Equipos' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentSection(item.id)}
                                className={`nav-item whitespace-nowrap ${currentSection === item.id ? 'active' : ''}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-4 py-8 flex-grow animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Admin Panel (Conditional) */}
                {adminMode && (
                    <div className="mb-8">
                        <AdminPanel 
                            isAuthenticated={isAdminAuthenticated}
                            onLogin={handleLogin}
                            onSimulateRound={() => alert("Los partidos son programados automáticamente.")}
                            onResetSeason={async () => {
                                if(confirm('¿Reiniciar temporada?')) {
                                    const initialTeams = INITIAL_TEAMS;
                                    const initialMatches = initializeSeason(initialTeams);
                                    await dbSync.save(dbId, initialTeams, initialMatches, { leagueNames: LEAGUE_NAMES, appLogo: '' }, true);
                                    window.location.reload(); 
                                }
                            }}
                            onEditTeam={setEditingTeam}
                            teams={teams}
                            leagueNames={leagueNames}
                            appLogo={appLogo}
                            onUpdateSettings={handleUpdateSettings}
                        />
                    </div>
                )}

                {/* Section Content */}
                {currentSection === 'STANDINGS' && (
                    <div className="card">
                         {currentLeague === 6 ? (
                             <div className="space-y-8">
                                {[1,2,3,4,5,6,7,8].map(gId => (
                                    <div key={gId}>
                                        <h3 className="text-lg font-bold mb-3 pb-2 border-b dark:border-slate-800">Grupo {gId}</h3>
                                        <LeagueTable teams={currentLeagueTeams.filter(t => t.groupId === gId)} />
                                    </div>
                                ))}
                             </div>
                         ) : (
                             <LeagueTable teams={currentLeagueTeams} />
                         )}
                    </div>
                )}

                {currentSection === 'FIXTURES' && (
                    <FixturesView 
                        matches={currentLeagueMatches} 
                        teamsMap={teamsMap} 
                        adminMode={adminMode && isAdminAuthenticated} 
                        onUpdateMatchTime={handleUpdateMatchTime}
                        onStartMatch={handleStartMatch}
                    />
                )}

                {currentSection === 'LIVE' && (
                    <LiveResultsView 
                        matches={currentLeagueMatches.filter(m => m.status === 'LIVE')} 
                        teamsMap={teamsMap} 
                        type="LIVE" 
                        onViewDetail={openMatchDetail}
                    />
                )}

                {currentSection === 'RESULTS' && (
                    <LiveResultsView 
                        matches={currentLeagueMatches.filter(m => m.status === 'FINISHED')} 
                        teamsMap={teamsMap} 
                        type="RESULTS" 
                        onViewDetail={openMatchDetail}
                    />
                )}

                {currentSection === 'PLAYOFFS' && (
                    <PlayoffsView 
                        leagueId={currentLeague} 
                        matches={matches} 
                        teams={teamsMap} 
                        adminMode={adminMode && isAdminAuthenticated}
                        onGeneratePlayoffs={handleGeneratePlayoffs}
                        onAdvanceRound={handleAdvancePlayoffRound}
                        onStartMatch={handleStartMatch}
                        onViewDetail={openMatchDetail}
                    />
                )}

                {currentSection === 'PROMOTION' && (
                     <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <div className="text-center space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <div className="icon-arrow-up-down w-10 h-10 text-blue-500"></div>
                            </div>
                            <h2 className="text-2xl font-bold">Ascenso y Descenso</h2>
                            <p className="text-slate-500">
                                La temporada regular y la liguilla deben finalizar para habilitar la fase de ascenso y descenso.
                            </p>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded text-sm border border-yellow-200 dark:border-yellow-900/50">
                                Próximamente disponible al finalizar el torneo.
                            </div>
                        </div>
                    </div>
                )}

                {currentSection === 'TEAMS' && (
                    <TeamsView 
                        teams={currentLeagueTeams} 
                        onSelectTeam={openTeamDetail} 
                    />
                )}
            </main>

            {/* Team Editor Modal */}
            <Modal isOpen={!!editingTeam} onClose={() => setEditingTeam(null)} title="Editar Equipo">
                {editingTeam && (
                    <TeamEditor 
                        team={editingTeam} 
                        onSave={handleTeamSave} 
                        onCancel={() => setEditingTeam(null)} 
                    />
                )}
            </Modal>

            {/* Global Image Viewer */}
            <ImageViewer src={zoomedImage} onClose={() => setZoomedImage(null)} />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);