import fetch from "node-fetch";

const URL = "https://www.instagram.com/nanis_cakes/?__a=1&__d=dis";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Cookie": "sessionid=YOUR_SESSION_ID; csrftoken=YOUR_CSRF_TOKEN", // لازم تعبيها
  "X-CSRFToken": "YOUR_CSRF_TOKEN"
};

async function fetchInstagram() {
  const res = await fetch(URL, { headers });
  if (!res.ok) {
    console.error("HTTP error", res.status);
    const text = await res.text();
    console.log(text); // يشوف لو رجع HTML أو JSON
    return;
  }
  const json = await res
  console.log(json.body);
}

fetchInstagram();
