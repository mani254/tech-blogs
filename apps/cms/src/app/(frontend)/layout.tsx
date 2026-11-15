import React from 'react'

export const metadata = {
  description: 'Payload CMS for Tech Blogs',
  title: 'Tech Blogs CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

