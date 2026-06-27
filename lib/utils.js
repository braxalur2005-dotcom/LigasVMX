// Basic utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date) => {
    return new Date(date).toLocaleString('es-MX', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const playSound = (type) => {
    // Placeholder for sound effects
    // console.log(`Playing sound: ${type}`);
};

// Simple storage wrapper for local cache
const storage = {
    get: (key, def) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : def;
        } catch (e) {
            console.error('Storage Get Error', e);
            return def;
        }
    },
    set: (key, val) => {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error('Storage Set Error', e);
        }
    }
};

// Image Compression utility
const compressImage = (dataUrl, maxWidth = 200, quality = 0.7) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            if (img.width <= maxWidth) {
                resolve(dataUrl);
                return;
            }
            const canvas = document.createElement('canvas');
            const scaleSize = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
    });
};

// Database synchronizer
const DB_OBJECT_TYPE = 'lvmx_app_data';
let saveTimeout = null;

const dbSync = {
    load: async () => {
        try {
            if (typeof trickleListObjects === 'undefined') return null;
            const res = await trickleListObjects(DB_OBJECT_TYPE, 1, false);
            if (res.items && res.items.length > 0) {
                const obj = res.items[0];
                return {
                    dbId: obj.objectId,
                    teams: obj.objectData.teams_data ? JSON.parse(obj.objectData.teams_data) : null,
                    matches: obj.objectData.matches_data ? JSON.parse(obj.objectData.matches_data) : null,
                    settings: obj.objectData.settings_data ? JSON.parse(obj.objectData.settings_data) : null
                };
            }
        } catch (e) {
            console.error('DB Load Error', e);
        }
        return null;
    },
    save: async (dbId, teams, matches, settings, instant = false) => {
        const doSave = async () => {
            try {
                if (typeof trickleCreateObject === 'undefined') return;
                
                // Optimize matches data (remove heavy timelines if not needed or just stringify)
                // We keep it simple for now, but ensure it doesn't fail
                const payload = {
                state_id: 'global_state',
                teams_data: teams ? JSON.stringify(teams) : null,
                    matches_data: matches ? JSON.stringify(matches) : null,
                    settings_data: settings ? JSON.stringify(settings) : null
                };
                
                if (dbId) {
                    await trickleUpdateObject(DB_OBJECT_TYPE, dbId, payload);
                } else {
                    await trickleCreateObject(DB_OBJECT_TYPE, payload);
                }
            } catch (e) {
                console.error('DB Save Error', e);
            }
        };

        if (instant) {
            if (saveTimeout) clearTimeout(saveTimeout);
            await doSave();
        } else {
            if (saveTimeout) clearTimeout(saveTimeout);
            saveTimeout = setTimeout(doSave, 3000); // Debounce for 3 seconds
        }
    }
};
