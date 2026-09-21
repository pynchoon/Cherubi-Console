const STORAGE_KEY = 'cherubiUser';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function showPage(id) {
  document.querySelectorAll('.cherubi-page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

const PROFILE_IMAGES = {
  pluma: 'PEGA_AQUI_URL_PLUMA',
  nota: 'PEGA_AQUI_URL_NOTA'
};

const PROFILE_NAMES = {
  pluma: 'Pluma Angelical',
  nota: 'Nota Musical'
};

function init() {
  const user = getUser();
  if (!user) {
    showPage('page-create');
  } else {
    showPage('page-login');
  }
}

document.getElementById('form-create').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('create-username').value.trim();
  const password = document.getElementById('create-password').value;
  if (!username || !password) return;

  const user = {
    username: username,
    password: password,
    profile: null,
    pepitas: 0,
    notes: '',
    achievements: []
  };

  saveUser(user);
  showPage('page-warning');
});

document.getElementById('btn-warning-continue').addEventListener('click', function () {
  showPage('page-survey-1');
});

document.getElementById('btn-survey-next').addEventListener('click', function () {
  const q1 = document.querySelector('input[name="q1"]:checked');
  if (!q1) {
    alert('Elegí una opción para continuar.');
    return;
  }
  showPage('page-survey-2');
});

document.getElementById('btn-survey-submit').addEventListener('click', function () {
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');

  if (!q1 || !q2) {
    alert('Respondé las dos preguntas para continuar.');
    return;
  }

  const answers = q1.value + q2.value;
  let profile = null;

  if (answers === 'AA') {
    profile = 'pluma';
  } else if (answers === 'BB') {
    profile = 'nota';
  }

  if (profile) {
    finishProfile(profile, true);
  } else {
    showPage('page-choose');
  }
});

document.querySelectorAll('.cherubi-profile-option').forEach(function (el) {
  el.addEventListener('click', function () {
    finishProfile(el.dataset.profile, false);
  });
});

function finishProfile(profile, wasAutomatic) {
  const user = getUser();
  user.profile = profile;
  saveUser(user);

  if (wasAutomatic) {
    document.getElementById('result-text').textContent =
      'Tu perfil por defecto es ' + PROFILE_NAMES[profile] + '. Podés cambiarlo más tarde.';
    document.getElementById('result-img').src = PROFILE_IMAGES[profile];
    showPage('page-result');
  } else {
    goHome();
  }
}

document.getElementById('btn-result-continue').addEventListener('click', goHome);

document.getElementById('form-login').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const user = getUser();
  const errorEl = document.getElementById('login-error');

  if (user && user.username === username && user.password === password) {
    errorEl.textContent = '';
    goHome();
  } else {
    errorEl.textContent = 'Usuario o contraseña incorrectos.';
  }
});

function goHome() {
  const user = getUser();
  if (user.profile) {
    document.getElementById('sidebar-profile-pic').src = PROFILE_IMAGES[user.profile];
  }
  showPage('page-home');
}

function openModal(html) {
  document.getElementById('cherubi-modal-box').innerHTML = html;
  document.getElementById('cherubi-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('cherubi-modal').classList.remove('active');
}

document.getElementById('cherubi-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

document.getElementById('app-perfil').addEventListener('click', function () {
  const user = getUser();
  openModal(
    '<h3>Perfil</h3>' +
    '<form id="form-edit-profile">' +
    '<label>Usuario</label>' +
    '<input type="text" id="edit-username" value="' + user.username + '" />' +
    '<label>Contraseña</label>' +
    '<input type="password" id="edit-password" value="' + user.password + '" />' +
    '<button type="submit">Guardar</button>' +
    '</form>'
  );

  document.getElementById('form-edit-profile').addEventListener('submit', function (e) {
    e.preventDefault();
    const u = getUser();
    u.username = document.getElementById('edit-username').value.trim();
    u.password = document.getElementById('edit-password').value;
    saveUser(u);
    closeModal();
  });
});

['app-logros', 'app-estrellas', 'app-azar', 'app-notas', 'app-tragamonedas', 'app-tienda'].forEach(function (id) {
  document.getElementById(id).addEventListener('click', function () {
    openModal('<p>Esta app todavía está en construcción ✨</p>');
  });
});

init();
