import fetch from 'node-fetch';
import * as fs from 'fs';

async function main() {
    const rawKey = fs.readFileSync('key.txt', 'utf8');
    const keyContent = typeof rawKey === 'string'
        ? rawKey.replace(/\s+/g, '')
        : rawKey;

    console.log("Sending keyContent length:", keyContent.length);

    const res = await fetch('http://localhost:4000/api/auth/verify-key-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-id', keyContent })
    });
    
    const data = await res.json();
    console.log("Response:", res.status, data);
}
main().catch(console.error);
