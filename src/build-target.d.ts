// Build target environment variable
// Used for subdomain deployment:
// - 'app' → app.symone.com (User Dashboard only)
// - 'admin' → admin.symone.com (Admin Panel only)
// - 'all' → localhost development (everything)

declare const __BUILD_TARGET__: 'app' | 'admin' | 'all';
