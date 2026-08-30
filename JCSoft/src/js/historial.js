document.addEventListener('DOMContentLoaded', () => {

    const tablaBody = document.getElementById('tablaHistorialBody');
    const mensajeVacio = document.getElementById('mensajeVacio');
    const btnLimpiar = document.getElementById('btnLimpiar');
    function obtenerHistorial() {
        return JSON.parse(localStorage.getItem('historialCotizaciones') || '[]');
    }


    function renderizarTabla() {
        const historial = obtenerHistorial();

        tablaBody.innerHTML = '';

        if (historial.length === 0) {
            mensajeVacio.classList.remove('hidden');
            return;
        }

        mensajeVacio.classList.add('hidden');

        historial.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';

            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    ${item.fecha || 'N/A'}
                </td>
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-900 dark:text-white">${item.cliente || 'Sin cliente'}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${item.empresa || 'Empresa no registrada'}</div>
                </td>
                <td class="px-6 py-4 capitalize">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        ${item.producto || 'Servicio General'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    ${item.horas || 0} hrs
                </td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    $${item.total ? Number(item.total).toFixed(2) : '0.00'}
                </td>
                <td class="px-6 py-4 text-center space-x-2">
                    <button 
                        onclick="reactivarCotizacion('${item.id}')"
                        class="font-medium text-blue-600 dark:text-blue-500 hover:underline text-xs bg-blue-50 dark:bg-gray-700 p-2 rounded">
                        Reactivar
                    </button>
                    <button 
                        onclick="eliminarCotizacion(${index})"
                        class="font-medium text-red-600 dark:text-red-500 hover:underline text-xs bg-red-50 dark:bg-gray-700 p-2 rounded">
                        Eliminar
                    </button>
                </td>
            `;

            tablaBody.appendChild(tr);
        });
    }

  
    window.reactivarCotizacion = function(id) {
        const historial = obtenerHistorial();
        const seleccionada = historial.find(item => item.id === id);

        if (seleccionada) {
            localStorage.setItem('cotizacionActiva', JSON.stringify(seleccionada));
            window.location.href = '/src/pages/cotizar.html'; 
        }
    };


    window.eliminarCotizacion = function(index) {
        if (!confirm('¿Deseas eliminar esta cotización archivada?')) return;

        const historial = obtenerHistorial();
        historial.splice(index, 1);
        localStorage.setItem('historialCotizaciones', JSON.stringify(historial));
        
        renderizarTabla();
    };


    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            const historial = obtenerHistorial();
            
            if (historial.length === 0) {
                alert('El historial ya está vacío.');
                return;
            }

            if (confirm('¿Estás seguro de que deseas borrar todo el historial de casos?')) {
                localStorage.removeItem('historialCotizaciones');
                renderizarTabla();
            }
        });
    }

    renderizarTabla();
});

const historial = JSON.parse(localStorage.getItem("jcsoft_historial")) || [];
