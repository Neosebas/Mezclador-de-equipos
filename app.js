// ===================== FUNCIONES COMUNES =====================

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayTeams(teams) {
    const teamsContainer = document.getElementById('teamsContainer');
    teamsContainer.innerHTML = '';

    const imagePaths = ['img/team1.webp', 'img/team2.webp'];
    shuffle(imagePaths);

    teams.forEach((team, index) => {
        const teamElement = document.createElement('div');
        teamElement.classList.add('team');

        const title = document.createElement('h3');
        title.textContent = `Equipo ${index + 1}`;
        teamElement.appendChild(title);

        const teamList = document.createElement('p');
        teamList.textContent = team.join(', ');
        teamElement.appendChild(teamList);

        if (imagePaths.length > 0) {
            const image = document.createElement('img');
            image.src = imagePaths.pop();
            image.alt = `Imagen del Equipo ${index + 1}`;
            image.classList.add('team-image');
            teamElement.appendChild(image);
        }

        teamsContainer.appendChild(teamElement);
    });
}

// ===================== INICIO GLOBAL =====================

document.addEventListener("DOMContentLoaded", () => {

    // ===================== SORTEO =====================

const botonGenerar = document.getElementById('generateTeams');
if (botonGenerar) {
    botonGenerar.addEventListener('click', () => {
        const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
        if (!usuario) {
            alert("No hay usuario logueado.");
            return;
        }

        const jugadoresKey = `jugadores_${usuario.email}`;
        const jugadores = JSON.parse(localStorage.getItem(jugadoresKey)) || [];

        const jugadoresActivos = jugadores.filter(j => j.activo ?? true);
        if (jugadoresActivos.length === 0) {
            alert("No hay jugadores activos seleccionados.");
            return;
        }

        const numberOfTeams = parseInt(document.getElementById('teamNumber').value);
        const teamSize = parseInt(document.getElementById('teamSize').value);
        const totalPlayers = jugadoresActivos.length;

        if (numberOfTeams <= 0 || teamSize <= 0) {
            alert('Por favor ingresa un número válido de equipos y tamaño de equipo.');
            return;
        }

        const minPlayersNeeded = numberOfTeams * teamSize;
        if (totalPlayers < minPlayersNeeded) {
            alert(`La cantidad de jugadores es insuficiente. Necesitas al menos ${minPlayersNeeded} jugadores para formar ${numberOfTeams} equipos de ${teamSize} jugadores.`);
            return;
        }

        // Ordenar jugadores de mayor a menor nivel
        jugadoresActivos.sort((a, b) => b.nivel - a.nivel);

        // Crear equipos vacíos
        const teams = Array.from({ length: numberOfTeams }, () => []);

        // Distribución zigzag para balancear los niveles
        let forward = true;
        let teamIndex = 0;

        for (const jugador of jugadoresActivos) {
            teams[teamIndex].push(jugador.nombre);

            if (forward) {
                teamIndex++;
                if (teamIndex >= numberOfTeams) {
                    teamIndex = numberOfTeams - 1;
                    forward = false;
                }
            } else {
                teamIndex--;
                if (teamIndex < 0) {
                    teamIndex = 0;
                    forward = true;
                }
            }
        }

        displayTeams(teams);
    });
}


    // ===================== CARGA DE JUGADORES =====================

    const formJugador = document.getElementById("formJugador");
    const listaJugadores = document.getElementById("listaJugadores");

    const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (usuario) {
        const jugadoresKey = `jugadores_${usuario.email}`;
        const jugadores = JSON.parse(localStorage.getItem(jugadoresKey)) || [];

        function guardarJugadores() {
            localStorage.setItem(jugadoresKey, JSON.stringify(jugadores));
        }

        function mostrarJugadores() {
            listaJugadores.innerHTML = "";

            jugadores.forEach((j, i) => {
                const li = document.createElement("li");

                // Checkbox de participación
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = j.activo ?? true;
                checkbox.addEventListener("change", () => {
                    jugadores[i].activo = checkbox.checked;
                    guardarJugadores();
                });

                // Nombre + Nivel
                const label = document.createElement("span");
                label.textContent = ` ${j.nombre} (Nivel ${j.nivel})`;

                // Botón de eliminar individual
                const btnEliminar = document.createElement("button");
                btnEliminar.textContent = "🗑️";
                btnEliminar.title = "Eliminar jugador";
                btnEliminar.style.marginLeft = "10px";
                btnEliminar.addEventListener("click", () => {
                    if (confirm(`¿Eliminar a ${j.nombre}?`)) {
                        jugadores.splice(i, 1);
                        guardarJugadores();
                        mostrarJugadores();
                    }
                });

                li.appendChild(checkbox);
                li.appendChild(label);
                li.appendChild(btnEliminar);
                listaJugadores.appendChild(li);
            });

            // Botón para eliminar todo el plantel
            if (jugadores.length > 0) {
                const btnEliminarTodos = document.createElement("button");
                btnEliminarTodos.textContent = "Eliminar todo el plantel";
                btnEliminarTodos.style.marginTop = "10px";
                btnEliminarTodos.addEventListener("click", () => {
                    if (confirm("¿Estás seguro que querés eliminar todos los jugadores?")) {
                        jugadores.length = 0;
                        guardarJugadores();
                        mostrarJugadores();
                    }
                });

                listaJugadores.appendChild(btnEliminarTodos);
            }
        }

        if (formJugador) {
            formJugador.addEventListener("submit", (e) => {
                e.preventDefault();
                const nombre = document.getElementById("nombreJugador").value.trim();
                const nivel = parseInt(document.getElementById("nivelJugador").value);
                if (nombre === "") return;
                jugadores.push({ nombre, nivel, activo: true });
                guardarJugadores();
                mostrarJugadores();
                formJugador.reset();
            });
        }

        mostrarJugadores();
    }

    // ===================== LOGIN Y REGISTRO =====================

    const formRegistro = document.getElementById("formRegistro");
    const formLogin = document.getElementById("formLogin");

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            if (usuarios.find(u => u.email === email)) {
                alert("El email ya está registrado.");
                return;
            }

            const passwordHash = await hashPassword(password);
            usuarios.push({ nombre, email, passwordHash });
            localStorage.setItem("usuarios", JSON.stringify(usuarios));

            alert("Registro exitoso. Iniciá sesión.");
            window.location.href = "login.html";
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("emailLogin").value;
            const password = document.getElementById("passwordLogin").value;

            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const usuario = usuarios.find(u => u.email === email);
            if (!usuario) {
                alert("Usuario no encontrado.");
                return;
            }

            const passwordHash = await hashPassword(password);
            if (usuario.passwordHash !== passwordHash) {
                alert("Contraseña incorrecta.");
                return;
            }

            localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));
            alert("Bienvenido, " + usuario.nombre);
            window.location.href = "index.html";
        });
    }
});
