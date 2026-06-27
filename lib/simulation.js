// Simulation Logic 2.0 - Deterministic Time & Rich Events

// Constants for Time Mapping
const REAL_MS_FIRST_HALF = 60 * 1000; // 1 minute
const REAL_MS_HALF_TIME = 30 * 1000;  // 30 seconds
const REAL_MS_SECOND_HALF = 60 * 1000; // 1 minute
const TOTAL_DURATION = REAL_MS_FIRST_HALF + REAL_MS_HALF_TIME + REAL_MS_SECOND_HALF;

// Event Probabilities (per match)
const EVENT_CHANCES = {
    GOAL: 2.5, // Avg goals per match
    YELLOW: 3.5,
    RED: 0.2,
    CORNER: 8,
    FOUL: 12,
    OFFSIDE: 2
};

// Generate Single Round Robin Schedule
const generateSchedule = (teams) => {
    const schedule = [];
    const n = teams.length;
    let leagueTeams = [...teams];
    const isOdd = n % 2 !== 0;
    if (isOdd) leagueTeams.push({ id: 'BYE' }); 

    const numTeams = leagueTeams.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    for (let round = 0; round < numRounds; round++) {
        const currentRoundMatches = [];
        for (let match = 0; match < matchesPerRound; match++) {
            const home = leagueTeams[match];
            const away = leagueTeams[numTeams - 1 - match];

            if (home.id !== 'BYE' && away.id !== 'BYE') {
                currentRoundMatches.push({
                    id: generateId(),
                    homeId: home.id,
                    awayId: away.id,
                    homeScore: 0,
                    awayScore: 0,
                    status: 'SCHEDULED', 
                    minute: 0,
                    events: [],
                    timeline: null, // Will store pre-calculated events
                    startTime: null
                });
            }
        }
        schedule.push(currentRoundMatches);
        leagueTeams = [leagueTeams[0], ...leagueTeams.slice(-1), ...leagueTeams.slice(1, -1)];
    }
    return schedule;
};

// Pre-calculate timeline for a match (Deterministic Outcome)
const generateMatchTimeline = (match) => {
    const events = [];
    const matchId = match.id;
    
    // Helper to add random events
    const addEvents = (type, count, teamIdFn) => {
        for(let i=0; i<count; i++) {
            // Random time between 0 and 90 (virtual)
            // Map to Real Time Ms
            const virtualMinute = Math.floor(Math.random() * 90) + 1;
            let realTimeOffset = 0;
            
            if (virtualMinute <= 45) {
                realTimeOffset = (virtualMinute / 45) * REAL_MS_FIRST_HALF;
            } else {
                realTimeOffset = REAL_MS_FIRST_HALF + REAL_MS_HALF_TIME + ((virtualMinute - 45) / 45) * REAL_MS_SECOND_HALF;
            }
            
            // Add some randomness to realTimeOffset so events don't strictly align to minute boundaries
            realTimeOffset += (Math.random() * 1000) - 500;

            events.push({
                type,
                minute: virtualMinute,
                realTimeOffset: Math.floor(realTimeOffset),
                teamId: teamIdFn ? teamIdFn() : null,
                text: getEventText(type)
            });
        }
    };

    // Goals (Poisson-ish distribution via simple random count)
    const totalGoals = Math.floor(Math.random() * 5); // 0-4 goals roughly
    // Bias slightly?
    addEvents('goal', totalGoals, () => Math.random() > 0.5 ? match.homeId : match.awayId);

    // Cards
    addEvents('card_yellow', Math.floor(Math.random() * 5), () => Math.random() > 0.5 ? match.homeId : match.awayId);
    addEvents('card_red', Math.random() < 0.2 ? 1 : 0, () => Math.random() > 0.5 ? match.homeId : match.awayId);
    
    // Others
    addEvents('corner', Math.floor(Math.random() * 10), () => Math.random() > 0.5 ? match.homeId : match.awayId);
    addEvents('foul', Math.floor(Math.random() * 15), () => Math.random() > 0.5 ? match.homeId : match.awayId);

    // Sort by real time
    return events.sort((a,b) => a.realTimeOffset - b.realTimeOffset);
};

const getEventText = (type) => {
    const texts = {
        goal: ['¡GOLAZO!', 'Tiro potente y gol', 'Cabezazo letal', 'Gol de rebote', 'Definición sutil'],
        card_yellow: ['Falta táctica', 'Entrada tardía', 'Protesta al árbitro', 'Mano intencional'],
        card_red: ['Entrada violenta', 'Agresión', 'Doble amarilla', 'Último recurso'],
        corner: ['Tiro de esquina', 'Balón desviado a córner'],
        foul: ['Falta en medio campo', 'Empujón', 'Zancadilla'],
        offside: ['Fuera de juego', 'Posición adelantada']
    };
    const list = texts[type] || ['Evento'];
    return list[Math.floor(Math.random() * list.length)];
};

const initializeSeason = (teams) => {
    // Group teams
    const leagueMap = {}; 
    teams.forEach(t => {
        if (!leagueMap[t.leagueId]) leagueMap[t.leagueId] = [];
        leagueMap[t.leagueId].push(t);
    });

    let allMatches = [];

    // Helper to schedule a list of match objects
    const scheduleMatches = (matchesToSchedule) => {
        const now = new Date();
        // Start from tomorrow 9 AM
        let scheduleDate = new Date(now);
        scheduleDate.setDate(scheduleDate.getDate() + 1);
        scheduleDate.setHours(9, 0, 0, 0);

        let matchesScheduledToday = 0;
        
        matchesToSchedule.forEach(m => {
            // Assign time
            // Random time between 9:00 (current scheduleDate) and 22:30
            // Actually, requirement says "Max 3 matches per day". 
            // So strictly 3 matches per day.
            
            if (matchesScheduledToday >= 3) {
                // Next day
                scheduleDate.setDate(scheduleDate.getDate() + 1);
                scheduleDate.setHours(9, 0, 0, 0);
                matchesScheduledToday = 0;
            }

            // Randomize hour within 09:00 - 22:30
            // 9am is base. 22:30 is 13.5 hours later.
            const randomOffsetMinutes = Math.floor(Math.random() * (13.5 * 60));
            const matchTime = new Date(scheduleDate.getTime() + randomOffsetMinutes * 60000);

            m.startTime = matchTime.toISOString();
            matchesScheduledToday++;
        });
    };

    // 1. Generate all rounds for all leagues
    let globalMatchPool = [];

    // Leagues 1-5
    for (let i = 1; i <= 5; i++) {
        const lgTeams = leagueMap[i];
        if (lgTeams) {
            const rounds = generateSchedule(lgTeams);
            rounds.forEach((roundMatches, rIdx) => {
                roundMatches.forEach(m => {
                    m.leagueId = i;
                    m.round = rIdx + 1;
                    globalMatchPool.push(m);
                });
            });
        }
    }

    // League 6
    const lg6Teams = leagueMap[6];
    if (lg6Teams) {
        const groupMap = {};
        lg6Teams.forEach(t => {
            if(!groupMap[t.groupId]) groupMap[t.groupId] = [];
            groupMap[t.groupId].push(t);
        });
        Object.keys(groupMap).forEach(gId => {
            const grpTeams = groupMap[gId];
            const rounds = generateSchedule(grpTeams);
            rounds.forEach((roundMatches, rIdx) => {
                roundMatches.forEach(m => {
                    m.leagueId = 6;
                    m.groupId = parseInt(gId);
                    m.round = rIdx + 1;
                    globalMatchPool.push(m);
                });
            });
        });
    }

    // 2. Schedule them
    // Sort logic? We probably want round 1 of all leagues first, then round 2, etc.
    // But "Max 3 matches per day" total? Or per league? 
    // Requirement: "fechas máximo 3 partidos por dia". Typically implies total global if not specified, 
    // but 3 matches/day for 6 leagues (approx 1000 matches) would take 333 days (1 year). 
    // That seems realistic for a "Real" league but maybe too slow for a game? 
    // User wants "partidos mas realistas". Let's stick to 3 per day globally to be safe, or per league?
    // Let's assume 3 matches PER LEAGUE per day is safer for gameplay flow, 
    // BUT user said "3 partidos por dia" (singular). I will implement 3 global matches per day to strictly follow "3 partidos por dia".
    // This makes the season long, which is fine for "realistic".
    // We will shuffle the pool to mix leagues? Or do Round 1 L1, Round 1 L2...
    // Let's sort by Round then League.
    globalMatchPool.sort((a,b) => {
        if (a.round !== b.round) return a.round - b.round;
        return a.leagueId - b.leagueId;
    });

    scheduleMatches(globalMatchPool);
    return globalMatchPool;
};

// Main Update Function called by Loop
const updateMatchState = (match, now) => {
    if (match.status === 'FINISHED') return match;

    const startTime = new Date(match.startTime).getTime();
    const elapsed = now - startTime;

    // Match hasn't started
    if (elapsed < 0) return match;

    // Match Start / Init Logic
    let currentMatch = { ...match };
    if (!currentMatch.timeline) {
        currentMatch.timeline = generateMatchTimeline(currentMatch);
        currentMatch.status = 'LIVE';
    }

    // Determine State based on Elapsed Real Time
    // 0 -> REAL_MS_FIRST_HALF : First Half
    // REAL_MS_FIRST_HALF -> +HALF_TIME : Break
    // ... -> Total : Second Half
    
    let virtualMinute = 0;
    let isBreak = false;
    let isFinished = false;

    // Calculate extra time based on events (5 fouls or 1 red = 1 sec extra)
    // We need to count fouls/reds that happened BEFORE current elapsed time to adjust Duration?
    // Complexity: High. Simplified: Calculate total extra time at end of simulation generation 
    // and add it to TOTAL_DURATION dynamically?
    // Let's stick to fixed duration for simplicity + small buffer.
    
    // Count events for extra time
    // We only know events that *have occurred*.
    // Actually, generating the timeline upfront allows us to know total events.
    const reds = currentMatch.timeline.filter(e => e.type === 'card_red').length;
    const fouls = currentMatch.timeline.filter(e => e.type === 'foul').length;
    const extraSeconds = reds + Math.floor(fouls / 5);
    const extraTimeMs = extraSeconds * 1000;

    const adjustedTotalDuration = TOTAL_DURATION + extraTimeMs;

    if (elapsed >= adjustedTotalDuration) {
        isFinished = true;
        virtualMinute = 90; // + added time
    } else if (elapsed <= REAL_MS_FIRST_HALF) {
        // 1st Half: Map 0-1m Real to 0-45m Virtual
        virtualMinute = Math.floor((elapsed / REAL_MS_FIRST_HALF) * 45);
        if (virtualMinute < 0) virtualMinute = 0;
    } else if (elapsed <= REAL_MS_FIRST_HALF + REAL_MS_HALF_TIME) {
        // Break
        isBreak = true;
        virtualMinute = 45;
    } else {
        // 2nd Half: Map remaining time to 45-90
        const secondHalfElapsed = elapsed - (REAL_MS_FIRST_HALF + REAL_MS_HALF_TIME);
        const secondHalfDuration = adjustedTotalDuration - (REAL_MS_FIRST_HALF + REAL_MS_HALF_TIME);
        virtualMinute = 45 + Math.floor((secondHalfElapsed / secondHalfDuration) * 45);
        if (virtualMinute > 90) virtualMinute = 90;
    }

    // Reveal Events
    const visibleEvents = currentMatch.timeline.filter(e => e.realTimeOffset <= elapsed);
    
    // Update Score
    const homeGoals = visibleEvents.filter(e => e.type === 'goal' && e.teamId === currentMatch.homeId).length;
    const awayGoals = visibleEvents.filter(e => e.type === 'goal' && e.teamId === currentMatch.awayId).length;

    currentMatch.minute = virtualMinute;
    currentMatch.homeScore = homeGoals;
    currentMatch.awayScore = awayGoals;
    currentMatch.events = visibleEvents;
    currentMatch.isBreak = isBreak; // UI can show "Entretiempo"

    if (isFinished) {
        currentMatch.status = 'FINISHED';
        currentMatch.minute = 90; // Final
    }

    return currentMatch;
};

const fastSimulateMatch = (match) => {
    // Generate timeline immediately and jump to end
    const timeline = generateMatchTimeline(match);
    const homeGoals = timeline.filter(e => e.type === 'goal' && e.teamId === match.homeId).length;
    const awayGoals = timeline.filter(e => e.type === 'goal' && e.teamId === match.awayId).length;
    
    return {
        ...match,
        homeScore: homeGoals,
        awayScore: awayGoals,
        status: 'FINISHED',
        minute: 90,
        events: timeline,
        timeline: timeline
    };
};

const calculateStandings = (matches, teams) => {
    const teamStats = {};
    teams.forEach(t => {
        teamStats[t.id] = {
            ...t,
            stats: { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
        };
    });

    matches.forEach(m => {
        if (m.status === 'FINISHED') {
            const h = teamStats[m.homeId];
            const a = teamStats[m.awayId];
            
            if (h && a) {
                h.stats.p++;
                a.stats.p++;
                h.stats.gf += m.homeScore;
                h.stats.ga += m.awayScore;
                a.stats.gf += m.awayScore;
                a.stats.ga += m.homeScore;
                h.stats.gd = h.stats.gf - h.stats.ga;
                a.stats.gd = a.stats.gf - a.stats.ga;

                if (m.homeScore > m.awayScore) {
                    h.stats.w++;
                    h.stats.pts += 3;
                    a.stats.l++;
                } else if (m.homeScore < m.awayScore) {
                    a.stats.w++;
                    a.stats.pts += 3;
                    h.stats.l++;
                } else {
                    h.stats.d++;
                    a.stats.d++;
                    h.stats.pts += 1;
                    a.stats.pts += 1;
                }
            }
        }
    });

    return Object.values(teamStats).sort((a, b) => {
        if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
        if (b.stats.gd !== a.stats.gd) return b.stats.gd - a.stats.gd;
        if (b.stats.gf !== a.stats.gf) return b.stats.gf - a.stats.gf;
        return a.name.localeCompare(b.name);
    });
};