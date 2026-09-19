import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'node:os';

const PORT = 8787;
const wss = new WebSocketServer({ port: PORT });

// 純轉發：手機點餐頁送出的 order 訊息，原封不動廣播給其他連線（主要是大螢幕頁）。
wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    for (const client of wss.clients) {
      if (client !== socket && client.readyState === client.OPEN) {
        client.send(data.toString());
      }
    }
  });
});

function lanAddresses() {
  const nets = networkInterfaces();
  const addresses = [];
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
    }
  }
  return addresses;
}

console.log(`[ws-server] 點餐即時同步伺服器已啟動，監聽 port ${PORT}`);
for (const addr of lanAddresses()) {
  console.log(`[ws-server] 區網位址: ${addr}`);
}
