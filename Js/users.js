Users.js

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación y rol
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'Administrador') {
    window.location.href = 'login.html';
    return;
  }

  // Cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });

  const form = document.getElementById('userForm');
  const table = document.getElementById('userTable');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchInput = document.getElementById('search');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Mostrar usuarios
  function renderTable(data = users) {
    table.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-2">${user.id}</td>
        <td class="p-2">${user.name}</td>
        <td class="p-2">${user.email}</td>
        <td class="p-2">${user.username}</td>
        <td class="p-2">${user.role}</td>
        <td class="p-2">
          <button onclick="editUser(${users.indexOf(user)})" class="text-blue-500 mr-2"><i class="fa fa-edit"></i></button>
          <button onclick="deleteUser(${users.indexOf(user)})" class="text-red-500"><i class="fa fa-trash"></i></button>
        </td>
      `;
      table.appendChild(row);
    });

    totalPagesSpan.textContent = Math.ceil(data.length / itemsPerPage) || 1;
    currentPageSpan.textContent = currentPage;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
  }

  // Agregar o actualizar usuario
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    if (users.some(u => u.username === username && u.id != document.getElementById('userId').value)) {
      alert('El nombre de usuario ya existe');
      return;
    }
    if (users.some(u => u.email === email && u.id != document.getElementById('userId').value)) {
      alert('El email ya está registrado');
      return;
    }

    const user = {
      id: document.getElementById('userId').value || Date.now(),
      name: document.getElementById('name').value,
      email: email,
      username: username,
      password: document.getElementById('password').value,
      role: document.getElementById('role').value
    };

    if (document.getElementById('userId').value) {
      const index = users.findIndex(u => u.id == user.id);
      users[index] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem('users', JSON.stringify(users));
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar';
    cancelBtn.classList.add('hidden');
    currentPage = 1;
    renderTable();
  });

  // Editar usuario
  window.editUser = (index) => {
    const user = users[index];
    document.getElementById('userId').value = user.id;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('username').value = user.username;
    document.getElementById('password').value = user.password;
    document.getElementById('role').value = user.role;
    submitBtn.innerHTML = '<i class="fa fa-save"></i> Guardar';
    cancelBtn.classList.remove('hidden');
  };

  // Eliminar usuario
  window.deleteUser = (index) => {
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
    currentPage = Math.min(currentPage, Math.ceil(users.length / itemsPerPage)) || 1;
    renderTable();
  };

  // Cancelar edición
  cancelBtn.addEventListener('click', () => {
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar';
    cancelBtn.classList.add('hidden');
  });

  // Búsqueda
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderTable(filtered);
  });

  // Paginación
  prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPage.addEventListener('click', () => {
    if (currentPage < Math.ceil(users.length / itemsPerPage)) {
      currentPage++;
      renderTable();
    }
  });

  renderTable();
});
