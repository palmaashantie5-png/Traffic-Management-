const users = {
  aeronn: { name: 'Administrator' },
  angel: { name: 'Administrator' },
  lance: { name: 'Administrator' }
};

const $ = (id) => document.getElementById(id);

function showApp(username) {
  $('userName').textContent =
    username.charAt(0).toUpperCase() + username.slice(1);

  $('userRole').textContent = users[username].name;
  $('login').classList.add('hidden');
  $('app').classList.remove('hidden');

  setTimeout(() => {
    if (window.trafficMap) {
      window.trafficMap.invalidateSize();
    }
  }, 350);
}

$('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const username = $('username').value.trim().toLowerCase();
  const password = $('password').value;

  if (users[username] && password === '1234') {
    localStorage.setItem('currentUser', username);
    showApp(username);
  } else {
    alert('Invalid username or password.');
  }
});

$('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  $('loginForm').reset();
  $('app').classList.add('hidden');
  $('login').classList.remove('hidden');
  navigateTo('dashboard');
});

const savedUser = localStorage.getItem('currentUser');
if (savedUser && users[savedUser]) {
  showApp(savedUser);
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach((section) => {
    section.classList.toggle('active', section.id === page);
  });

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });

  if (page === 'live-map' && window.trafficMap) {
    setTimeout(() => {
      window.trafficMap.invalidateSize();
    }, 200);
  }
}

document.querySelectorAll('.nav-btn').forEach((button) => {
  button.addEventListener('click', () => navigateTo(button.dataset.page));
});

document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => navigateTo(button.dataset.go));
});

const qcCenter = [14.6915, 121.092];
const qcBounds = L.latLngBounds([14.655, 121.045], [14.725, 121.135]);

const trafficMap = L.map('map', {
  zoomControl: true,
  maxBounds: qcBounds,
  maxBoundsViscosity: 1,
  minZoom: 12
}).setView(qcCenter, 13);

window.trafficMap = trafficMap;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(trafficMap);

const roads = [
  { name: 'Commonwealth Avenue', point: [14.6895, 121.0825], status: 'red', speed: 16 },
  { name: 'Batasan Road', point: [14.6938, 121.102], status: 'amber', speed: 25 },
  { name: 'Batasan–San Mateo Road', point: [14.697, 121.105], status: 'red', speed: 18 },
  { name: 'Litex Road', point: [14.6825, 121.091], status: 'amber', speed: 27 },
  { name: 'Payatas Road', point: [14.7, 121.11], status: 'green', speed: 38 },
  { name: 'Holy Spirit Drive', point: [14.687, 121.0735], status: 'green', speed: 35 },
  { name: 'Bagong Silangan Road', point: [14.6755, 121.098], status: 'amber', speed: 24 }
];

const colors = {
  green: '#188038',
  amber: '#f9ab00',
  red: '#d93025'
};

const directionColor = '#2563eb';

const labels = {
  green: 'Free flow',
  amber: 'Moderate',
  red: 'Heavy traffic'
};

const roadMarkers = [];

function roadPopup(road) {
  return `
    <strong>${road.name}</strong><br>
    <span style="color:${colors[road.status]}">${labels[road.status]}</span><br>
    Average speed: ${road.speed} km/h
  `;
}

function renderTrafficList() {
  const trafficList = $('trafficList');
  trafficList.innerHTML = '';

  roads.forEach((road) => {
    const row = document.createElement('div');
    row.className = 'traffic-item';
    row.innerHTML = `
      <div class="summary">
        <span class="dot ${road.status}"></span>
        <div>
          <strong>${road.name}</strong>
          <small>${labels[road.status]}</small>
        </div>
      </div>
      <small>${road.speed} km/h</small>
    `;
    trafficList.appendChild(row);
  });
}

roads.forEach((road) => {
  const marker = L.circleMarker(road.point, {
    radius: 9,
    color: '#fff',
    weight: 2,
    fillColor: colors[road.status],
    fillOpacity: 0.95
  }).addTo(trafficMap);

  marker.bindPopup(roadPopup(road));
  roadMarkers.push({ marker, road });
});

renderTrafficList();

const routeSummary = $('routeSummary');
let activeRoute = null;
let routeMarkers = [];

function parseCoords(value) {
  const [lat, lng] = value.split(',').map(Number);
  return [lat, lng];
}

function haversine(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return 6371 * c;
}

function nearestRoad(coord) {
  let best = null;

  roads.forEach((road) => {
    const distance = haversine(coord, road.point);
    if (!best || distance < best.distance) {
      best = { road, distance };
    }
  });

  return best;
}

function buildRoadRoute(origin, destination) {
  const startRoad = nearestRoad(origin);
  const endRoad = nearestRoad(destination);

  const deltaLat = destination[0] - origin[0];
  const deltaLng = destination[1] - origin[1];
  const travelLength = Math.hypot(deltaLat, deltaLng) || 1;

  const candidateRoads = roads
    .filter((road) => road.name !== startRoad.road.name && road.name !== endRoad.road.name)
    .map((road) => {
      const dx = road.point[0] - origin[0];
      const dy = road.point[1] - origin[1];
      const progression = (dx * deltaLat + dy * deltaLng) / travelLength;
      const lateralOffset = Math.abs(dx * deltaLng - dy * deltaLat) / travelLength;
      const roadDistance = haversine(origin, road.point) + haversine(destination, road.point);
      const endBias = haversine(road.point, endRoad.road.point);

      return {
        road,
        progression,
        lateralOffset,
        score: lateralOffset * 6 + endBias * 0.8 + roadDistance * 0.35
      };
    })
    .filter((entry) => entry.progression > 0)
    .sort((a, b) => a.progression - b.progression || a.score - b.score)
    .slice(0, 3)
    .map((entry) => entry.road.point);

  const routePoints = [
    origin,
    startRoad.road.point,
    ...candidateRoads,
    endRoad.road.point,
    destination
  ];

  return routePoints.filter((point, index, arr) => {
    return !arr.slice(0, index).some((prev) => prev[0] === point[0] && prev[1] === point[1]);
  });
}

function clearRouteMarkers() {
  routeMarkers.forEach((marker) => {
    if (marker && trafficMap.hasLayer(marker)) {
      trafficMap.removeLayer(marker);
    }
  });
  routeMarkers = [];
}

function createDirectionArrows(points) {
  clearRouteMarkers();

  if (!points || points.length < 2) {
    return;
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const mid = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2
    ];

    const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;

    const arrowMarker = L.marker(mid, {
      icon: L.divIcon({
        className: 'route-arrow-icon',
        html: `<div style="font-size:18px;color:${directionColor};transform:rotate(${angle}deg);display:flex;align-items:center;justify-content:center;width:20px;height:20px;">➤</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(trafficMap);

    routeMarkers.push(arrowMarker);
  }
}

function updateRouteSummary(origin, destination) {
  const originName = $('origin').selectedOptions[0].textContent;
  const destinationName = $('destination').selectedOptions[0].textContent;

  const distanceKm = Math.round(
    Math.hypot(
      destination[0] - origin[0],
      destination[1] - origin[1]
    ) * 111.2 * 10
  ) / 10;

  routeSummary.innerHTML = `
    From <strong>${originName}</strong> to <strong>${destinationName}</strong><br>
    Estimated distance: <strong>${distanceKm} km</strong><br>
    Route follows the major road network around District 2.
  `;
}

$('directionsBtn').addEventListener('click', () => {
  const originValue = $('origin').value;
  const destinationValue = $('destination').value;

  if (!originValue || !destinationValue) {
    return;
  }

  if (activeRoute) {
    trafficMap.removeLayer(activeRoute);
  }

  const origin = parseCoords(originValue);
  const destination = parseCoords(destinationValue);
  const routePoints = buildRoadRoute(origin, destination);

  activeRoute = L.polyline(routePoints, {
    color: directionColor,
    weight: 4,
    opacity: 0.9
  }).addTo(trafficMap);

  createDirectionArrows(routePoints);

  const startMarker = L.circleMarker(origin, {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: directionColor,
    fillOpacity: 0.9
  }).addTo(trafficMap);

  const endMarker = L.circleMarker(destination, {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: directionColor,
    fillOpacity: 0.9
  }).addTo(trafficMap);

  routeMarkers.push(startMarker, endMarker);

  trafficMap.fitBounds(L.latLngBounds(routePoints), {
    padding: [30, 30]
  });

  updateRouteSummary(origin, destination);
});

$('clearBtn').addEventListener('click', () => {
  if (activeRoute) {
    trafficMap.removeLayer(activeRoute);
    activeRoute = null;
  }

  clearRouteMarkers();

  routeSummary.textContent = 'Choose two Quezon City locations, then select Directions.';
});

$('refreshBtn').addEventListener('click', () => {
  roads.forEach((road) => {
    const next = ['green', 'amber', 'red'][Math.floor(Math.random() * 3)];
    road.status = next;
    road.speed = next === 'green' ? 32 + Math.floor(Math.random() * 12) : next === 'amber' ? 18 + Math.floor(Math.random() * 12) : 12 + Math.floor(Math.random() * 10);
  });

  roadMarkers.forEach(({ marker, road }) => {
    marker.setStyle({
      fillColor: colors[road.status]
    });
    marker.bindPopup(roadPopup(road));
  });

  renderTrafficList();
});

window.addEventListener('load', () => {
  if (window.trafficMap) {
    window.trafficMap.invalidateSize();
  }
});

window.navigateTo = navigateTo;
