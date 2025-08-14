 let pdfBlob = null;
let agendaDatos = {};

async function cargarDatos() {
    try {
        const res = await fetch('/api/agenda');
        agendaDatos = await res.json();
    } catch (error) {
        console.log("No se pudo cargar la agenda:", error);
        agendaDatos = {};
    }
}

async function guardarDatos() {
    try {
        await fetch('/api/agenda', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(agendaDatos)
        });
    } catch (error) {
        console.log("Error al guardar la agenda:", error);
    }
}

async function mostrarFormulario() {
    await cargarDatos();
    document.getElementById("contenido").innerHTML = `
        <form id="formulario">
            <label>Barrio San Antonio:</label>

            <label>Fecha:</label>
            <input type="date" id="fecha" value="${agendaDatos.fecha || ''}">

            <label>Dirige:</label>
            <input type="text" id="dirige" value="${agendaDatos.dirige || ''}">

            <label>Preside:</label>
            <input type="text" id="preside" value="${agendaDatos.preside || ''}">

            ${crearListaHTML('Anuncios','nuevoAnuncio','listaAnuncios', agendaDatos.anuncios)}
            <label>Primer Himno:</label>
            <input type="text" id="primerHimno" value="${agendaDatos.primerHimno || ''}">

            <label>Primera Oración:</label>
            <input type="text" id="primeraOracion" value="${agendaDatos.primeraOracion || ''}">

            ${crearListaHTML('Asuntos del barrio','nuevoAsunto','listaAsuntos', agendaDatos.asuntos)}
            ${crearListaHTML('Testimonios','nuevoTestimonio','listaTestimonios', agendaDatos.testimonios)}

            <label>Primer Discursante:</label>
            <input type="text" id="primerDiscursante" value="${agendaDatos.primerDiscursante || ''}">

            <label>Himno Intermedio:</label>
            <input type="text" id="himnoIntermedio" value="${agendaDatos.himnoIntermedio || ''}">

            <label>Segundo Discursante:</label>
            <input type="text" id="segundoDiscursante" value="${agendaDatos.segundoDiscursante || ''}">

            <label>Último Himno:</label>
            <input type="text" id="ultimoHimno" value="${agendaDatos.ultimoHimno || ''}">

            <label>Última Oración:</label>
            <input type="text" id="ultimaOracion" value="${agendaDatos.ultimaOracion || ''}">

            <button type="button" onclick="generarPDF()">Aceptar</button>
        </form>
    `;
}

function crearListaHTML(titulo, inputId, listaId, items=[]) {
    let liHTML = '';
    if (items && Array.isArray(items)) {
        items.forEach(texto => {
            liHTML += `<li>${texto}<button onclick="this.parentElement.remove()">❌</button></li>`;
        });
    }
    return `
    <div class="list-container">
        <label>${titulo}:</label>
        <div class="item-input">
            <input type="text" id="${inputId}" placeholder="Escribe aquí">
            <button type="button" onclick="agregarItem('${inputId}','${listaId}')">Agregar</button>
        </div>
        <ul id="${listaId}" class="item-list">
            ${liHTML}
        </ul>
    </div>`;
}

function agregarItem(inputId, listId) {
    const input = document.getElementById(inputId);
    const texto = input.value.trim();
    if (texto !== "") {
        const li = document.createElement("li");
        li.textContent = texto;
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "❌";
        btnEliminar.onclick = () => li.remove();
        li.appendChild(btnEliminar);
        document.getElementById(listId).appendChild(li);
        input.value = "";
    }
}

function generarPDF() {
    if (!window.jspdf) {
        alert("La librería jsPDF aún no está lista. Recarga la página y prueba otra vez.");
        return;
    }

    // Guardar datos en agendaDatos
    agendaDatos = {
        fecha: document.getElementById("fecha").value,
        dirige: document.getElementById("dirige").value,
        preside: document.getElementById("preside").value,
        primerHimno: document.getElementById("primerHimno").value,
        primeraOracion: document.getElementById("primeraOracion").value,
        primerDiscursante: document.getElementById("primerDiscursante").value,
        himnoIntermedio: document.getElementById("himnoIntermedio").value,
        segundoDiscursante: document.getElementById("segundoDiscursante").value,
        ultimoHimno: document.getElementById("ultimoHimno").value,
        ultimaOracion: document.getElementById("ultimaOracion").value,
        anuncios: Array.from(document.querySelectorAll("#listaAnuncios li")).map(li => li.textContent.replace('❌','')),
        asuntos: Array.from(document.querySelectorAll("#listaAsuntos li")).map(li => li.textContent.replace('❌','')),
        testimonios: Array.from(document.querySelectorAll("#listaTestimonios li")).map(li => li.textContent.replace('❌',''))
    };

    guardarDatos();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    function checkPageSpace(lines = 1) {
        if (y + lineHeight * lines > pageHeight - 10) {
            doc.addPage();
            y = 20;
        }
    }

    function agregarCampo(nombre, valor) {
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${nombre}: ${valor || ''}`, 15, y);
        y += lineHeight;
    }

    function agregarListaPDF(titulo, items) {
        if (!items || items.length === 0) return;
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${titulo}:`, 15, y);
        y += lineHeight;
        items.forEach(texto => {
            checkPageSpace();
            doc.text(`- ${texto}`, 20, y);
            y += 8;
        });
        y += 4;
    }

    doc.setFontSize(18);
    doc.text("Agenda Sacramental", 105, y, null, null, "center");
    y += 15;

    agregarCampo("Barrio", "San Antonio");
    agregarCampo("Fecha", agendaDatos.fecha);
    agregarCampo("Dirige", agendaDatos.dirige);
    agregarCampo("Preside", agendaDatos.preside);
    agregarListaPDF("Anuncios", agendaDatos.anuncios);
    agregarCampo("Primer Himno", agendaDatos.primerHimno);
    agregarCampo("Primera Oración", agendaDatos.primeraOracion);
    agregarListaPDF("Asuntos del barrio", agendaDatos.asuntos);
    agregarListaPDF("Testimonios", agendaDatos.testimonios);
    agregarCampo("Primer Discursante", agendaDatos.primerDiscursante);
    agregarCampo("Himno Intermedio", agendaDatos.himnoIntermedio);
    agregarCampo("Segundo Discursante", agendaDatos.segundoDiscursante);
    agregarCampo("Último Himno", agendaDatos.ultimoHimno);
    agregarCampo("Última Oración", agendaDatos.ultimaOracion);

    pdfBlob = doc.output("blob");
    alert("¡Agenda lista! Ahora presiona 'Ver Agenda' para visualizarla.");
}

function verPDF() {
    if(!pdfBlob){
        alert("Primero debes crear una agenda");
        return;
    }
    const fecha = agendaDatos.fecha || new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reunión_Sacramental_${fecha}.pdf`;
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank"); // Abre el PDF en nueva pestaña
}
