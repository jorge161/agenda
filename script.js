 let pdfBlob = null;

function mostrarFormulario() {
    document.getElementById("contenido").innerHTML = `
        <form id="formulario">
            <label>Barrio San Antonio:</label>

            <label>Fecha:</label>
            <input type="date" id="fecha">

            <label>Dirige:</label>
            <input type="text" id="dirige">

            <label>Preside:</label>
            <input type="text" id="preside">

            ${crearListaHTML('Anuncios','nuevoAnuncio','listaAnuncios')}
            <label>Primer Himno:</label>
            <input type="text" id="primerHimno">

            <label>Primera Oración:</label>
            <input type="text" id="primeraOracion">

            ${crearListaHTML('Asuntos del barrio','nuevoAsunto','listaAsuntos')}
            ${crearListaHTML('Testimonios','nuevoTestimonio','listaTestimonios')}

            <label>Primer Discursante:</label>
            <input type="text" id="primerDiscursante">

            <label>Himno Intermedio:</label>
            <input type="text" id="himnoIntermedio">

            <label>Segundo Discursante:</label>
            <input type="text" id="segundoDiscursante">

            <label>Último Himno:</label>
            <input type="text" id="ultimoHimno">

            <label>Última Oración:</label>
            <input type="text" id="ultimaOracion">

            <button type="button" onclick="generarPDF()">Aceptar</button>
        </form>
    `;
}

function crearListaHTML(titulo, inputId, listaId) {
    return `
    <div class="list-container">
        <label>${titulo}:</label>
        <div class="item-input">
            <input type="text" id="${inputId}" placeholder="Escribe aquí">
            <button type="button" onclick="agregarItem('${inputId}','${listaId}')">Agregar</button>
        </div>
        <ul id="${listaId}" class="item-list"></ul>
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

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15;
    const lineHeight = 10;
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

    function agregarListaPDF(titulo, listaId) {
        const items = document.querySelectorAll(`#${listaId} li`);
        if (items.length === 0) return;
        checkPageSpace();
        doc.setFontSize(12);
        doc.text(`${titulo}:`, 10, y);
        y += lineHeight;
        items.forEach(li => {
            checkPageSpace();
            doc.text(`- ${li.textContent.replace('❌','')}`, 15, y);
            y += 6;
        });
        y += 2;
    }

    doc.setFontSize(18);
    doc.text("Agenda Sacramental", 105, y, null, null, "center");
    y += 15;

    agregarCampo("Barrio", "San Antonio");
    agregarCampo("Fecha", document.getElementById("fecha").value);
    agregarCampo("Dirige", document.getElementById("dirige").value);
    agregarCampo("Preside", document.getElementById("preside").value);
    agregarListaPDF("Anuncios","listaAnuncios");
    agregarCampo("Primer Himno", document.getElementById("primerHimno").value);
    agregarCampo("Primera Oración", document.getElementById("primeraOracion").value);
    agregarListaPDF("Asuntos del barrio","listaAsuntos");
    agregarListaPDF("Testimonios","listaTestimonios");
    agregarCampo("Primer Discursante", document.getElementById("primerDiscursante").value);
    agregarCampo("Himno Intermedio", document.getElementById("himnoIntermedio").value);
    agregarCampo("Segundo Discursante", document.getElementById("segundoDiscursante").value);
    agregarCampo("Último Himno", document.getElementById("ultimoHimno").value);
    agregarCampo("Última Oración", document.getElementById("ultimaOracion").value);

    pdfBlob = doc.output("blob");
    alert("PDF generado. Ahora presiona 'Ver Agenda' para visualizarlo.");
}

function verPDF() {
    if (!pdfBlob) {
        alert("Primero debes crear la agenda.");
        return;
    }
    const fecha = document.getElementById("fecha").value || new Date().toISOString().split('T')[0];
    const nombreArchivo = `Agenda_Sacramental_${fecha}.pdf`;
    const url = URL.createObjectURL(pdfBlob);
    document.getElementById("contenido").innerHTML = `
        <h2>Vista previa del PDF</h2>
        <iframe src="${url}" title="${nombreArchivo}"></iframe>
        <button onclick="mostrarFormulario()">Volver al formulario</button>
    `;
}
