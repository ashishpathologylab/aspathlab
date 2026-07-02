import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Users,
  TestTube,
  Package,
  FileText,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}



const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },         // Home / Dashboard
  { icon: Calendar, label: 'Bookings', href: '/bookings' },      // Calendar for scheduling
  { icon: Users, label: 'Patients', href: '/patients' },         // Users icon for patient list
  { icon: TestTube, label: 'Tests', href: '/tests' },            // Test tube for lab tests
  { icon: Package, label: 'Samples', href: '/samples' },         // Package/Box icon for sample management
  { icon: FileText, label: 'Reports', href: '/reports' },        // Document icon for reports
  { icon: DollarSign, label: 'Payments', href: '/payments' },    // DollarSign for payments
];


export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          // mobile
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 sm:w-72 border-r bg-card shadow-md lg:hidden',
          // desktop
          'lg:static lg:top-0 lg:z-auto lg:block lg:h-screen lg:w-64 xl:w-72 lg:translate-x-0'
        )}
      >
        <div className="p-4 space-y-2 overflow-y-auto max-h-full">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) {
                      onClose();
                    }
                  }}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate sm:inline">{item.label}</span>
                </Link>

              </motion.div>
            );
          })}
        </div>
      </motion.aside>
    </>
  );
};
