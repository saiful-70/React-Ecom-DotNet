/** @type {import('next').NextConfig} */

// --- Image remotePatterns allowlist -----------------------------------
// This repo is a multi-tenant demo (see CLAUDE.md "Variants"): each client
// deploy points at a different backend, so we cannot hardcode a single
// production image host. Instead we derive the allowlist from env vars at
// config-load time (this file is plain CommonJS, so process.env/new URL()
// are available at build/start).
//
// NOTE: next.config.js is only evaluated at build/start time — changing
// API_BASE_URL (or the other env vars below) requires a rebuild/restart
// for the new host to take effect.
//
// If a deployment serves product images from another CDN (e.g. a
// dedicated asset host separate from the API), add its hostname to
// `extraHosts` below. See the security audit fix plan, Task 16 / Q5, for
// the follow-up to maintain an explicit, reviewed CDN host list per
// deployment instead of relying solely on env-derived hosts.
const extraHosts = [
	// "cdn.example.com",
];

function hostnameFromEnv(value) {
	if (!value) return null;
	try {
		return new URL(value).hostname || null;
	} catch {
		return null;
	}
}

const envHosts = [
	hostnameFromEnv(process.env.API_BASE_URL),
	hostnameFromEnv(process.env.API_BASE_URL_V1),
	hostnameFromEnv(process.env.NEXT_PUBLIC_SITE_URL),
	"images.unsplash.com", // known static demo/placeholder image host
	...extraHosts,
].filter(Boolean);

const allowedHosts = Array.from(new Set(envHosts));

const remotePatterns = allowedHosts.map((hostname) => ({
	protocol: "https",
	hostname,
}));

const nextConfig = {
	images: {
		remotePatterns,
	},
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
	// Enable standalone output for Docker
	output: "standalone",
};

module.exports = nextConfig;
