 let pdfBlob = null;
let agendaDatos = {}; // Datos del formulario

document.addEventListener('DOMContentLoaded', () => {
    mostrarFormulario();
});

function mostrarFormulario() {
    document.getElementById("contenido").innerHTML = `
        <form id="formulario">
            <label>Barrio:</label>
            <input type="text" id="barrio" value="${agendaDatos.barrio || ''}">

            <label>Fecha:</label>
            <input type="date" id="fecha" value="${agendaDatos.fecha || ''}">

            <label>Dirige:</label>
            <input type="text" id="dirige" value="${agendaDatos.dirige || ''}">

            <label>Preside:</label>
            <input type="text" id="preside" value="${agendaDatos.preside || ''}">

            ${crearListaHTML('Anuncios','nuevoAnuncio','listaAnuncios', agendaDatos.anuncios || [])}

            <label>Primer Himno:</label>
            <input type="text" id="primerHimno" value="${agendaDatos.primerHimno || ''}">

            <label>Primera Oración:</label>
            <input type="text" id="primeraOracion" value="${agendaDatos.primeraOracion || ''}">

            <label>Himno Sacramental:</label>
            <input type="text" id="himnoSacramental" value="${agendaDatos.himnoSacramental || ''}">

            ${crearListaHTML('Asuntos del barrio','nuevoAsunto','listaAsuntos', agendaDatos.asuntos || [])}
            ${crearListaHTML('Testimonios','nuevoTestimonio','listaTestimonios', agendaDatos.testimonios || [])}

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

            <button type="button" id="btnAceptar">Aceptar</button>
        </form>
    `;

    document.getElementById('btnAceptar').addEventListener('click', generarPDF);
}

function crearListaHTML(titulo, inputId, listaId, items=[]) {
    let listItems = items.map(texto => `<li>${texto} <button type="button" onclick="this.parentElement.remove()">❌</button></li>`).join('');
    return `
    <div class="list-container" id="container-${listaId}">
        <label>${titulo}:</label>
        <div class="item-input">
            <input type="text" id="${inputId}" placeholder="Escribe aquí">
            <button type="button" onclick="agregarItem('${inputId}','${listaId}')">Agregar</button>
        </div>
        <ul id="${listaId}" class="item-list">${listItems}</ul>
    </div>`;
}

function agregarItem(inputId, listId) {
    const input = document.getElementById(inputId);
    const texto = input.value.trim();
    if (texto !== "") {
        const li = document.createElement("li");
        li.innerHTML = `${texto} <button type="button" onclick="this.parentElement.remove()">❌</button>`;
        document.getElementById(listId).appendChild(li);
        input.value = "";
    }
}

function actualizarAgendaDatos() {
    agendaDatos = {
        barrio: document.getElementById("barrio")?.value || '',
        fecha: document.getElementById("fecha")?.value || '',
        dirige: document.getElementById("dirige")?.value || '',
        preside: document.getElementById("preside")?.value || '',
        primerHimno: document.getElementById("primerHimno")?.value || '',
        primeraOracion: document.getElementById("primeraOracion")?.value || '',
        himnoSacramental: document.getElementById("himnoSacramental")?.value || '',
        primerDiscursante: document.getElementById("primerDiscursante")?.value || '',
        himnoIntermedio: document.getElementById("himnoIntermedio")?.value || '',
        segundoDiscursante: document.getElementById("segundoDiscursante")?.value || '',
        ultimoHimno: document.getElementById("ultimoHimno")?.value || '',
        ultimaOracion: document.getElementById("ultimaOracion")?.value || '',
        anuncios: Array.from(document.querySelectorAll("#listaAnuncios li")).map(li => li.textContent.replace('❌','').trim()),
        asuntos: Array.from(document.querySelectorAll("#listaAsuntos li")).map(li => li.textContent.replace('❌','').trim()),
        testimonios: Array.from(document.querySelectorAll("#listaTestimonios li")).map(li => li.textContent.replace('❌','').trim())
    };
}

function generarPDF() {
    actualizarAgendaDatos();

    // Validar campos obligatorios
    const camposObligatorios = [
        'barrio','fecha','dirige','preside',
        'primerHimno','primeraOracion','himnoSacramental',
        'primerDiscursante','himnoIntermedio','segundoDiscursante',
        'ultimoHimno','ultimaOracion'
    ];

    let camposVacios = [];
    camposObligatorios.forEach(campo => {
        const input = document.getElementById(campo);
        if (!agendaDatos[campo] || agendaDatos[campo].trim() === '') {
            input.style.border = '2px solid red'; // resaltar
            camposVacios.push(campo);
        } else {
            input.style.border = ''; // quitar borde
        }
    });

    // Validar listas
    const listasObligatorias = [
        {id: 'listaAnuncios', containerId: 'container-listaAnuncios'},
        {id: 'listaAsuntos', containerId: 'container-listaAsuntos'},
        {id: 'listaTestimonios', containerId: 'container-listaTestimonios'}
    ];

    listasObligatorias.forEach(lista => {
        const container = document.getElementById(lista.containerId);
        const items = document.getElementById(lista.id).children;
        if (items.length === 0) {
            container.style.border = '2px solid red';
            camposVacios.push(lista.id);
        } else {
            container.style.border = '';
        }
    });

    if (camposVacios.length > 0) {
        alert("Por favor completa todos los campos y listas obligatorias resaltadas en rojo antes de generar el PDF.");
        return;
    }

    // Crear PDF con jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    function checkPageSpace(lines = 1) {
        if (y + lineHeight * lines > pageHeight - 20) {
            doc.addPage();
            y = 15;
        }
    }

    function agregarCampo(nombre, valor, colorFondo = [245,245,245]) {
        checkPageSpace();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`${nombre}:`, 10, y);

        doc.setFont("helvetica", "normal");
        const margen = 5;
        const x = 10 + doc.getTextWidth(`${nombre}:`) + margen;
        const ancho = pageWidth - x - 10;
        const alto = 7;
        doc.setDrawColor(200);
        doc.setFillColor(...colorFondo);
        doc.rect(x, y - 5, ancho, alto, "FD");
        doc.text(`${valor}`, x + 2, y);
        y += lineHeight;
    }

    function agregarListaPDF(titulo, items, colorFondo=[245,245,245]) {
        if(items.length === 0) return;
        checkPageSpace();
        doc.setFont("helvetica", "bold");
        doc.text(`${titulo}:`, 10, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        items.forEach(texto => {
            checkPageSpace();
            const x = 15;
            const ancho = pageWidth - x - 15;
            const alto = 6;
            doc.setDrawColor(200);
            doc.setFillColor(...colorFondo);
            doc.rect(x, y - 5, ancho, alto, "FD");
            doc.text(`- ${texto}`, x + 2, y);
            y += 7;
        });
        y += 2;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Agenda Sacramental", pageWidth/2, y, null, null, "center");
    y += 12;

    const colores = [
        [245,245,245], [230, 240, 255], [245,245,245], [230, 240, 255]
    ];

    agregarCampo("Barrio", agendaDatos.barrio, colores[0]);
    agregarCampo("Fecha", agendaDatos.fecha, colores[1]);
    agregarCampo("Dirige", agendaDatos.dirige, colores[2]);
    agregarCampo("Preside", agendaDatos.preside, colores[3]);
    agregarListaPDF("Anuncios", agendaDatos.anuncios, colores[0]);
    agregarCampo("Primer Himno", agendaDatos.primerHimno, colores[1]);
    agregarCampo("Primera Oración", agendaDatos.primeraOracion, colores[2]);
    agregarCampo("Himno Sacramental", agendaDatos.himnoSacramental, colores[3]);
    agregarListaPDF("Asuntos del barrio", agendaDatos.asuntos, colores[0]);
    agregarListaPDF("Testimonios", agendaDatos.testimonios, colores[1]);
    agregarCampo("Primer Discursante", agendaDatos.primerDiscursante, colores[2]);
    agregarCampo("Himno Intermedio", agendaDatos.himnoIntermedio, colores[3]);
    agregarCampo("Segundo Discursante", agendaDatos.segundoDiscursante, colores[0]);
    agregarCampo("Último Himno", agendaDatos.ultimoHimno, colores[1]);
    agregarCampo("Última Oración", agendaDatos.ultimaOracion, colores[2]);

    // Pie de página
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Cortesía de Jorge D. Silva, Barrio San Antonio Estaca El Merendón", pageWidth/2, pageHeight - 10, null, null, "center");

    pdfBlob = doc.output("blob");
    alert("¡Listo! Ahora puedes ver la agenda.");
}

function verPDF() {
    if (!pdfBlob) {
        alert("Primero debes crear una agenda");
        return;
    }

    const fecha = agendaDatos.fecha || new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reunión_Sacramental_${fecha}.pdf`;
    const url = URL.createObjectURL(pdfBlob);

    document.getElementById("contenido").innerHTML = `
        <h2>Vista previa del PDF</h2>
        <embed src="${url}" type="application/pdf" width="100%" height="600px" style="border:1px solid #ccc;">
        <br>
        <a href="${url}" download="${nombreArchivo}" style="display:inline-block;margin-top:10px;padding:10px 15px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
            Descargar PDF
        </a>
        <button onclick="mostrarFormulario()" style="margin-left:10px;padding:10px 15px;background-color:#555;color:white;border:none;border-radius:5px;cursor:pointer;">
            Volver al formulario
        </button>
    `;
}

// Descargar JSON
function descargarJSON() {
    actualizarAgendaDatos();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agendaDatos));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "agenda.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// Cargar JSON
function cargarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        agendaDatos = JSON.parse(e.target.result);
        mostrarFormulario(); // precarga editable
    };
    reader.readAsText(file);
}
