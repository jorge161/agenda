 const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('../')); // Sirve los archivos frontend

const agendaFile = path.join(__dirname, 'agenda.json');

app.get('/api/agenda', (req, res) => {
    if (fs.existsSync(agendaFile)) {
        const data = fs.readFileSync(agendaFile);
        res.json(JSON.parse(data));
    } else {
        res.json({});
    }
});

app.post('/api/agenda', (req, res) => {
    fs.writeFileSync(agendaFile, JSON.stringify(req.body, null, 2));
    res.json({status:'ok'});
});

app.listen(PORT, ()=>console.log(`Servidor corriendo en http://localhost:${PORT}`));
