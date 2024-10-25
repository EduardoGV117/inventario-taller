function showSection(sectionId) {
    // Ocultar todas las secciones
    let sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    let activeSection = document.getElementById(sectionId);
    activeSection.classList.add('active');
}
