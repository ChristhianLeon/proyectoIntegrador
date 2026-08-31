import html2pdf from "html2pdf.js";

let TARIFAS_DEFECTO = {
  web: 15,
  software: 25,
  acompanamiento: 20
};

let PRECIOS_STACK = {
  selectBD: {
    "postgres": 500,
    "oracle": 1200,
    "mariadb": 300,
    "otras": 0
  },
  selectHerramientasLicencias: {
    "Pasarelas de pago": 250,
    "API de mapas y geolocalización": 200,
    "Servicios de mensajería (SMS/Email)": 300,
    "Herramientas de análisis (Analytics)": 200,
    "ninguno": 0
  },
  selectSSL: {
    "Propio": 500,
    "Otro": 100,
    "Ninguno": 0
  },
  selectHosting: {
    "Alojamiento web (Hosting)": 150,
    "Servidores en la nube (Cloud Computing)": 600,
    "propio/NA": 0
  }
};

let tarifasActuales = { ...TARIFAS_DEFECTO };

document.addEventListener("DOMContentLoaded", () => {
  cargarTarifasGuardadas();
  inicializarEventos();
  sincronizarFecha();
});

function cargarTarifasGuardadas() {
  let guardadas = localStorage.getItem("jcsoft_tarifas");
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

  let inputsGenerantes = [
    "inputCliente", "inputRUC", "inputDireccion", "inputCorreo", "inputTelefono", "selectProducto", "inputModelo", "inputNecesidad",
    "selectBD", "selectSSL", "selectHerramientasLicencias", "selectHosting",
    "hPlan", "hDes", "hPru", "hImp", "hMan"
  ];

  inputsGenerantes.forEach(id => {
    let elem = document.getElementById(id);
    if (elem) {
      elem.addEventListener("input", calcularCotizacion);
      elem.addEventListener("change", calcularCotizacion);
    }
  });
}

function login() {
  let u = document.getElementById("inputUsuario").value;
  let c = document.getElementById("inputClave").value;

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
  let tabCotizar = document.getElementById("tabCotizar");
  let tabAdmin = document.getElementById("tabAdmin");
  let areaCotizador = document.getElementById("areaCotizador");
  let areaAdministracion = document.getElementById("areaAdministracion");

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
  let hoy = new Date();
  let fechaStr = hoy.toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  document.getElementById("pdfFecha").innerText = fechaStr;
}

function sugerirHoras() {
  let total = parseFloat(document.getElementById("inputHorasTotales").value) || 0;
  if (total <= 0) return;

  document.getElementById("hPlan").value = Math.round(total * 0.10);
  document.getElementById("hDes").value = Math.round(total * 0.50);
  document.getElementById("hPru").value = Math.round(total * 0.20);
  document.getElementById("hImp").value = Math.round(total * 0.10);
  document.getElementById("hMan").value = Math.round(total * 0.10);

  calcularCotizacion();
}

function calcularCotizacion() {
  let cliente = document.getElementById("inputCliente").value || "Cliente no especificado";
  let ruc = document.getElementById("inputRUC").value || "No especificado";
  let direccion = document.getElementById("inputDireccion").value || "No especificada";
  let correo = document.getElementById("inputCorreo").value || "No especificado";
  let telefono = document.getElementById("inputTelefono").value || "No especificado";
  let servicioKey = document.getElementById("selectProducto").value;
  let modelo = document.getElementById("inputModelo").value || "Sistema Web Personalizado";
  let necesidad = document.getElementById("inputNecesidad").value || "Sin descripción adicional.";

  let tarifaHora = tarifasActuales[servicioKey] || 0;

  let selectBD = document.getElementById("selectBD");
  let selectSSL = document.getElementById("selectSSL");
  let selectHerramientasLicencias = document.getElementById("selectHerramientasLicencias");
  let selectHosting = document.getElementById("selectHosting");

  let costoBD = PRECIOS_STACK.selectBD[selectBD.value] || 0;
  let costoSSL = PRECIOS_STACK.selectSSL[selectSSL.value] || 0;
  let costoHerramientas = PRECIOS_STACK.selectHerramientasLicencias[selectHerramientasLicencias.value] || 0;
  let costoHost = PRECIOS_STACK.selectHosting[selectHosting.value] || 0;

  let hPlan = parseFloat(document.getElementById("hPlan").value) || 0;
  let hDes = parseFloat(document.getElementById("hDes").value) || 0;
  let hPru = parseFloat(document.getElementById("hPru").value) || 0;
  let hImp = parseFloat(document.getElementById("hImp").value) || 0;
  let hMan = parseFloat(document.getElementById("hMan").value) || 0;

  let totalHoras = hPlan + hDes + hPru + hImp + hMan;

  let costoOperativo = totalHoras * tarifaHora;
  let costoLicencias = costoBD + costoSSL + costoHerramientas + costoHost;
  let subtotal = costoOperativo + costoLicencias;
  let iva = subtotal * 0.15;
  let retencion = subtotal * 0.02;
  let riesgo = subtotal * 0.30;
  let totalNeto = subtotal + iva - retencion + riesgo;

  document.getElementById("pdfCliente").innerText = cliente;
  document.getElementById("pdfRUC").innerText = ruc;
  document.getElementById("pdfModelo").innerText = modelo;
  document.getElementById("pdfDireccion").innerText = direccion;
  document.getElementById("pdfCorreo").innerText = correo;
  document.getElementById("pdfTelefono").innerText = telefono;
  document.getElementById("pdfNecesidad").innerText = necesidad;

  document.getElementById("pdfBD").innerText = selectBD.options[selectBD.selectedIndex].text;
  document.getElementById("pdfSSL").innerText = selectSSL.options[selectSSL.selectedIndex].text;
  document.getElementById("pdfHerramientas").innerText = selectHerramientasLicencias.options[selectHerramientasLicencias.selectedIndex].text;
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
  document.getElementById("resRiesgo").innerText = `$${riesgo.toFixed(2)}`;
  document.getElementById("resTotal").innerText = `$${totalNeto.toFixed(2)}`;
}

function guardarTarifas() {
  let web = parseFloat(document.getElementById("tarifaWeb").value) || 0;
  let software = parseFloat(document.getElementById("tarifaSoftware").value) || 0;
  let acompanamiento = parseFloat(document.getElementById("tarifaAcompanamiento").value) || 0;

  tarifasActuales = { web, software, acompanamiento };
  localStorage.setItem("jcsoft_tarifas", JSON.stringify(tarifasActuales));

  alert("Tarifas actualizadas correctamente.");
  calcularCotizacion();
}

function descargarPDF() {
  let elemento = document.getElementById("contenedor-proforma-pdf");

  if (!elemento) {
    alert("Error: No se encontró el contenedor de la proforma.");
    return;
  }

  elemento.style.display = "block";
  elemento.style.width = "auto";
  elemento.style.maxWidth = "none";
  elemento.style.height = "auto";

  let anchoCaptura = Math.max(elemento.scrollWidth, elemento.offsetWidth, 794);
  let altoCaptura = Math.max(elemento.scrollHeight, elemento.offsetHeight, 1123);

  elemento.style.width = `${anchoCaptura}px`;

  let clienteStr = document.getElementById("inputCliente").value.trim() || "Cliente";

  let opciones = {
    margin: 0,
    filename: `Proforma_JCSoft_${clienteStr.replace(/\s+/g, "_")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: anchoCaptura,
      height: altoCaptura,
      windowWidth: anchoCaptura,
      windowHeight: altoCaptura,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    setTimeout(() => {
      html2pdf()
        .set(opciones)
        .from(elemento)
        .save()
        .then(() => console.log("PDF generado correctamente"))
        .catch((error) => {
          console.error("Error en html2pdf:", error);
          alert("Error al generar el PDF: " + error.message);
        });
    }, 150);
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Error al generar el PDF: " + error.message);
  }
}