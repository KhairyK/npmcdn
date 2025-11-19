export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Format: /npm/<package>@<version>/<file>
    // Contoh: /npm/vue@3.3.4/dist/vue.esm-browser.js
    if (!url.pathname.startsWith("/npm/")) {
      return new Response("Invalid route. Use /npm/<package>@<version>/<file>", { status: 400 });
    }

    // Hilangkan `/npm/`
    const path = url.pathname.replace("/npm/", "");

    // Sumber CDN fallback
    const cdnList = [
      `https://cdn.jsdelivr.net/npm/${path}`,
      `https://unpkg.com/${path}`,
    ];

    // Loop coba fetch ke semua CDN
    for (const cdnURL of cdnList) {
      try {
        const response = await fetch(cdnURL);

        if (response.ok) {
          // Clone response supaya header bisa di-edit
          const newHeaders = new Headers(response.headers);
          newHeaders.set("Access-Control-Allow-Origin", "*");
          newHeaders.set("Cache-Control", "public, max-age=3600");

          return new Response(response.body, {
            status: response.status,
            headers: newHeaders
          });
        }
      } catch (err) {
        // CDN error → lanjut ke yang berikutnya
      }
    }

    // Semua sumber CDN gagal
    return new Response("Package or file not found in jsDelivr or UNPKG", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
};
