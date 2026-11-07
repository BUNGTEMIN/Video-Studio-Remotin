const https = require('https');

function execMcpCommand(cmd, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    let msgPath = '';
    const sseReq = https.get('https://mcp-termux.nufat.id/sse', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/event-stream'
      }
    }, (res) => {
      let buffer = '';
      res.on('data', chunk => {
        buffer += chunk.toString();
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const ev of events) {
          if (!ev.trim()) continue;
          const lines = ev.split('\n');
          let eventType = '';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.replace('event:', '').trim();
            if (line.startsWith('data:')) eventData = line.replace('data:', '').trim();
          }

          if (eventType === 'endpoint' || (!eventType && eventData.startsWith('/messages'))) {
            msgPath = eventData;
            postRpc(1, 'initialize', {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'CapCutStudioClient', version: '1.0.0' }
            });
          } else if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              if (parsed.id === 1) {
                postRpc(2, 'tools/call', {
                  name: 'run_command',
                  arguments: {
                    command: cmd
                  }
                });
              } else if (parsed.id === 2) {
                sseReq.destroy();
                if (parsed.result && parsed.result.content) {
                  resolve(parsed.result.content[0].text);
                } else {
                  resolve(JSON.stringify(parsed, null, 2));
                }
              }
            } catch (e) {
              // ignore partial json
            }
          }
        }
      });
    });

    sseReq.on('error', reject);

    function postRpc(id, method, params) {
      const postData = JSON.stringify({ jsonrpc: '2.0', id, method, params });
      const url = new URL('https://mcp-termux.nufat.id' + msgPath);
      const postReq = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      postReq.on('error', reject);
      postReq.write(postData);
      postReq.end();
    }

    setTimeout(() => {
      sseReq.destroy();
      resolve('Command timed out waiting for MCP response');
    }, timeoutMs);
  });
}

async function main() {
  console.log('Checking diary-motion-generator and send_telegram.sh...');
  const res = await execMcpCommand(`
    cd /data/data/com.termux/files/home/diary-motion-generator && head -n 35 generate.sh
    echo "=== SEND TELEGRAM SH ==="
    cat /data/data/com.termux/files/home/send_telegram.sh
  `, 25000);
  console.log(res);
}

main().catch(console.error);
