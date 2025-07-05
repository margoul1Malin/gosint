'use client';

import React from 'react';
import Link from 'next/link';

const ArticlesSection = () => {
  const articles = [
    {
      title: 'Guide complet Anonymat sur Internet',
      description: 'Découvrez les dernières techniques et outils pour l\'anonymat sur Internet. Ainsi que la méthodologie pour éviter toutes erreurs.',
      category: 'GUIDE',
      readTime: '45 min',
      url: 'https://www.drhead.org/articles/anonymat-sur-internet-1743024807903',
      featured: true
    },
    {
      title: 'Découvrez le SEO Black Hat',
      description: 'Découvrez les techniques de SEO Black Hat pour améliorer votre visibilité sur les moteurs de recherche.',
      category: 'SEO',
      readTime: '8 min',
      url: 'https://www.drhead.org/articles/quelques-techniques-seo-blackhat-1751392180396',
      featured: false
    },
    {
      title: 'Techniques de Stéganographie',
      description: 'Découvrez les techniques de stéganographie pour protéger vos informations.',
      category: 'TECHNIQUE',
      readTime: '12 min',
      url: 'https://www.drhead.org/articles/la-steganographie-1743170639329',
      featured: false
    },
    {
      title: 'Windows : Elevation de privilèges',
      description: 'Découvrez les techniques d\'elevation de privilèges pour Windows.',
      category: 'MÉTHODOLOGIE',
      readTime: '20 min',
      url: 'https://www.drhead.org/articles/windows-privilege-escalation-1741645458198',
      featured: true
    },
    {
      title: 'Partitionnement Linux',
      description: 'Découvrez les meilleurs outils pour le partitionnement Linux.',
      category: 'SYSTÈME',
      readTime: '10 min',
      url: 'https://www.drhead.org/articles/linux-comprendre-le-partitionnement-1741604103666',
      featured: false
    },
    {
      title: 'Créez votre propre VPN avec WireGuard !',
      description: 'Découvrez comment créer votre propre VPN avec WireGuard.',
      category: 'SECURITE',
      readTime: '5 min',
      url: 'https://www.drhead.org/articles/creer-son-propre-vpn-avec-wireguard-1751400519029',
      featured: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'GUIDE': 'text-primary border-primary/30 bg-primary/10',
      'SÉCURITÉ': 'text-accent border-accent/30 bg-accent/10',
      'TECHNIQUE': 'text-secondary border-secondary/30 bg-secondary/10',
      'MÉTHODOLOGIE': 'text-primary border-primary/30 bg-primary/10',
      'OUTILS': 'text-accent border-accent/30 bg-accent/10',
      'AUTOMATISATION': 'text-secondary border-secondary/30 bg-secondary/10'
    };
    return colors[category as keyof typeof colors] || 'text-primary border-primary/30 bg-primary/10';
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-surface/20 overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Lignes de scan */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-[90%] mx-auto px-8 relative z-10 grid grid-cols-2 place-items-center">
        {/* En-tête de section */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-primary font-mono mb-6 cyber-glow">
            <span className="text-accent">{'>'}</span> RESSOURCES & ARTICLES
          </h2>
          <p className="text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
            Approfondissez vos connaissances avec nos guides, tutoriels et analyses sur l'OSINT et la cybersécurité.
          </p>
          
          {/* Indicateurs de mise à jour */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            <div className="flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full border border-primary/30">
              <span className="text-primary font-mono text-lg">Mis à jour quotidiennement</span>
            </div>
            <div className="flex items-center space-x-3 bg-accent/10 px-6 py-3 rounded-full border border-accent/30">
              <span className="text-accent font-mono text-lg">Contenu premium gratuit</span>
            </div>
          </div>
        </div>

        {/* Articles en format liste verticale */}
        <div className="space-y-8 mb-20">
          {articles.map((article, index) => (
            <div 
              key={index} 
              className={`cyber-border rounded-2xl bg-surface/20 backdrop-blur-sm hover:bg-surface/30 transition-all group max-w-4xl mx-auto ${
                article.featured ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              <div className="p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-mono font-bold border ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      {article.featured && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-primary text-sm font-mono">FEATURED</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-3xl font-bold text-primary mb-4 font-mono group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-foreground/70 text-xl leading-relaxed mb-6">
                      {article.description}
                    </p>

                    <div className="flex items-center gap-6 text-foreground/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="font-mono">Lecture: {article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span className="font-mono font-bold text-secondary">Gratuit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link 
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-3 text-primary hover:text-accent transition-colors font-mono font-bold text-lg bg-primary/10 hover:bg-accent/10 px-6 py-3 rounded-xl border border-primary/30 hover:border-accent/30"
                    >
                      <span>Lire l'article</span>
                      <span className="text-2xl">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Barre de progression animée */}
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Newsletter centrée */}
        <div className="cyber-border p-12 rounded-2xl bg-black backdrop-blur-sm w-full mx-auto text-center col-span-2">
          <h3 className="text-4xl font-bold text-primary font-mono mb-6 cyber-glow">
            <span className="text-accent">{'>'}</span> NEWSLETTER
          </h3>
          <p className="text-foreground/70 text-xl mb-8">
            Recevez chaque semaine les dernières actualités, outils et techniques d'OSINT directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input 
              type="email" 
              placeholder="votre@email.com" 
              className="flex-1 bg-background/50 border border-primary/30 rounded-xl px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-colors font-mono text-lg"
            />
            <button className="cyber-button-primary px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105">
              S'abonner
            </button>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-primary font-mono text-lg">2500+ abonnés • Pas de spam</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection; 