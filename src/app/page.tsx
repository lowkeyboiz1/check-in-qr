'use client'

import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { activeTabAtom } from '@/store/atoms'
import { QRScannerComponent } from '@/components/qr-scanner'
import { GuestList } from '@/components/guest-list'
import { SettingsPage } from '@/components/settings-page'
import { GuestModal } from '@/components/guest-modal'
import { BottomNavigation } from '@/components/bottom-navigation'
import { DemoQRGenerator } from '@/components/demo-qr-generator'

export default function Home() {
  const [activeTab] = useAtom(activeTabAtom)

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'scan':
        return <QRScannerComponent />
      case 'guests':
        return <GuestList />
      case 'settings':
        return <SettingsPage />
      default:
        return <QRScannerComponent />
    }
  }

  return (
    <div className='smooth-scroll flex h-dvh flex-col overflow-hidden bg-gray-50 pb-20'>
      {/* Main Content - Takes remaining space */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1]
            }}
            className='flex flex-1 flex-col overflow-hidden'
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - Fixed height */}
      <BottomNavigation />

      {/* Modals */}
      <GuestModal />

      {/* Demo QR Generator (for testing) */}
      {/* <DemoQRGenerator /> */}
    </div>
  )
}
