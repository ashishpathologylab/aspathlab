import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Filter, Eye, Edit3, Calendar, CheckCircle, Clock, TestTube, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { bookingsApi, patientsApi } from '@/api';
import { testsApi } from '@/api/tests';
import { useToast } from '@/hooks/use-toast';


interface Booking {
  id: number;
  bookingDate: string;
  status: string;
  testIds: number[];
  testNames: string[];
  patient: Patient;
}


interface Patient {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  email: string;
  address: string;
}

interface LabTest { id: number; name: string; }


export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ patientId: number | ''; bookingDate: string; status: string; testIds: number[] }>({ patientId: '', bookingDate: '', status: 'PENDING', testIds: [] });
  const [updateForm, setUpdateForm] = useState<{ bookingDate: string; status: string; testIds: number[] }>({ bookingDate: '', status: 'PENDING', testIds: [] });
  const [search, setSearch] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [bookingsRes, patientsRes, testsRes] = await Promise.all([
          bookingsApi.getAll() as Promise<any[]>,
          patientsApi.getAll() as Promise<any[]>,
          testsApi.getAll() as Promise<any[]>,
        ]);

        console.log('Bookings response:', bookingsRes);
        console.log('Patients response:', patientsRes);
        console.log('Tests response:', testsRes);

        const mappedBookings: Booking[] = bookingsRes.map((b) => ({
          id: b.id,
          bookingDate: b.bookingDate,
          status: b.status || "PENDING",
          testIds: Array.isArray(b.bookingTests)
            ? b.bookingTests.map((bt: any) => bt.test?.id)
            : [],
          testNames: Array.isArray(b.bookingTests)
            ? b.bookingTests.map((bt: any) => bt.test?.testName || bt.test?.name || "")
            : [],
          patient: {
            id: b.patient?.id,
            name: b.patient?.name,
            gender: b.patient?.gender,
            dateOfBirth: b.patient?.dateOfBirth,
            contactNumber: b.patient?.contactNumber || '',
            email: b.patient?.email || '',
            address: b.patient?.address || '',
          },
        }));


        const mappedPatients: Patient[] = patientsRes.map((p: any) => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          dateOfBirth: p.dateOfBirth,
          contactNumber: p.contactNumber || '',
          email: p.email || '',
          address: p.address || '',
        }));

        const mappedTests: LabTest[] = testsRes.map((t: any) => ({
          id: t.id,
          name: t.testName || t.name || 'Unknown Test'
        }));

        console.log('Mapped patients:', mappedPatients);
        console.log('Mapped tests:', mappedTests);

        setBookings(mappedBookings);
        setFilteredBookings(mappedBookings);
        setPatients(mappedPatients);
        setTests(mappedTests);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        toast({ title: 'Error', description: 'Failed to fetch bookings.', variant: 'destructive' });
      } finally {
      }
    };
    fetchData();
  }, [toast]);

  // Filter bookings based on search term and status
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(bookings =>
        bookings.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookings.testNames.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(bookings.id).includes(searchTerm.toLowerCase()) ||
        bookings.patient.contactNumber.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bookings => bookings.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);


  const getStatusBadge = (status: 'pending' | 'completed' | string) => {
    const variants = {
      pending: { variant: 'default' as const, icon: CheckCircle, color: 'text-white' },
      completed: { variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
    } as const;

    const key = (status || '').toLowerCase() as 'pending' | 'completed';
    const config = variants[key] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className={config.color}>{status}</span>
      </Badge>
    );

  };

  useEffect(() => {
    if (!isUpdateOpen || !selectedBooking) return;

    (async () => {
      const current = await bookingsApi.getById(String(selectedBooking.id)) as any;

      const toDateInputValue = (dateString: string) =>
        dateString ? new Date(dateString).toISOString().split("T")[0] : "";

      setUpdateForm({
        bookingDate: toDateInputValue(current.bookingDate),
        status: (current.status || "PENDING").toUpperCase(),
        testIds: Array.isArray(current.bookingTests)
          ? current.bookingTests.map((bt: any) => bt.test?.id)
          : [],
      });
    })();
  }, [isUpdateOpen, selectedBooking]);




  // no local status update helper; using backend update instead

  const refreshBookings = async () => {
    const bookingsRes = await bookingsApi.getAll() as any[];

    const mappedBookings: Booking[] = bookingsRes.map((b) => ({
      id: b.id,
      bookingDate: b.bookingDate,
      status: String(b.status || '').toLowerCase(),
      testIds: Array.isArray(b.bookingTests) ? b.bookingTests.map((bt: any) => bt.test?.id) : [],
      testNames: Array.isArray(b.bookingTests) ? b.bookingTests.map((bt: any) => bt.test?.testName || bt.test?.name || '') : [],
      patient: {
        id: b.patient?.id,
        name: b.patient?.name,
        gender: b.patient?.gender,
        dateOfBirth: b.patient?.dateOfBirth,
        contactNumber: b.patient?.contactNumber || '',
        email: b.patient?.email || '',
        address: b.patient?.address || '',
      },
    }));
    setBookings(mappedBookings);
    setFilteredBookings(mappedBookings);
  };

  const handleCreate = async () => {
    try {
      if (!createForm.patientId || !createForm.bookingDate || !createForm.status || createForm.testIds.length === 0) {
        toast({ title: 'Validation error', description: 'Fill all fields and select tests.', variant: 'destructive' });
        return;
      }
      const payload = {
        patientId: createForm.patientId,
        bookingDate: createForm.bookingDate,
        status: createForm.status,
        testIds: createForm.testIds,
      } as const;
      const created = await bookingsApi.create(payload as any);
      await refreshBookings();
      setIsCreateOpen(false);
      setCreateForm({ patientId: '', bookingDate: '', status: 'PENDING', testIds: [] });
      toast({ title: 'Booking created', description: `Booking #${(created as any).id} created successfully.` });
    } catch (error) {
      toast({ title: 'Error creating booking', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedBooking) return;

      // 1. Fetch current booking with its testIds
      const current = await bookingsApi.getById(String(selectedBooking.id)) as { testIds?: number[] };
      const currentTestIds: number[] = current.testIds || [];

      // 2. Normalize incoming testIds (dedupe, fallback to empty array)
      const incomingTestIds: number[] = Array.from(
        new Set(updateForm.testIds || [])
      );

      // 3. Compare differences
      const toAdd = incomingTestIds.filter((id) => !currentTestIds.includes(id));
      const toRemove = currentTestIds.filter((id) => !incomingTestIds.includes(id));

      // 4. If nothing changed, skip API call
      if (
        toAdd.length === 0 &&
        toRemove.length === 0 &&
        (updateForm.bookingDate === undefined ||
          updateForm.bookingDate === selectedBooking.bookingDate) &&
        (updateForm.status === undefined ||
          updateForm.status === selectedBooking.status)
      ) {
        toast({
          title: 'No changes detected',
          description: 'Nothing was updated.',
        });
        return;
      }

      // 5. Build payload
      const payload = {
        bookingDate: updateForm.bookingDate || selectedBooking.bookingDate,
        status: updateForm.status || selectedBooking.status,
        testIds:
          updateForm.testIds && updateForm.testIds.length > 0
            ? updateForm.testIds
            : selectedBooking.testIds, // fallback to original tests
      };


      // 6. Call update API
      await bookingsApi.update(String(selectedBooking.id), payload as any);
      await refreshBookings();

      // 7. Close dialogs & reset
      setIsUpdateOpen(false);
      setSelectedBooking(null);

      toast({
        title: 'Booking updated',
        description: [
          toAdd.length ? `Added tests: ${toAdd.join(', ')}` : null,
          toRemove.length ? `Removed tests: ${toRemove.join(', ')}` : null,
        ]
          .filter(Boolean)
          .join(' | ') || 'Changes saved.',
      });
    } catch (error) {
      toast({
        title: 'Error updating booking',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };



  const handleDeletePatient = async (bookingid: number) => {
    try {
      await bookingsApi.delete(bookingid);
      setBookings(prev => prev.filter(bookings => bookings.id !== bookingid));
      toast({
        title: "Booking deleted successfully",
        description: "Booking has been removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Error deleting booking",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Bookings Management
        </h1>
        <p className="text-muted-foreground">
          Manage and track all test bookings and appointments.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {[
          { title: 'Total Bookings', value: bookings.length, color: 'text-blue-600' },
          { title: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-orange-600' },
          { title: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'text-purple-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>All Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, booking ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateOpen(true)} className="sm:ml-auto">Add Booking</Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {booking.testNames.map((test, idx) => (
                            <Badge key={idx} variant="outline" className="mr-1">
                              {test}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.patient.contactNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status as 'pending' | 'completed')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog
                            open={isDialogOpen && selectedBooking?.id === booking.id}
                            onOpenChange={setIsDialogOpen}

                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-full sm:max-w-lg w-full">
                              <DialogHeader>
                                <DialogTitle>
                                  Booking Details - {selectedBooking?.id}
                                </DialogTitle>
                                <DialogDescription>
                                  View and manage booking information
                                </DialogDescription>
                              </DialogHeader>

                              {selectedBooking && (
                                <div className="space-y-8">
                                  {/* Patient Information */}
                                  <div>
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">
                                      Patient Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Patient ID</p>
                                        <p>{selectedBooking.patient.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Name</p>
                                        <p>{selectedBooking.patient.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Gender</p>
                                        <p>{selectedBooking.patient.gender}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Date of Birth</p>
                                        <p>{format(new Date(selectedBooking.patient.dateOfBirth), "PPP")}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Age</p>
                                        <p>
                                          {(() => {
                                            const dob = new Date(selectedBooking.patient.dateOfBirth);
                                            const diff = Date.now() - dob.getTime();
                                            const ageDt = new Date(diff);
                                            return Math.abs(ageDt.getUTCFullYear() - 1970);
                                          })()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Contact Number</p>
                                        <p>{selectedBooking.patient.contactNumber}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Email</p>
                                        <p>{selectedBooking.patient.email}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">Address</p>
                                        <p>{selectedBooking.patient.address}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Booking Information */}
                                  <div>
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">
                                      Booking Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Booking ID</p>
                                        <p>{selectedBooking.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Booking Date</p>
                                        <p>{format(new Date(selectedBooking.bookingDate), "PPP")}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">Tests</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {selectedBooking.testNames.map((test, idx) => (
                                            <Badge key={idx} variant="outline">
                                              {test}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Current Status</p>
                                        <div className="mt-1">
                                          {getStatusBadge(
                                            booking.status as "pending" | "completed"
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsUpdateOpen(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePatient(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>


                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search filters'
                    : 'No bookings have been made yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-full sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Create Booking</DialogTitle>
            <DialogDescription>Select patient, date, status and tests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient ({patients.length} available)</Label>
              <Select
                value={String(createForm.patientId)}
                onValueChange={(val) =>
                  setCreateForm((prev) => ({ ...prev, patientId: Number(val) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>

                <SelectContent>
                  {/* 🔍 Search input */}
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Filtered items */}
                  {patients.length === 0 ? (
                    <SelectItem value="no-patients" disabled>
                      No patients available
                    </SelectItem>
                  ) : (
                    patients
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.email.toLowerCase().includes(search.toLowerCase()) ||
                          p.contactNumber?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} ({p.email})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Booking Date</Label>
              <Input type="date" value={createForm.bookingDate} onChange={(e) => setCreateForm(prev => ({ ...prev, bookingDate: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={createForm.status} onValueChange={(val) => setCreateForm(prev => ({ ...prev, status: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tests ({tests.length} available)</Label>
              <div className="flex flex-wrap gap-2">
                {tests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tests available</p>
                ) : (
                  tests.map(t => {
                    const active = createForm.testIds.includes(t.id);
                    return (
                      <Button key={t.id} type="button" variant={active ? 'default' : 'outline'} size="sm" onClick={() => setCreateForm(prev => ({ ...prev, testIds: active ? prev.testIds.filter(id => id !== t.id) : [...prev.testIds, t.id] }))}>
                        <TestTube className="h-3 w-3 mr-1" /> {t.name}
                      </Button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="max-w-full sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Update Booking</DialogTitle>
            <DialogDescription>Change date, status and tests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Booking Date</Label>
              <Input type="date" value={updateForm.bookingDate} onChange={(e) => setUpdateForm(prev => ({ ...prev, bookingDate: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={updateForm.status} onValueChange={(val) => setUpdateForm(prev => ({ ...prev, status: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tests ({tests.length} available)</Label>
              <div className="flex flex-wrap gap-2">
                {tests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tests available</p>
                ) : (
                  tests.map(t => {
                    const active = updateForm.testIds.includes(t.id);
                    return (
                      <Button key={t.id} type="button" variant={active ? 'default' : 'outline'} size="sm" onClick={() => setUpdateForm(prev => ({ ...prev, testIds: active ? prev.testIds.filter(id => id !== t.id) : [...prev.testIds, t.id] }))}>
                        <TestTube className="h-3 w-3 mr-1" /> {t.name}
                      </Button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};