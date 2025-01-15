import { Fragment, useEffect, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import Link from 'next/link'
// import md5 from 'md5'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

import LogoGravatar from '../components/LogoGravatar'

const navigation = [
  { name: 'Prueba gratis', href: '/trial', trial: true },
  { name: 'Dashboard', href: '/' },
  { name: 'API Docs', href: 'https://docs.wazend.net/', external: true },
  { name: 'Integraciones', href: '/integrations' }
]

const userNavigation = [
  { name: 'Tu perfil', href: '/profile' },
  { name: 'Facturación', href: 'https://wazend.net/my-account', external: true },
  { name: 'Cerrar sesión', href: '/', signOut: true }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState(router.pathname)
  const { data: session } = useSession()

  // // Avatar Retro
  // const getGravatarUrl = (email, size = 200) => {
  //   const hash = md5(email.trim().toLowerCase())
  //   return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`
  // }

  // const userEmail = session?.user?.email || 'nulled'
  // const avatarUrl = getGravatarUrl(userEmail)

  useEffect(() => {
    const handleRouteChange = (url) => {
      setCurrentPath(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => {
      router.push('/login') // Redirige a la página de login o inicio
    })
  }

  return (
    <>
      {/* <Disclosure as='nav' className='bg-white shadow-sm border-b border-gray-100'></Disclosure> */}


      <Disclosure as="nav" className="bg-zinc-900 shadow-sm border-b border-gray-700">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/">
                      <Image
                        className="block h-8 w-auto lg:hidden"
                        src="/images/icon-dark.png"
                        alt="Logo"
                        width={236}
                        height={60}
                      />
                      <Image
                        className="hidden h-8 w-auto lg:block"
                        src="/images/logo-dark.png"
                        alt="Logo"
                        width={236}
                        height={60}
                      />
                    </Link>
                  </div>
                </div>

                {session && (
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <div className="relative">
                      <p className="text-white text-sm font-medium lg:block hidden">
                        {session.user.email}
                      </p>
                    </div>

                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <LogoGravatar email={session.user.email} size={40} />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >

{/* Menu PC */}
<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-zinc-800 py-1 shadow-lg ring-2 ring-zinc-700 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  href={item.href}
                                  className={`block px-4 py-2 text-sm ${item.signOut ? 'text-red-400' : 'text-white'
                                    } ${active ? 'bg-zinc-700' : ''}`}
                                  onClick={item.signOut ? handleSignOut : undefined}
                                  target={item.external ? '_blank' : undefined}
                                >
                               <div className='flex items-center'>
                                    {item.name}
                                    {item.external && <ArrowTopRightOnSquareIcon className='h-3.5 w-3.5 ml-2 text-white' />}
                                  </div>
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>


                      </Transition>
                    </Menu>
                  </div>
                )}

                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-zinc-900 p-2 text-gray-400 hover:bg-zinc-800 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {session && (
              <Disclosure.Panel className="sm:hidden bg-zinc-800">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${currentPath === item.href
                          ? 'border-gray-500 bg-zinc-900 text-white'
                          : 'border-transparent text-gray-300 hover:border-gray-500 hover:bg-zinc-900 hover:text-white'
                        }`}
                      aria-current={currentPath === item.href ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            )}
          </>
        )}
      </Disclosure>






    </>
  )
}
