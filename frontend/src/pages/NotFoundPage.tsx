import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-6 px-4">
      {/* Pokeball animation */}
      <motion.div
        animate={{ rotate: [0, 20, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-8xl select-none"
      >
        🔴
      </motion.div>

      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-black gradient-text"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mt-2"
        >
          Page Not Found
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-3 max-w-sm"
        >
          The page you're looking for has fled into the tall grass. Let's get you back on track!
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <Button onClick={() => navigate('/')} icon={<Home className="w-4 h-4" />}>
          Back to Home
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} icon={<Search className="w-4 h-4" />}>
          Go Back
        </Button>
      </motion.div>
    </div>
  );
}
