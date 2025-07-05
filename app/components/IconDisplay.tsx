'use client'

import * as FiIcons from 'react-icons/fi'
import * as AiIcons from 'react-icons/ai'
import * as BiIcons from 'react-icons/bi'
import * as BsIcons from 'react-icons/bs'
import * as FaIcons from 'react-icons/fa'
import * as HiIcons from 'react-icons/hi'
import * as IoIcons from 'react-icons/io5'
import * as MdIcons from 'react-icons/md'
import * as RiIcons from 'react-icons/ri'
import * as TbIcons from 'react-icons/tb'

interface IconDisplayProps {
  iconName: string
  className?: string
}

export default function IconDisplay({ iconName, className = "w-5 h-5" }: IconDisplayProps) {
  // Créer un mapping de toutes les icônes
  const iconMap = {
    ...FiIcons,
    ...AiIcons,
    ...BiIcons,
    ...BsIcons,
    ...FaIcons,
    ...HiIcons,
    ...IoIcons,
    ...MdIcons,
    ...RiIcons,
    ...TbIcons
  }

  const IconComponent = iconMap[iconName as keyof typeof iconMap] as React.ComponentType<{ className?: string }>

  if (!IconComponent) {
    return <span className={className}>?</span>
  }

  return <IconComponent className={className} />
} 