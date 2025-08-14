 let pdfBlob = null;
let agendaDatos = {};

// Inicializa la agenda desde JSON en el servidor o vacío
function inicializar() {
    if (!agendaDatos || Object.keys(agendaDatos).length === 0) {
        agendaDatos = {};
    }
    generarPDF(); // Genera PDF inicial vacío
}

async function mostrarFormulario() {
    document.getElementById("contenido").innerHTML = `
        <form id="formulario">
            <label>Barrio San Antonio:</label>

            <label>Fecha:</label>
            <input type="date" id="fecha" value="${agendaDatos.fecha || ''}" oninput="generarPDF()">

            <label>Dirige:</label>
            <input type="text" id="dirige" value="${agendaDatos.dirige || ''}" oninput="generarPDF()">

            <label>Preside:</label>
            <input type="text" id="preside" value="${agendaDatos.preside || ''}" oninput="generarPDF()">

            ${crearListaHTML('Anuncios','nuevoAnuncio','listaAnuncios', agendaDatos.anuncios)}
            
            <label>Primer Himno:</label>
            <input type="text" id="primerHimno" value="${agendaDatos.primerHimno || ''}" oninput="generarPDF()">

            <label>Primera Oración:</label>
            <input type="text" id="primeraOracion" value="${agendaDatos.primeraOracion || ''}" oninput="generarPDF()">

            ${crearListaHTML('Asuntos del barrio','nuevoAsunto','listaAsuntos', agendaDatos.asuntos)}
            
            <label>Himno Sacramental:</label>
            <input type="text" id="himnoSacramental" value="${agendaDatos.himnoSacramental || ''}" oninput="generarPDF()">

            <label>Primer Discursante:</label>
            <input type="text" id="primerDiscursante" value="${agendaDatos.primerDiscursante || ''}" oninput="generarPDF()">

            ${crearListaHTML('Testimonios','nuevoTestimonio','listaTestimonios', agendaDatos.testimonios)}
            
            <label>Himno Intermedio:</label>
            <input type="text" id="himnoIntermedio" value="${agendaDatos.himnoIntermedio || ''}" oninput="generarPDF()">

            <label>Segundo Discursante:</label>
            <input type="text" id="segundoDiscursante" value="${agendaDatos.segundoDiscursante || ''}" oninput="generarPDF()">

            <label>Último Himno:</label>
            <input type="text" id="ultimoHimno" value="${agendaDatos.ultimoHimno || ''}" oninput="generarPDF()">

            <label>Última Oración:</label>
            <input type="text" id="ultimaOracion" value="${agendaDatos.ultimaOracion || ''}" oninput="generarPDF()">
        </form>
    `;
    generarPDF();
}

function crearListaHTML(titulo, inputId, listaId, items=[]) {
    let liHTML = '';
    if (items && Array.isArray(items)) {
        items.forEach(texto => {
            liHTML += `<li>${texto}<button onclick="eliminarItem(this,'${listaId}')">❌</button></li>`;
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
    if(texto !== ""){
        const li = document.createElement("li");
        li.textContent = texto;
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "❌";
        btnEliminar.onclick = () => eliminarItem(btnEliminar, listId);
        li.appendChild(btnEliminar);
        document.getElementById(listId).appendChild(li);
        input.value = "";
        generarPDF();
    }
}

function eliminarItem(btn, listId) {
    btn.parentElement.remove();
    generarPDF();
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    // Guardar los datos
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
        anuncios: Array.from(document.querySelectorAll("#listaAnuncios li")).map(li => li.textContent.replace('❌','')),
        asuntos: Array.from(document.querySelectorAll("#listaAsuntos li")).map(li => li.textContent.replace('❌','')),
        testimonios: Array.from(document.querySelectorAll("#listaTestimonios li")).map(li => li.textContent.replace('❌',''))
    };

    function checkPageSpace(lines=1){
        if(y + lineHeight*lines > pageHeight - 10){
            doc.addPage();
            y = 20;
        }
    }

    function agregarCampo(nombre, valor){
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${nombre}: ${valor}`, 15, y);
        y += lineHeight;
    }

    function agregarListaPDF(titulo, items){
        if(!items || items.length === 0) return;
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${titulo}:`, 15, y);
        y += lineHeight;
        items.forEach(texto=>{
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
    agregarCampo("Himno Sacramental", agendaDatos.himnoSacramental);
    agregarCampo("Primer Discursante", agendaDatos.primerDiscursante);
    agregarListaPDF("Testimonios", agendaDatos.testimonios);
    agregarCampo("Himno Intermedio", agendaDatos.himnoIntermedio);
    agregarCampo("Segundo Discursante", agendaDatos.segundoDiscursante);
    agregarCampo("Último Himno", agendaDatos.ultimoHimno);
    agregarCampo("Última Oración", agendaDatos.ultimaOracion);

    pdfBlob = doc.output("blob");
}

// Ver PDF en nueva ventana
function verPDF() {
    if(!pdfBlob){
        alert("Primero debes crear la agenda");
        return;
    }
    const fecha = agendaDatos.fecha || new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reunión_Sacramental_${fecha}.pdf`;
    const url = URL.createObjectURL(pdfBlob);

    // Crear nueva ventana con vista previa y botón de descarga
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


// Descargar JSON de datos
function descargarJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agendaDatos));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "agenda.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// Cargar JSON de datos
function cargarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
        try{
            agendaDatos = JSON.parse(e.target.result);
            mostrarFormulario();
        } catch(err){
            alert("Archivo JSON inválido");
        }
    };
    reader.readAsText(file);
}

// Inicializar
window.onload = inicializar;
