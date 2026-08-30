import { jsPDF } from "jspdf";

const TARIFAS_DEFECTO = {
  web: 15,
  software: 25,
  acompanamiento: 20
};

const PRECIOS_STACK = {
  selectBD: {
    postgres: 150,
    oracle: 300,
    mariadb: 120,
    otras: 0
  },
  selectBackend: {
    javaSpring: 250,
    python: 200,
    otras: 0
  },
  selectFrontend: {
    flutter: 250,
    jsf: 200,
    otras: 0
  },
  selectHosting: {
    dedicado: 150,
    compartido: 60,
    otros: 0
  }
};

let tarifasActuales = { ...TARIFAS_DEFECTO };

document.addEventListener("DOMContentLoaded", () => {
  cargarTarifasGuardadas();
  inicializarEventos();
  sincronizarFecha();
});

function cargarTarifasGuardadas() {
  const guardadas = localStorage.getItem("jcsoft_tarifas");
  if (guardadas) {
    try {
      tarifasActuales = JSON.parse(guardadas);
    } catch (e) {
      tarifasActuales = { ...TARIFAS_DEFECTO };
    }
  }

  document.getElementById("tarifaWeb").value = tarifasActuales.web;
  document.getElementById("tarifaSoftware").value = tarifasActuales.software;
  document.getElementById("tarifaAcompanamiento").value = tarifasActuales.acompanamiento;
}

function inicializarEventos() {
  document.getElementById("btnIngresar").addEventListener("click", login);
  document.getElementById("btnSalir").addEventListener("click", logout);

  document.getElementById("tabCotizar").addEventListener("click", () => cambiarPestana("cotizar"));
  document.getElementById("tabAdmin").addEventListener("click", () => cambiarPestana("admin"));

  document.getElementById("btnSugerir").addEventListener("click", sugerirHoras);
  document.getElementById("btnCalcular").addEventListener("click", calcularCotizacion);
  document.getElementById("btnGuardarTarifas").addEventListener("click", guardarTarifas);
  document.getElementById("btnGenerarPDF").addEventListener("click", descargarPDF);

  const inputsGenerantes = [
    "inputCliente", "selectProducto", "inputModelo", "inputNecesidad",
    "selectBD", "selectBackend", "selectFrontend", "selectHosting",
    "hPlan", "hDes", "hPru", "hImp", "hMan"
  ];

  inputsGenerantes.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.addEventListener("input", calcularCotizacion);
      elem.addEventListener("change", calcularCotizacion);
    }
  });
}

function login() {
  const u = document.getElementById("inputUsuario").value;
  const c = document.getElementById("inputClave").value;

  if (u === "admin" && c === "admin") {
    document.getElementById("vista-login").classList.add("hidden");
    document.getElementById("vista-sistema").classList.remove("hidden");
    calcularCotizacion();
  } else {
    alert("Credenciales incorrectas. Use admin/admin");
  }
}

function logout() {
  document.getElementById("vista-sistema").classList.add("hidden");
  document.getElementById("vista-login").classList.remove("hidden");
  document.getElementById("inputUsuario").value = "";
  document.getElementById("inputClave").value = "";
}

function cambiarPestana(tab) {
  const tabCotizar = document.getElementById("tabCotizar");
  const tabAdmin = document.getElementById("tabAdmin");
  const areaCotizador = document.getElementById("areaCotizador");
  const areaAdministracion = document.getElementById("areaAdministracion");

  if (tab === "cotizar") {
    tabCotizar.className = "pestana pestana-activa";
    tabAdmin.className = "pestana pestana-inactiva";
    areaCotizador.classList.remove("hidden");
    areaAdministracion.classList.add("hidden");
  } else {
    tabAdmin.className = "pestana pestana-activa";
    tabCotizar.className = "pestana pestana-inactiva";
    areaAdministracion.classList.remove("hidden");
    areaCotizador.classList.add("hidden");
  }
}

function sincronizarFecha() {
  const hoy = new Date();
  const fechaStr = hoy.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  document.getElementById("pdfFecha").innerText = fechaStr;
}

function sugerirHoras() {
  const total = parseFloat(document.getElementById("inputHorasTotales").value) || 0;
  if (total <= 0) return;

  document.getElementById("hPlan").value = Math.round(total * 0.10);
  document.getElementById("hDes").value = Math.round(total * 0.50);
  document.getElementById("hPru").value = Math.round(total * 0.20);
  document.getElementById("hImp").value = Math.round(total * 0.10);
  document.getElementById("hMan").value = Math.round(total * 0.10);

  calcularCotizacion();
}

function calcularCotizacion() {
  const cliente = document.getElementById("inputCliente").value || "Cliente no especificado";
  const servicioKey = document.getElementById("selectProducto").value;
  const modelo = document.getElementById("inputModelo").value || "Sistema Web Personalizado";
  const necesidad = document.getElementById("inputNecesidad").value || "Sin descripción adicional.";

  const tarifaHora = tarifasActuales[servicioKey] || 0;

  const selectBD = document.getElementById("selectBD");
  const selectBackend = document.getElementById("selectBackend");
  const selectFrontend = document.getElementById("selectFrontend");
  const selectHosting = document.getElementById("selectHosting");

  const costoBD = PRECIOS_STACK.selectBD[selectBD.value] || 0;
  const costoBack = PRECIOS_STACK.selectBackend[selectBackend.value] || 0;
  const costoFront = PRECIOS_STACK.selectFrontend[selectFrontend.value] || 0;
  const costoHost = PRECIOS_STACK.selectHosting[selectHosting.value] || 0;

  const hPlan = parseFloat(document.getElementById("hPlan").value) || 0;
  const hDes = parseFloat(document.getElementById("hDes").value) || 0;
  const hPru = parseFloat(document.getElementById("hPru").value) || 0;
  const hImp = parseFloat(document.getElementById("hImp").value) || 0;
  const hMan = parseFloat(document.getElementById("hMan").value) || 0;

  const totalHoras = hPlan + hDes + hPru + hImp + hMan;

  const costoOperativo = totalHoras * tarifaHora;
  const costoLicencias = costoBD + costoBack + costoFront + costoHost;
  const subtotal = costoOperativo + costoLicencias;
  const iva = subtotal * 0.15;
  const retencion = subtotal * 0.02;
  const totalNeto = subtotal + iva - retencion;

  document.getElementById("pdfCliente").innerText = cliente;
  document.getElementById("pdfModelo").innerText = modelo;
  document.getElementById("pdfNecesidad").innerText = necesidad;

  document.getElementById("pdfBD").innerText = selectBD.options[selectBD.selectedIndex].text;
  document.getElementById("pdfBack").innerText = selectBackend.options[selectBackend.selectedIndex].text;
  document.getElementById("pdfFront").innerText = selectFrontend.options[selectFrontend.selectedIndex].text;
  document.getElementById("pdfHost").innerText = selectHosting.options[selectHosting.selectedIndex].text;

  document.getElementById("pdfTarifa").innerText = tarifaHora.toFixed(2);
  document.getElementById("pdfPlan").innerText = hPlan;
  document.getElementById("pdfDes").innerText = hDes;
  document.getElementById("pdfPru").innerText = hPru;
  document.getElementById("pdfImp").innerText = hImp;
  document.getElementById("pdfMan").innerText = hMan;

  document.getElementById("resOperativo").innerText = `$${costoOperativo.toFixed(2)}`;
  document.getElementById("resTecnologico").innerText = `$${costoLicencias.toFixed(2)}`;
  document.getElementById("resSubtotal").innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById("resIVA").innerText = `$${iva.toFixed(2)}`;
  document.getElementById("resRetencion").innerText = `-$${retencion.toFixed(2)}`;
  document.getElementById("resTotal").innerText = `$${totalNeto.toFixed(2)}`;
}

function guardarTarifas() {
  const web = parseFloat(document.getElementById("tarifaWeb").value) || 0;
  const software = parseFloat(document.getElementById("tarifaSoftware").value) || 0;
  const acompanamiento = parseFloat(document.getElementById("tarifaAcompanamiento").value) || 0;

  tarifasActuales = { web, software, acompanamiento };
  localStorage.setItem("jcsoft_tarifas", JSON.stringify(tarifasActuales));

  alert("Tarifas actualizadas correctamente.");
  calcularCotizacion();
}

function descargarPDF() {
  const elemento = document.getElementById("contenedor-proforma-pdf");
  const clienteStr = document.getElementById("inputCliente").value.trim() || "Cliente";

  const opciones = {
    margin: 10,
    filename: `Proforma_JCSoft_${clienteStr.replace(/\s+/g, "_")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  if (window.html2pdf) {
    window.html2pdf().set(opciones).from(elemento).save();
  } else {
    alert("Error al cargar la librería de exportación a PDF.");
  }
}

function guardarEnHistorial(cotizacion) {
  let historial = JSON.parse(localStorage.getItem("jcsoft_historial")) || [];
  
 
  const nuevaCotizacion = {
    id: Date.now(),
    fecha: new Date().toLocaleDateString("es-EC"),
    cliente: cotizacion.cliente,
    servicio: cotizacion.servicio,
    total: cotizacion.total
  };

  historial.push(nuevaCotizacion);
  localStorage.setItem("jcsoft_historial", JSON.stringify(historial));
}