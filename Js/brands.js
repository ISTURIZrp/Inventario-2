Brands.js

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

  const form = document.getElementById('brandForm');
  const table = document.getElementById('brandTable');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchInput = document.getElementById('search');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');
  let brands = JSON.parse(localStorage.getItem('brands')) || [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Mostrar marcas
  function renderTable(data = brands) {
    table.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((brand, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-2">${brand.id}</td>
        <td class="p-2">${brand.name}</td>
        <td class="p-2">
          <button onclick="editBrand(${brands.indexOf(brand)})" class="text-blue-500 mr-2"><i class="fa fa-edit"></i></button>
          <button onclick="deleteBrand(${brands.indexOf(brand)})" class="text-red-500"><i class="fa fa-trash"></i></button>
        </td>
      `;
      table.appendChild(row);
    });

    totalPagesSpan.textContent = Math.ceil(data.length / itemsPerPage) || 1;
    currentPageSpan.textContent = currentPage;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
  }

  // Agregar o actualizar marca
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const brand = {
      id: document.getElementById('brandId').value || Date.now(),
      name: document.getElementById('name').value
    };

    if (document.getElementById('brandId').value) {
      const index = brands.findIndex(b => b.id == brand.id);
      brands[index] = brand;
    } else {
      brands.push(brand);
    }

    localStorage.setItem('brands', JSON.stringify(brands));
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar';
    cancelBtn.classList.add('hidden');
    currentPage = 1;
    renderTable();
  });

  // Editar marca
  window.editBrand = (index) => {
    const brand = brands[index];
    document.getElementById('brandId').value = brand.id;
    document.getElementById('name').value = brand.name;
    submitBtn.innerHTML = '<i class="fa fa-save"></i> Guardar';
    cancelBtn.classList.remove('hidden');
  };

  // Eliminar marca
  window.deleteBrand = (index) => {
    brands.splice(index, 1);
    localStorage.setItem('brands', JSON.stringify(brands));
    currentPage = Math.min(currentPage, Math.ceil(brands.length / itemsPerPage)) || 1;
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
    const filtered = brands.filter(brand => 
      brand.name.toLowerCase().includes(searchTerm)
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
    if (currentPage < Math.ceil(brands.length / itemsPerPage)) {
      currentPage++;
      renderTable();
    }
  });

  renderTable();
});
