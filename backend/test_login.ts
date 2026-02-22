import fetch from 'node-fetch';

async function main() {
    console.log("Sending login request...");
    const start = Date.now();
    try {
        const res = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'akuntiktok1397@gmail.com', password: 'Asui1234' })
        });
        const data = await res.json();
        console.log("Response:", res.status, data);
    } catch (e) {
        console.error("Error:", e);
    }
    console.log(`Took ${Date.now() - start}ms`);
}
main();
