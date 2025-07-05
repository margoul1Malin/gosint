'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toLocaleString('fr-FR'));
  }, []);

  return (
    <footer className="bg-surface/90 backdrop-blur-lg border-t border-primary/20">
      {/* Ligne de scan supérieure */}
      
      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Colonne 1 - Logo et description */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-bold font-mono text-primary">aOSINT</h3>
            </div>
            <p className="text-foreground/70 text-lg leading-relaxed">
              Plateforme avancée d'Open Source Intelligence pour l'investigation numérique moderne.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-primary text-lg">🔍</span>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/30 hover:bg-accent/20 transition-colors cursor-pointer">
                <span className="text-accent text-lg">🌐</span>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center border border-secondary/30 hover:bg-secondary/20 transition-colors cursor-pointer">
                <span className="text-secondary text-lg">📊</span>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Outils */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-primary font-mono">
              <span className="text-accent">{'>'}</span> OUTILS
            </h4>
            <div className="space-y-4">
              {[
                'Recherche OSINT',
                'Analyse de domaines',
                'Reconnaissance IP',
                'Investigation sociale',
                'Analyse de métadonnées'
              ].map((tool, index) => (
                <Link 
                  key={index}
                  href="#" 
                  className="block text-foreground/70 hover:text-primary transition-colors font-medium"
                >
                  {tool}
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 3 - Ressources */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-primary font-mono">
              <span className="text-accent">{'>'}</span> RESSOURCES
            </h4>
            <div className="space-y-4">
              {[
                'Documentation',
                'Ressources OSINT',
                'Support'
              ].map((resource, index) => (
                <Link 
                  key={index}
                  href="#" 
                  className="block text-foreground/70 hover:text-primary transition-colors font-medium"
                >
                  {resource}
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne 4 - Contact */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-primary font-mono">
              <span className="text-accent">{'>'}</span> CONTACT
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-foreground/70">support@aosint.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-foreground/70">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-foreground/70">Paris, France</span>
              </div>
            </div>

            {/* Statut système */}
            
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-bold text-primary font-mono">
              <span className="text-accent">{'>'}</span> PARTENAIRES
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <Link href="https://www.drhead.org" target="_blank" className="text-foreground/70 font-extrabold">DrHead</Link>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-foreground/70">know.ledger.owner@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-foreground/70">Bordeaux, France</span>
              </div>
            </div>

            {/* Statut système */}
            
          </div>
        </div>

        {/* Séparateur */}
        <div className="my-12 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        {/* Copyright et informations légales */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-foreground/50 text-sm">
            © 2025 aOSINT. Tous droits réservés.
          </div>
          <div className="flex space-x-8">
            <Link href="/confidentiality" className="text-foreground/50 hover:text-primary transition-colors text-sm">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-foreground/50 hover:text-primary transition-colors text-sm">
              Conditions d'utilisation
            </Link>
          </div>
        </div>

        {/* Message cyberpunk */}
        <div className="mt-12 text-center">
          <div className="text-sm text-accent font-mono">
            [ SYSTÈME SÉCURISÉ - ACCÈS AUTORISÉ UNIQUEMENT ]
          </div>
          <div className="text-sm text-primary/50 font-mono mt-2">
            &gt; Connexion établie depuis {mounted ? currentDate : 'Chargement...'}
          </div>
        </div>
      </div>

      {/* Lignes de scan inférieures */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"></div>
      
      {/* Effet de lueur */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none"></div>
    </footer>
  );
};

export default Footer; 