document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("name").value.trim();
    const password = document.getElementById("pwd").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = "/dashboard";
            } else {
                alert(result.message);
            }

        } catch (err) {
            console.error(err);
            alert("Unable to connect to the server.");
        }
});