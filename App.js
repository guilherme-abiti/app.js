const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/calculate', async (req, res) => {
  try {
    const origin = req.body.origin;
    const destination = req.body.destination;

    const coordinates = await Promise.all([
      getCoordinatesFromAddress(origin),
      getCoordinatesFromAddress(destination)
    ]);

    const distance = calculateDistance(coordinates[0], coordinates[1]);
    const fuelConsumption = parseFloat(req.body.fuelConsumption);
    const fuelPrice = parseFloat(req.body.fuelPrice);

    const totalFuelCost = (distance / fuelConsumption) * fuelPrice;

    res.send(`
      <h1>Resultado do Cálculo</h1>
      <p>Distância da Viagem: ${distance.toFixed(2)} km</p>
      <p>Consumo de Combustível: ${fuelConsumption} km/L</p>
      <p>Preço do Combustível: R$ ${fuelPrice.toFixed(2)}</p>
      <h2>Custo Total da Viagem: R$ ${totalFuelCost.toFixed(2)}</h2>
    `);
  } catch (error) {
    console.error('Erro ao calcular a distância:', error);
    res.status(500).send('Erro ao calcular a distância');
  }
});

async function getCoordinatesFromAddress(address) {
  const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${address}&format=json`);
  if (response.data && response.data.length > 0) {
    return {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon)
    };
  }
  throw new Error('Endereço não encontrado');
}

function calculateDistance(coord1, coord2) {
  const R = 6371; // Raio da Terra em km
  const lat1 = deg2rad(coord1.lat);
  const lon1 = deg2rad(coord1.lon);
  const lat2 = deg2rad(coord2.lat);
  const lon2 = deg2rad(coord2.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
