async function test() {
  const url = "https://www.facebook.com/share/p/1HpEKFZ3KL/?mibextid=wwXIfr";
  const res = await fetch(`https://api.dub.co/metatags?url=${encodeURIComponent(url)}`);
  const json = await res.json();
  console.log('Dub API details:', json);
}
test();
