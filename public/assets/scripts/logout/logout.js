function logout() {
    if (confirm("Are you sure you want to logout?")) {
        clearState();
        window.location.href = "/logout";
    }
}