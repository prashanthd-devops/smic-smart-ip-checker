const STORAGE_KEY = "smic-dashboard";

function getState() {
    const state = sessionStorage.getItem(STORAGE_KEY);
    return state ? JSON.parse(state) : {};
}

function saveState(state) {
    sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}

function updateState(section, data) {
    const state = getState();
    state[section] = {
        ...state[section],
        ...data
    };
    saveState(state);
}

function clearState() {
    sessionStorage.removeItem(STORAGE_KEY);
}