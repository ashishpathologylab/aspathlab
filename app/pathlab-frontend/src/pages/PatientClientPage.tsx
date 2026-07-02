import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  DollarSign,
  FileText,
  LogOut,
  Download,
  CreditCard,
  Activity,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  X,
  TestTube,
  Clock,
  Home,
  Receipt,
  UserCircle,
  HelpCircle,
  Menu,
  Search,
  Truck,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { patientClientApi, bookingsApi, resultsApi, paymentsApi } from '@/api/index';
import { testsApi } from '@/api/tests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Link } from "react-router-dom";
// Interfaces for API responses
export interface PatientDashboardDto {
  totalBookings: number;
  totalTestsCompleted: number;
  pendingTests: number;
}

export interface BookingDto {
  bookingId: number;
  testName: string;
  bookingDate: string;
  sampleStatus: string;
  testStatus: string;
}

export interface PaymentDto {
  paymentId: number;
  bookingId: number;
  paidAt?: string;
  amount: number;
  status: string;
}

export interface Patient {
  id?: number;
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
}

export interface Test {
  id?: number;
  testName: string;
  description?: string;
  sampleType?: string;
  price: number;
  parameters: TestParameter[];
}

export interface TestParameter {
  id?: number;
  name: string;
  unit?: string;
  refRangeMale?: string;
  refRangeFemale?: string;
  refRangeChild?: string;
}

// Modern Navigation Component
const PatientNavbar = ({
  activeSection,
  onSectionChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  patient
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  patient: Patient | null;
}) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'new-booking', label: 'New Booking', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TestTube className="h-5 w-5 text-white" />
              </div>
              <Link
                to="/"
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight 
             bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent 
             hover:opacity-90 transition-opacity duration-300 cursor-pointer select-none"
              >
                PathLab Pro
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {patient?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {patient?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Patient</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="hidden md:flex text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <Separator className="my-2" />
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Modern Footer Component
const PatientFooter = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 PathLab Pro. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
            Terms of Service
          </a>
          <a href="/#contact" className="hover:text-blue-600 dark:hover:text-blue-400">
            Help
          </a>
        </div>
      </div>
    </footer>
  );
};

// Dashboard Section Component
const DashboardSection = ({ dashboard, setActiveSection }: { dashboard: PatientDashboardDto | null; setActiveSection: (section: string) => void }) => {
  const navigate = useNavigate();

  const statsCards = dashboard ? [
    {
      title: 'Total Bookings',
      value: dashboard.totalBookings.toLocaleString(),
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Tests Completed',
      value: dashboard.totalTestsCompleted.toLocaleString(),
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Pending Tests',
      value: dashboard.pendingTests.toLocaleString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300'
    }
  ] : [];

  const handleQuickAction = (label: string) => {
    switch (label) {
      case 'Book Test':
        setActiveSection('new-booking');
        break;
      case 'View Bookings':
        setActiveSection('bookings');
        break;
      case 'View Payments':
        setActiveSection('payments');
        break;
      case 'Contact Support':
        navigate('/#contact');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          <p className="text-gray-600 dark:text-gray-400">Here's an overview of your health journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Book Test', icon: Calendar, color: 'blue' },
              { label: 'View Bookings', icon: FileText, color: 'green' },
              { label: 'View Payments', icon: DollarSign, color: 'purple' },
              { label: 'Contact Support', icon: HelpCircle, color: 'orange' }
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action.label)}
                className={`p-4 rounded-lg border-2 border-dashed border-${action.color}-200 dark:border-${action.color}-800 hover:border-${action.color}-400 dark:hover:border-${action.color}-600 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all duration-200 group`}
              >
                <action.icon className={`h-8 w-8 text-${action.color}-600 dark:text-${action.color}-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Bookings Section Component
const BookingsSection = ({ bookings }: { bookings: BookingDto[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  const filteredBookings = bookings.filter(booking =>
    booking.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookingId.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'COMPLETED': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      'CANCELLED': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </Badge>
    );
  };

  const getSampleStatusBadge = (status: string) => {
    const statusConfig = {
      'COLLECTED': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      'COLLECTION_PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      'IN_TRANSIT': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
      'RECEIVED': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Inbox },
      'TESTED': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: TestTube },
      'DISCARDED': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['COLLECTION_PENDING'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </Badge>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your test bookings and results. For cancellations or updates, please contact the lab.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="font-semibold">Booking ID</TableHead>
                  <TableHead className="font-semibold">Test Name</TableHead>
                  <TableHead className="font-semibold">Booking Date</TableHead>
                  <TableHead className="font-semibold">Sample Status</TableHead>
                  <TableHead className="font-semibold">Test Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.bookingId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      #{booking.bookingId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TestTube className="h-4 w-4 text-blue-600" />
                        <span>{booking.testName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getSampleStatusBadge(booking.sampleStatus)}</TableCell>
                    <TableCell>{getStatusBadge(booking.testStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            resultsApi.downloadReport(booking.bookingId);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 py-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of{" "}
                {filteredBookings.length} results
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Payments Section Component
const PaymentsSection = ({ payments }: { payments: PaymentDto[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, startIndex + itemsPerPage);

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'PAID': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your payment records</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="font-semibold">Payment ID</TableHead>
                  <TableHead className="font-semibold">Booking ID</TableHead>
                  <TableHead className="font-semibold">Payment Date</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.paymentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="font-medium">#{payment.paymentId}</TableCell>
                    <TableCell>#{payment.bookingId}</TableCell>
                    <TableCell>
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" disabled={payment.status !== 'PAID'}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            paymentsApi.downloadInvoice(payment.paymentId);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, payments.length)} of {payments.length} results
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({
  profile,
  isEditingProfile,
  setIsEditingProfile,
  profileForm,
  setProfileForm,
  handleProfileUpdate
}: {
  profile: Patient | null;
  isEditingProfile: boolean;
  setIsEditingProfile: (editing: boolean) => void;
  profileForm: any;
  setProfileForm: (form: any) => void;
  handleProfileUpdate: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
        </div>
        {!isEditingProfile && (
          <Button onClick={() => setIsEditingProfile(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                {profile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {profile?.name || 'User Name'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Patient</p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCircle className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Phone Number</Label>
                    <Input
                      id="contactNumber"
                      value={profileForm.contactNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleProfileUpdate} className="bg-gradient-to-r from-green-600 to-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// New Booking Section Component
const NewBookingSection = ({
  patientId,
  tests,
  onBookingCreated,
  setActiveSection
}: {
  patientId: number | undefined;
  tests: Test[];
  onBookingCreated: () => void;
  setActiveSection: (section: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    bookingDate: format(new Date(), 'yyyy-MM-dd'),
    testIds: [] as number[],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!patientId) {
      setError('Patient ID is required');
      return;
    }
    if (formData.testIds.length === 0) {
      setError('Please select at least one test');
      return;
    }
    if (!formData.bookingDate) {
      setError('Please select a booking date');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        patientId,
        bookingDate: formData.bookingDate,
        status: 'PENDING',
        testIds: formData.testIds,
        notes: formData.notes || undefined,
      };

      await bookingsApi.create(bookingData);
      toast.success('Booking created successfully');
      setFormData({
        bookingDate: format(new Date(), 'yyyy-MM-dd'),
        testIds: [],
        notes: '',
      });
      setIsOpen(false);
      onBookingCreated();
      setActiveSection('bookings');
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestToggle = (testId: number) => {
    setFormData(prev => ({
      ...prev,
      testIds: prev.testIds.includes(testId)
        ? prev.testIds.filter(id => id !== testId)
        : [...prev.testIds, testId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setActiveSection('dashboard');
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Create New Booking</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="bookingDate">Booking Date</Label>
            <Input
              id="bookingDate"
              type="date"
              value={formData.bookingDate}
              onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div className="space-y-2">
            <Label>Select Tests</Label>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
              {tests.map(test => (
                <div
                  key={test.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${formData.testIds.includes(test.id!)
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  onClick={() => test.id && handleTestToggle(test.id)}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{test.testName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">₹{test.price.toLocaleString()}</p>
                    {test.sampleType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sample: {test.sampleType}</p>
                    )}
                  </div>
                  {formData.testIds.includes(test.id!) && (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information or special instructions"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setActiveSection('dashboard');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export const PatientClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboard, setDashboard] = useState<PatientDashboardDto | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [profile, setProfile] = useState<Patient | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: ''
  });

  useEffect(() => {
    if (!sessionStorage.getItem('auth_token')) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dashboardData, bookingsData, paymentsData, profileData, testsData] = await Promise.all([
          patientClientApi.getDashboard(),
          patientClientApi.getBookings(),
          patientClientApi.getPayments(),
          patientClientApi.getProfile(),
          testsApi.getAll()
        ]);
        setDashboard(dashboardData);
        setBookings(bookingsData);
        setPayments(paymentsData);
        setProfile(profileData);
        setTests(testsData);
        setProfileForm({
          name: profileData.name,
          email: profileData.email,
          contactNumber: profileData.contactNumber || '',
          address: profileData.address || ''
        });
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching patient data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    try {
      const updatedProfile = await patientClientApi.updateProfile(profileForm);
      setProfile(updatedProfile);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    }
  };

  const handleBookingCreated = async () => {
    try {
      const [dashboardData, bookingsData] = await Promise.all([
        patientClientApi.getDashboard(),
        patientClientApi.getBookings()
      ]);
      setDashboard(dashboardData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error refreshing data after booking:', err);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection dashboard={dashboard} setActiveSection={setActiveSection} />;
      case 'bookings':
        return <BookingsSection bookings={bookings} />;
      case 'new-booking':
        return (
          <NewBookingSection
            patientId={profile?.id}
            tests={tests}
            onBookingCreated={handleBookingCreated}
            setActiveSection={setActiveSection}
          />
        );
      case 'payments':
        return <PaymentsSection payments={payments} />;
      case 'profile':
        return (
          <ProfileSection
            profile={profile}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            handleProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return <DashboardSection dashboard={dashboard} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PatientNavbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        patient={profile}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      <PatientFooter />
    </div>
  );
};