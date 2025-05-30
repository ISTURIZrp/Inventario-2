Suppliers.js

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

  const form = document.getElementById('supplierForm');
  const table = document.getElementById('supplierTable');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchInput = document.getElementById('search');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');
  let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Mostrar proveedores
  function renderTable(data = suppliers) {
    table.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((supplier, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-2">${supplier.id}</td>
        <td class="p-2">${supplier.name}</td>
        <td class="p-2">${supplier.contact}</td>
        <td class="p-2">${supplier.address}</td>
        <td class="p-2">
          <button onclick="editSupplier(${suppliers.indexOf(supplier)})" class="text-blue-500 mr-2"><i class="fa fa-edit"></i></button>
          <button onclick="deleteSupplier(${suppliers.indexOf(supplier)})" class="text-red-500"><i class="fa fa-trash"></i></button>
        </td>
      `;
      table.appendChild(row);
    });

    totalPagesSpan.textContent = Math.ceil(data.length / itemsPerPage) || 1;
    currentPageSpan.textContent = currentPage;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
  }

  // Agregar o actualizar proveedor
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const supplier = {
      id: document.getElementById('supplierId').value || Date.now(),
      name: document.getElementById('name').value,
      contact: document.getElementById('contact').value,
      address: document.getElementById('address').value
    };

    if (document.getElementById('supplierId').value) {
      const index = suppliers.findIndex(s => s.id == supplier.id);
      suppliers[index] = supplier;
    } else {
      suppliers.push(supplier);
    }

    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar';
    cancelBtn.classList.add('hidden');
    currentPage = 1;
    renderTable();
  });

  // Editar proveedor
  window.editSupplier = (index) => {
    const supplier = suppliers[index];
    document.getElementById('supplierId').value = supplier.id;
    document.getElementById('name').value = supplier.name;
    document.getElementById('contact').value = supplier.contact;
    document.getElementById('address').value = supplier.address;
    submitBtn.innerHTML = '<i class="fa fa-save"></i> Guardar';
    cancelBtn.classList.remove('hidden');
  };

  // Eliminar proveedor
  window.deleteSupplier = (index) => {
    suppliers.splice(index, 1);
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    currentPage = Math.min(currentPage, Math.ceil(suppliers.length / itemsPerPage)) || 1;
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
    const filtered = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchTerm) ||
      supplier.contact.toLowerCase().includes(searchTerm) ||
      supplier.address.toLowerCase().includes(searchTerm)
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
    if (currentPage < Math.ceil(suppliers.length / itemsPerPage)) {
      currentPage++;
      renderTable();
    }
  });

  renderTable();
});
