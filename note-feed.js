(() => {
  const RSS_URL = "https://note.com/ac_sbne/rss";
  const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`;

  const parseItems = (xmlText) => {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    return [...doc.querySelectorAll("item")].map((item) => ({
      title: item.querySelector("title")?.textContent?.trim() || "",
      link: item.querySelector("link")?.textContent?.trim() || "",
      thumb:
        item.querySelector("media\\:thumbnail, thumbnail")?.textContent?.trim() ||
        item.querySelector("enclosure")?.getAttribute("url") ||
        "",
    }));
  };

  const setHomeLatest = (latest) => {
    const titleEl = document.getElementById("home-latest-note-title");
    const linkEl = document.getElementById("home-latest-note-link");
    const imageEl = document.getElementById("home-latest-note-image");
    if (!titleEl || !linkEl) return;
    titleEl.textContent = `「${latest.title}」`;
    linkEl.href = latest.link;
    if (imageEl && latest.thumb) imageEl.src = latest.thumb;
  };

  const setInformation = (items) => {
    const latestTitleEl = document.getElementById("info-latest-title");
    const latestLinkEl = document.getElementById("info-latest-link");
    const recentList = document.getElementById("info-recent-list");
    if (!latestTitleEl || !latestLinkEl || !recentList) return;

    latestTitleEl.textContent = `新着記事: ${items[0].title}`;
    latestLinkEl.href = items[0].link;

    recentList.innerHTML = items.slice(1, 6)
      .map((item) => `<li><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></li>`)
      .join("");
  };

  fetch(PROXY_URL)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error("rss_fetch_failed"))))
    .then((xmlText) => {
      const items = parseItems(xmlText).filter((item) => item.title && item.link);
      if (!items.length) return;
      setHomeLatest(items[0]);
      if (items.length >= 2) setInformation(items);
    })
    .catch(() => {
      // Keep static fallback content.
    });
})();
