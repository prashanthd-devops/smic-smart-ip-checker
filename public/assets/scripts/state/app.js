window.addEventListener("DOMContentLoaded", () => {
    const state = getState();
    if (state.dashboard?.activePage) {
        pageView(state.dashboard.activePage);
    }
});