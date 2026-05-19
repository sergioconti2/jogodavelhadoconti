const adsenseConfig = {
  enabled: false,
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
  slots: {
    "top-banner": "0000000001",
    "sidebar-rectangle": "0000000002",
    "bottom-banner": "0000000003"
  }
};

const isHostedOnWeb = window.location.protocol === "http:" || window.location.protocol === "https:";

if (adsenseConfig.enabled && isHostedOnWeb && isValidPublisherId(adsenseConfig.publisherId)) {
  loadAdSenseScript();
  replacePlaceholdersWithAds();
}

function isValidPublisherId(publisherId) {
  return /^ca-pub-\d{16}$/.test(publisherId);
}

function loadAdSenseScript() {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.publisherId}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

function replacePlaceholdersWithAds() {
  const placeholders = document.querySelectorAll("[data-ad-slot]");

  placeholders.forEach((placeholder) => {
    const slotName = placeholder.dataset.adSlot;
    const adSlotId = adsenseConfig.slots[slotName];

    if (!adSlotId) {
      return;
    }

    placeholder.classList.add("adsense-unit");
    placeholder.innerHTML = `
      <ins
        class="adsbygoogle"
        style="display:block"
        data-ad-client="${adsenseConfig.publisherId}"
        data-ad-slot="${adSlotId}"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    `;

    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
}
