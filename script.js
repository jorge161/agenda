 let pdfBlob = null;
let agendaDatos = {}; // Guardar los datos del formulario

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    mostrarFormulario();
});

function mostrarFormulario() {
    document.getElementById("contenido").innerHTML = `
        <form id="formulario">
            <label>Barrio San Antonio:</label>

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

    // Asignar funcionalidad al botón Aceptar
    document.getElementById('btnAceptar').addEventListener('click', generarPDF);
}

function crearListaHTML(titulo, inputId, listaId, items=[]) {
    let listItems = items.map(texto => `<li>${texto} <button type="button" onclick="this.parentElement.remove()">❌</button></li>`).join('');
    return `
    <div class="list-container">
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

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    function checkPageSpace(lines = 1) {
        if (y + lineHeight * lines > pageHeight - 10) {
            doc.addPage();
            y = 15;
        }
    }

    function agregarCampo(nombre, valor) {
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${nombre}: ${valor || ''}`, 10, y);
        y += lineHeight;
    }

    function agregarListaPDF(titulo, items) {
        if(items.length === 0) return;
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${titulo}:`, 10, y);
        y += lineHeight;
        items.forEach(texto => {
            checkPageSpace();
            doc.text(`- ${texto}`, 15, y);
            y += 6;
        });
        y += 2;
    }

    doc.setFontSize(18);
    doc.text("Agenda Sacramental", 105, y, null, null, "center");
    y += 10;
    agregarCampo("Barrio", "San Antonio");
    agregarCampo("Fecha", agendaDatos.fecha);
    agregarCampo("Dirige", agendaDatos.dirige);
    agregarCampo("Preside", agendaDatos.preside);
    agregarListaPDF("Anuncios", agendaDatos.anuncios);
    agregarCampo("Primer Himno", agendaDatos.primerHimno);
    agregarCampo("Primera Oración", agendaDatos.primeraOracion);
    agregarCampo("Himno Sacramental", agendaDatos.himnoSacramental);
    agregarListaPDF("Asuntos del barrio", agendaDatos.asuntos);
    agregarListaPDF("Testimonios", agendaDatos.testimonios);
    agregarCampo("Primer Discursante", agendaDatos.primerDiscursante);
    agregarCampo("Himno Intermedio", agendaDatos.himnoIntermedio);
    agregarCampo("Segundo Discursante", agendaDatos.segundoDiscursante);
    agregarCampo("Último Himno", agendaDatos.ultimoHimno);
    agregarCampo("Última Oración", agendaDatos.ultimaOracion);

    pdfBlob = doc.output("blob");
    alert("¡Listo! Ahora puedes ver la agenda.");
}

function verPDF() {
    if(!pdfBlob){
        alert("Primero debes crear una agenda");
        return;
    }
    const fecha = agendaDatos.fecha || new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reunión_Sacramental_${fecha}.pdf`;
    const url = URL.createObjectURL(pdfBlob);

    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(`
        <html>
        <head>
            <title>Vista previa PDF</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                iframe { width: 100%; height: 80vh; border: 1px solid #ccc; margin-bottom: 10px; }
                button { padding: 10px 15px; font-size: 14px; border: none; background-color: #4CAF50; color: white; cursor: pointer; border-radius: 5px; }
                button:hover { background-color: #45a049; }
            </style>
        </head>
        <body>
            <h2>Vista previa del PDF</h2>
            <iframe src="${url}"></iframe>
            <br>
            <a href="${url}" download="${nombreArchivo}">
                <button>Descargar PDF</button>
            </a>
        </body>
        </html>
    `);
    previewWindow.document.close();
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
