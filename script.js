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

function parseCoords(value) {
  const [lat, lng] = value.split(',').map(Number);
  return [lat, lng];
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
    Traffic status: <strong>${distanceKm < 4 ? 'Light to moderate' : 'Moderate to heavy'}</strong>
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

  activeRoute = L.polyline([origin, destination], {
    color: '#2563eb',
    weight: 4,
    opacity: 0.9
  }).addTo(trafficMap);

  L.circleMarker(origin, {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: '#10b981',
    fillOpacity: 0.9
  }).addTo(trafficMap);

  L.circleMarker(destination, {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: '#ef4444',
    fillOpacity: 0.9
  }).addTo(trafficMap);

  trafficMap.fitBounds(L.latLngBounds([origin, destination]), {
    padding: [30, 30]
  });

  updateRouteSummary(origin, destination);
});

$('clearBtn').addEventListener('click', () => {
  if (activeRoute) {
    trafficMap.removeLayer(activeRoute);
    activeRoute = null;
  }

  trafficMap.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker && layer.getRadius && layer.getRadius() === 8) {
      trafficMap.removeLayer(layer);
    }
  });

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
































































































































































































































