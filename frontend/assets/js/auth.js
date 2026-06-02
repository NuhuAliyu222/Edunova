(function (global) {
  function parseJwt(token) {
    try {
      var payload = token.split('.')[1];
      var json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user || {}));
  }

  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  }

  function getToken() {
    return localStorage.getItem('token') || '';
  }

  function getTokenPayload() {
    var token = getToken();
    return token ? parseJwt(token) : null;
  }

  function isAuthenticated() {
    var token = getToken();
    if (!token) return false;
    var payload = parseJwt(token);
    if (!payload) return false;
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearSession();
      return false;
    }
    return true;
  }

  function showMessage(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
    el.style.color = isError ? '#ef4444' : '#22c55e';
  }

  function requireAuth(role) {
    if (!isAuthenticated()) {
      window.location.href = role === 'admin' ? '../admin/login.html' : 'login.html';
      return false;
    }
    
    var payload = getTokenPayload();
    if (role && payload && payload.role !== role) {
      window.location.href = payload.role === 'admin' ? '../admin/dashboard.html' : 'dashboard.html';
      return false;
    }
    return true;
  }

  function applyUserToPage() {
    var user = getUser();
    var payload = getTokenPayload();
    var name = user.name || (payload && payload.name) || 'Student';
    var email = user.email || (payload && payload.email) || '';

    ['studentName', 'userName', 'profileName'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = name;
    });

    var welcome = document.getElementById('welcomeMessage');
    if (welcome) {
      welcome.innerHTML = 'Hello, ' + name + '! 👋';
    }

    var emailEl = document.getElementById('profileEmail');
    if (emailEl && email) emailEl.textContent = email;
  }

  async function handleStudentLogin(form) {
    var email = form.querySelector('[name="email"]');
    var password = form.querySelector('[name="password"]');
    var msg = form.querySelector('[data-auth-message]');
    var btn = form.querySelector('[type="submit"]');

    if (!email || !password) {
      if (msg) showMessage(msg, 'Please fill all fields', true);
      return;
    }

    try {
      btn.disabled = true;
      var result = await global.EdunovaAPI.login(email.value.trim(), password.value);
      saveSession(result.token, result.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (msg) showMessage(msg, err.message || 'Login failed', true);
    } finally {
      btn.disabled = false;
    }
  }

  async function handleAdminLogin(form) {
    var email = form.querySelector('[name="email"]');
    var password = form.querySelector('[name="password"]');
    var msg = form.querySelector('[data-auth-message]');
    var btn = form.querySelector('[type="submit"]');

    try {
      btn.disabled = true;
      var result = await global.EdunovaAPI.adminLogin(email.value.trim(), password.value);
      saveSession(result.token, result.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (msg) showMessage(msg, err.message || 'Login failed', true);
    } finally {
      btn.disabled = false;
    }
  }

  async function handleRegister(form) {
    var name = form.querySelector('[name="name"]');
    var email = form.querySelector('[name="email"]');
    var password = form.querySelector('[name="password"]');
    var confirm = form.querySelector('[name="confirm_password"]');
    var msg = form.querySelector('[data-auth-message]');
    var btn = form.querySelector('[type="submit"]');

    if (password.value !== confirm.value) {
      if (msg) showMessage(msg, 'Passwords do not match', true);
      return;
    }

    if (password.value.length < 6) {
      if (msg) showMessage(msg, 'Password must be at least 6 characters', true);
      return;
    }

    try {
      btn.disabled = true;
      var result = await global.EdunovaAPI.register(
        name.value.trim(),
        email.value.trim(),
        password.value
      );
      saveSession(result.token, result.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (msg) showMessage(msg, err.message || 'Registration failed', true);
    } finally {
      btn.disabled = false;
    }
  }

  function initAuthForms() {
    var studentLogin = document.getElementById('studentLoginForm');
    if (studentLogin) {
      studentLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        handleStudentLogin(studentLogin);
      });
    }

    var adminLogin = document.getElementById('adminLoginForm');
    if (adminLogin) {
      adminLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        handleAdminLogin(adminLogin);
      });
    }

    var registerForm = document.getElementById('studentRegisterForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleRegister(registerForm);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAuthForms();
    if (document.body.dataset.authGuard) {
      requireAuth(document.body.dataset.authGuard);
      applyUserToPage();
    }
  });

  global.EdunovaAuth = {
    saveSession: saveSession,
    clearSession: clearSession,
    getUser: getUser,
    getToken: getToken,
    isAuthenticated: isAuthenticated,
    requireAuth: requireAuth,
    applyUserToPage: applyUserToPage,
    parseJwt: parseJwt,
  };
})(window);