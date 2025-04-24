import { XeroProvider } from '@/components/features/xero/XeroProvider'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Package, Users2, Newspaper } from 'lucide-react'
import Link from 'next/link'

// Define the card data array
const dashboardCards = [
  {
    title: 'Products',
    description: 'Manage your product catalog',
    content: 'View and edit products with their prices.',
    href: '/products',
    icon: <Package className='h-8 w-8 text-primary' />
  },
  {
    title: 'Customers',
    description: 'Manage your customer list',
    content: 'View and manage customer details.',
    href: '/customers',
    icon: <Users2 className='h-8 w-8 text-primary' />
  },
  {
    title: 'Dockets',
    description: 'Manage delivery dockets',
    content: 'Create and track delivery dockets.',
    href: '/dockets',
    icon: <Newspaper className='h-8 w-8 text-primary' />
  }
]

export default async function HomePage() {
  return (
    <XeroProvider>
      <div className='container mx-auto p-6'>
        <h1 className='text-3xl font-bold mb-14 text-center'>
          Delivery Docket App
        </h1>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {dashboardCards.map((card) => (
            <Link key={card.title} href={card.href} passHref>
              <Card className='hover:shadow-lg hover:scale-105 transition-all cursor-pointer'>
                <CardHeader className='flex flex-row items-center gap-4'>
                  {card.icon}
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>
                    {card.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </XeroProvider>
  )
}
