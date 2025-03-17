import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { User } from '@/components/common/User'
import Providers from '@/components/common/Providers'
import { SearchInput } from '@/components/common/SearchInput'
import { DesktopNav } from '@/components/common/DesktopNav'
import { DashboardBreadcrumb } from '@/components/common/DashboardBreadcrumb'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Delivery Docket App',
  description: 'Manage delivery dockets'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='flex min-h-screen w-full flex-col'>
        <Providers>
          <main className='flex min-h-screen w-full flex-col bg-muted/40'>
            <DesktopNav />
            <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-14'>
              <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
                {/* <MobileNav /> */}
                <DashboardBreadcrumb />
                <SearchInput />
                <User />
              </header>
              <main className='grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40'>
                {children}
                <Toaster />
              </main>
            </div>
            <Analytics />
          </main>
        </Providers>
      </body>
    </html>
  )
}

// function MobileNav() {
//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button size='icon' variant='outline' className='sm:hidden'>
//           <PanelLeft className='h-5 w-5' />
//           <span className='sr-only'>Toggle Menu</span>
//         </Button>
//       </SheetTrigger>
//       <SheetContent side='left' className='sm:max-w-xs'>
//         <nav className='grid gap-6 text-lg font-medium'>
//           <Link
//             href='#'
//             className='group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'
//           >
//             <Package2 className='h-5 w-5 transition-all group-hover:scale-110' />
//             <span className='sr-only'>Vercel</span>
//           </Link>
//           <Link
//             href='#'
//             className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'
//           >
//             <Home className='h-5 w-5' />
//             Dashboard
//           </Link>
//           <Link
//             href='#'
//             className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'
//           >
//             <ShoppingCart className='h-5 w-5' />
//             Orders
//           </Link>
//           <Link
//             href='#'
//             className='flex items-center gap-4 px-2.5 text-foreground'
//           >
//             <Package className='h-5 w-5' />
//             Products
//           </Link>
//           <Link
//             href='#'
//             className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'
//           >
//             <Users2 className='h-5 w-5' />
//             Customers
//           </Link>
//           <Link
//             href='#'
//             className='flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground'
//           >
//             <LineChart className='h-5 w-5' />
//             Settings
//           </Link>
//         </nav>
//       </SheetContent>
//     </Sheet>
//   )
// }
