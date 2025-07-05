# Outils de Vérification de Fuites de Données

Cette page fournit des outils OSINT pour vérifier si vos données personnelles ont été compromises dans des fuites de données.

## Fonctionnalités

### 1. Vérification d'Email
- Vérifie si une adresse email apparaît dans des fuites de données connues
- Utilise l'API Have I Been Pwned pour des résultats fiables
- Affiche les détails des fuites (date, source, types de données)
- Indique si les fuites sont vérifiées ou suspectes

### 2. Vérification de Mot de Passe
- Vérifie si un mot de passe a été compromis dans des fuites
- Utilise l'API Pwned Passwords avec hachage SHA-1 sécurisé
- Analyse la force du mot de passe
- Fournit des recommandations pour améliorer la sécurité
- Calcule l'entropie et le temps de crack estimé

### 3. Vérification de Nom d'Utilisateur
- Recherche les noms d'utilisateur dans diverses sources
- Vérifie la présence sur les plateformes sociales
- Identifie les fuites de données contenant le nom d'utilisateur

## Sécurité

### Protection des Données
- **Mots de passe** : Hachés avec SHA-1 avant envoi (k-anonymity)
- **Emails** : Chiffrés en transit via HTTPS
- **Noms d'utilisateur** : Pas de stockage sur nos serveurs
- **Anonymisation** : Toutes les recherches sont anonymisées

### Bonnes Pratiques
- Utilisez uniquement vos propres données
- Ne partagez jamais vos mots de passe
- Changez immédiatement les mots de passe compromis
- Activez l'authentification à deux facteurs

## APIs Utilisées

### Have I Been Pwned
- **Email Breaches** : Vérification des fuites d'emails
- **Rate Limiting** : Respecte les limites de l'API
- **Fallback** : Données d'exemple si l'API n'est pas disponible

### Pwned Passwords
- **K-Anonymity** : Seuls les 5 premiers caractères du hash sont envoyés
- **Sécurité** : Aucun mot de passe en clair n'est transmis
- **Performance** : Vérification rapide et efficace

## Configuration

### Variables d'Environnement
```bash
# Optionnel : Clé API Have I Been Pwned pour plus de requêtes
HIBP_API_KEY=your_api_key_here
```

### Limitations
- **Rate Limiting** : Limites imposées par les APIs externes
- **Authentification** : Connexion requise pour utiliser les outils
- **Fallback** : Données d'exemple si les APIs sont indisponibles

## Utilisation

1. **Connectez-vous** à votre compte
2. **Sélectionnez l'outil** souhaité
3. **Saisissez les données** à vérifier
4. **Analysez les résultats** et suivez les recommandations

## Que Faire en Cas de Fuite ?

### Actions Immédiates
1. **Changez vos mots de passe** sur tous les comptes affectés
2. **Activez la 2FA** partout où c'est possible
3. **Surveillez vos comptes** pour toute activité suspecte
4. **Utilisez un gestionnaire** de mots de passe

### Prévention
- Utilisez des **mots de passe uniques** pour chaque service
- Créez des mots de passe **longs et complexes**
- Activez les **notifications de sécurité**
- Effectuez des **vérifications régulières**

## Ressources Externes

- [Have I Been Pwned](https://haveibeenpwned.com)
- [Pwned Passwords](https://haveibeenpwned.com/Passwords)
- [DeHashed](https://www.dehashed.com)
- [LeakCheck](https://leakcheck.io)
- [Scylla](https://www.scylla.so)

## Support

Pour toute question ou problème technique, contactez l'équipe de support via la page de contact. 