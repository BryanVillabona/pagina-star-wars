async function getNameFromUrl(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.name || data.title || 'Desconocido';
  } catch (error) {
    return 'Desconocido';
  }
}

async function enrichPerson(item) {
  const species = item.species.length ? await getNameFromUrl(item.species[0]) : 'Desconocida';
  const homeworld = await getNameFromUrl(item.homeworld);
  return { ...item, speciesName: species, homeworldName: homeworld };
}

async function enrichPlanet(item) {
  const residents = item.residents.length
    ? (await Promise.all(item.residents.slice(0, 3).map(getNameFromUrl))).join(', ')
    : 'Sin datos';
  return { ...item, residentsNames: residents };
}

async function enrichSpecies(item) {
  const homeworld = item.homeworld ? await getNameFromUrl(item.homeworld) : 'Desconocido';
  return { ...item, homeworldName: homeworld };
}

async function enrichStarship(item) {
  return {
    ...item,
    description: `${item.model} (${item.starship_class})`,
    crew: item.crew,
    passengers: item.passengers,
    speed: item.max_atmosphering_speed,
    hyperdrive: item.hyperdrive_rating
  };
}

async function enrichVehicle(item) {
  return {
    ...item,
    description: `${item.model} (${item.vehicle_class})`,
    crew: item.crew,
    passengers: item.passengers,
    speed: item.max_atmosphering_speed,
    cargo: item.cargo_capacity
  };
}

document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value.trim();
  const category = document.getElementById('searchCategory').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!query) {
    resultsDiv.innerHTML = '<p class="text-warning">Por favor ingresa un nombre.</p>';
    return;
  }

  resultsDiv.innerHTML = '<p>Cargando...</p>';

  try {
    const res = await fetch(`https://swapi.py4e.com/api/${category}/?search=${query}`);
    const data = await res.json();
    if (data.results.length === 0) {
      resultsDiv.innerHTML = '<p class="text-danger">No se encontraron resultados.</p>';
      return;
    }

    let enriched = [];

    switch (category) {
      case "people":
        enriched = await Promise.all(data.results.map(enrichPerson));
        resultsDiv.innerHTML = enriched.map(item => `
          <div class="card-info">
            <div class="card-header"><h3>${item.name}</h3></div>
            <div class="card-body">
              <p class="card-text">
                <strong>Altura:</strong> ${item.height} cm<br>
                <strong>Peso:</strong> ${item.mass} kg<br>
                <strong>Género:</strong> ${item.gender}<br>
                <strong>Año de nacimiento:</strong> ${item.birth_year}<br>
                <strong>Color de cabello:</strong> ${item.hair_color}<br>
                <strong>Color de piel:</strong> ${item.skin_color}<br>
                <strong>Color de ojos:</strong> ${item.eye_color}<br>
                <strong>Especie:</strong> ${item.speciesName}<br>
                <strong>Peliculas:</strong> ${item.filmstitle}<br>
                <strong>Planeta de origen:</strong> ${item.homeworldName}
              </p>
            </div>
          </div>`).join('');
        break;

      case "planets":
        enriched = await Promise.all(data.results.map(enrichPlanet));
        resultsDiv.innerHTML = enriched.map(item => `
          <div class="card-info">
            <div class="card-header"><h3>${item.name}</h3></div>
            <div class="card-body">
              <p class="card-text">
                <strong>Clima:</strong> ${item.climate}<br>
                <strong>Terreno:</strong> ${item.terrain}<br>
                <strong>Periodo de rotación:</strong> ${item.rotation_period} hrs<br>
                <strong>Periodo orbital:</strong> ${item.orbital_period} días<br>
                <strong>Diametro:</strong> ${item.diameter}<br>
                <strong>Gravedad:</strong> ${item.gravity}<br>
                <strong>Habitantes conocidos:</strong> ${item.residentsNames}
              </p>
            </div>
          </div>`).join('');
        break;

      case "species":
        enriched = await Promise.all(data.results.map(enrichSpecies));
        resultsDiv.innerHTML = enriched.map(item => `
          <div class="card-info">
            <div class="card-header"><h3>${item.name}</h3></div>
            <div class="card-body">
              <p class="card-text">
                <strong>Clasificación:</strong> ${item.classification}<br>
                <strong>Lenguaje:</strong> ${item.language}<br>
                <strong>Planeta de origen:</strong> ${item.homeworldName}<br>
                <strong>Denominación:</strong> ${item.designation}<br>
                <strong>Estatura promedio:</strong> ${item.average_height} cm<br>
                <strong>Color de piel:</strong> ${item.skin_colors}<br>
                <strong>Color de cabello:</strong> ${item.hair_colors}<br>
                <strong>Color de ojos:</strong> ${item.eye_colors}<br>
                <strong>Esperanza de vida:</strong> ${item.average_lifespan} años
              </p>
            </div>
          </div>`).join('');
        break;

      case "starships":
        enriched = await Promise.all(data.results.map(enrichStarship));
        resultsDiv.innerHTML = enriched.map(item => `
          <div class="card-info">
            <div class="card-header"><h3>${item.name}</h3></div>
            <div class="card-body">
              <p class="card-text">
                <strong>Modelo:</strong> ${item.description}<br>
                <strong>Fabricante:</strong> ${item.manufacturer}<br>
                <strong>Velocidad:</strong> ${item.speed}<br>
                <strong>Pasajeros:</strong> ${item.passengers}<br>
                <strong>Tripulación:</strong> ${item.crew}<br>
                <strong>Hyperdrive:</strong> ${item.hyperdrive}
              </p>
            </div>
          </div>`).join('');
        break;

      case "vehicles":
        enriched = await Promise.all(data.results.map(enrichVehicle));
        resultsDiv.innerHTML = enriched.map(item => `
          <div class="card-info">
            <div class="card-header"><h3>${item.name}</h3></div>
            <div class="card-body">
              <p class="card-text">
                <strong>Modelo:</strong> ${item.description}<br>
                <strong>Fabricante:</strong> ${item.manufacturer}<br>
                <strong>Velocidad:</strong> ${item.speed}<br>
                <strong>Pasajeros:</strong> ${item.passengers}<br>
                <strong>Tripulación:</strong> ${item.crew}<br>
                <strong>Carga:</strong> ${item.cargo}
              </p>
            </div>
          </div>`).join('');
        break;
    }

  } catch (err) {
    resultsDiv.innerHTML = '<p class="text-danger">Error al buscar datos.</p>';
  }
});