function agregarItem(listaId, nombreCampo) {
    const lista = document.getElementById(listaId);
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
        <input type="text" name="${nombreCampo}[]" placeholder="Escribe aquí" required>
        <button type="button" onclick="eliminarItem(this)">❌</button>
    `;
    lista.appendChild(div);
}

function eliminarItem(boton) {
    boton.parentElement.remove();
}

function verPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nombreReunion = document.getElementById("nombreReunion").value;
    const fecha = document.getElementById("fecha").value;

    let y = 10;
    doc.setFontSize(16);
    doc.text(nombreReunion, 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 10, y);
    y += 10;

    y = agregarSeccionPDF(doc, "Oradores", "oradores[]", y);
    y = agregarSeccionPDF(doc, "Himnos", "himnos[]", y);
    y = agregarSeccionPDF(doc, "Anuncios", "anuncios[]", y);

    const nombreArchivo = `${nombreReunion}_${fecha}.pdf`;
    const blob = doc.output("blob");

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}

function agregarSeccionPDF(doc, titulo, campoName, y) {
    doc.setFontSize(14);
    doc.text(titulo, 10, y);
    y += 6;

    const campos = document.getElementsByName(campoName);
    doc.setFontSize(12);

    for (let campo of campos) {
        doc.text(`- ${campo.value}`, 15, y);
        y += 6;
    }
    return y + 4;
}
