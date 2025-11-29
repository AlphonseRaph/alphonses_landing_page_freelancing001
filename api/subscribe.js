// This Vercel Serverless Function will handle the POST request from your HTML form.

// IMPORTANT: Install the necessary package for your email provider (e.g., node-fetch 
// for API calls, or a dedicated SDK). For simplicity, this uses native Node.js 'fetch' 
// which is supported in Vercel functions (Node 18+).

export default async function handler(req, res) {
    // 1. Enforce POST Method
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // 2. Secret Configuration (Must be set in Vercel Environment Variables)
    // Replace these placeholders with your actual keys/IDs.
    const EMAIL_API_KEY = process.env.EMAIL_SERVICE_API_KEY; 
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID || 'YOUR_DEFAULT_LIST_ID';

    if (!EMAIL_API_KEY) {
        console.error("EMAIL_SERVICE_API_KEY is not set.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    // 3. Extract and Validate Data
    const { name, email } = await req.json();

    if (!email || !name || !email.includes('@')) {
        return res.status(400).json({ message: 'Missing or invalid name/email address.' });
    }

    // 4. API Call to MailerLite (Conceptual Example - adapt for your service)
    try {
        const mailerliteResponse = await fetch(`https://api.mailerlite.com/api/v2/groups/${MAILERLITE_GROUP_ID}/subscribers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Use a standard authorization header for security
                'X-MailerLite-ApiKey': EMAIL_API_KEY 
            },
            body: JSON.stringify({
                email: email,
                name: name,
                // Automatically add to the specified group/list
                resubscribe: true 
            })
        });

        // Check if the API request failed
        if (!mailerliteResponse.ok) {
            const errorText = await mailerliteResponse.text();
            console.error('MailerLite API Error:', errorText);
            // Return a general error message to the client for security
            return res.status(500).json({ message: 'Error subscribing. This email may already be on the list.' });
        }

        // 5. Success
        return res.status(200).json({ message: 'Subscription successful!' });

    } catch (error) {
        console.error('API Handler Error:', error);
        return res.status(500).json({ message: 'Internal server error. Check logs for details.' });
    }
}
