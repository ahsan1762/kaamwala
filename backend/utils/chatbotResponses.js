const responses = [
    // --- CORE FUNCTIONALITY ---
    {
        intent: 'greeting',
        priority: 1,
        keywords: ['hello', 'hi', 'hey', 'salam', 'aoa'],
        synonyms: ['greetings', 'good morning', 'good evening'],
        patterns: [/hello/i, /hi/i, /salam/i, /hey/i],
        text: 'Assalam o Alaikum! Welcome to KaamWala. How can I assist you today? You can ask about hiring workers, becoming a service provider, or our payment methods.'
    },
    {
        intent: 'services_list',
        priority: 2,
        keywords: ['services', 'work', 'jobs', 'offer'],
        synonyms: ['what do you do', 'available services', 'types of work', 'categories'],
        patterns: [/what services/i, /list services/i, /what.*offer/i],
        text: 'We simplify your daily life with trusted professionals. Our services include: \n1. Electrician \n2. Plumber \n3. Carpenter \n4. Mason \n5. AC Repair \n6. General Helpers.'
    },
    {
        intent: 'become_worker_process',
        priority: 3,
        keywords: ['become worker', 'join as worker', 'register worker', 'earn', 'signup worker'],
        synonyms: ['work for you', 'get job'],
        patterns: [/become a worker/i, /want to work/i, /register as worker/i, /signup.*worker/i, /sign up.*worker/i, /create.*worker/i],
        text: 'To become a KaamWala partner: \n1. Click "Become a Service Provider" or "Register". \n2. Select "Worker" as your role. \n3. Fill in your Name, CNIC & Phone. \n4. Verify your Email. \n5. Complete your Profile (Upload Photo, CNIC & Skill Video). \n6. Wait for Admin Approval.'
    },
    {
        intent: 'become_customer_process',
        priority: 3,
        keywords: ['become customer', 'register customer', 'signup customer', 'hire someone', 'client'],
        synonyms: ['create customer account', 'user signup', 'cumtomer'], // Added typo 'cumtomer'
        patterns: [/become a customer/i, /register as customer/i, /signup.*customer/i, /sign up.*customer/i, /create.*customer/i],
        text: 'To register as a Customer: \n1. Click "Register" (Top Right). \n2. Select "Customer" as your role. \n3. Enter your Name, Email, Password & Phone. \n4. Click "Create Account". \nYou can now search and book workers immediately!'
    },
    {
        intent: 'signup_general',
        priority: 2, // Low priority than specific ones
        keywords: ['signup', 'register', 'create account', 'join'],
        synonyms: ['make account', 'sign up'],
        patterns: [/^signup$/i, /^register$/i, /^how.*signup$/i, /^how.*register$/i],
        text: 'You can register as a **Customer** (to hire workers) or as a **Worker** (to offer services). \n- "How to signup as Customer?" \n- "How to signup as Worker?"\nPlease specify which one you are interested in.'
    },
    {
        intent: 'hire_worker',
        priority: 4,
        keywords: ['hire', 'book', 'need worker', 'find'],
        synonyms: ['get help', 'appointment', 'schedule'],
        patterns: [/hire/i, /book/i, /need a/i, /find.*worker/i, /looking for/i],
        text: 'Hiring is easy! \n1. Go to "Find Workers" page. \n2. Filter by Service (e.g., Plumber) and Location (e.g., F-10 Islamabad). \n3. View Profiles, Ratings & Videos. \n4. Click "Book Now" and choose a time.'
    },
    {
        intent: 'payment_methods',
        priority: 5,
        keywords: ['pay', 'payment', 'cash', 'money'],
        synonyms: ['charges', 'card', 'jazzcash', 'easypaisa'],
        patterns: [/how to pay/i, /payment method/i, /payment option/i],
        text: 'We support secure payments via: \n- **Cash on Satisfaction**: Pay the worker directly after the job is done. \n- **Online Payment**: JazzCash, EasyPaisa, or Credit/Debit Card (Coming Soon for all areas).'
    },
    {
        intent: 'service_areas',
        priority: 6,
        keywords: ['location', 'area', 'city', 'islamabad', 'rawalpindi'],
        synonyms: ['where', 'sectors', 'coverage'],
        patterns: [/where are you/i, /locations/i, /sectors/i, /cities/i],
        text: 'Currently, we serve major sectors of Islamabad including F-6, F-7, F-8, F-10, F-11, G-6, G-9, G-10, G-11, and I-8. We are expanding to Rawalpindi soon!'
    },
    {
        intent: 'safety_verification',
        priority: 7,
        keywords: ['safe', 'security', 'verified', 'trust'],
        synonyms: ['scam', 'background check', 'secure'],
        patterns: [/is it safe/i, /verified/i, /trustworthy/i],
        text: 'Your safety is our priority. Every worker on KaamWala is Admin Verified. We strictly check their Original CNIC, Contact Details, and Skill Video before allowing them to work.'
    },
    {
        intent: 'worker_requirements',
        priority: 8,
        keywords: ['requirements', 'documents', 'needed'],
        synonyms: ['what do i need', 'docs', 'prerequisites'],
        patterns: [/documents required/i, /what is needed/i, /eligibility/i],
        text: 'To register as a worker, you need: \n- Valid CNIC \n- Active Phone Number \n- A clear Profile Picture \n- A short Video demonstrating your skill (30-60 secs).'
    },
    {
        intent: 'contact_support',
        priority: 9,
        keywords: ['contact', 'support', 'help', 'complaint'],
        synonyms: ['call', 'email', 'issue', 'problem', 'talk to human'],
        patterns: [/contact/i, /customer service/i, /complaint/i, /talk to support/i, /human/i],
        text: 'Need help? You can reach our 24/7 support via the "Contact Us" page, email us at support@kaamwala.com, or call our helpline at 051-1234567.'
    },
    {
        intent: 'login_help',
        priority: 10,
        keywords: ['login', 'signin', 'log in'],
        synonyms: ['access account', 'cant login'],
        patterns: [/how.*login/i, /log\s?in/i, /sign\s?in/i],
        text: 'To login: \n1. Click the "Login" button at the top right. \n2. Enter your Email and Password. \n3. If you face issues, use "Forgot Password".'
    },
    {
        intent: 'forgot_password_help',
        priority: 11,
        keywords: ['forgot', 'password', 'reset'],
        synonyms: ['lost password', 'change password', 'recover account'],
        patterns: [/forgot.*password/i, /reset.*password/i, /i.*forgot/i],
        text: 'Don\'t worry! \n1. Go to the Login Page. \n2. Click "Forgot Password?". \n3. Enter your email. \n4. Check your inbox for the reset link.'
    },
    {
        intent: 'booking_cancellation',
        priority: 12,
        keywords: ['cancel', 'refund', 'change booking'],
        synonyms: ['stop booking', 'abort'],
        patterns: [/cancel.*booking/i, /refund/i],
        text: 'You can cancel a booking from your "My Bookings" dashboard before the worker accepts it. If the worker has already accepted, please contact support immediately.'
    },
    {
        intent: 'pricing_policy',
        priority: 13,
        keywords: ['price', 'cost', 'rate', 'charges', 'expensive'],
        synonyms: ['how much', 'fee structure'],
        patterns: [/how much/i, /rates/i, /price/i],
        text: 'Our workers set their own competitive rates. You can see the estimated "Hourly Rate" on each worker\'s profile before booking. You can also negotiate the final price on-site for complex jobs.'
    },
    {
        intent: 'dispute_resolution',
        priority: 14,
        keywords: ['complaint', 'bad service', 'damage', 'fight'],
        synonyms: ['not satisfied', 'rude', 'broke'],
        patterns: [/complaint/i, /bad work/i, /not happy/i],
        text: 'We take quality seriously. If you are not satisfied, please rate the worker poorly and file a complaint via the "Contact Us" page. We investigate all reports and ban workers who violate our standards.'
    },

    // --- CONVERSATIONAL / CHITCHAT ---
    {
        intent: 'identity',
        priority: 15,
        keywords: ['who are you', 'your name', 'what are you'],
        synonyms: ['bot', 'ai', 'robot'],
        patterns: [/who are you/i, /what is your name/i, /are you a bot/i],
        text: 'I am the KaamWala Assistant, an AI chatbot here to help you navigate our platform and find the best services!'
    },
    {
        intent: 'creator',
        priority: 16,
        keywords: ['who made you', 'creator', 'developer'],
        synonyms: ['built by', 'owner'],
        patterns: [/who made you/i, /who created you/i, /who built you/i],
        text: 'I was developed by the talented tech team at KaamWala to make your life easier.'
    },
    {
        intent: 'greeting_conversational',
        priority: 16,
        keywords: ['how are you', 'how do you do', 'whats up'],
        synonyms: ['doing good'],
        patterns: [/how are you/i, /how is it going/i],
        text: 'I am just a computer program, but I am functioning perfectly! How can I help you with your home services today?'
    },
    {
        intent: 'gratitude',
        priority: 18,
        keywords: ['thank', 'thanks', 'thx'],
        synonyms: ['appreciate', 'good job'],
        patterns: [/thank you/i, /thanks/i, /jazakallah/i],
        text: 'You are welcome! Let me know if you need anything else. Happy to help!'
    },
    {
        intent: 'compliment',
        priority: 19,
        keywords: ['smart', 'good', 'awesome', 'great'],
        synonyms: ['intelligent', 'nice'],
        patterns: [/you are smart/i, /good bot/i, /great job/i],
        text: 'Thank you! I try my best to be helpful. 😊'
    },
    {
        intent: 'joke',
        priority: 20,
        keywords: ['joke', 'funny', 'laugh'],
        synonyms: ['tell me a joke'],
        patterns: [/joke/i, /something funny/i],
        text: 'Why did the electrician get shocked? Because he wasn’t current with the news! ⚡ (I know, I should stick to helping you find workers!)'
    },
    {
        intent: 'insult',
        priority: 21,
        keywords: ['stupid', 'dumb', 'idiot', 'useless', 'bad'],
        synonyms: ['hate you'],
        patterns: [/you are stupid/i, /dumb/i, /useless/i],
        text: 'I apologize if I couldn\'t help. I am still learning. Please try asking your question differently or contact our human support for better assistance.'
    },
    {
        intent: 'meaning_of_life',
        priority: 99,
        keywords: ['meaning of life', 'universe'],
        synonyms: [],
        patterns: [/meaning of life/i],
        text: '42. But for practical purposes, it might be getting that leaky tap fixed! 🔧'
    }
];

const defaultResponse =
    'I am your KaamWala Assistant. I can help you with Hiring Workers, Registration, Payment Methods, or Safety Queries. Try asking "How to hire a plumber" or "How to signup as worker".';

/**
 * Calculate confidence score for intent
 */
const calculateConfidence = (message, intent) => {
    let score = 0;

    intent.keywords.forEach(word => {
        if (message.includes(word.toLowerCase().trim())) score += 0.3;
    });

    intent.synonyms.forEach(word => {
        if (message.includes(word.toLowerCase().trim())) score += 0.2;
    });

    intent.patterns.forEach(regex => {
        if (regex.test(message)) score += 0.4; // Increased matching weight for regex
    });

    return Math.min(score, 1);
};

/**
 * Main chatbot response function
 */
const getBotResponse = (message) => {
    if (!message) {
        return { reply: defaultResponse, confidence: 0 };
    }

    const lowerMsg = message.toLowerCase();
    let bestMatch = null;
    let highestConfidence = 0;

    for (const intent of responses) {
        const confidence = calculateConfidence(lowerMsg, intent);

        if (
            confidence > highestConfidence ||
            (confidence === highestConfidence &&
                bestMatch &&
                intent.priority < bestMatch.priority)
        ) {
            highestConfidence = confidence;
            bestMatch = intent;
        }
    }

    // Lowered threshold slightly for better responsiveness
    if (bestMatch && highestConfidence >= 0.25) {
        return {
            reply: bestMatch.text,
            confidence: Number(highestConfidence.toFixed(2))
        };
    }

    return {
        reply: defaultResponse,
        confidence: 0.1
    };
};

module.exports = { getBotResponse };
