document.getElementById('generateTeams').addEventListener('click', function() {
    const playersInput = document.getElementById('players').value.trim();
    const players = playersInput.split(/\n|,/).map(player => player.trim()).filter(player => player !== '');

    const totalPlayers = players.length;
    const numberOfTeams = parseInt(document.getElementById('teamNumber').value);
    const teamSize = parseInt(document.getElementById('teamSize').value);

    if (numberOfTeams <= 0 || teamSize <= 0) {
        alert('Por favor ingresa un número válido de equipos y tamaño de equipo.');
        return;
    }

    const minPlayersNeeded = numberOfTeams * teamSize;
    
    if (totalPlayers < minPlayersNeeded) {
        alert(`La cantidad de jugadores es insuficiente. Necesitas al menos ${minPlayersNeeded} jugadores para formar ${numberOfTeams} equipos de ${teamSize} jugadores.`);
        return;
    }

    shuffle(players);
    const teams = [];

    for (let i = 0; i < numberOfTeams; i++) {
        teams.push([]);
    }

    for (let i = 0; i < totalPlayers; i++) {
        teams[i % numberOfTeams].push(players[i]);
    }

    displayTeams(teams);
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayTeams(teams) {
    const teamsContainer = document.getElementById('teamsContainer');
    teamsContainer.innerHTML = '';

    // Lista de imágenes disponibles
    const imagePaths = [
        'img/team1.jpg',
        'img/team2.jpg'
    ];

    // Mezclar aleatoriamente la lista de imágenes
    shuffle(imagePaths);

    teams.forEach((team, index) => {
        const teamElement = document.createElement('div');
        teamElement.classList.add('team');

        // Agregar título del equipo
        const title = document.createElement('h3');
        title.textContent = `Equipo ${index + 1}`;
        teamElement.appendChild(title);

        // Agregar lista de jugadores
        const teamList = document.createElement('p');
        teamList.textContent = team.join(', ');
        teamElement.appendChild(teamList);

        // Asignar imagen aleatoria desde la lista mezclada
        if (imagePaths.length > 0) {
            const image = document.createElement('img');
            image.src = imagePaths.pop(); // Toma y elimina la última imagen del array
            image.alt = `Imagen del Equipo ${index + 1}`;
            image.classList.add('team-image');
            teamElement.appendChild(image);
        }

        teamsContainer.appendChild(teamElement);
    });
}
