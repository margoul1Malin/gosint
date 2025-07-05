'use client'

import { useState, useEffect } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import { FiFolderPlus, FiPlay, FiLoader, FiAlertTriangle, FiCheck, FiEye, FiShield, FiGlobe, FiFileText, FiFolder, FiExternalLink, FiChevronRight, FiChevronDown, FiFile, FiInfo, FiCheckCircle } from 'react-icons/fi'
import { FoldersEnumerationResult, CrawledPage } from '@/lib/folders-enumeration-executor'

interface TaskStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: FoldersEnumerationResult
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

interface TreeNode {
  url: string
  name: string
  page: CrawledPage
  children: TreeNode[]
  isExpanded: boolean
  level: number
}

export default function FoldersEnumerationPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [result, setResult] = useState<FoldersEnumerationResult | null>(null)
  const [selectedPage, setSelectedPage] = useState<CrawledPage | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'security'>('tree')
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Options de crawling
  const [maxDepth, setMaxDepth] = useState(3)
  const [maxPages, setMaxPages] = useState(100)
  const [includeExternal, setIncludeExternal] = useState(false)
  const [checkSensitiveFiles, setCheckSensitiveFiles] = useState(true)

  // Fonction pour construire l'arbre hiérarchique
  const buildTree = (pages: CrawledPage[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>()
    
    // Créer tous les nœuds
    pages.forEach(page => {
      const url = new URL(page.url)
      const pathname = url.pathname
      
      // Créer le nom d'affichage basé sur le chemin
      let name = pathname === '/' ? 'Accueil' : pathname.split('/').filter(Boolean).pop() || 'Accueil'
      
      // Ajouter l'extension si c'est un fichier
      if (page.extension && !name.includes('.')) {
        name += `.${page.extension}`
      }
      
      // Ajouter un indicateur pour les dossiers
      if (page.isDirectory && !pathname.endsWith('/')) {
        name += '/'
      }
      
      const node: TreeNode = {
        url: page.url,
        name,
        page,
        children: [],
        isExpanded: expandedNodes.has(page.url),
        level: page.depth
      }
      
      nodeMap.set(page.url, node)
    })
    
    // Construire la hiérarchie basée sur les chemins d'URL
    const rootNodes: TreeNode[] = []
    
    pages.forEach(page => {
      const node = nodeMap.get(page.url)
      if (!node) return
      
      const url = new URL(page.url)
      const pathSegments = url.pathname.split('/').filter(Boolean)
      
      if (pathSegments.length === 0) {
        // Page racine
        rootNodes.push(node)
      } else {
        // Trouver le parent logique
        let parentUrl = `${url.protocol}//${url.host}`
        if (pathSegments.length > 1) {
          parentUrl += '/' + pathSegments.slice(0, -1).join('/') + '/'
        } else {
          parentUrl += '/'
        }
        
        const parentNode = nodeMap.get(parentUrl)
        if (parentNode) {
          parentNode.children.push(node)
        } else {
          // Si le parent n'existe pas, essayer de trouver un parent plus proche
          let found = false
          for (let i = pathSegments.length - 2; i >= 0; i--) {
            const potentialParentUrl = `${url.protocol}//${url.host}/${pathSegments.slice(0, i + 1).join('/')}/`
            const potentialParent = nodeMap.get(potentialParentUrl)
            if (potentialParent) {
              potentialParent.children.push(node)
              found = true
              break
            }
          }
          
          if (!found) {
            // Chercher la racine
            const rootUrl = `${url.protocol}//${url.host}/`
            const rootNode = nodeMap.get(rootUrl)
            if (rootNode) {
              rootNode.children.push(node)
            } else {
              rootNodes.push(node)
            }
          }
        }
      }
    })
    
    // Fonction récursive pour trier les enfants
    const sortChildren = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        // Dossiers en premier, puis fichiers
        if (a.page.isDirectory && !b.page.isDirectory) return -1
        if (!a.page.isDirectory && b.page.isDirectory) return 1
        
        // Puis par nom
        return a.name.localeCompare(b.name)
      }).map(node => ({
        ...node,
        children: sortChildren(node.children)
      }))
    }
    
    return sortChildren(rootNodes)
  }

  // Basculer l'expansion d'un nœud
  const toggleNodeExpansion = (nodeUrl: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeUrl)) {
      newExpanded.delete(nodeUrl)
    } else {
      newExpanded.add(nodeUrl)
    }
    setExpandedNodes(newExpanded)
  }

  // Mettre à jour l'arbre quand les résultats changent
  useEffect(() => {
    if (result) {
      const tree = buildTree(result.sitemap)
      setTreeNodes(tree)
    }
  }, [result, expandedNodes])

  // Polling pour vérifier le statut de la tâche
  useEffect(() => {
    if (taskId && (!taskStatus || (taskStatus.status !== 'completed' && taskStatus.status !== 'failed'))) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/queue/status?taskId=${taskId}`)
          if (response.ok) {
            const status = await response.json()
            setTaskStatus(status)
            
            if (status.status === 'completed' && status.result) {
              setResult(status.result)
              setLoading(false)
            } else if (status.status === 'failed') {
              setError(status.error || 'Erreur lors du crawling')
              setLoading(false)
            }
          }
        } catch (err) {
          console.error('Erreur lors de la vérification du statut:', err)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [taskId, taskStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Veuillez entrer une URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setTaskId(null)
    setTaskStatus(null)
    setSelectedPage(null)
    setTreeNodes([])
    setExpandedNodes(new Set())

    try {
      const response = await fetch('/api/tools/folders-enumeration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          maxDepth,
          maxPages,
          includeExternal,
          checkSensitiveFiles
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du lancement du crawling')
      }

      const data = await response.json()
      setTaskId(data.taskId)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du crawling')
      setLoading(false)
    }
  }

  const renderTreeNode = (node: TreeNode, isLast: boolean = false, prefix: string = '') => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.url)
    
    // Symboles pour l'arbre
    const connector = isLast ? '└── ' : '├── '
    const childPrefix = prefix + (isLast ? '    ' : '│   ')
    
    return (
      <div key={node.url} className="font-mono text-sm">
        {/* Nœud principal */}
        <div 
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            selectedPage?.url === node.url 
              ? 'bg-cyan-500/20 border-l-2 border-cyan-500' 
              : 'hover:bg-gray-800/50'
          }`}
          onClick={() => setSelectedPage(node.page)}
        >
          {/* Préfixe de l'arbre */}
          <span className="text-gray-600 select-none whitespace-pre">
            {prefix + connector}
          </span>
          
          {/* Icône d'expansion */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNodeExpansion(node.url)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <FiChevronDown size={14} />
              ) : (
                <FiChevronRight size={14} />
              )}
            </button>
          )}
          
          {/* Icône du fichier/dossier */}
          {node.page.isDirectory ? (
            <FiFolder className="text-yellow-400 flex-shrink-0" size={16} />
          ) : (
            <FiFile className="text-blue-400 flex-shrink-0" size={16} />
          )}
          
          {/* Nom */}
          <span className="text-white truncate flex-1">
            {node.name}
          </span>
          
          {/* Badges de statut */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-xs px-1 py-0.5 rounded ${
              node.page.statusCode === 200 ? 'bg-green-500/20 text-green-400' :
              node.page.statusCode >= 400 ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {node.page.statusCode}
            </span>
            
            {node.page.extension && (
              <span className="text-xs text-gray-400 bg-gray-700/50 px-1 py-0.5 rounded">
                {node.page.extension}
              </span>
            )}
            
            {node.page.forms.length > 0 && (
              <span className="text-xs text-purple-400 bg-purple-500/20 px-1 py-0.5 rounded">
                {node.page.forms.length}F
              </span>
            )}
          </div>
        </div>
        
        {/* Enfants */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, index) => 
              renderTreeNode(child, index === node.children.length - 1, childPrefix)
            )}
          </div>
        )}
      </div>
    )
  }

  const renderTreeView = (nodes: TreeNode[]) => {
    if (nodes.length === 0) return null
    
    return (
      <div className="bg-gray-900/30 rounded-lg p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-medium">Structure du site</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setExpandedNodes(new Set(result?.sitemap.map(p => p.url)))}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Tout développer
            </button>
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Tout réduire
            </button>
          </div>
        </div>
        
        <div className="space-y-0">
          {nodes.map((node, index) => 
            renderTreeNode(node, index === nodes.length - 1)
          )}
        </div>
      </div>
    )
  }

  const renderListView = (pages: CrawledPage[]) => {
    return pages.map((page, index) => (
      <div 
        key={page.url}
        className={`flex items-center gap-3 p-3 rounded border transition-colors cursor-pointer ${
          selectedPage?.url === page.url 
            ? 'bg-cyan-500/20 border-cyan-500/50' 
            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70'
        }`}
        onClick={() => setSelectedPage(page)}
      >
        {page.isDirectory ? (
          <FiFolder className="text-yellow-400 flex-shrink-0" size={20} />
        ) : (
          <FiFileText className="text-blue-400 flex-shrink-0" size={20} />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white truncate">{page.title || 'Sans titre'}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              page.statusCode === 200 ? 'bg-green-500/20 text-green-400' :
              page.statusCode >= 400 ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {page.statusCode}
            </span>
          </div>
          
          <div className="text-sm text-gray-400 truncate">{page.url}</div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>Profondeur: {page.depth}</span>
            <span>Taille: {(page.size / 1024).toFixed(1)} KB</span>
            {page.extension && <span>Type: {page.extension}</span>}
            <span>Liens: {page.links.length}</span>
          </div>
        </div>
        
        <FiExternalLink className="text-gray-400 flex-shrink-0" size={16} />
      </div>
    ))
  }

  const renderSecurityView = (result: FoldersEnumerationResult) => {
    const { security } = result
    
    return (
      <div className="space-y-6">
        {/* Fichiers sensibles */}
        {security.sensitiveFiles.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <FiAlertTriangle size={20} />
              Fichiers sensibles détectés ({security.sensitiveFiles.length})
            </h3>
            <div className="space-y-2">
              {security.sensitiveFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FiFileText className="text-red-400" size={16} />
                  <span className="text-red-300">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dossiers exposés */}
        {security.exposedDirectories.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
              <FiFolder size={20} />
              Dossiers exposés ({security.exposedDirectories.length})
            </h3>
            <div className="space-y-2">
              {security.exposedDirectories.map((dir, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FiFolder className="text-orange-400" size={16} />
                  <span className="text-orange-300">{dir}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panneaux d'administration */}
        {security.adminPanels.length > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
              <FiShield size={20} />
              Panneaux d'administration ({security.adminPanels.length})
            </h3>
            <div className="space-y-2">
              {security.adminPanels.map((panel, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FiShield className="text-purple-400" size={16} />
                  <span className="text-purple-300">{panel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fichiers de configuration */}
        {security.configFiles.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
              <FiFileText size={20} />
              Fichiers de configuration ({security.configFiles.length})
            </h3>
            <div className="space-y-2">
              {security.configFiles.map((config, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FiFileText className="text-yellow-400" size={16} />
                  <span className="text-yellow-300">{config}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aucun problème détecté */}
        {security.sensitiveFiles.length === 0 && 
         security.exposedDirectories.length === 0 && 
         security.adminPanels.length === 0 && 
         security.configFiles.length === 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <FiCheck size={20} />
              Aucun problème de sécurité détecté
            </h3>
            <p className="text-green-300 text-sm">
              Le crawling n'a pas détecté de fichiers sensibles ou de dossiers exposés évidents.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <ToolsLayout
      title="Énumération de Dossiers"
      description="Crawler et générateur d'arborescence pour sites web"
      icon={<FiFolderPlus className="text-cyan-400" size={48} />}
    >
      <div className="space-y-8">
        {/* Formulaire de crawling */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FiFolderPlus className="text-cyan-400" size={24} />
            Configuration du crawling
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL cible
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profondeur maximale
                </label>
                <select
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  disabled={loading}
                >
                  <option value={1}>1 niveau</option>
                  <option value={2}>2 niveaux</option>
                  <option value={3}>3 niveaux</option>
                  <option value={4}>4 niveaux</option>
                  <option value={5}>5 niveaux</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pages maximales
                </label>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  disabled={loading}
                >
                  <option value={50}>50 pages</option>
                  <option value={100}>100 pages</option>
                  <option value={200}>200 pages</option>
                  <option value={500}>500 pages</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={includeExternal}
                  onChange={(e) => setIncludeExternal(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/50"
                  disabled={loading}
                />
                Inclure les liens externes
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={checkSensitiveFiles}
                  onChange={(e) => setCheckSensitiveFiles(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/50"
                  disabled={loading}
                />
                Vérifier les fichiers sensibles
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={20} />
                  Crawling en cours...
                </>
              ) : (
                <>
                  <FiPlay size={20} />
                  Démarrer le crawling
                </>
              )}
            </button>
          </form>
        </div>

        {/* Statut de la tâche */}
        {taskStatus && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Statut du crawling</h3>
            <div className="flex items-center gap-3">
              {taskStatus.status === 'pending' && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <FiLoader className="animate-spin" size={16} />
                  En attente...
                </div>
              )}
              {taskStatus.status === 'running' && (
                <div className="flex items-center gap-2 text-blue-400">
                  <FiLoader className="animate-spin" size={16} />
                  Crawling en cours...
                </div>
              )}
              {taskStatus.status === 'completed' && (
                <div className="flex items-center gap-2 text-green-400">
                  <FiCheck size={16} />
                  Terminé
                </div>
              )}
              {taskStatus.status === 'failed' && (
                <div className="flex items-center gap-2 text-red-400">
                  <FiAlertTriangle size={16} />
                  Échec
                </div>
              )}
            </div>
          </div>
        )}

        {/* Erreurs */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <FiAlertTriangle size={20} />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <div className="space-y-6">
            {/* Résumé des résultats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-green-400">{result.totalPages}</div>
                <div className="text-sm text-gray-400">Pages découvertes</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-blue-400">{result.totalDirectories}</div>
                <div className="text-sm text-gray-400">Dossiers trouvés</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">{result.maxDepth}</div>
                <div className="text-sm text-gray-400">Profondeur max</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-orange-400">{Object.keys(result.files).length}</div>
                <div className="text-sm text-gray-400">Types de fichiers</div>
              </div>
            </div>

            {/* Méthodes de découverte */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                <FiInfo className="inline mr-2" />
                Méthodes de découverte
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{result.discoveryMethods.sitemap}</div>
                  <div className="text-sm text-gray-400">Sitemap XML</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{result.discoveryMethods.crawl}</div>
                  <div className="text-sm text-gray-400">Crawling</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{result.discoveryMethods.robots}</div>
                  <div className="text-sm text-gray-400">Robots.txt</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">{result.discoveryMethods.directory}</div>
                  <div className="text-sm text-gray-400">Énumération</div>
                </div>
              </div>
              {result.discoveryMethods.sitemap > 0 && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="text-sm text-green-400">
                    <FiCheckCircle className="inline mr-1" />
                    Sitemap XML détecté ! {Math.round((result.discoveryMethods.sitemap / result.totalPages) * 100)}% des pages découvertes via sitemap
                  </div>
                </div>
              )}
            </div>

            {/* Modes d'affichage */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Arborescence du site</h3>
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'tree' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Arbre
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Liste
                  </button>
                  <button
                    onClick={() => setViewMode('security')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'security' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sécurité
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {viewMode === 'tree' && renderTreeView(treeNodes)}
                {viewMode === 'list' && renderListView(result.sitemap)}
                {viewMode === 'security' && renderSecurityView(result)}
              </div>
            </div>

            {/* Détails de la page sélectionnée */}
            {selectedPage && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Détails de la page</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">URL:</span>
                    <span className="text-cyan-400 ml-2">{selectedPage.url}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Titre:</span>
                    <span className="text-white ml-2">{selectedPage.title || 'Sans titre'}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-400">Statut:</span>
                      <span className={`ml-2 ${
                        selectedPage.statusCode === 200 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedPage.statusCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Taille:</span>
                      <span className="text-white ml-2">{(selectedPage.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Profondeur:</span>
                      <span className="text-white ml-2">{selectedPage.depth}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Liens:</span>
                      <span className="text-white ml-2">{selectedPage.links.length}</span>
                    </div>
                  </div>
                  {selectedPage.forms.length > 0 && (
                    <div>
                      <span className="text-gray-400">Formulaires:</span>
                      <span className="text-white ml-2">{selectedPage.forms.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 