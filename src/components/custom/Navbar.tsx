import { useState, useEffect } from 'react'
import { Home, Search, User } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function Navbar() {
  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    const date = new Date()

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }

    const formatted = date.toLocaleDateString('en-US', options)
    setFormattedDate(formatted)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex justify-between items-center px-6 py-4 border-b">
      
        <div>
          <p className="font-bold text-lg">Hello User</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        
        <div className="flex items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Home className="w-5 h-5 cursor-pointer hover:text-primary transition" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Home</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Search className="w-5 h-5 cursor-pointer hover:text-primary transition" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Search</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <User className="w-5 h-5 cursor-pointer hover:text-primary transition" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
