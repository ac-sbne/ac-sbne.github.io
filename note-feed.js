(() => {
  const RSS_URL = "https://note.com/ac_sbne/rss";
  const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`;

  const parseItems = (xmlText) => {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    return [...doc.querySelectorAll("item")].map((item) => {
      const title = item.querySelector("title")?.textContent?.trim() || "";
      const link = item.querySelector("link")?.textContent?.trim() || "";
      const thumb =
        item.querySelector("media\\:thumbnail, thumbnail")?.textContent?.trim() ||
        item.querySelector("enclosure")?.getAttribute("url") ||
        "";
      return { title, link, thumb };
    });
  };

  const setHomeLatest = (latest) => {
    const titleEl = document.getElementById("home-latest-note-title");
    const linkEl = document.getElementById("home-latest-note-link");
    const imageEl = document.getElementById("home-latest-note-image");
    if (!titleEl || !linkEl) return;

    titleEl.textContent = `縲・{latest.title}縲港;
    linkEl.href = latest.link;
    if (imageEl && latest.thumb) {
      imageEl.src = latest.thumb;
    }
  };

  const setInformation = (items) => {
    const latestTitleEl = document.getElementById("info-latest-title");
    const latestLinkEl = document.getElementById("info-latest-link");
    const recentList = document.getElementById("info-recent-list");
    if (!latestTitleEl || !latestLinkEl || !recentList) return;

    const latest = items[0];
    latestTitleEl.textContent = `譁ｰ逹險倅ｺ・ ${latest.title}`;
    latestLinkEl.href = latest.link;

    const secondToSixth = items.slice(1, 6);
    recentList.innerHTML = secondToSixth
      .map(
        (item) => `<li>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
        </li>`
      )
      .join("");
  };

  fetch(PROXY_URL)
    .then((res) => {
      if (!res.ok) throw new Error("rss_fetch_failed");
      return res.text();
    })
    .then((xmlText) => {
      const items = parseItems(xmlText).filter((item) => item.title && item.link);
      if (items.length === 0) return;

      setHomeLatest(items[0]);
      if (items.length >= 2) {
        setInformation(items);
      }
    })
    .catch(() => {
      // Keep static fallback content when feed fetch fails.
    });
})();
