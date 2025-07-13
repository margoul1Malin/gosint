import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { franc, francAll } from 'franc'
// @ts-ignore - Module sans types
import { iso6391 } from 'langs'

interface LanguageDetectionResult {
  detectedLanguage: {
    code: string
    name: string
    nativeName?: string
    confidence: number
  }
  alternatives: Array<{
    code: string
    name: string
    nativeName?: string
    confidence: number
  }>
  textInfo: {
    length: number
    wordCount: number
    charCount: number
    sentences: number
  }
  analysis: {
    isReliable: boolean
    confidenceLevel: 'high' | 'medium' | 'low'
    recommendations: string[]
  }
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { text } = await request.json()

    // Validation du texte
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texte requis' },
        { status: 400 }
      )
    }

    const trimmedText = text.trim()
    
    if (trimmedText.length === 0) {
      return NextResponse.json(
        { error: 'Le texte ne peut pas être vide' },
        { status: 400 }
      )
    }

    if (trimmedText.length > 3000) { // 300 mots ≈ 3000 caractères
      return NextResponse.json(
        { error: 'Le texte ne peut pas dépasser 300 mots (environ 3000 caractères)' },
        { status: 400 }
      )
    }

    console.log(`🔍 Détection de langue pour un texte de ${trimmedText.length} caractères`)

    // Analyser le texte
    const textInfo = analyzeText(trimmedText)

    // Détecter la langue avec franc
    const detectedCode = franc(trimmedText)
    
    // Obtenir les alternatives avec leurs scores
    const francAllResults = francAll(trimmedText)
    
    // Convertir les codes ISO 639-3 en informations de langue
    const detectedLanguage = getLanguageInfo(detectedCode, francAllResults[0]?.[1] || 0)
    
    // Obtenir les alternatives (top 5)
    const alternatives = francAllResults
      .slice(1, 6)
      .map(([code, score]: [string, number]) => getLanguageInfo(code, score))
      .filter((lang: any) => {
        // Filtrer les langues indéterminées et les scores très faibles
        return lang.code !== 'und' && 
               lang.confidence > 10 && // Minimum 10% de confiance
               !lang.name.includes('Langue inconnue') // Exclure les langues non reconnues
      })

    // Analyser la fiabilité
    const analysis = analyzeReliability(detectedLanguage, alternatives, textInfo)

    const result: LanguageDetectionResult = {
      detectedLanguage,
      alternatives,
      textInfo,
      analysis,
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Langue détectée: ${detectedLanguage.name} (${detectedLanguage.confidence.toFixed(2)}%)`)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ Erreur lors de la détection de langue:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de la détection de langue'
      },
      { status: 500 }
    )
  }
}

function analyzeText(text: string) {
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
  
  return {
    length: text.length,
    wordCount: words.length,
    charCount: text.replace(/\s/g, '').length,
    sentences: sentences.length
  }
}

function getLanguageInfo(code: string, score: number) {
  // Convertir le score franc en pourcentage de confiance
  const confidence = Math.min(Math.max((score / 1) * 100, 0), 100)
  
  // Essayer de trouver les informations de langue
  let languageInfo = null
  
  // Franc utilise ISO 639-3, essayer de convertir en ISO 639-1
  try {
    // Mapping manuel pour les codes les plus communs
    const codeMapping: { [key: string]: string } = {
      'fra': 'fr',
      'eng': 'en',
      'spa': 'es',
      'deu': 'de',
      'ita': 'it',
      'por': 'pt',
      'rus': 'ru',
      'jpn': 'ja',
      'kor': 'ko',
      'zho': 'zh',
      'ara': 'ar',
      'hin': 'hi',
      'nld': 'nl',
      'swe': 'sv',
      'nor': 'no',
      'dan': 'da',
      'fin': 'fi',
      'pol': 'pl',
      'ces': 'cs',
      'hun': 'hu',
      'tur': 'tr',
      'heb': 'he',
      'tha': 'th',
      'vie': 'vi',
      'ukr': 'uk',
      'bul': 'bg',
      'ron': 'ro',
      'hrv': 'hr',
      'slv': 'sl',
      'est': 'et',
      'lav': 'lv',
      'lit': 'lt',
      'slk': 'sk',
      'cat': 'ca',
      'eus': 'eu',
      'glg': 'gl',
      'mlt': 'mt',
      'gle': 'ga',
      'cym': 'cy',
      'isl': 'is',
      'mkd': 'mk',
      'sqi': 'sq',
      'bel': 'be',
      'ltz': 'lb',
      'mri': 'mi',
      'mya': 'my',
      'nep': 'ne',
      'sin': 'si',
      'tam': 'ta',
      'tel': 'te',
      'kan': 'kn',
      'mal': 'ml',
      'guj': 'gu',
      'pan': 'pa',
      'ben': 'bn',
      'ori': 'or',
      'mar': 'mr',
      'asm': 'as',
      'urd': 'ur',
      'pus': 'ps',
      'fas': 'fa',
      'kur': 'ku',
      'amh': 'am',
      'orm': 'om',
      'som': 'so',
      'swa': 'sw',
      'hau': 'ha',
      'yor': 'yo',
      'ibo': 'ig',
      'zul': 'zu',
      'afr': 'af',
      'xho': 'xh'
    }
    
    const iso639_1 = codeMapping[code] || code
    languageInfo = iso6391.where('1', iso639_1)
  } catch (error) {
    console.warn(`Impossible de trouver les informations pour le code: ${code}`)
  }
  
  return {
    code: code,
    name: languageInfo?.name || getLanguageName(code),
    nativeName: languageInfo?.nativeName,
    confidence: confidence
  }
}

function getLanguageName(code: string): string {
  // Mapping complet des langues ISO 639-3 - Couvre plus de 500 langues
  const names: { [key: string]: string } = {
    // === LANGUES PRINCIPALES ===
    'fra': 'Français',
    'eng': 'Anglais',
    'spa': 'Espagnol',
    'deu': 'Allemand',
    'ita': 'Italien',
    'por': 'Portugais',
    'rus': 'Russe',
    'jpn': 'Japonais',
    'kor': 'Coréen',
    'zho': 'Chinois',
    'ara': 'Arabe',
    'hin': 'Hindi',
    'nld': 'Néerlandais',
    'swe': 'Suédois',
    'nor': 'Norvégien',
    'dan': 'Danois',
    'fin': 'Finnois',
    'pol': 'Polonais',
    'ces': 'Tchèque',
    'hun': 'Hongrois',
    'tur': 'Turc',
    'heb': 'Hébreu',
    'tha': 'Thaï',
    'vie': 'Vietnamien',
    'ukr': 'Ukrainien',
    'bul': 'Bulgare',
    'ron': 'Roumain',
    'hrv': 'Croate',
    'slv': 'Slovène',
    'est': 'Estonien',
    'lav': 'Letton',
    'lit': 'Lituanien',
    'slk': 'Slovaque',
    'cat': 'Catalan',
    'eus': 'Basque',
    'glg': 'Galicien',
    'ell': 'Grec Moderne',
    'srp': 'Serbe',
    'bos': 'Bosniaque',
    'cnr': 'Monténégrin',
    'mri': 'Maori',
    'haw': 'Hawaïen',
    'smo': 'Samoan',
    'ton': 'Tongan',
    'fij': 'Fidjien',
    'tah': 'Tahitien',
    
    // === LANGUES ASIATIQUES ===
    'ind': 'Indonésien',
    'msa': 'Malais',
    'fil': 'Filipino',
    'tgl': 'Tagalog',
    'ceb': 'Cebuano',
    'war': 'Waray',
    'pam': 'Pampangan',
    'pag': 'Pangasinan',
    'ilo': 'Ilocano',
    'hil': 'Hiligaynon',
    'bik': 'Bikol',
    'cmn': 'Chinois Mandarin',
    'yue': 'Cantonais',
    'wuu': 'Wu (Shanghaïen)',
    'hsn': 'Xiang',
    'hak': 'Hakka',
    'nan': 'Min Nan',
    'gan': 'Gan',
    'lzh': 'Chinois Classique',
    'bod': 'Tibétain',
    'mon': 'Mongol',
    'khm': 'Khmer',
    'lao': 'Lao',
    'mya': 'Birman',
    'nep': 'Népalais',
    'sin': 'Cinghalais',
    'dzo': 'Dzongkha',
    'kha': 'Khasi',
    'lus': 'Mizo',
    'grt': 'Garo',
    'kok': 'Konkani',
    'sat': 'Santali',
    'brx': 'Bodo',
    'mni': 'Manipuri',
    'raj': 'Rajasthani',
    'bho': 'Bhojpuri',
    'mai': 'Maithili',
    'mag': 'Magahi',
    'awa': 'Awadhi',
    'new': 'Newari',
    'doi': 'Dogri',
    'kas': 'Kashmiri',
    'sd': 'Sindhi',
    'pnb': 'Pendjabi Occidental',
    'bal': 'Baloutchi',
    'bra': 'Braj',
    'hne': 'Chhattisgarhi',
    'gom': 'Konkani de Goa',
    'tcy': 'Tulu',
    'bpy': 'Bishnupriya',
    'syl': 'Sylheti',
    'ctg': 'Chittagonian',
    'rkt': 'Rangpuri',
    'rhg': 'Rohingya',
    'my': 'Birman',
    'shn': 'Shan',
    'mnw': 'Mon',
    'kar': 'Karen',
    'kac': 'Kachin',
    'ksw': 'Karen Sgaw',
    'pwo': 'Karen Pwo',
    'kjp': 'Pwo Karen Oriental',
    'blk': 'Pa\'o',
    'kyu': 'Kayah Occidental',
    'eky': 'Kayah Oriental',
    'kht': 'Khamti',
    'njo': 'Ao',
    'njz': 'Nyishi',
    'adi': 'Adi',
    'aot': 'Atong',
    'grt': 'Garo',
         'xnr': 'Kangri',
     'gbm': 'Garhwali',
     'pbv': 'Pnar',
     'lsi': 'Lachixío Zapotec',
     'unr': 'Mundari',
     'hoc': 'Ho',
     'kru': 'Kurukh',
     'hmar': 'Hmar',
     'pawi': 'Lai',
     'ctd': 'Tedim Chin',
     'cnh': 'Chin Hakha',
     'cfm': 'Falam Chin',
     'czt': 'Zotung Chin',
     'dao': 'Daai Chin',
     'csy': 'Siyin Chin',
     'cbl': 'Bualkhaw Chin',
     'cnw': 'Ngawn Chin',
     'cka': 'Khumi Chin',
     'cmr': 'Mro Chin',
     'csh': 'Asho Chin',
     'cnb': 'Chinbon Chin',
    
    // === LANGUES INDIENNES ===
    'tam': 'Tamoul',
    'tel': 'Télougou',
    'kan': 'Kannada',
    'mal': 'Malayalam',
    'guj': 'Gujarati',
    'pan': 'Pendjabi',
    'ben': 'Bengali',
    'ori': 'Oriya',
    'mar': 'Marathi',
    'asm': 'Assamais',
    'urd': 'Ourdou',
    'pus': 'Pachto',
    'fas': 'Persan',
    'kur': 'Kurde',
    'ckb': 'Sorani',
    'kmr': 'Kurmandji',
    'sdh': 'Kurde du Sud',
    'lrc': 'Luri du Nord',
    'luz': 'Luri du Sud',
    'glk': 'Gilaki',
    'mzn': 'Mazandarani',
    'tly': 'Talysh',
    'ttt': 'Tat Musulman',
    'jdt': 'Judéo-Tat',
    'pal': 'Pahlavi',
    'xpr': 'Parthe',
    'sog': 'Sogdien',
    'kho': 'Khotanais',
    'xco': 'Chorasmien',
    'xbc': 'Bactrien',
    'ae': 'Avestique',
    'peo': 'Vieux Persan',
    'ira': 'Iranien',
    'os': 'Ossète',
    'inh': 'Ingouche',
    'ce': 'Tchétchène',
    'kbd': 'Kabarde',
    'ady': 'Adyghé',
    'ab': 'Abkhaze',
    'ka': 'Géorgien',
    'xmf': 'Mingrélien',
    'lzz': 'Laze',
    'sva': 'Svane',
    'hy': 'Arménien',
    'xcl': 'Arménien Classique',
    
    // === LANGUES TURCO-MONGOLES ===
    'azb': 'Azéri du Sud',
    'aze': 'Azéri',
    'kaz': 'Kazakh',
    'kir': 'Kirghiz',
    'uzb': 'Ouzbek',
    'tgk': 'Tadjik',
    'tuk': 'Turkmène',
    'tat': 'Tatar',
    'chv': 'Tchouvache',
    'bak': 'Bachkir',
    'sah': 'Sakha',
    'tyv': 'Touvain',
    'kjh': 'Khakasse',
    'alt': 'Altaï du Sud',
    'kum': 'Koumyk',
    'nog': 'Nogaï',
    'krc': 'Karatchaï-Balkar',
    'kdr': 'Karaïm',
    'gag': 'Gagaouze',
    'crh': 'Tatar de Crimée',
    'kaa': 'Karakalpak',
    'uum': 'Urum',
    'otk': 'Turc Ancien',
    'oui': 'Ouïghour Ancien',
    'uga': 'Ougaritique',
    'xqa': 'Karakhanide',
    'chg': 'Tchaghataï',
    'ota': 'Turc Ottoman',
    'trk': 'Turc',
    'slr': 'Salar',
    'ybe': 'Yugur Occidental',
    'yuy': 'Yugur Oriental',
    'dlg': 'Dolgane',
    'evn': 'Evenk',
    'eve': 'Even',
    'neg': 'Negidal',
    'orh': 'Oroqen',
    'orc': 'Oroch',
    'ude': 'Ude',
    'ulc': 'Ulch',
    'niv': 'Nivkh',
    'ain': 'Aïnou',
    'jpx': 'Japonais',
    'ryu': 'Ryukyu',
    'xug': 'Kunigami',
    'ryn': 'Rungus du Nord',
    'yoi': 'Yonaguni',
    'kzg': 'Kikai',
    'tkn': 'Tokunoshima',
    'ams': 'Amami du Sud',
    'rys': 'Yaeyama',
    'yox': 'Yoron',
    'okn': 'Okinawa du Nord',
    'xmm': 'Miyako',
    'mvi': 'Miyako',
    'psm': 'Pauserna',
    'tkm': 'Takelma',
    'tol': 'Tolowa',
    'wax': 'Wasco-Wishram',
    'yur': 'Yurok',
    'hup': 'Hupa',
    'ktw': 'Kato',
    'wai': 'Wailaki',
    'ckn': 'Cahto',
    'mjd': 'Mattole',
    'shs': 'Shuswap',
    'lil': 'Lillooet',
    'thp': 'Thompson',
    'oka': 'Okanagan',
    'coo': 'Comox',
    'hur': 'Halkomelem',
    'lut': 'Lushootseed',
    'str': 'Straits Salish',
    'clm': 'Clallam',
    'nux': 'Nuxalk',
    'kwk': 'Kwak\'wala',
    'hei': 'Heiltsuk',
    'oow': 'Oowekyala',
    'has': 'Haisla',
    'coo': 'Comox',
    'pqm': 'Malécite-Passamaquoddy',
    'mic': 'Micmac',
    'abe': 'Abénaquis Occidental',
    'aaq': 'Abénaquis Oriental',
    'xpq': 'Mohegan-Pequot',
    'wam': 'Wampanoag',
    'nac': 'Narragansett',
    'qun': 'Quinnipiac',
    'unm': 'Unami',
    'mun': 'Munsee',
    'oj': 'Ojibwe',
    'pot': 'Potawatomi',
    'otw': 'Ottawa',
    'alq': 'Algonquin',
    'cr': 'Cree',
    'csw': 'Cree des Marais',
    'cwd': 'Cree des Bois',
    'crk': 'Cree des Plaines',
    'crl': 'Cree de l\'Est',
    'crm': 'Cree de Moose',
    'crj': 'Cree du Sud-Est',
    'cro': 'Crow',
    'hid': 'Hidatsa',
    'mhq': 'Mandan',
    'arp': 'Arapaho',
    'ats': 'Atsina',
    'chy': 'Cheyenne',
    'lkt': 'Lakota',
    'dak': 'Dakota',
    'nkt': 'Nakota',
    'sto': 'Stoney',
    'asb': 'Assiniboine',
    'win': 'Ho-Chunk',
    'oto': 'Otoe',
    'iow': 'Iowa',
    'mpv': 'Mandan',
    'omh': 'Omaha',
    'pon': 'Ponca',
    'ksk': 'Kansa',
    'osb': 'Osage',
    'qua': 'Quapaw',
    'mus': 'Muskogee',
    'sem': 'Seminole',
    'hit': 'Hitchiti',
    'akz': 'Alabama',
    'cku': 'Koasati',
    'apk': 'Kiowa Apache',
    'kio': 'Kiowa',
    'com': 'Comanche',
    'shh': 'Shoshone',
    'pai': 'Paiute du Nord',
    'chm': 'Mari',
    'udm': 'Oudmourte',
    'kpv': 'Komi-Zyriane',
    'koi': 'Komi-Permyak',
    'myv': 'Erzya',
    'mdf': 'Moksha',
    'hun': 'Hongrois',
    'kca': 'Khanty',
    'mns': 'Mansi',
    'nio': 'Nganasan',
    'yrk': 'Nénètse',
    'enh': 'Enets',
    'sel': 'Selkoupe',
    'kca': 'Khanty',
    'mns': 'Mansi',
    'kdr': 'Karaïm',
    'gag': 'Gagaouze',
    'crh': 'Tatar de Crimée',
    'kaa': 'Karakalpak',
    'uum': 'Urum',
    
    // === LANGUES AFRICAINES ===
    'amh': 'Amharique',
    'orm': 'Oromo',
    'som': 'Somali',
    'swa': 'Swahili',
    'hau': 'Haoussa',
    'yor': 'Yoruba',
    'ibo': 'Igbo',
    'zul': 'Zoulou',
    'xho': 'Xhosa',
    'afr': 'Afrikaans',
    'nso': 'Sotho du Nord',
    'sot': 'Sotho du Sud',
    'tsn': 'Tswana',
    'ven': 'Venda',
    'ssw': 'Swati',
    'nbl': 'Ndébélé du Sud',
    'tso': 'Tsonga',
    'mlg': 'Malgache',
    'aka': 'Akan',
    'twi': 'Twi',
    'fat': 'Fanti',
    'ewe': 'Ewe',
    'gaa': 'Ga',
    'dag': 'Dagbani',
    'gur': 'Frafra',
    'kpo': 'Ikposo',
    'bm': 'Bambara',
    'dyu': 'Dioula',
    'man': 'Mandingue',
    'mnk': 'Mandinka',
    'sus': 'Soussou',
    'kri': 'Krio',
    'men': 'Mendé',
    'tem': 'Temne',
    'lim': 'Limbou',
    'vai': 'Vaï',
    'kpe': 'Kpellé',
    'bss': 'Akoose',
    'bas': 'Bassa',
    'btb': 'Beti',
    'bum': 'Bulu',
    'byv': 'Medumba',
    'eto': 'Eton',
    'ewo': 'Ewondo',
    'fan': 'Fang',
    'fub': 'Adamawa Fulfulde',
    'fuv': 'Fulfulde du Nord-Est',
    'fuf': 'Pular',
    'ffm': 'Maasina Fulfulde',
    'fue': 'Borgu Fulfulde',
    'fuc': 'Pulaar',
    'fuq': 'Fulfulde Central-Est',
    'fuh': 'Fulfulde Occidental du Niger',
    'fuv': 'Fulfulde du Nord-Est',
    'gil': 'Kiribati',
    'gom': 'Konkani de Goa',
    'gon': 'Gondi',
    'grt': 'Garo',
    'guz': 'Gusii',
    'haw': 'Hawaïen',
    'her': 'Herero',
    'hil': 'Hiligaynon',
    'hmn': 'Hmong',
    'ho': 'Hiri Motu',
    'hz': 'Herero',
    'ig': 'Igbo',
    'ii': 'Yi de Sichuan',
    'ik': 'Inupiaq',
    'io': 'Ido',
    'is': 'Islandais',
    'it': 'Italien',
    'iu': 'Inuktitut',
    'ja': 'Japonais',
    'jv': 'Javanais',
    'ka': 'Géorgien',
    'kg': 'Kongo',
    'ki': 'Kikuyu',
    'kj': 'Kuanyama',
    'kk': 'Kazakh',
    'kl': 'Groenlandais',
    'km': 'Khmer',
    'kn': 'Kannada',
    'ko': 'Coréen',
    'kr': 'Kanouri',
    'ks': 'Kashmiri',
    'ku': 'Kurde',
    'kv': 'Komi',
    'kw': 'Cornique',
    'ky': 'Kirghiz',
    'la': 'Latin',
    'lb': 'Luxembourgeois',
    'lg': 'Ganda',
    'li': 'Limbourgeois',
    'ln': 'Lingala',
    'lo': 'Lao',
    'lt': 'Lituanien',
    'lu': 'Luba-Katanga',
    'lv': 'Letton',
    'mg': 'Malgache',
    'mh': 'Marshallais',
    'mi': 'Maori',
    'mk': 'Macédonien',
    'ml': 'Malayalam',
    'mn': 'Mongol',
    'mo': 'Moldave',
    'mr': 'Marathi',
    'ms': 'Malais',
    'mt': 'Maltais',
    'my': 'Birman',
    'na': 'Nauruan',
    'nb': 'Norvégien Bokmål',
    'nd': 'Ndébélé du Nord',
    'ne': 'Népalais',
    'ng': 'Ndonga',
    'nl': 'Néerlandais',
    'nn': 'Norvégien Nynorsk',
    'no': 'Norvégien',
    'nr': 'Ndébélé du Sud',
    'nv': 'Navajo',
    'ny': 'Chichewa',
    'oc': 'Occitan',
    'oj': 'Ojibwé',
    'om': 'Oromo',
    'or': 'Oriya',
    'os': 'Ossète',
    'pa': 'Pendjabi',
    'pi': 'Pali',
    'pl': 'Polonais',
    'ps': 'Pachto',
    'pt': 'Portugais',
    'qu': 'Quechua',
    'rm': 'Romanche',
    'rn': 'Kirundi',
    'ro': 'Roumain',
    'ru': 'Russe',
    'rw': 'Kinyarwanda',
    'sa': 'Sanskrit',
    'sc': 'Sarde',
    'sd': 'Sindhi',
    'se': 'Sami du Nord',
    'sg': 'Sango',
    'sh': 'Serbo-Croate',
    'si': 'Cinghalais',
    'sk': 'Slovaque',
    'sl': 'Slovène',
    'sm': 'Samoan',
    'sn': 'Shona',
    'so': 'Somali',
    'sq': 'Albanais',
    'sr': 'Serbe',
    'ss': 'Swati',
    'st': 'Sotho du Sud',
    'su': 'Soundanais',
    'sv': 'Suédois',
    'sw': 'Swahili',
    'ta': 'Tamoul',
    'te': 'Télougou',
    'tg': 'Tadjik',
    'th': 'Thaï',
    'ti': 'Tigrigna',
    'tk': 'Turkmène',
    'tl': 'Tagalog',
    'tn': 'Tswana',
    'to': 'Tongien',
    'tr': 'Turc',
    'ts': 'Tsonga',
    'tt': 'Tatar',
    'tw': 'Twi',
    'ty': 'Tahitien',
    'ug': 'Ouïghour',
    'uk': 'Ukrainien',
    'ur': 'Ourdou',
    'uz': 'Ouzbek',
    've': 'Venda',
    'vi': 'Vietnamien',
    'vo': 'Volapük',
    'wa': 'Wallon',
    'wo': 'Wolof',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'za': 'Zhuang',
    'zh': 'Chinois',
    'zu': 'Zoulou',
    
    // === LANGUES EUROPÉENNES RÉGIONALES ===
    'mlt': 'Maltais',
    'gle': 'Irlandais',
    'gla': 'Gaélique Écossais',
    'cym': 'Gallois',
    'bre': 'Breton',
    'cor': 'Cornique',
    'isl': 'Islandais',
    'fao': 'Féroïen',
    'mkd': 'Macédonien',
    'sqi': 'Albanais',
    'bel': 'Biélorusse',
    'ltz': 'Luxembourgeois',
    'frr': 'Frison du Nord',
    'fry': 'Frison Occidental',
    'stq': 'Frison Oriental',
    'gsw': 'Suisse Allemand',
    'bar': 'Bavarois',
    'lmo': 'Lombard',
    'vec': 'Vénitien',
    'scn': 'Sicilien',
    'nap': 'Napolitain',
    'lij': 'Ligure',
    'pms': 'Piémontais',
    'roa': 'Langue Romane',
    'ast': 'Asturien',
    'ext': 'Estrémègne',
    'mwl': 'Mirandais',
    'arg': 'Aragonais',
    'oci': 'Occitan',
    'cos': 'Corse',
    'srd': 'Sarde',
    'fur': 'Frioulan',
    'lad': 'Ladino',
    'roh': 'Romanche',
    'csb': 'Cachoube',
    'szl': 'Silésien',
    'rue': 'Ruthène',
    'rsn': 'Rusyn',
    'bg': 'Bulgare',
    'mk': 'Macédonien',
    'sr': 'Serbe',
    'hr': 'Croate',
    'bs': 'Bosniaque',
    'cnr': 'Monténégrin',
    'sl': 'Slovène',
    'sk': 'Slovaque',
    'cs': 'Tchèque',
    'pl': 'Polonais',
    'hsb': 'Haut-Sorabe',
    'dsb': 'Bas-Sorabe',
    'hu': 'Hongrois',
    'ro': 'Roumain',
    'rup': 'Aroumain',
    'ruq': 'Mégléno-Roumain',
    'rmy': 'Romani Vlax',
    'rmn': 'Romani Balkan',
    'rmc': 'Romani Carpathien',
    'rmf': 'Romani Kalé',
    'rml': 'Romani Baltique',
    'rmw': 'Romani Gallois',
    'rmg': 'Romani Traveller',
    'rmo': 'Romani Sinte',
    'rmr': 'Romani Kaale',
    'rmu': 'Romani Tavringer',
    'rmy': 'Romani Vlax',
    'rmz': 'Romani Marma',
    'yid': 'Yiddish',
    'lad': 'Ladino',
    'jdt': 'Judéo-Tat',
    'jge': 'Judéo-Géorgien',
    'yhd': 'Judéo-Irakien',
    'jpr': 'Judéo-Persan',
    'prd': 'Judéo-Provençal',
    'itk': 'Judéo-Italien',
    'yij': 'Yiddish',
    'lad': 'Ladino',
    'jdt': 'Judéo-Tat',
    'jge': 'Judéo-Géorgien',
    'yhd': 'Judéo-Irakien',
    'jpr': 'Judéo-Persan',
    'prd': 'Judéo-Provençal',
    'itk': 'Judéo-Italien',
    
    // === LANGUES HISTORIQUES ET CLASSIQUES ===
    'lat': 'Latin',
    'grc': 'Grec Ancien',
    'san': 'Sanskrit',
    'pli': 'Pali',
    'ave': 'Avestique',
    'peo': 'Vieux Persan',
    'xpr': 'Parthe',
    'sog': 'Sogdien',
    'kho': 'Khotanais',
    'xco': 'Chorasmien',
    'xbc': 'Bactrien',
    'pal': 'Pahlavi',
    'xcl': 'Arménien Classique',
    'got': 'Gothique',
    'goh': 'Vieux Haut-Allemand',
    'gmh': 'Moyen Haut-Allemand',
    'osx': 'Vieux Saxon',
    'ofs': 'Vieux Frison',
    'odt': 'Vieux Néerlandais',
    'dum': 'Moyen Néerlandais',
    'ang': 'Vieil Anglais',
    'enm': 'Moyen Anglais',
    'sco': 'Scots',
    'non': 'Vieux Norrois',
    'gmq': 'Germanique du Nord',
    'gem': 'Germanique',
    'ine': 'Indo-Européen',
    'hit': 'Hittite',
    'xlu': 'Louvite',
    'xld': 'Lydien',
    'xlc': 'Lycien',
    'xpg': 'Phrygien',
    'txh': 'Thrace',
    'xil': 'Illyrien',
    'xve': 'Vénète',
    'xmf': 'Mingrélien',
    'lzz': 'Laze',
    'sva': 'Svane',
    'cau': 'Caucasien',
    'xmk': 'Ancien Macédonien',
    'gmy': 'Grec Mycénien',
    'xpg': 'Phrygien',
    'txh': 'Thrace',
    'xil': 'Illyrien',
    'xve': 'Vénète',
    'ett': 'Étrusque',
    'xrr': 'Rhétique',
    'nrc': 'Noric',
    'xce': 'Celtibère',
    'xga': 'Galatien',
    'xtg': 'Gaulois Transalpin',
    'xcg': 'Cisalpin Gaulois',
    'xbm': 'Breton Moyen',
    'owl': 'Vieil Gallois',
    'mga': 'Moyen Irlandais',
    'sga': 'Vieil Irlandais',
    'pgl': 'Gaulois Primitif',
    'cel': 'Celtique',
    'itc': 'Italique',
    'osc': 'Osque',
    'xum': 'Ombrien',
    'xfa': 'Falisque',
    'xvo': 'Volsque',
    'xae': 'Æquien',
    'xmr': 'Marrucin',
    'xps': 'Pélignien',
    'xvs': 'Vestinien',
    'xmf': 'Marsien',
    'xsa': 'Sabellien',
    'xsc': 'Scythe',
    'xln': 'Alain',
    'oos': 'Ossète Ancien',
    'xto': 'Tokharien A',
    'txb': 'Tokharien B',
    'und': 'Indéterminé'
  }
  
  return names[code] || `Langue inconnue (${code})`
}

function analyzeReliability(
  detectedLanguage: any,
  alternatives: any[],
  textInfo: any
) {
  const confidence = detectedLanguage.confidence
  let confidenceLevel: 'high' | 'medium' | 'low' = 'low'
  let isReliable = false
  const recommendations: string[] = []
  
  // Déterminer le niveau de confiance
  if (confidence >= 80) {
    confidenceLevel = 'high'
    isReliable = true
  } else if (confidence >= 60) {
    confidenceLevel = 'medium'
    isReliable = true
  } else {
    confidenceLevel = 'low'
    isReliable = false
  }
  
  // Recommandations basées sur l'analyse
  if (textInfo.wordCount < 10) {
    recommendations.push('Le texte est très court. Ajoutez plus de mots pour améliorer la précision.')
  }
  
  if (textInfo.sentences < 2) {
    recommendations.push('Ajoutez plus de phrases complètes pour une meilleure détection.')
  }
  
  if (confidence < 60) {
    recommendations.push('La confiance est faible. Vérifiez si le texte contient des mots dans plusieurs langues.')
  }
  
  if (alternatives.length > 0 && alternatives[0].confidence > confidence * 0.8) {
    recommendations.push(`Considérez aussi ${alternatives[0].name} comme langue possible.`)
  }
  
  if (detectedLanguage.code === 'und') {
    recommendations.push('Langue indéterminée. Essayez avec un texte plus long et plus caractéristique.')
  }
  
  return {
    isReliable,
    confidenceLevel,
    recommendations
  }
} 