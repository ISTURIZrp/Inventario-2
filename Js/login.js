login.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('error');
  
  // Crear usuario administrador por defecto si no existe
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (!users.some(u => u.username === 'admin')) {
    users.push({
      id: Date.now(),
      name: 'Administrador',
      username: 'admin',
      password: 'admin',
      email: 'admin@lab.com',
      role: 'Administrador'
    });
    localStorage.setItem('users', JSON.stringify(users));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'index.html';
    } else {
      error.classList.remove('hidden');
    }
  });
});
