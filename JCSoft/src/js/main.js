import '../css/style.css';
import 'flowbite';
import html2pdf from 'html2pdf.js';

// 1. ESTRUCTURA DE DATOS BASE
const valoresPorDefecto = {
    tarifas: { web: 15.0, software: 25.0, acompanamiento: 20.0 },
    tecnologias: {
        bd: { postgres: 150, oracle: 300, mariadb: 120, otras: 0 },
        backend: { javaSpring: 250, python: 200, otras: 0 },
        frontend: { flutter: 250, jsf: 200, otras: 0 },
        hosting: { dedicado: 150, compartido: 60, otros: 0 }
    }
};

// Carga segura que evita errores si el localStorage guardó datos incompletos
function cargarConfiguracion() {
    try {
        const guardado = JSON.parse(localStorage.getItem('JCSoft_Config'));
        if (!guardado || !guardado.tarifas || !guardado.tecnologias) {
            return valoresPorDefecto;
        }
        return {
            tarifas: { ...valoresPorDefecto.tarifas, ...guardado.tarifas },
            tecnologias: {
                bd: { ...valoresPorDefecto.tecnologias.bd, ...(guardado.tecnologias.bd || {}) },
                backend: { ...valoresPorDefecto.tecnologias.backend, ...(guardado.tecnologias.backend || {}) },
                frontend: { ...valoresPorDefecto.tecnologias.frontend, ...(guardado.tecnologias.frontend || {}) },
                hosting: { ...valoresPorDefecto.tecnologias.hosting, ...(guardado.tecnologias.hosting || {}) }
            }
        };
    } catch (e) {
        return valoresPorDefecto;
    }
}

let configJCSoft = cargarConfiguracion();

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializar inputs de tarifas
    const inputTarifaWeb = document.getElementById('tarifaWeb');
    const inputTarifaSoftware = document.getElementById('tarifaSoftware');
    const inputTarifaAcomp = document.getElementById('tarifaAcompanamiento');

    if (inputTarifaWeb && inputTarifaSoftware && inputTarifaAcomp) {
        inputTarifaWeb.value = configJCSoft.tarifas.web;
        inputTarifaSoftware.value = configJCSoft.tarifas.software;
        inputTarifaAcomp.value = configJCSoft.tarifas.acompanamiento;
    }

    // 2. LOGIN Y LOGOUT
    const btnIngresar = document.getElementById('btnIngresar');
    if (btnIngresar) {
        btnIngresar.addEventListener('click', () => {
            const usuario = document.getElementById('inputUsuario').value.trim();
            const clave = document.getElementById('inputClave').value.trim();

            if (usuario === "admin" && clave === "1234") {
                document.getElementById('vista-login').classList.replace('block', 'hidden');
                document.getElementById('vista-sistema').classList.replace('hidden', 'block');
            } else {
                alert("Usuario o clave incorrectos.");
            }
        });
    }

    const btnSalir = document.getElementById('btnSalir');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            document.getElementById('vista-sistema').classList.replace('block', 'hidden');
            document.getElementById('vista-login').classList.replace('hidden', 'block');
            document.getElementById('inputUsuario').value = '';
            document.getElementById('inputClave').value = '';
        });
    }

    // 3. PESTAÑAS (SPA)
    const tabCotizar = document.getElementById('tabCotizar');
    const tabAdmin = document.getElementById('tabAdmin');
    const areaCotizar = document.getElementById('areaCotizador');
    const areaAdmin = document.getElementById('areaAdministracion');

    if (tabCotizar && tabAdmin) {
        tabCotizar.addEventListener('click', (e) => {
            e.preventDefault();
            areaCotizar.classList.replace('hidden', 'block');
            areaAdmin.classList.replace('block', 'hidden');
            tabCotizar.className = "w-full p-4 font-bold text-blue-600 bg-white border-t-4 border-blue-600 focus:outline-none";
            tabAdmin.className = "w-full p-4 font-bold text-gray-500 hover:text-blue-600 focus:outline-none";
        });

        tabAdmin.addEventListener('click', (e) => {
            e.preventDefault();
            areaAdmin.classList.replace('hidden', 'block');
            areaCotizar.classList.replace('block', 'hidden');
            tabAdmin.className = "w-full p-4 font-bold text-blue-600 bg-white border-t-4 border-blue-600 focus:outline-none";
            tabCotizar.className = "w-full p-4 font-bold text-gray-500 hover:text-blue-600 focus:outline-none";
        });
    }

    // 4. GUARDAR TARIFAS
    const btnGuardarTarifas = document.getElementById('btnGuardarTarifas');
    if (btnGuardarTarifas) {
        btnGuardarTarifas.addEventListener('click', () => {
            const nWeb = parseFloat(document.getElementById('tarifaWeb').value);
            const nSoftware = parseFloat(document.getElementById('tarifaSoftware').value);
            const nAcompa = parseFloat(document.getElementById('tarifaAcompanamiento').value);

            if (nWeb > 0 && nSoftware > 0 && nAcompa > 0) {
                configJCSoft.tarifas.web = nWeb;
                configJCSoft.tarifas.software = nSoftware;
                configJCSoft.tarifas.acompanamiento = nAcompa;
                localStorage.setItem('JCSoft_Config', JSON.stringify(configJCSoft));
                alert("Tarifas actualizadas correctamente.");
            } else {
                alert("Ingrese valores mayores a cero.");
            }
        });
    }

    // 5. SUGERENCIA DE HORAS
    const btnSugerir = document.getElementById('btnSugerir');
    if (btnSugerir) {
        btnSugerir.addEventListener('click', () => {
            const total = parseFloat(document.getElementById('inputHorasTotales').value) || 0;
            document.getElementById('hPlan').value = Math.round(total * 0.15);
            document.getElementById('hDes').value = Math.round(total * 0.40);
            document.getElementById('hPru').value = Math.round(total * 0.20);
            document.getElementById('hImp').value = Math.round(total * 0.15);
            document.getElementById('hMan').value = Math.round(total * 0.10);
        });
    }

    // 6. MOTOR DE CÁLCULO Y RENDERIZADO DEL PDF
    const btnCalcular = document.getElementById('btnCalcular');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            // A. Datos Generales
            const clienteVal = document.getElementById('inputCliente').value.trim() || "Consumidor Final";
            const modeloVal = document.getElementById('inputModelo').value;
            const necesidadVal = document.getElementById('inputNecesidad').value.trim() || "Sin descripción";

            document.getElementById('pdfCliente').innerText = clienteVal;
            document.getElementById('pdfModelo').innerText = modeloVal;
            document.getElementById('pdfNecesidad').innerText = necesidadVal;

            // B. Tarifa según Producto
            const selectProd = document.getElementById('selectProducto');
            const costoHora = configJCSoft.tarifas[selectProd.value] || 20.0;
            document.getElementById('pdfTarifa').innerText = costoHora.toFixed(2);

            // C. Textos de Tecnologías Seleccionadas
            const selBD = document.getElementById('selectBD');
            const selBack = document.getElementById('selectBackend');
            const selFront = document.getElementById('selectFrontend');
            const selHost = document.getElementById('selectHosting');

            document.getElementById('pdfBD').innerText = selBD.options[selBD.selectedIndex].text;
            document.getElementById('pdfBack').innerText = selBack.options[selBack.selectedIndex].text;
            document.getElementById('pdfFront').innerText = selFront.options[selFront.selectedIndex].text;
            document.getElementById('pdfHost').innerText = selHost.options[selHost.selectedIndex].text;

            // D. Horas por Fase
            const hPlan = parseFloat(document.getElementById('hPlan').value) || 0;
            const hDes = parseFloat(document.getElementById('hDes').value) || 0;
            const hPru = parseFloat(document.getElementById('hPru').value) || 0;
            const hImp = parseFloat(document.getElementById('hImp').value) || 0;
            const hMan = parseFloat(document.getElementById('hMan').value) || 0;

            document.getElementById('pdfPlan').innerText = hPlan;
            document.getElementById('pdfDes').innerText = hDes;
            document.getElementById('pdfPru').innerText = hPru;
            document.getElementById('pdfImp').innerText = hImp;
            document.getElementById('pdfMan').innerText = hMan;

            // E. Operaciones Matemáticas
            const totalHoras = hPlan + hDes + hPru + hImp + hMan;
            const costoOperativo = totalHoras * costoHora;

            const costoTec = 
                (configJCSoft.tecnologias.bd[selBD.value] || 0) +
                (configJCSoft.tecnologias.backend[selBack.value] || 0) +
                (configJCSoft.tecnologias.frontend[selFront.value] || 0) +
                (configJCSoft.tecnologias.hosting[selHost.value] || 0);

            const subtotal = costoOperativo + costoTec;
            const iva = subtotal * 0.15;
            const retencion = subtotal * 0.02;
            const totalFinal = (subtotal + iva) - retencion;

            // F. Actualización del Resumen Financiero
            document.getElementById('resOperativo').innerText = `$${costoOperativo.toFixed(2)}`;
            document.getElementById('resTecnologico').innerText = `$${costoTec.toFixed(2)}`;
            document.getElementById('resSubtotal').innerText = `$${subtotal.toFixed(2)}`;
            document.getElementById('resIVA').innerText = `$${iva.toFixed(2)}`;
            document.getElementById('resRetencion').innerText = `-$${retencion.toFixed(2)}`;
            document.getElementById('resTotal').innerText = `$${totalFinal.toFixed(2)}`;

            // Desplazar la vista suavemente hacia la proforma
            document.getElementById('contenedor-proforma-pdf').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 7. DESCARGA EN PDF
    const btnGenerarPDF = document.getElementById('btnGenerarPDF');
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener('click', () => {
            const elemento = document.getElementById('contenedor-proforma-pdf');
            const opt = {
                margin: 0.5,
                filename: 'Cotizacion_JCSoft.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(elemento).save();
        });
    }
});