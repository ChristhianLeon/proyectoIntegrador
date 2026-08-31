import '../css/style.css';
import 'flowbite';
import html2pdf from 'html2pdf.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnAbrirModal = document.getElementById('btnAbrirModal');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const contactoModal = document.getElementById('contactoModal');
    const formularioContacto = document.getElementById('formularioContacto');
    const mensajeExito = document.getElementById('mensajeExito');
    if (btnAbrirModal && contactoModal) {
        btnAbrirModal.addEventListener('click', () => {
            contactoModal.classList.remove('hidden');
            formularioContacto.classList.remove('hidden');
            mensajeExito.classList.add('hidden');
            formularioContacto.reset();
        });

        btnCerrarModal.addEventListener('click', () => {
            contactoModal.classList.add('hidden');
        });

        formularioContacto.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue
            

            formularioContacto.classList.add('hidden');
            mensajeExito.classList.remove('hidden');
        });
    }
});