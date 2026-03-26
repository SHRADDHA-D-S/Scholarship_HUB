import React from 'react'
import { motion } from 'framer-motion'

export default function Footer(){
return (
<motion.footer 
  className="w-full mt-12 py-6 bg-white text-center text-sm text-slate-500"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  
</motion.footer>
)
}