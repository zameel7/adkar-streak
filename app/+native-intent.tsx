// Maps incoming deep links (custom scheme or verified https App Links) to app
// routes. The website uses /morning and /evening; the app screens are
// /morning-adkar and /evening-adkar.
const PATH_MAP: Record<string, string> = {
    "/morning": "/morning-adkar",
    "/evening": "/evening-adkar",
    "/morning-adkar": "/morning-adkar",
    "/evening-adkar": "/evening-adkar",
};

function toPathname(input: string): string {
    // Inputs can be full URLs (https://adkar.zameel7.me/morning,
    // adkarchamp://morning, exp://host:8081/--/morning) or bare paths (/morning).
    let path = input;
    const sep = path.indexOf("/--/"); // Expo Go / dev-client separator
    if (sep >= 0) {
        path = path.slice(sep + 3);
    } else {
        const m = path.match(/^([a-z][a-z0-9+.-]*):\/\/(.*)$/i);
        if (m) {
            const [, scheme, rest] = m;
            const hasHost = /^(https?|exp|exps)$/i.test(scheme);
            path = hasHost ? "/" + rest.split("/").slice(1).join("/") : "/" + rest;
        }
    }
    path = path.split(/[?#]/)[0].replace(/\/+$/, "");
    return path || "/";
}

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
    try {
        const pathname = toPathname(path);
        return PATH_MAP[pathname] ?? path;
    } catch {
        return path;
    }
}
