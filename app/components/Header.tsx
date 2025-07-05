'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  FiSearch, 
  FiGlobe, 
  FiTarget, 
  FiUsers, 
  FiFileText, 
  FiMapPin, 
  FiUser, 
  FiHome, 
  FiHeart, 
  FiDatabase, 
  FiShield, 
  FiDollarSign, 
  FiShoppingBag,
  FiChevronDown,
  FiBell,
  FiSettings
} from 'react-icons/fi';
import IconDisplay from './IconDisplay';

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  isActive: boolean
  order: number
  toolCount: number
}

const Header = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    };

    updateTime(); // Mise à jour immédiate
    const timer = setInterval(updateTime, 1000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  // Charger les catégories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories?limit=20');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Charger les notifications pour les utilisateurs connectés
  useEffect(() => {
    if (session?.user) {
      loadNotifications();
      // Recharger les notifications toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    
    // Vérifier si le clic est dans le menu déroulant des outils
    if (!target.closest('.dropdown-tools') && showDropdown) {
      setShowDropdown(false);
    }
    
    // Vérifier si le clic est dans le menu utilisateur
    if (!target.closest('.dropdown-user') && showUserMenu) {
      setShowUserMenu(false);
    }
    
    // Vérifier si le clic est dans le menu notifications
    if (!target.closest('.dropdown-notifications') && showNotifications) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'
    }`}>
      {/* Ligne de scan cyberpunk */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
      
      <div className="px-8 py-6">
        <div className="flex justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
            </div>
            <Link href="/" className="ml-2 cursor-pointer hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold font-mono text-primary cyber-glow">
                aOSINT
              </h1>
              <p className="text-sm text-accent font-mono">
                Advanced Open Source Intelligence
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-primary transition-colors duration-200 cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg">
              Accueil
            </Link>
            
            {/* Dropdown Outils */}
            <div className="relative dropdown-tools">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-300 hover:text-primary transition-colors duration-200 flex items-center gap-1 cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg"
              >
                Outils
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-[520px] bg-black/95 backdrop-blur-md border border-primary/20 rounded-lg shadow-2xl z-50">
                  <div className="p-4">
                    {/* Lien "Tous les outils" */}
                    <Link
                      href="/tools"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group mb-2 border-b border-gray-800 cursor-pointer"
                    >
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary text-sm font-bold">∞</span>
                      </div>
                      <div>
                        <span className="text-foreground group-hover:text-primary transition-colors font-medium">
                          Tous les outils
                        </span>
                        <div className="text-xs text-gray-400">
                          Voir tous les outils OSINT disponibles
                        </div>
                      </div>
                    </Link>
                    
                    {/* Catégories */}
                    {loadingCategories ? (
                      <div className="py-4 text-center text-gray-400">
                        Chargement des catégories...
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/tools/${category.slug}`}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group cursor-pointer"
                          >
                            <IconDisplay 
                              iconName={category.icon} 
                              className="w-5 h-5 text-primary flex-shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-foreground group-hover:text-primary transition-colors font-medium text-sm block truncate">
                                {category.name}
                              </span>
                              <div className="text-xs text-gray-400">
                                {category.toolCount} outil{category.toolCount > 1 ? 's' : ''}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-400">
                        Aucune catégorie disponible
                      </div>
                    )}
                  </div>
                  
                  {/* Ligne de scan en bas du menu */}
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                </div>
              )}
            </div>
            
            <Link href="/about" className="text-gray-300 hover:text-primary transition-colors duration-200 cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors duration-200 cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg">
              Contact
            </Link>
          </nav>

          {/* Informations système */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="text-right">
              <div className="text-xs text-accent font-mono uppercase tracking-wider">SYSTÈME</div>
              <div className="text-lg text-primary font-mono font-bold">
                {mounted ? currentTime : '00:00:00'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-accent font-mono uppercase tracking-wider">STATUT</div>
              <div className="text-lg text-primary font-mono font-bold flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></span>
                ACTIF
              </div>
            </div>
          </div>

          {/* Boutons d'authentification */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-400">Chargement...</div>
            ) : session ? (
              // Utilisateur connecté
              <div className="flex items-center space-x-4">
                {/* DEBUG: Afficher les infos de session */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 font-mono">
                    Role: {(session.user as any)?.role || 'undefined'}
                  </div>
                )}
                
                {/* Cloche de notifications */}
                <div className="relative dropdown-notifications">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-300 hover:text-primary transition-colors duration-200 cursor-pointer hover:bg-primary/10 rounded-lg"
                  >
                    <FiBell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-black/95 backdrop-blur-md border border-primary/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-primary font-mono">Notifications</h3>
                          <Link 
                            href="/profile"
                            className="text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer hover:bg-accent/10 px-2 py-1 rounded"
                            onClick={() => setShowNotifications(false)}
                          >
                            Voir tout
                          </Link>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">Aucune notification</p>
                        ) : (
                          <div className="space-y-3">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                  notification.isRead 
                                    ? 'border-gray-600 bg-gray-800/50' 
                                    : 'border-accent/30 bg-accent/5 hover:bg-accent/10'
                                }`}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead(notification.id);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-foreground mb-1">
                                      {notification.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 mt-1">
                                      {formatDate(notification.createdAt)}
                                    </span>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu utilisateur */}
                <div className="relative dropdown-user">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors duration-200 cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block">{session.user?.name || 'Utilisateur'}</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-black/95 backdrop-blur-md border border-primary/20 rounded-lg shadow-2xl z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-700">
                          <p className="text-sm text-gray-300">{session.user?.name}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                          <p className="text-xs text-accent font-mono uppercase">
                            {(session.user as any)?.role || 'USER'}
                          </p>
                        </div>
                        <Link href="/profile" className="block px-3 py-2 text-sm text-gray-300 hover:text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer">
                          Mon profil
                        </Link>
                        <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-300 hover:text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer">
                          Tableau de bord
                        </Link>
                        {((session.user as any)?.role === 'ADMIN') && (
                          <Link href="/admin" className="block px-3 py-2 text-sm text-accent hover:text-accent/80 hover:bg-accent/10 rounded transition-colors font-mono cursor-pointer">
                            <FiSettings className="w-4 h-4 inline mr-2" />
                            Administration
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Utilisateur non connecté
              <>
                <Link href="/auth/signin" className="text-gray-300 hover:text-primary transition-colors duration-200 cursor-pointer hover:bg-primary/10 px-3 py-2 rounded-lg">
                  Connexion
                </Link>
                <Link href="/auth/signup" className="cyber-button-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer hover:opacity-90">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ligne de scan cyberpunk bas */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"></div>
    </header>
  );
};

export default Header; 