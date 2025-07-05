'use client';

import React, { useState, useEffect } from 'react';

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const phrases = [
    'Automatisez la Reconnaissance',
    'Intelligence ouverte',
    'Analyse de données',
    'Investigation numérique',
    'Cybersécurité'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const currentPhrase = phrases[currentIndex];
    
    if (!isDeleting && typedText.length < currentPhrase.length) {
      // Écrire le texte
      const timeout = setTimeout(() => {
        setTypedText(currentPhrase.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && typedText.length === currentPhrase.length) {
      // Pause avant de commencer à effacer
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typedText.length > 0) {
      // Effacer le texte
      const timeout = setTimeout(() => {
        setTypedText(typedText.slice(0, -1));
      }, 50);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typedText.length === 0) {
      // Passer à la phrase suivante
      setIsDeleting(false);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }
  }, [typedText, currentIndex, isDeleting, phrases, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [mounted]);

  const capabilities = [
    {
      category: 'RECONNAISSANCE',
      items: [
        'Scan de réseaux automatisé',
        'Énumération de sous-domaines',
        'Analyse de ports et services',
        'Cartographie d\'infrastructure'
      ]
    },
    {
      category: 'INVESTIGATION',
      items: [
        'Recherche d\'identités numériques',
        'Analyse de profils sociaux',
        'Corrélation de données',
        'Timeline d\'activités'
      ]
    },
    {
      category: 'ANALYSE',
      items: [
        'Extraction de métadonnées',
        'Analyse de fichiers',
        'Détection de patterns',
        'Visualisation de données'
      ]
    },
    {
      category: 'API',
      items: [
        'API pour les développeurs',
        'Accès aux données en temps réel',
        'Intégration dans vos workflows',
        'Analyse de données via API'
      ]
    }
  ];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-32">
      {/* Effets de fond cyberpunk */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Lignes de scan animées */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-secondary to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse delay-1500"></div>
      </div>

      <div className="w-full max-w-[90%] mx-auto px-8 text-center relative z-10">
        {/* Titre principal */}
        <div className="mb-24">
          <h1 className="text-8xl md:text-[12rem] font-bold font-mono text-primary cyber-glow mb-8">
            aOSINT
          </h1>
          <div className="text-3xl md:text-4xl text-accent font-mono mb-12 h-16 flex items-center justify-center">
            <span className="text-foreground">{'>'}</span>&nbsp;
            <span className="min-w-0">{mounted ? typedText : 'Reconnaissance avancée'}</span>
            <span className={`text-primary ml-1 ${mounted && showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
          </div>
          <p className="text-2xl md:text-3xl text-foreground/80 max-w-6xl mx-auto leading-relaxed mb-16">
            Plateforme avancée d'Open Source Intelligence regroupant les meilleurs outils 
            et techniques pour l'investigation numérique et la collecte d'informations.
          </p>
          
          {/* Badge de confiance */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
            <div className="flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full border border-primary/30">
              <span className="text-primary font-mono text-lg">Utilisé par 500+ professionnels</span>
            </div>
            <div className="flex items-center space-x-3 bg-accent/10 px-6 py-3 rounded-full border border-accent/30">
              <span className="text-accent font-mono text-lg">99.9% de disponibilité</span>
            </div>
            <div className="flex items-center space-x-3 bg-secondary/10 px-6 py-3 rounded-full border border-secondary/30">
              <span className="text-secondary font-mono text-lg">Anonymat garanti</span>
            </div>
          </div>
        </div>

        {/* Statistiques simplifiées */}
        <div className="flex flex-wrap justify-center gap-12 mb-24">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary font-mono mb-4">100+</div>
            <div className="text-2xl text-accent font-medium">Outils OSINT</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-primary font-mono mb-4">24/7</div>
            <div className="text-2xl text-accent font-medium">Disponibilité</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-primary font-mono mb-4">∞</div>
            <div className="text-2xl text-accent font-medium">Possibilités</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-primary font-mono mb-4">0</div>
            <div className="text-2xl text-accent font-medium">Traces</div>
          </div>
        </div>

        {/* Bouton d'action principal */}
        <div className="mb-32">
          <button className="cyber-button-primary px-16 py-8 rounded-2xl font-bold text-2xl transition-all hover:scale-105 shadow-2xl">
            Commencer l'investigation
          </button>
        </div>

        {/* Capacités en format liste plutôt que grille */}
        <div className="mb-24 w-full">
          <h2 className="text-5xl font-bold text-primary font-mono mb-8 cyber-glow">
            <span className="text-accent">{'>'}</span> CAPACITÉS AVANCÉES
          </h2>
          <p className="text-2xl text-foreground/70 mb-16 max-w-4xl mx-auto">
            Explorez toute la puissance de notre plateforme OSINT avec des outils spécialisés pour chaque phase de votre investigation.
          </p>
          
          <div className="grid grid-cols-2 gap-8 w-full">
            {capabilities.map((capability, index) => (
              <div 
                key={index} 
                className={`cyber-border p-12 rounded-2xl backdrop-blur-sm transition-all w-full h-full flex flex-col relative overflow-hidden ${
                  capability.category === 'API' 
                    ? 'bg-gradient-to-br from-[#00ff88] to-[#00d4ff] border-[#00ff88] hover:shadow-[0_0_25px_rgba(0,255,136,0.6),0_0_35px_rgba(0,212,255,0.4)] hover:scale-[1.02] hover:-translate-y-1' 
                    : 'bg-surface/20 hover:bg-surface/30'
                }`}
                style={capability.category === 'API' ? {
                  boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)'
                } : {}}
              >
                {/* Effet de balayage pour la section API */}
                {capability.category === 'API' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-500 ease-out"></div>
                )}
                
                <h3 className={`text-4xl font-bold font-mono mb-8 text-center relative z-10 ${
                  capability.category === 'API' ? 'text-black font-semibold' : 'text-accent'
                }`}>
                  {capability.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 relative z-10">
                  {capability.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-4 min-h-[60px] justify-center">
                      <div className={`w-3 h-3 rounded-full animate-pulse flex-shrink-0 mt-2 ${
                        capability.category === 'API' ? 'bg-black' : 'bg-primary'
                      }`}></div>
                      <span className={`text-xl leading-relaxed ${
                        capability.category === 'API' ? 'text-black font-medium' : 'text-foreground/80'
                      }`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action final simplifié */}
        <div className="cyber-border p-16 rounded-3xl bg-black backdrop-blur-sm w-full mx-auto">
          <h2 className="text-4xl font-bold text-primary font-mono mb-8 cyber-glow">
            Prêt à commencer votre investigation ?
          </h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-4xl mx-auto">
            Rejoignez des centaines de professionnels qui font confiance à aOSINT pour leurs missions critiques.
          </p>
          <button className="cyber-button-primary px-16 py-2 rounded-2xl font-bold text-2xl transition-all hover:scale-105">
            Démarrer maintenant
          </button>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-primary rounded-full flex justify-center">
          <div className="w-2 h-4 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 