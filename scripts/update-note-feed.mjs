import { writeFile } from "node:fs/promises";

const RSS_URL = "https://note.com/ac_sbne/rss";
const OUTPUT_FILE = "data/note-feed.json";
const TAKE_COUNT = 10;

const decode = (value = "") =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

const getTag = (text, tag) => {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return decode(match?.[1]?.trim() || "");
};

const getThumb = (itemText) => {
  const media = itemText.match(/<media:thumbnail>([\s\S]*?)<\/media:thumbnail>/i);
  if (media?.[1]) return decode(media[1].trim());
  const enclosure = itemText.match(/<enclosure[^>]*url="([^"]+)"/i);
  return decode(enclosure?.[1] || "");
};

const parseItems = (xmlText) => {
  const itemBlocks = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  return itemBlocks.slice(0, TAKE_COUNT).map((m) => {
    const itemText = m[1];
    return {
      title: getTag(itemText, "title"),
      link: getTag(itemText, "link"),
      publishedAt: getTag(itemText, "pubDate"),
      thumb: getThumb(itemText),
    };
  });
};

const run = async () => {
  const res = await fetch(RSS_URL, { headers: { "User-Agent": "ac-sbne.github.io-feed-updater" } });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xmlText = await res.text();
  const items = parseItems(xmlText).filter((x) => x.title && x.link);
  if (!items.length) throw new Error("No feed items parsed.");

  const payload = {
    source: RSS_URL,
    generatedAt: new Date().toISOString(),
    items,
  };
  await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Updated ${OUTPUT_FILE} with ${items.length} items.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
