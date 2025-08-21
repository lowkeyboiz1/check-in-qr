'use client'

import { useAtom } from 'jotai'
import { motion } from 'framer-motion'
import { activeTabAtom, checkedInCountAtom } from '@/store/atoms'
import { QrCode, Users, Settings } from 'lucide-react'

export function BottomNavigation() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom)
  const [checkedInCount] = useAtom(checkedInCountAtom)

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'scan' | 'guests' | 'settings')
  }

  const tabConfig = [
    {
      value: 'scan',
      icon: QrCode,
      label: 'Quét QR',
      activeColor: 'blue',
      activeBg: 'bg-blue-50',
      activeText: 'text-blue-600',
      inactiveText: 'text-gray-500'
    },
    {
      value: 'guests',
      icon: Users,
      label: 'Khách',
      activeColor: 'emerald',
      activeBg: 'bg-emerald-50',
      activeText: 'text-emerald-600',
      inactiveText: 'text-gray-500',
      badge: checkedInCount
    },
    {
      value: 'settings',
      icon: Settings,
      label: 'Cài đặt',
      activeColor: 'gray',
      activeBg: 'bg-gray-50',
      activeText: 'text-gray-600',
      inactiveText: 'text-gray-500'
    }
  ]

  return (
    <div className='fixed right-0 bottom-0 left-0 border-t border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-xl'>
      <div className='safe-area-padding-bottom'>
        <div className='grid grid-cols-3 px-2 py-1'>
          {tabConfig.map(({ value, icon: Icon, label, activeBg, activeText, inactiveText, badge }) => {
            const isActive = activeTab === value

            return (
              <motion.button
                key={value}
                onClick={() => handleTabChange(value)}
                whileTap={{ scale: 0.95 }}
                className={`touch-target relative flex flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-200 ${
                  isActive ? `${activeBg} ${activeText}` : `hover:bg-gray-50 ${inactiveText}`
                }`}
              >
                <Icon className={`h-6 w-6 transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId='activeTab'
                    className='absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 transform rounded-full bg-current'
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
