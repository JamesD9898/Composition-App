// Check authentication before page renders
const AuthEnabled = false;
const AuthDisabledPages = ["index.html", "auth.html"];
function verifyAuth() {
    if (!AuthEnabled) {
        console.log("Auth is disabled for all pages");
        return;
    }
    if (AuthDisabledPages.includes(window.location.pathname)) {
        console.log("Auth is disabled on page " + window.location.pathname);
        return;
    }
    // Get the full URL of the current page
    const currentURL = window.location.href;

    // Get just the pathname (e.g., "/folder/page.html")
    const pathname = window.location.pathname;

    // Get the filename from the path
    const filename = pathname.split('/').pop();

    fetch("/api/auth/verify")
      .then((response) => response.json())
    .then((data) => {
        if (!data.authenticated) {
            window.location.href = "/auth/auth.html";
        }
          })
          .catch((error) => {
            console.error("Authentication check failed:", error);
            window.location.href = "/auth/auth.html";
          });
}

verifyAuth();
