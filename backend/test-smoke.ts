// Quick smoke-test for the backend endpoints
// Usage: npx ts-node test-smoke.ts
import * as http from 'http';

const BASE = 'http://localhost:3000';

function request(
    method: string,
    path: string,
    headers: Record<string, string> = {},
    body?: object
): Promise<{ status: number; data: string }> {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : undefined;
        const opts = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr).toString() } : {}),
                ...headers,
            },
        };
        const url = new URL(BASE + path);
        const req = http.request(url, opts, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => resolve({ status: res.statusCode || 0, data }));
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function run() {
    let pass = 0; let fail = 0;

    function check(label: string, condition: boolean, detail = '') {
        if (condition) { console.log(` ${label}`); pass++; }
        else { console.log(` ${label}${detail ? ' — ' + detail : ''}`); fail++; }
    }

    // ── 1. Health check ──────────────────────────────────────────────────────
    console.log('\n[1] GET /');
    const health = await request('GET', '/');
    check('status 200', health.status === 200, `got ${health.status}`);
    check('has status ok', health.data.includes('"ok"'));

    // ── 2. Auth demo ─────────────────────────────────────────────────────────
    console.log('\n[2] POST /api/auth/demo');
    const auth = await request('POST', '/api/auth/demo');
    check('status 200', auth.status === 200, `got ${auth.status}`);
    const authJson = JSON.parse(auth.data);
    check('has token', typeof authJson.payload?.token === 'string');
    const token: string = authJson.payload?.token ?? '';

    // ── 3. Auth guard — no token ─────────────────────────────────────────────
    console.log('\n[3] POST /api/query — no token');
    const noToken = await request('POST', '/api/query', {}, { query: 'Hello' });
    check('status 403', noToken.status === 403, `got ${noToken.status}`);

    // ── 4. Auth guard — bad token ─────────────────────────────────────────────
    console.log('\n[4] POST /api/query — bad token');
    const badToken = await request('POST', '/api/query', { Authorization: 'Bearer bad.token' }, { query: 'Hello' });
    check('status 403', badToken.status === 403, `got ${badToken.status}`);

    // ── 5. Validation — empty query ───────────────────────────────────────────
    console.log('\n[5] POST /api/query — empty query');
    const emptyQ = await request('POST', '/api/query', { Authorization: `Bearer ${token}` }, { query: '' });
    check('status 400', emptyQ.status === 400, `got ${emptyQ.status}`);

    // ── 6. Validation — missing query ─────────────────────────────────────────
    console.log('\n[6] POST /api/query — missing query field');
    const missingQ = await request('POST', '/api/query', { Authorization: `Bearer ${token}` }, {});
    check('status 400', missingQ.status === 400, `got ${missingQ.status}`);

    // ── 7. Validation — query too long ────────────────────────────────────────
    console.log('\n[7] POST /api/query — query too long');
    const longQ = await request(
        'POST', '/api/query',
        { Authorization: `Bearer ${token}` },
        { query: 'a'.repeat(2001) }
    );
    check('status 400', longQ.status === 400, `got ${longQ.status}`);

    console.log(`\n──────────────────────────────`);
    console.log(`Results: ${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
