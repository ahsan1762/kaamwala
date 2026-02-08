const fetch = require('node-fetch'); // Needs node-fetch installed or use built-in fetch in Node 18+

// If node version is old, this might fail. We'll use standard http or just assume Node 18+ for fetch.
// Actually, `npm install node-fetch` might be needed if Node < 18.
// Let's use standard `http` module to be dependency-free or just assume modern Node.
// The user has Node.js.

const BASE_URL = 'http://localhost:5000/api';

const runTest = async () => {
    console.log('--- STARTING BACKEND TESTS ---');

    // 1. Test Root
    try {
        const res = await fetch('http://localhost:5000/');
        const text = await res.text();
        console.log(`[1] Server Root: ${res.status === 200 ? 'PASS' : 'FAIL'} (${text})`);
    } catch (e) {
        console.error('[1] Server Root: FAIL (Server might not be running)', e.message);
        return;
    }

    // Generate random email
    const rand = Math.floor(Math.random() * 10000);
    const customerEmail = `customer${rand}@test.com`;
    const customerPass = '123456';

    // 2. Register Customer
    let token = '';
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Customer',
                email: customerEmail,
                password: customerPass,
                role: 'customer'
            })
        });
        const data = await res.json();
        if (res.status === 201) {
            console.log(`[2] Register Customer: PASS`);
            token = data.token;
        } else {
            console.log(`[2] Register Customer: FAIL (${data.message})`);
        }
    } catch (e) {
        console.error('[2] Register Customer: ERROR', e.message);
    }

    // 3. Login Customer
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: customerEmail,
                password: customerPass
            })
        });
        const data = await res.json();
        if (res.status === 200 && data.token) {
            console.log(`[3] Login Customer: PASS`);
        } else {
            console.log(`[3] Login Customer: FAIL (${data.message})`);
        }
    } catch (e) {
        console.error('[3] Login Customer: ERROR', e.message);
    }

    // 4. Test Protected Route (My Bookings)
    if (token) {
        try {
            const res = await fetch(`${BASE_URL}/bookings/my`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.status === 200) {
                console.log(`[4] Protected Route (My Bookings): PASS`);
            } else {
                console.log(`[4] Protected Route: FAIL (Status ${res.status})`);
            }
        } catch (e) {
            console.error('[4] Protected Route: ERROR', e.message);
        }
    }

    console.log('--- TESTS COMPLETED ---');
    console.log('If all passed, your backend is working perfectly!');
};

runTest();
