const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 2020; // Porta para a API HTTP
const WS_PORT = 2021; // Porta para o WebSocket
const CLIENTS = {}; // Armazena os clientes conectados

const cors = require('cors');
app.use(cors());
app.use(express.json());


// Configurar WebSocket
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('Cliente conectado.');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      // Registrar cliente
      CLIENTS[data.clientId] = ws;
      console.log(`Cliente registrado: ${data.clientId}`);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado.');
  });
});

// Rota para listar impressoras
app.get('/api/printers/:clientId', (req, res) => {
  const { clientId } = req.params;

  if (!CLIENTS[clientId]) {
    return res.status(404).send('Cliente não conectado.');
  }

  CLIENTS[clientId].send(JSON.stringify({ type: 'listPrinters' }));

  CLIENTS[clientId].once('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'printers') {
      res.json(data.printers);
    }
  });
});

// Rota para enviar um trabalho de impressão
app.post('/api/print/:clientId', (req, res) => {
  const { clientId } = req.params;
  const { htmlContent, printerName } = req.body;

  if (!CLIENTS[clientId]) {
    return res.status(404).send('Cliente não conectado.');
  }

  CLIENTS[clientId].send(
    JSON.stringify({
      type: 'print',
      htmlContent,
      printerName,
    })
  );

  CLIENTS[clientId].once('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'printStatus') {
      res.send(data.status);
    }
  });
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`Servidor HTTP rodando em http://localhost:${PORT}`);
  console.log(`Servidor WebSocket rodando na porta ${WS_PORT}`);
});
