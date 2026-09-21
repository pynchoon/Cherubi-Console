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
  pluma: {
    palido: 'https://i.ibb.co/xkFjffC/3-removebg-preview.png',
    oscuro: 'https://i.ibb.co/TBD4nsBC/Chat-GPT-Image-19-sept-2026-20-16-32.png',
    rosa: 'https://i.ibb.co/SX9VLj3n/5-removebg-preview.png'
  },
  nota: {
    palido: 'https://i.ibb.co/67T8MYFM/6-removebg-preview.png',
    oscuro: 'https://i.ibb.co/LXyX8SJq/7-removebg-preview.png',
    rosa: 'https://i.ibb.co/zTBtKxtM/8-removebg-preview.png'
  }
};

const PROFILE_NAMES = {
  pluma: 'Pluma Angelical',
  nota: 'Nota Musical'
};

function getProfileImg(user) {
  const theme = user.theme || 'palido';
  return PROFILE_IMAGES[user.profile][theme];
}

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
    theme: 'palido',
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
  if (!user.theme) user.theme = 'palido';
  saveUser(user);

  if (wasAutomatic) {
    document.getElementById('result-text').textContent =
      'Tu perfil por defecto es ' + PROFILE_NAMES[profile] + '. Podés cambiarlo más tarde.';
    document.getElementById('result-img').src = getProfileImg(user);
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

/* ===== SIDEBAR: apps + scroll infinito ===== */

const APPS = [
  { id: 'perfil', icon: 'profile', title: 'Perfil' },
  { id: 'logros', icon: '🏆', title: 'Logros' },
  { id: 'estrellas', icon: '✦', title: 'Visor de estrellas', star: true },
  { id: 'azar', icon: '🎲', title: 'Azar' },
  { id: 'notas', icon: '📝', title: 'Notas' },
  { id: 'tragamonedas', icon: '🎰', title: 'Tragamonedas' },
  { id: 'tienda', icon: '🛒', title: 'Tienda' }
];

function renderSidebar() {
  const track = document.getElementById('sidebar-track');
  const user = getUser();
  let html = '';

  for (let copy = 0; copy < 3; copy++) {
    APPS.forEach(function (app) {
      const extraClass = app.star ? ' cherubi-app-star' : (app.id === 'perfil' ? ' cherubi-app-profile' : '');
      if (app.icon === 'profile') {
        html += '<div class="cherubi-app' + extraClass + '" data-app="' + app.id + '" title="' + app.title + '">' +
          '<img src="' + getProfileImg(user) + '" alt="Perfil" /></div>';
      } else {
        html += '<div class="cherubi-app' + extraClass + '" data-app="' + app.id + '" title="' + app.title + '">' + app.icon + '</div>';
      }
    });
  }

  track.innerHTML = html;

  const oneSetHeight = track.scrollHeight / 3;
  const sidebar = document.querySelector('.cherubi-sidebar');
  sidebar.scrollTop = oneSetHeight;

  sidebar.addEventListener('scroll', function () {
    if (sidebar.scrollTop < oneSetHeight * 0.5) {
      sidebar.scrollTop += oneSetHeight;
    } else if (sidebar.scrollTop > oneSetHeight * 1.5) {
      sidebar.scrollTop -= oneSetHeight;
    }
  });

  track.addEventListener('click', function (e) {
    const el = e.target.closest('.cherubi-app');
    if (!el) return;
    handleAppClick(el.dataset.app);
  });
}

function handleAppClick(appId) {
  if (appId === 'perfil') {
    openProfileModal();
  } else {
    openModal('<p>Esta app todavía está en construcción ✨</p>');
  }
}

function openProfileModal() {
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

/* ===== TOP BAR: pepitas, hora, fecha ===== */

function updateTopbar() {
  const user = getUser();
  document.getElementById('topbar-pepitas').textContent = '🪙 ' + user.pepitas;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('topbar-time').textContent = hh + ':' + mm;

  const dd = String(now.getDate()).padStart(2, '0');
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const yy = now.getFullYear();
  document.getElementById('topbar-date').textContent = dd + '/' + mo + '/' + yy;
}

function goHome() {
  showPage('page-home');
  renderSidebar();
  updateTopbar();
  setInterval(updateTopbar, 1000);
}

init();const STORAGE_KEY = 'cherubiUser';

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
