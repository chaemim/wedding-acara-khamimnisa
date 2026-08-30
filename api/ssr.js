export default async function handler(req, res) {
  try {
    const mod = await import('../dist/server/server.js');
    const server = mod.default ?? mod;
    if (typeof server.fetch !== 'function') {
      throw new Error('server.fetch not found on built server');
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (v === undefined) continue;
      if (Array.isArray(v)) v.forEach((val) => headers.append(k, val));
      else headers.set(k, String(v));
    }

    const init = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
    }

    const request = new Request(url, init);
    const response = await server.fetch(request, {}, {});

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));

    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  } catch (err) {
    console.error('SSR wrapper error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
