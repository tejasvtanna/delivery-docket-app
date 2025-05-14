import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { SignOutButton } from '@clerk/nextjs'

export async function UserProfileMenu() {
  const user = await currentUser()

  let profileMenuText = ''
  if (user) {
    const firstName = user?.firstName || ''
    const lastName = user?.lastName || ''
    profileMenuText = firstName || lastName ? `${firstName} ${lastName}` : ''
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex items-center gap-3 border border-gray-200 rounded-full pl-4 cursor-pointer'>
          <div>{profileMenuText}</div>
          <Button
            variant='outline'
            size='icon'
            className='overflow-hidden rounded-full'
          >
            <Image
              // src={user?.imageUrl ?? '/placeholder-user.jpg'} // Use imageUrl from user object
              src={'/placeholder-user.jpg'} // Use imageUrl from user object
              width={36}
              height={36}
              alt='Avatar'
              className='overflow-hidden rounded-full'
            />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {user ? (
          <DropdownMenuItem>
            <SignOutButton redirectUrl='/login'>
              <button className='w-full text-left'>Sign Out</button>
            </SignOutButton>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link href='/login'>Sign In</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
