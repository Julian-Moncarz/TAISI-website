// GET /api/discord -> redirect to the TAISI Discord invite.
// The invite never appears in the page source, so scrapers that harvest discord.gg links from HTML
// don't find it, and obvious bots and scripts that follow the link get a polite refusal instead.
// This keeps out casual crawlers. The real gate is inside Discord: a verification level, member
// screening (rules to accept), and a captcha bot for new members.
const INVITE = "https://discord.gg/bSWbtZTEYR";
const BOT = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|httpclient|headless|scrapy|go-http|java\/|node-fetch|axios|okhttp|libwww/i;

export default function handler(req, res) {
  const ua = req.headers["user-agent"] || "";
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (!ua || BOT.test(ua)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Open this link in a web browser to join the TAISI Discord.");
    return;
  }
  res.statusCode = 302;
  res.setHeader("Location", INVITE);
  res.end();
}
