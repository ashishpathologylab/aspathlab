// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Moon, Sun, Menu, X, Stethoscope } from 'lucide-react';
// import { useTheme } from '@/contexts/ThemeContext';
// import { useAuth } from '@/contexts/AuthContext';
// import { motion } from 'framer-motion';

// interface NavbarProps {
//   isSidebarOpen?: boolean;
//   onToggleSidebar?: () => void;
// }

// export const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
//   const { theme, toggleTheme } = useTheme();
//   const { isAuthenticated, logout } = useAuth();
//   const location = useLocation();
//   const isLandingPage = location.pathname === '/';

//   return (
//     <motion.nav
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
//     >
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between">
//           <div className="flex items-center space-x-4">
//             {isAuthenticated && onToggleSidebar && (
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={onToggleSidebar}
//                 className="lg:hidden"
//               >
//                 {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             )}
//             <Link to="/" className="flex items-center space-x-2">
//               <Stethoscope className="h-8 w-8 text-primary" />
//               <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
//                 PathLab Pro 
//               </span>
//             </Link>
//           </div>

//           {isLandingPage && (
//             <div className="hidden md:flex items-center space-x-6">
//               <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
//                 Home
//               </Link>
//               <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
//                 About
//               </a>
//               <Link to="/tests" className="text-sm font-medium hover:text-primary transition-colors">
//                 Tests
//               </Link>
//               <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
//                 Contact
//               </a>
//             </div>
//           )}

//           <div className="flex items-center space-x-2">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={toggleTheme}
//               className="transition-transform hover:scale-105"
//             >
//               {theme === 'light' ? (
//                 <Moon className="h-5 w-5" />
//               ) : (
//                 <Sun className="h-5 w-5" />
//               )}
//             </Button>

//             {isAuthenticated ? (
//               <>
//                 <Link to="/dashboard">
//                   <Button className="ml-2">Dashboard</Button>
//                 </Link>
//                 <Button variant="outline" onClick={logout} className="ml-2">
//                   Logout
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Link to="/login">
//                   <Button className="ml-2">Login</Button>
//                 </Link>
//                 <Link to="/signup">
//                   <Button variant="outline" className="ml-2">Signup</Button>
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.nav>
//   );
// };

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X, Stethoscope } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface NavbarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  // choose correct dashboard link based on userType
  const dashboardLink =
    user?.userType === 'PATIENT' ? '/patient-client' : '/dashboard';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {isAuthenticated && onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="lg:hidden"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                PathLab Pro
              </span>
            </Link>
          </div>

          {isLandingPage && (
            <div className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </a>
              <a href="#test" className="text-sm font-medium hover:text-primary transition-colors">
                Tests
              </a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          )}


          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-transform hover:scale-105"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <>
                <Link to={dashboardLink}>
                  <Button className="ml-2">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={logout} className="ml-2">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="ml-2">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="ml-2">Signup</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
