Inventory.js

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Configurar menú dinámico
  const navLinks = document.getElementById('navLinks');
  if (currentUser.role === 'Administrador') {
    navLinks.innerHTML = `
      <a href="index.html" class="hover:underline font-bold">Inventario</a>
      <a href="shipments.html" class="hover:underline">Envíos</a>
      <a href="suppliers.html" class="hover:underline">Proveedores</a>
      <a href="brands.html" class="hover:underline">Marcas</a>
      <a href="users.html" class="hover:underline">Usuarios</a>
    `;
  } else {
    navLinks.innerHTML = `
      <a href="index.html" class="hover:underline font-bold">Inventario</a>
      <a href="shipments.html" class="hover:underline">Envíos</a>
    `;
  }

  // Cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });

  const form = document.getElementById('inventoryForm');
  const table = document.getElementById('inventoryTable');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchInput = document.getElementById('search');
  const totalItems = document.getElementById('totalItems');
  const lowStock = document.getElementById('lowStock');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Mostrar inventario
  function renderTable(data = inventory) {
    table.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-2">${item.id}</td>
        <td class="p-2">${item.name}</td>
        <td class="p-2 ${item.quantity < 10 ? 'text-red-500' : ''}">${item.quantity}</td>
        <td class="p-2">${item.lot}</td>
        <td class="p-2">${item.expiry}</td>
        <td class="p-2">
          <button onclick="editItem(${inventory.indexOf(item)})" class="text-blue-500 mr-2"><i class="fa fa-edit"></i></button>
          <button onclick="deleteItem(${inventory.indexOf(item)})" class="text-red-500"><i class="fa fa-trash"></i></button>
        </td>
      `;
      table.appendChild(row);
    });

    totalPagesSpan.textContent = Math.ceil(data.length / itemsPerPage) || 1;
    currentPageSpan.textContent = currentPage;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
  }

  // Actualizar resumen
  function updateSummary() {
    totalItems.textContent = inventory.length;
    lowStock.textContent = inventory.filter(item => item.quantity < 10).length;
  }

  // Agregar o actualizar elemento
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const quantity = parseInt(document.getElementById('quantity').value);
    const lot = document.getElementById('lot').value;
    const expiry = document.getElementById('expiry').value;
    const today = new Date().toISOString().split('T')[0];

    if (quantity < 0) {
      alert('La cantidad no puede ser negativa');
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(lot)) {
      alert('El lote debe ser alfanumérico');
      return;
    }
    if (inventory.some(item => item.lot === lot && item.id != document.getElementById('itemId').value)) {
      alert('El lote ya existe');
      return;
    }
    if (expiry < today) {
      alert('La fecha de caducidad no puede ser pasada');
      return;
    }

    const item = {
      id: document.getElementById('itemId').value || Date.now(),
      name: document.getElementById('name').value,
      quantity: quantity,
      lot: lot,
      expiry: expiry
    };

    if (document.getElementById('itemId').value) {
      const index = inventory.findIndex(i => i.id == item.id);
      inventory[index] = item;
    } else {
      inventory.push(item);
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar';
    cancelBtn.classList.add('hidden');
    currentPage = 1;
    renderTable();
    updateSummary();
  });

  // Editar elemento
  window.editItem = (index) => {
    const item = inventory[index];
    document.getElementById('itemId').value = item.id;
    document.getElementById('name').value = item.name;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('lot').value = item.lot;
    document.getElementById('expiry').value = item.expiry;
    submitBtn.innerHTML = '<i class="fa fa-save"></i> Guardar';
    cancelBtn.classList.remove('hidden');
  };

  // Eliminar elemento
  window.deleteItem = (index) => {
    inventory.splice(index, 1);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    currentPage = Math.min(currentPage, Math.ceil(inventory.length / itemsPerPage)) || 1;
    renderTable();
    updateSummary();
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
    const filtered = inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.lot.toLowerCase().includes(searchTerm) ||
      item.quantity.toString().includes(searchTerm) ||
      item.expiry.includes(searchTerm)
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
    if (currentPage < Math.ceil(inventory.length / itemsPerPage)) {
      currentPage++;
      renderTable();
    }
  });

  // Exportar a CSV
  window.exportToCSV = () => {
    let csv = 'ID,Nombre,Cantidad,Lote,Fecha de Caducidad\n';
    inventory.forEach(item => {
      const row = [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`,
        item.quantity,
        item.lot,
        item.expiry
      ];
      csv += row.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  renderTable();
  updateSummary();
});
