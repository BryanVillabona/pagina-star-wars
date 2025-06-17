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