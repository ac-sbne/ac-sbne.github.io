(() => {
  const measurementId = window.MARKETING_CONFIG?.ga4MeasurementId || "";
  const isEnabled = /^G-[A-Z0-9]+$/i.test(measurementId) && measurementId !== "G-XXXXXXXXXX";
  if (!isEnabled) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const url = new URL(window.location.href);
  const utmData = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) utmData[key] = value;
  });
  if (Object.keys(utmData).length) {
    sessionStorage.setItem("last_utm", JSON.stringify(utmData));
    gtag("event", "utm_landing", utmData);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("http")) return;
    const destination = new URL(href, window.location.origin);
    if (destination.hostname === window.location.hostname) return;
    gtag("event", "outbound_click", {
      destination: destination.href,
      link_text: (link.textContent || "").trim().slice(0, 100),
      page_path: window.location.pathname,
    });
  });

  window.addEventListener("marketing:form_submit", (event) => {
    const formName = event?.detail?.form || "unknown";
    gtag("event", "generate_lead", {
      form_name: formName,
      page_path: window.location.pathname,
    });
  });
})();
