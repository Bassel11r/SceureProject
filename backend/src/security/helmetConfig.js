const helmet = require("helmet");

/**
 * Helmet security headers configuration.
 * Implements: X-Frame-Options, X-Content-Type-Options,
 *             Strict-Transport-Security (HSTS), Content-Security-Policy (CSP),
 *             Referrer-Policy, and more.
 */
module.exports = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],          // No inline scripts, no CDN
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },         // X-Frame-Options: DENY
    hidePoweredBy: true,                    // Remove X-Powered-By: Express
    hsts: {
        maxAge: 31536000,                   // 1 year
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true,                          // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,                        // X-XSS-Protection (legacy browsers)
});
