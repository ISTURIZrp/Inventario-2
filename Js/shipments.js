Shipments.js

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
      <a href="index.html" class="hover:underline">Inventario</a>
      <a href="shipments.html" class="hover:underline font-bold">Envíos</a>
      <a href="suppliers.html" class="hover:underline">Proveedores</a>
      <a href="brands.html" class="hover:underline">Marcas</a>
      <a href="users.html" class="hover:underline">Usuarios</a>
    `;
  } else {
    navLinks.innerHTML = `
      <a href="index.html" class="hover:underline">Inventario</a>
      <a href="shipments.html" class="hover:underline font-bold">Envíos</a>
    `;
  }

  // Cerrar sesión
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });

  const form = document.getElementById('shipmentForm');
  const table = document.getElementById('shipmentTable');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchInput = document.getElementById('search');
  const statusFilter = document.getElementById('statusFilter');
  const totalShipments = document.getElementById('totalShipments');
  const statusEnviado = document.getElementById('statusEnviado');
  const statusEnTransito = document.getElementById('statusEnTransito');
  const statusEntregado = document.getElementById('statusEntregado');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');
  let shipments = JSON.parse(localStorage.getItem('shipments')) || [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Mostrar envíos
  function renderTable(data = shipments) {
    table.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((shipment, index) => {
      const statusColor = {
        'Enviado': 'text-yellow-500',
        'En tránsito': 'text-blue-500',
        'Entregado': 'text-green-500'
      }[shipment.status] || '';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-2">${shipment.id}</td>
        <td class="p-2">${shipment.name}</td>
        <td class="p-2">${shipment.quantity}</td>
        <td class="p-2">${shipment.lot}</td>
        <td class="p-2">${shipment.shipmentDate}</td>
        <td class="p-2">${shipment.recipient}</td>
        <td class="p-2 ${statusColor}">${shipment.status}</td>
        <td class="p-2">
          <button onclick="editShipment(${shipments.indexOf(shipment)})" class="text-blue-500 mr-2"><i class="fa fa-edit"></i></button>
          <button onclick="deleteShipment(${shipments.indexOf(shipment)})" class="text-red-500"><i class="fa fa-trash"></i></button>
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
    totalShipments.textContent = shipments.length;
    statusEnviado.textContent = shipments.filter(s => s.status === 'Enviado').length;
    statusEnTransito.textContent = shipments.filter(s => s.status === 'En tránsito').length;
    statusEntregado.textContent = shipments.filter(s => s.status === 'Entregado').length;
  }

  // Filtrar datos
  function filterData() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    let filtered = shipments;

    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.name.toLowerCase().includes(searchTerm) ||
        shipment.lot.toLowerCase().includes(searchTerm) ||
        shipment.recipient.toLowerCase().includes(searchTerm) ||
        shipment.shipmentDate.includes(searchTerm) ||
        shipment.status.toLowerCase().includes(searchTerm)
      );
    }

    if (status) {
      filtered = filtered.filter(shipment => shipment.status === status);
    }

    currentPage = 1;
    renderTable(filtered);
  }

  // Agregar o actualizar envío
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const quantity = parseInt(document.getElementById('quantity').value);
    const lot = document.getElementById('lot').value;
    const shipmentDate = document.getElementById('shipmentDate').value;
    const today = new Date().toISOString().split('T')[0];

    if (quantity < 0) {
      alert('La cantidad no puede ser negativa');
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(lot)) {
      alert('El lote debe ser alfanumérico');
      return;
    }
    if (shipments.some(s => s.lot === lot && s.id != document.getElementById('shipmentId').value)) {
      alert('El lote ya existe en envíos');
      return;
    }
    if (shipmentDate > today) {
      alert('La fecha de envío no puede ser futura');
      return;
    }

    const shipment = {
      id: document.getElementById('shipmentId').value || Date.now(),
      name: document.getElementById('name').value,
      quantity: quantity,
      lot: lot,
      shipmentDate: shipmentDate,
      recipient: document.getElementById('recipient').value,
      status: document.getElementById('status').value
    };

    if (document.getElementById('shipmentId').value) {
      const index = shipments.findIndex(s => s.id == shipment.id);
      shipments[index] = shipment;
    } else {
      shipments.push(shipment);
    }

    localStorage.setItem('shipments', JSON.stringify(shipments));
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar Envío';
    cancelBtn.classList.add('hidden');
    currentPage = 1;
    renderTable();
    updateSummary();
  });

  // Editar envío
  window.editShipment = (index) => {
    const shipment = shipments[index];
    document.getElementById('shipmentId').value = shipment.id;
    document.getElementById('name').value = shipment.name;
    document.getElementById('quantity').value = shipment.quantity;
    document.getElementById('lot').value = shipment.lot;
    document.getElementById('shipmentDate').value = shipment.shipmentDate;
    document.getElementById('recipient').value = shipment.recipient;
    document.getElementById('status').value = shipment.status;
    submitBtn.innerHTML = '<i class="fa fa-save"></i> Guardar';
    cancelBtn.classList.remove('hidden');
  };

  // Eliminar envío
  window.deleteShipment = (index) => {
    shipments.splice(index, 1);
    localStorage.setItem('shipments', JSON.stringify(shipments));
    currentPage = Math.min(currentPage, Math.ceil(shipments.length / itemsPerPage)) || 1;
    renderTable();
    updateSummary();
  };

  // Cancelar edición
  cancelBtn.addEventListener('click', () => {
    form.reset();
    submitBtn.innerHTML = '<i class="fa fa-plus"></i> Agregar Envío';
    cancelBtn.classList.add('hidden');
  });

  // Búsqueda y filtro
  searchInput.addEventListener('input', filterData);
  statusFilter.addEventListener('change', filterData);

  // Paginación
  prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPage.addEventListener('click', () => {
    if (currentPage < Math.ceil(shipments.length / itemsPerPage)) {
      currentPage++;
      renderTable();
    }
  });

  // Exportar a CSV
  window.exportToCSV = () => {
    let csv = 'ID,Producto,Cantidad,Lote,Fecha de Envío,Destinatario,Estado\n';
    shipments.forEach(shipment => {
      const row = [
        shipment.id,
        `"${shipment.name.replace(/"/g, '""')}"`,
        shipment.quantity,
        shipment.lot,
        shipment.shipmentDate,
        `"${shipment.recipient.replace(/"/g, '""')}"`,
        shipment.status
      ];
      csv += row.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'envios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  renderTable();
  updateSummary();
});
