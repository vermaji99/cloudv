const jsforce = require('jsforce');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// @desc    Redirect to Salesforce login
// @route   GET /api/auth/login
exports.login = (req, res) => {
    const { env } = req.query;
    const loginUrl = env === 'sandbox' ? 'https://test.salesforce.com' : 'https://login.salesforce.com';

    console.log(`Initiating login for ${env || 'production'} at ${loginUrl}`);
    
    // Create a dynamic oauth2 object for this request
    const dynamicOAuth2 = new jsforce.OAuth2({
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        redirectUri: process.env.SALESFORCE_REDIRECT_URI,
        loginUrl: loginUrl
    });

    // Generate PKCE verifier and challenge
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

    // Store verifier and loginUrl in a short-lived cookie for the callback
    const isProduction = process.env.NODE_ENV === 'production' || req.get('host').includes('onrender.com');
    
    res.cookie('auth_config', JSON.stringify({ verifier, loginUrl }), {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 5 * 60 * 1000 // 5 minutes
    });

    const authUrl = dynamicOAuth2.getAuthorizationUrl({
        scope: 'full refresh_token offline_access',
        code_challenge: challenge,
        code_challenge_method: 'S256'
    });
    
    console.log('Redirecting to:', authUrl);
    res.redirect(authUrl);
};

// @desc    Handle Salesforce OAuth callback
// @route   GET /api/auth/callback
exports.callback = async (req, res) => {
    const { code, error, error_description } = req.query;
    const authConfigRaw = req.cookies.auth_config;
    let authConfig = {};
    
    try {
        if (authConfigRaw) authConfig = JSON.parse(authConfigRaw);
    } catch (e) {
        console.error('Failed to parse auth_config cookie');
    }

    const code_verifier = authConfig.verifier;
    const loginUrl = authConfig.loginUrl || 'https://login.salesforce.com';

    console.log('--- OAuth Callback Debug ---');
    console.log('Full URL:', req.originalUrl);
    console.log('Code present:', !!code);
    if (error) {
        console.error('Salesforce Error:', error);
        console.error('Description:', error_description);
    }
    console.log('Verifier from cookie present:', !!code_verifier);
    console.log('Login URL used:', loginUrl);
    console.log('---------------------------');

    if (!code) {
        console.error('OAuth Callback Error: No code provided');
        const errorMsg = error_description || error || 'No code provided';
        return res.redirect(`${process.env.CLIENT_URL}/#/login?error=no_code&msg=${encodeURIComponent(errorMsg)}`);
    }

    try {
        console.log('OAuth Callback - Requesting token...');
        
        // Create a dynamic oauth2 object with the same loginUrl used in the initial request
        const dynamicOAuth2 = new jsforce.OAuth2({
            clientId: process.env.SALESFORCE_CLIENT_ID,
            clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
            redirectUri: process.env.SALESFORCE_REDIRECT_URI,
            loginUrl: loginUrl
        });

        // Exchange code for token
        const tokenResponse = await dynamicOAuth2.requestToken(code, { 
            code_verifier: code_verifier 
        });
        
        console.log('OAuth Callback - Token exchange successful');
        
        // Clear the config cookie
        res.clearCookie('auth_config', { path: '/' });

        // Create a new connection with the received tokens
        const userConn = new jsforce.Connection({ 
            instanceUrl: tokenResponse.instance_url,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            oauth2: dynamicOAuth2
        });
        
        // Get details about the user and org
        const identity = await userConn.identity();
        console.log('OAuth Callback - Identity fetched for:', identity.username);

        // Create JWT token
        const token = jwt.sign({
            accessToken: tokenResponse.access_token,
            instanceUrl: tokenResponse.instance_url,
            refreshToken: tokenResponse.refresh_token,
            userId: identity.user_id,
            username: identity.username,
            displayName: identity.display_name,
            orgId: identity.organization_id,
        }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        // Set cookie with robust settings for production/development
        const isProduction = process.env.NODE_ENV === 'production' || req.get('host').includes('onrender.com');
        
        res.cookie('token', token, {
            httpOnly: true, 
            secure: isProduction, 
            sameSite: isProduction ? 'none' : 'lax',
            path: '/', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        console.log('OAuth Callback - Success! Redirecting to dashboard. Production mode:', isProduction);
        
        // On mobile/some browsers, cross-site cookies are blocked. 
        // We pass the token in the URL as a fallback so the frontend can store it.
        const redirectUrl = isProduction 
            ? `${process.env.CLIENT_URL}/#/dashboard?token=${token}`
            : `${process.env.CLIENT_URL}/#/dashboard`;

        res.redirect(redirectUrl);
    } catch (err) {
        console.error('OAuth Callback Error Detail:', err);
        const errorMessage = err.message || 'Authentication failed';
        res.redirect(`${process.env.CLIENT_URL}/#/login?error=auth_failed&msg=${encodeURIComponent(errorMessage)}`);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        // Check for token manually since we removed 'protect' middleware for this route
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.json({
                success: false,
                authenticated: false,
                message: 'Not logged in'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded;

        // Since we stored basic info in JWT, we can return that
        // But let's try to fetch org info to get the actual Org Name
        let orgName = 'Salesforce Org';
        
        try {
            const conn = new jsforce.Connection({
                instanceUrl: user.instanceUrl,
                accessToken: user.accessToken
            });

            const orgInfo = await conn.query("SELECT Name FROM Organization LIMIT 1");
            if (orgInfo.records && orgInfo.records.length > 0) {
                orgName = orgInfo.records[0].Name;
            }
        } catch (connErr) {
            console.error('getMe - Salesforce Connection Error:', connErr.message);
        }

        res.json({
            success: true,
            authenticated: true,
            user: {
                username: user.username,
                displayName: user.displayName,
                orgId: user.orgId,
                orgName: orgName,
                instanceUrl: user.instanceUrl
            }
        });
    } catch (err) {
        console.error('getMe - Unexpected Error:', err.message);
        // If token is invalid or expired, still return 200 but with authenticated: false
        res.json({ 
            success: false, 
            authenticated: false, 
            message: 'Session expired or invalid' 
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production' || req.get('host').includes('onrender.com');
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    });
    res.status(200).json({ success: true, message: 'Logged out' });
};
