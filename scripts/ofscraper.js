
const scrape = async (pseudo) => {
  const searchUrl = `https://onlyfans.com/search?q=${encodeURIComponent(pseudo)}`;

  // Essaie avec ou sans headless
  const payload = {
    url: searchUrl,
    geo: "fr",
    headless: "html" // ou false / null
  };

  const response = await fetch("https://scraper-api.decodo.com/v2/scrape", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic VTAwMDAyODc0OTc6UFdfMWYyNDA4OTBiNDBmYWM4ZmE1NzJlOWM3NTZkNDk2YTI3"
    },
  });

  if (!response.ok) {
    console.error("Erreur HTTP:", response.status);
    return;
  }

  const data = await response.json();
  if(data.status === "failed"){
    console.error("Erreur API:", data.message);
  } else {
    console.log(data);
  }
}

scrape("jhonny");