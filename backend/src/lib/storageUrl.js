function supabasePublicBaseUrl() {
  const explicit = process.env.SUPABASE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const databaseUrl = process.env.DATABASE_URL || "";
  const dbHost = databaseUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/i);
  if (dbHost) {
    return `https://${dbHost[1]}.supabase.co`;
  }

  const poolerUser = databaseUrl.match(/postgres\.([a-z0-9]+)/i);
  if (poolerUser) {
    return `https://${poolerUser[1]}.supabase.co`;
  }

  return null;
}

function publicImageUrl(bucket, path) {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = supabasePublicBaseUrl();
  if (!bucket || !base) {
    return null;
  }

  const encodedPath = String(path)
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

module.exports = {
  supabasePublicBaseUrl,
  publicImageUrl,
};
