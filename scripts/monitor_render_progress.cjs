const https = require('https');

function callMcpTool(toolName, args, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    let msgPath = '';
    let resolved = false;

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
              clientInfo: { name: 'CapCutMonitor', version: '1.0.0' }
            });
          } else if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              if (parsed.id === 1) {
                postRpc(2, 'tools/call', {
                  name: toolName,
                  arguments: args
                });
              } else if (parsed.id === 2) {
                resolved = true;
                sseReq.destroy();
                resolve(parsed.result);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      });
    });

    sseReq.on('error', (err) => {
      if (!resolved) reject(err);
    });

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
      postReq.on('error', (err) => {
        if (!resolved) reject(err);
      });
      postReq.write(postData);
      postReq.end();
    }

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        sseReq.destroy();
        reject(new Error(`Timeout waiting for MCP ${toolName}`));
      }
    }, timeoutMs);
  });
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function main() {
  console.log('Monitoring 85s render and Telegram dispatch...');
  let done = false;
  let cycle = 0;

  while (!done && cycle < 40) {
    cycle++;
    await sleep(6000);
    try {
      const res = await callMcpTool('run_command', {
        command: 'tail -n 12 $(ls -t ~/.mcp-jobs/render85s-*.log | head -1)',
        timeout_sec: 20
      }, 25000);

      const text = res?.content?.[0]?.text || '';
      console.log(`\n--- [Check ${cycle}] ---`);
      console.log(text.trim());

      if (text.includes('=== ALL_DONE ===') || text.includes('Berhasil terkirim ke Telegram!') || text.includes('"ok":true') || text.includes('Telegram Exit Code: 0')) {
        console.log('\n🌟 DITEMUKAN STATUS SELESAI!');
        done = true;
        break;
      }
    } catch (e) {
      console.log(`Retry check ${cycle}:`, e.message);
    }
  }

  // Get full output and file details
  console.log('\n=== DETAIL FILE & TELEGRAM STATUS ===');
  const finalCheck = await callMcpTool('run_command', {
    command: `
      echo "=== ISI LOG LENGKAP ==="
      cat $(ls -t ~/.mcp-jobs/render85s-*.log | head -1) | tail -n 30
      echo "=== CEK FILE HASIL ==="
      ls -lh /data/data/com.termux/files/home/diary-motion-generator/out/diary_85s_aabaim_capcut.mp4
      echo "=== CEK DURASI DENGAN FFPROBE ==="
      ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /data/data/com.termux/files/home/diary-motion-generator/out/diary_85s_aabaim_capcut.mp4 2>/dev/null || true
    `,
    timeout_sec: 25
  }, 30000);

  console.log(finalCheck?.content?.[0]?.text || '');
}

main().catch(console.error);
