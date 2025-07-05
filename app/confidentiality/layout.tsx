import { getPageMetadata } from '@/lib/metadata'

export const metadata = getPageMetadata('confidentiality')

export default function ConfidentialityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 