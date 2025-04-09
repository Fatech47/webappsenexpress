// Fichier complet : js/app.js

let drivers = [];
let pendingDriver = {};
let renewingDriverId = null;

// Simulation d'upload (remplacer par Cloudinary si besoin)
async function uploadToCloudinary() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('https://via.placeholder.com/150');
    }, 1000);
  });
}

// Ouvrir une modale
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'block';
}

// Fermer une modale
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

// Défilement fluide
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// Thème clair/sombre
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

// Enregistrement local
function saveToLocalStorage() {
  localStorage.setItem('drivers', JSON.stringify(drivers));
}

// Chargement local
function loadFromLocalStorage() {
  const storedDrivers = localStorage.getItem('drivers');
  if (storedDrivers) drivers = JSON.parse(storedDrivers);
  updateDriversList();
}

// Mise à jour de la liste des livreurs actifs
function updateDriversList(filter = '') {
  const now = new Date();
  const activeDrivers = drivers.filter(driver => new Date(driver.expirationDate) > now);
  const filtered = activeDrivers.filter(driver =>
    driver.name.toLowerCase().includes(filter.toLowerCase())
  );

  const html = filtered.map((driver, index) => `
    <div class="driver-card" style="animation-delay: ${index * 0.1}s">
      <h3>${driver.name}</h3>
      <p>${driver.vehicle} • ${driver.price} FCFA</p>
      <p>📞 ${driver.phone}</p>
      <p>Abonnement actif jusqu'au ${new Date(driver.expirationDate).toLocaleDateString()}</p>
    </div>
  `).join('');

  document.getElementById('driversList').innerHTML = html;
}

// Inscription d'un nouveau livreur
async function processRegistration() {
  try {
    pendingDriver = {
      name: document.getElementById('driverName').value.trim(),
      vehicle: document.getElementById('driverVehicle').value.trim(),
      price: document.getElementById('driverPrice').value.trim(),
      phone: document.getElementById('driverPhone').value.trim()
    };

    if (!pendingDriver.name || !pendingDriver.vehicle || !pendingDriver.price || !pendingDriver.phone) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const photoUrl = await uploadToCloudinary();
    if (photoUrl) {
      pendingDriver.photo = photoUrl;
      const expiration = new Date();
      expiration.setMonth(expiration.getMonth() + 1);
      pendingDriver.expirationDate = expiration.toISOString();
      closeModal('registrationModal');
      showModal('paymentModal');
    }
  } catch (error) {
    console.error("Erreur d'inscription :", error);
  }
}

// Paiement validé (nouveau ou renouvellement)
function confirmPayment() {
  if (renewingDriverId) {
    const driver = drivers.find(d => d.id === renewingDriverId);
    if (driver) {
      const newExpiration = new Date();
      newExpiration.setMonth(newExpiration.getMonth() + 1);
      driver.expirationDate = newExpiration.toISOString();
      alert("Abonnement renouvelé jusqu'au " + newExpiration.toLocaleDateString());
      saveToLocalStorage();
      updateDriversList();
    }
    renewingDriverId = null;
    closeModal('paymentModal');
    return;
  }

  pendingDriver.id = Date.now();
  drivers.push({ ...pendingDriver });
  saveToLocalStorage();
  updateDriversList();
  closeModal('paymentModal');
}

// Lancer le renouvellement
function renewSubscription(driverId) {
  renewingDriverId = driverId;
  showModal('paymentModal');
}

// Initialisation
window.onload = () => {
  loadFromLocalStorage();
  const toggleButton = document.getElementById('toggleTheme');
  if (toggleButton) toggleButton.addEventListener('click', toggleTheme);
};
