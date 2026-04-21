import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { scaleIn } from '../../utils/animations'

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={scaleIn.initial}
            animate={scaleIn.animate}
            exit={scaleIn.initial}
            transition={{ ...scaleIn.transition, ease: 'easeOut' }}
            className={`w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} bg-white rounded-2xl shadow-xl`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-4 border-b border-cognitia-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-cognitia-dark">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-gray-100 text-cognitia-muted hover:text-cognitia-dark flex items-center justify-center"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
