async function fetchFb() {
  const url = "https://www.facebook.com/share/p/1HpEKFZ3KL/?mibextid=wwXIfr";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
  };
  const res = await fetch(url, { headers });
  const text = await res.text();
  console.log('Status:', res.status);
  
  const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'No title');
}
fetchFb();
