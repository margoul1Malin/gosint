const { GoogleSearch } = require('serpapi');
const readlineSync = require('readline-sync');

const API_KEY = "d9a71439b65dc0ccd95e77d9f1be889e91f078ebff6fa839b3f952eb47d96f03";

const dorks = [
  'site:facebook.com intext:"{}"',
  'site:twitter.com intext:"{}"',
  'site:linkedin.com intext:"{}"',
  'site:linkedin.com/in/ intext:"{}"',
  'site:instagram.com intext:"{}"',
  'site:vk.com intext:"{}"',
  'site:tiktok.com/@ intext:"{}"',
  'site:snapchat.com/add/ intext:"{}"',
  'site:hs3x.com intext:"{}"',
  'site:receive-sms-now.com intext:"{}"',
  'site:smslisten.com intext:"{}"',
  'site:smsnumbersonline.com intext:"{}"',
  'site:freesmscode.com intext:"{}"',
  'site:whosenumber.info intext:"{}" intitle:"who called"',
  'intitle:"Phone Fraud" intext:"{}"',
  'site:findwhocallsme.com intext:"{}"',
  'site:annuaire-inverse.net intext:"{}"',
  'site:leboncoin.fr intext:"{}"',
  'site:pagesjaunes.fr intext:"{}"',
  'site:forums.jeuxvideo.com intext:"{}"',
  'site:commentcamarche.net intext:"{}"',
  'site:societe.com intext:"{}"',
  'site:numinfo.net intext:"{}"',
  'site:sync.me intext:"{}"',
  'site:pastebin.com intext:"{}"',
  'site:ghostbin.com intext:"{}"',
  'site:justpaste.it intext:"{}"',
  'site:controlc.com intext:"{}"',
  'site:hastebin.com intext:"{}"',
  // Sites connus pour fuites/mots de passe/identité
  'site:haveibeenpwned.com intext:"{}"',
  'site:breachdirectory.org intext:"{}"',
  'site:dehashed.com intext:"{}"',
  'site:snusbase.com intext:"{}"',
  'site:leak-lookup.com intext:"{}"',
  'site:intelx.io intext:"{}"',
  'site:exposedrips.net intext:"{}"',
  'site:dark.fail intext:"{}"',
  'site:pastebin.com intext:"{} password"',
  'site:ghostbin.com intext:"{} password"',
  'site:justpaste.it intext:"{} password"',
  'site:controlc.com intext:"{} password"',
  'site:hastebin.com intext:"{} password"',
  'intext:"{} password"',
  'intext:"{} email password"',
  'intext:"{} leaked"',
  'intext:"{} breach"',
  'intext:"{} dump"',
  'intext:"{} credentials"',
  'intext:"{} hacked"',
];

async function searchDork(target, dork) {
  const query = dork.replace('{}', target);
  const params = {
    engine: "google",
    q: query,
    api_key: API_KEY,
    num: 5,
  };

  const search = new GoogleSearch(params);

  try {
    const results = await search.json();
    if (results.error) {
      console.log(`[!] Erreur API: ${results.error}`);
      return null;
    }
    if (results.organic_results && results.organic_results.length > 0) {
      return results.organic_results;
    }
    return null;
  } catch (e) {
    console.log(`[!] Exception: ${e.message}`);
    return null;
  }
}

async function main() {
  const target = readlineSync.question('🔍 Entrez un nom, email, numéro... à rechercher : ').trim();
  console.log(`\n🎯 Recherches Google pour : ${target}\n`);

  for (const dork of dorks) {
    console.log(`➡  Dork: ${dork.replace('{}', target)}`);
    const results = await searchDork(target, dork);
    if (results) {
      console.log(`✅ ${results.length} résultat(s) trouvé(s) :`);
      results.forEach((res, i) => {
        const title = res.title || "Pas de titre";
        const link = res.link || "Pas de lien";
        const snippet = res.snippet || "";
        console.log(`  ${i + 1}. ${title}\n     ${link}`);
        if (snippet) console.log(`     Extrait: ${snippet}`);
      });
      console.log();
    } else {
      console.log("❌ Aucun résultat\n");
    }
  }
}

main();
