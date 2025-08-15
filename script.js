let pdfBlob = null;
let agendaDatos = {};

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

    document.getElementById('btnAceptar').addEventListener('click', () => {
        if(validarCampos()) generarPDF();
    });
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
    if(texto !== "") {
        const li = document.createElement("li");
        li.innerHTML = `${texto} <button type="button" onclick="this.parentElement.remove()">❌</button>`;
        document.getElementById(listId).appendChild(li);
        input.value = "";
    }
    validarCampos();
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

function validarCampos() {
    let vacio = false;

    // Validar inputs de texto y fecha EXCLUYENDO los inputs dentro de listas
    document.querySelectorAll("input[type='text']:not(.list-container input)").forEach(input => {
        if(input.value.trim() === "") {
            input.classList.add('vacia');
            vacio = true;
        } else {
            input.classList.remove('vacia');
        }
    });
    document.querySelectorAll("input[type='date']").forEach(input => {
        if(input.value.trim() === "") {
            input.classList.add('vacia');
            vacio = true;
        } else {
            input.classList.remove('vacia');
        }
    });

    // Validar listas
    document.querySelectorAll(".list-container").forEach(container => {
        const input = container.querySelector("input[type='text']");
        const lista = container.querySelector(".item-list");
        const items = Array.from(lista.children).filter(li => li.textContent.replace('❌','').trim() !== '');
        if(items.length === 0) {
            input.classList.add('vacia');
            lista.classList.add('vacia');
            container.querySelector("button").classList.add('vacia');
            vacio = true;
        } else {
            input.classList.remove('vacia');
            lista.classList.remove('vacia');
            container.querySelector("button").classList.remove('vacia');
        }
    });

    if(vacio) {
        alert("Aún hay campos vacíos que deben ser llenados.");
        return false;
    }

    actualizarAgendaDatos();
    return true;
}


function generarPDF() {
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

    function agregarCampo(nombre, valor) {
        checkPageSpace();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`${nombre}:`, 10, y);
        doc.setFont("helvetica", "normal");
        const x = 10 + doc.getTextWidth(`${nombre}:`) + 5;
        const ancho = pageWidth - x - 10;
        const alto = 7;
        doc.setDrawColor(200);
        doc.setFillColor(245,245,245);
        doc.rect(x, y-5, ancho, alto, "FD");
        doc.text(`${valor}`, x+2, y);
        y += lineHeight;
    }

    function agregarListaPDF(titulo, items) {
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
            doc.setFillColor(245,245,245);
            doc.rect(x, y-5, ancho, alto, "FD");
            doc.text(`- ${texto}`, x+2, y);
            y += 7;
        });
        y += 2;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Agenda Sacramental", pageWidth/2, y, null, null, "center");
    y += 12;

    agregarCampo("Barrio", agendaDatos.barrio);
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

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("Cortesía de Jorge Silva, Barrio San Antonio Estaca El Merendón", pageWidth/2, pageHeight-10, null, null, "center");

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
        <a href="${url}" download="${nombreArchivo}" style="display:inline-block;margin-top:10px;padding:10px 15px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Descargar PDF</a>
        <button onclick="mostrarFormulario()" style="margin-top:10px;padding:10px 15px;border:none;border-radius:5px;background-color:#FF9800;color:white;cursor:pointer;">Regresar</button>
    `;
}

function descargarJSON() {
    actualizarAgendaDatos();
    const json = JSON.stringify(agendaDatos, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "agenda.json";
    a.click();
}

function cargarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            agendaDatos = JSON.parse(e.target.result);
            mostrarFormulario();
        } catch(err) {
            alert("Archivo JSON inválido");
        }
    };
    reader.readAsText(file);
}
