import '../app/globals.css'

import { NotFoundContent } from '@/components/layout/not-found-content'

export default function RootNotFoundPage() {
  return (
    <html lang="ka">
      <body className="antialiased">
        <NotFoundContent
          title="გვერდი ვერ მოიძებნა"
          description="სამწუხაროდ, თქვენ მიერ მოთხოვნილი გვერდი არ არსებობს ან წაშლილია."
          backLabel="მთავარ გვერდზე დაბრუნება"
          backHref="/"
        />
      </body>
    </html>
  )
}
