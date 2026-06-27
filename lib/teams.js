// Mock Data Generation
// Since we don't have the original file, we generate realistic data.

const LEAGUE_NAMES = [
    "Liga Premier MX",
    "Liga de Expansión",
    "Segunda División",
    "Tercera División",
    "Cuarta División",
    "Liga ANBMX" // League 6
];

const generateTeams = () => {
    const teams = [];
    
    // Leagues 1-5 (20 teams each)
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 20; j++) {
            teams.push({
                id: `l${i+1}-t${j+1}`,
                name: `Club ${LEAGUE_NAMES[i].split(' ')[1]} FC ${j+1}`,
                leagueId: i + 1,
                logoUrl: `https://ui-avatars.com/api/?name=C${j+1}&background=random&color=fff&size=128`,
                titles: 0,
                stats: { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
            });
        }
    }

    // League 6 (40 teams, 8 groups of 5)
    for (let g = 0; g < 8; g++) {
        for (let t = 0; t < 5; t++) {
             teams.push({
                id: `l6-g${g+1}-t${t+1}`,
                name: `ANBMX Grp${g+1} Team ${t+1}`,
                leagueId: 6,
                groupId: g + 1,
                logoUrl: `https://ui-avatars.com/api/?name=A${g+1}&background=random&color=fff&size=128`,
                titles: 0,
                stats: { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
            });
        }
    }

    return teams;
};

const INITIAL_TEAMS = generateTeams();