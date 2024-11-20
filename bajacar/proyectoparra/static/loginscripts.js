document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (result.success) {
            // Redirigir o mostrar éxito
            window.location.href = '/pagina.html';
        } else {
            // Mostrar error
            errorMessage.textContent = result.message;
            errorMessage.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorMessage.textContent = 'Error al intentar iniciar sesión.';
        errorMessage.style.display = 'block';
    }
});
