import * as FiIcons from 'react-icons/fi'
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import * as AiIcons from 'react-icons/ai'
import * as BiIcons from 'react-icons/bi'
import * as BsIcons from 'react-icons/bs'
import * as HiIcons from 'react-icons/hi'
import * as IoIcons from 'react-icons/io5'
import * as RiIcons from 'react-icons/ri'
import * as TbIcons from 'react-icons/tb'

interface DynamicIconProps {
  iconName: string
  size?: number
  className?: string
}

export default function DynamicIcon({ iconName, size = 24, className = '' }: DynamicIconProps) {
  // Combine all icon libraries
  const allIcons = {
    ...FiIcons,
    ...FaIcons,
    ...MdIcons,
    ...AiIcons,
    ...BiIcons,
    ...BsIcons,
    ...HiIcons,
    ...IoIcons,
    ...RiIcons,
    ...TbIcons
  }

  // Get the icon component
  const IconComponent = allIcons[iconName as keyof typeof allIcons]

  // If icon not found, return a default icon or the icon name
  if (!IconComponent) {
    return <span className={className}>{iconName}</span>
  }

  return <IconComponent size={size} className={className} />
} 