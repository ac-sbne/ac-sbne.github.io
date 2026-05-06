(() => {
  const DATA_URL = "/data/note-feed.json";
  const NOTE_HOST = "note.com";

  const safeExternalUrl = (value) => {
    try {
      const u = new URL(value, window.location.origin);
      if (!["https:", "http:"].includes(u.protocol)) return "";
      if (u.hostname !== NOTE_HOST && !u.hostname.endsWith(`.${NOTE_HOST}`)) return "";
      return u.href;
    } catch {
      return "";
    }
  };

  const safeImageUrl = (value) => {
    try {
      const u = new URL(value, window.location.origin);
      if (u.protocol !== "https:") return "";
      return u.href;
    } catch {
      return "";
    }
  };

  const setHomeLatest = (latest) => {
    const titleEl = document.getElementById("home-latest-note-title");
    const linkEl = document.getElementById("home-latest-note-link");
    const imageEl = document.getElementById("home-latest-note-image");
    if (!titleEl || !linkEl) return;
    const safeLink = safeExternalUrl(latest.link);
    if (!safeLink) return;
    titleEl.textContent = `「${latest.title}」`;
    linkEl.href = safeLink;
    if (imageEl) {
      const safeThumb = safeImageUrl(latest.thumb);
      if (safeThumb) imageEl.src = safeThumb;
    }
  };

  const setInformation = (items) => {
    const latestTitleEl = document.getElementById("info-latest-title");
    const latestLinkEl = document.getElementById("info-latest-link");
    const recentList = document.getElementById("info-recent-list");
    if (!latestTitleEl || !latestLinkEl || !recentList) return;
    const latestSafeLink = safeExternalUrl(items[0].link);
    if (!latestSafeLink) return;

    latestTitleEl.textContent = `新着記事: ${items[0].title}`;
    latestLinkEl.href = latestSafeLink;

    recentList.replaceChildren(
      ...items.slice(1, 6).map((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const safeLink = safeExternalUrl(item.link);
        a.href = safeLink || "https://note.com/ac_sbne";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = item.title;
        li.appendChild(a);
        return li;
      }),
    );
  };

  fetch(`${DATA_URL}?t=${Date.now()}`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error("json_fetch_failed"))))
    .then((payload) => {
      const items = (payload.items || []).filter((item) => item.title && item.link);
      if (!items.length) return;
      setHomeLatest(items[0]);
      if (items.length >= 2) setInformation(items);
    })
    .catch(() => {
      // Keep static fallback content.
    });
})();
