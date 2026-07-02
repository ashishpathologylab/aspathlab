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
import { Search, Filter, Eye, Edit3, CheckCircle, Clock, TestTube, Trash2, Truck, Inbox, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { bookingsApi, samplesApi } from '@/api';
import { testsApi } from '@/api/tests';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: number;
  name: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface Sample {
  id: number;
  test: LabTest;
  collectedAt: string;
  collectedBy: User | null;
  status: string;
  notes: string;
  booking: { id: number; patient: Patient };
}

interface Booking {
  id: number;
  patient: Patient;
  bookingDate: string;
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

export const SamplePage: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ bookingId: number | null; testIds: number[]; collectedBy: number | null; notes: string }>({ bookingId: null, testIds: [], collectedBy: null, notes: '' });
  const [updateForm, setUpdateForm] = useState<{ collectedBy: number | null; status: string; notes: string }>({ collectedBy: null, status: '', notes: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [bookingsRes, testsRes] = await Promise.all([
          bookingsApi.getAll() as Promise<any[]>,
          testsApi.getAll() as Promise<any[]>,
        ]);

        console.log('Bookings response:', bookingsRes);
        console.log('Tests response:', testsRes);

        const mappedBookings: Booking[] = bookingsRes.map((b) => ({
          id: b.id,
          bookingDate: b.bookingDate,
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

        const mappedTests: LabTest[] = testsRes.map((t: any) => ({
          id: t.id,
          name: t.testName || t.name || 'Unknown Test'
        }));

        const mappedSamples: Sample[] = bookingsRes.flatMap((b) =>
          b.samples.map((s: any) => ({
            id: s.id,
            test: {
              id: s.test?.id,
              name: s.test?.testName || s.test?.name || '',
            },
            collectedAt: s.collectedAt,
            collectedBy: s.collectedBy ? { id: s.collectedBy.id, name: s.collectedBy.name, email: s.collectedBy.email, role: s.collectedBy.role, isActive: s.collectedBy.isActive, createdAt: s.collectedBy.createdAt } : null,
            status: s.status,
            notes: s.notes || '',
            booking: {
              id: b.id,
              patient: {
                id: b.patient?.id,
                name: b.patient?.name,
                gender: b.patient?.gender,
                dateOfBirth: b.patient?.dateOfBirth,
                contactNumber: b.patient?.contactNumber || '',
                email: b.patient?.email || '',
                address: b.patient?.address || '',
              },
            },
          }))
        );

        console.log('Mapped bookings:', mappedBookings);
        console.log('Mapped tests:', mappedTests);
        console.log('Mapped samples:', mappedSamples);

        setSamples(mappedSamples);
        setFilteredSamples(mappedSamples);
        setBookings(mappedBookings);
        setTests(mappedTests);
      } catch (error) {
        console.error('Failed to fetch samples:', error);
        toast({ title: 'Error', description: 'Failed to fetch samples.', variant: 'destructive' });
      }
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    let filtered = samples;

    if (searchTerm) {
      filtered = filtered.filter(sample =>
        sample.booking.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(sample.booking.id).includes(searchTerm.toLowerCase()) ||
        String(sample.id).includes(searchTerm.toLowerCase()) ||
        sample.booking.patient.contactNumber.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sample => sample.status === statusFilter);
    }

    setFilteredSamples(filtered);
  }, [samples, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      COLLECTION_PENDING: { variant: 'outline' as const, icon: Clock, color: 'text-orange-600' },
      COLLECTED: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      IN_TRANSIT: { variant: 'outline' as const, icon: Truck, color: 'text-blue-600' },
      RECEIVED: { variant: 'secondary' as const, icon: Inbox, color: 'text-cyan-600' },
      TESTED: { variant: 'default' as const, icon: TestTube, color: 'text-purple-600' },
      DISCARDED: { variant: 'outline' as const, icon: XCircle, color: 'text-red-600' },
    } as const;

    const key = (status || '').toUpperCase() as keyof typeof variants;
    const config = variants[key] || { variant: 'outline' as const, icon: Clock, color: 'text-gray-400' };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className={config.color}>{status}</span>
      </Badge>
    );
  };

  useEffect(() => {
    if (!isUpdateOpen || !selectedSample) return;

    (async () => {
      const currentBooking = await bookingsApi.getById(String(selectedSample.booking.id)) as any;
      const current = currentBooking.samples.find((s: any) => s.id === selectedSample.id);

      setUpdateForm({
        collectedBy: current?.collectedBy?.id ?? null,
        status: current?.status || "COLLECTION_PENDING",
        notes: current?.notes || "",
      });
    })();
  }, [isUpdateOpen, selectedSample]);

  const refreshSamples = async () => {
    const bookingsRes = await bookingsApi.getAll() as any[];

    const mappedSamples: Sample[] = bookingsRes.flatMap((b) =>
      b.samples.map((s: any) => ({
        id: s.id,
        test: {
          id: s.test?.id,
          name: s.test?.testName || s.test?.name || '',
        },
        collectedAt: s.collectedAt,
        collectedBy: s.collectedBy ? { id: s.collectedBy.id, name: s.collectedBy.name, email: s.collectedBy.email, role: s.collectedBy.role, isActive: s.collectedBy.isActive, createdAt: s.collectedBy.createdAt } : null,
        status: s.status,
        notes: s.notes || '',
        booking: {
          id: b.id,
          patient: {
            id: b.patient?.id,
            name: b.patient?.name,
            gender: b.patient?.gender,
            dateOfBirth: b.patient?.dateOfBirth,
            contactNumber: b.patient?.contactNumber || '',
            email: b.patient?.email || '',
            address: b.patient?.address || '',
          },
        },
      }))
    );

    const mappedBookings: Booking[] = bookingsRes.map((b) => ({
      id: b.id,
      bookingDate: b.bookingDate,
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

    setSamples(mappedSamples);
    setFilteredSamples(mappedSamples);
    setBookings(mappedBookings);
  };

  const handleCreate = async () => {
    try {
      if (!createForm.bookingId || createForm.testIds.length === 0) {
        toast({ title: 'Validation error', description: 'Select booking and at least one test.', variant: 'destructive' });
        return;
      }
      for (const testId of createForm.testIds) {
        const payload = {
          bookingId: createForm.bookingId,
          testId,
          collectedBy: createForm.collectedBy ?? null,
          notes: createForm.notes,
        } as const;
        await samplesApi.create(payload as any);
      }
      await refreshSamples();
      setIsCreateOpen(false);
      setCreateForm({ bookingId: null, testIds: [], collectedBy: null, notes: '' });
      toast({ title: 'Sample(s) created', description: 'Sample(s) created successfully.' });
    } catch (error) {
      toast({ title: 'Error creating sample', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedSample) return;

      const currentBooking = await bookingsApi.getById(String(selectedSample.booking.id)) as any;
      const current = currentBooking.samples.find((s: any) => s.id === selectedSample.id);

      if (!current) return;

      const payload = {
        collectedBy: updateForm.collectedBy ?? current.collectedBy?.id ?? null,
        status: updateForm.status || current.status,
        notes: updateForm.notes || current.notes,
      };

      if (
        payload.collectedBy === (current.collectedBy?.id ?? null) &&
        payload.status === current.status &&
        payload.notes === current.notes
      ) {
        toast({
          title: 'No changes detected',
          description: 'Nothing was updated.',
        });
        return;
      }

      await samplesApi.update(String(selectedSample.id), payload as any);
      await refreshSamples();

      setIsUpdateOpen(false);
      setSelectedSample(null);

      toast({
        title: 'Sample updated',
        description: 'Changes saved.',
      });
    } catch (error) {
      toast({
        title: 'Error updating sample',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSample = async (sampleId: number) => {
    try {
      await samplesApi.delete(sampleId);
      await refreshSamples(); // Ensure consistency with server state
      toast({
        title: "Sample deleted successfully",
        description: "Sample has been removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Error deleting sample",
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
          Samples Management
        </h1>
        <p className="text-muted-foreground">
          Manage and track all samples.
        </p>
      </motion.div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">        {[
          { title: 'Total Samples', value: samples.length, color: 'text-blue-600' },
          { title: 'Pending', value: samples.filter(s => s.status === 'COLLECTION_PENDING').length, color: 'text-orange-600' },
          { title: 'Collected', value: samples.filter(s => s.status === 'COLLECTED').length, color: 'text-green-600' },
          { title: 'In Transit', value: samples.filter(s => s.status === 'IN_TRANSIT').length, color: 'text-blue-600' },
          { title: 'Received', value: samples.filter(s => s.status === 'RECEIVED').length, color: 'text-cyan-600' },
          { title: 'Tested', value: samples.filter(s => s.status === 'TESTED').length, color: 'text-purple-600' },
          { title: 'Discarded', value: samples.filter(s => s.status === 'DISCARDED').length, color: 'text-red-600' },
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>All Samples</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, sample ID, booking ID or test..."
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
                  <SelectItem value="COLLECTION_PENDING">Collection Pending</SelectItem>
                  <SelectItem value="COLLECTED">Collected</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="TESTED">Tested</SelectItem>
                  <SelectItem value="DISCARDED">Discarded</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateOpen(true)} className="sm:ml-auto">Add Sample</Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Sample ID</TableHead>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Collected Date / Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.map((sample, index) => (
                    <motion.tr
                      key={sample.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{sample.id}</TableCell>
                      <TableCell>{sample.booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sample.booking.patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sample.booking.patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sample.test.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(sample.collectedAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sample.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog
                            open={isDialogOpen && selectedSample?.id === sample.id}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSample(sample)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-full sm:max-w-lg w-full">
                              <DialogHeader>
                                <DialogTitle>
                                  Sample Details - {selectedSample?.id}
                                </DialogTitle>
                                <DialogDescription>
                                  View and manage sample information
                                </DialogDescription>
                              </DialogHeader>

                              {selectedSample && (
                                <div className="overflow-y-auto max-h-[70vh] space-y-8 pr-2">
                                  <div>
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">
                                      Patient Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Patient ID</p>
                                        <p>{selectedSample.booking.patient.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Name</p>
                                        <p>{selectedSample.booking.patient.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Gender</p>
                                        <p>{selectedSample.booking.patient.gender}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Date of Birth</p>
                                        <p>{format(new Date(selectedSample.booking.patient.dateOfBirth), "PPP")}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Age</p>
                                        <p>
                                          {(() => {
                                            const dob = new Date(selectedSample.booking.patient.dateOfBirth);
                                            const diff = Date.now() - dob.getTime();
                                            const ageDt = new Date(diff);
                                            return Math.abs(ageDt.getUTCFullYear() - 1970);
                                          })()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Contact Number</p>
                                        <p>{selectedSample.booking.patient.contactNumber}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Email</p>
                                        <p>{selectedSample.booking.patient.email}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">Address</p>
                                        <p>{selectedSample.booking.patient.address}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">
                                      Sample Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Sample ID</p>
                                        <p>{selectedSample.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Booking ID</p>
                                        <p>{selectedSample.booking.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Collected Date</p>
                                        <p>{format(new Date(selectedSample.collectedAt), "PPP")}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Collected By</p>
                                        <p>{selectedSample.collectedBy?.name ?? 'Pending'}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">Test</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          <Badge variant="outline">
                                            {selectedSample.test.name}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Current Status</p>
                                        <div className="mt-1">
                                          {getStatusBadge(selectedSample.status)}
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">Notes</p>
                                        <p>{selectedSample.notes || 'None'}</p>
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
                              setSelectedSample(sample);
                              setIsUpdateOpen(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSample(sample.id)}
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

            {filteredSamples.length === 0 && (
              <div className="text-center py-12">
                <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No samples found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search filters'
                    : 'No samples have been created yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-full sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Create Sample</DialogTitle>
            <DialogDescription>Select booking, tests, and optional fields.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Booking ({bookings.length} available)</Label>
              <Select
                value={String(createForm.bookingId ?? '')}
                onValueChange={(val) =>
                  setCreateForm((prev) => ({ ...prev, bookingId: Number(val) || null }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select booking" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {bookings.length === 0 ? (
                    <SelectItem value="no-bookings" disabled>
                      No bookings available
                    </SelectItem>
                  ) : (
                    bookings
                      .filter(
                        (b) =>
                          b.patient.name.toLowerCase().includes(search.toLowerCase()) ||
                          b.patient.email.toLowerCase().includes(search.toLowerCase()) ||
                          b.patient.contactNumber?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          Booking #{b.id} - {b.patient.name} ({b.patient.email})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Collected By (user ID, optional)</Label>
              <Input
                type="number"
                value={createForm.collectedBy ? String(createForm.collectedBy) : ''}
                onChange={(e) => setCreateForm(prev => ({ ...prev, collectedBy: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-notes">Notes (optional)</Label>
              <Textarea
                id="create-notes"
                value={createForm.notes || ''}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
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
            <DialogTitle>Update Sample</DialogTitle>
            <DialogDescription>Update optional fields.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Collected By (user ID, optional)</Label>
              <Input
                type="number"
                value={updateForm.collectedBy ? String(updateForm.collectedBy) : ''}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, collectedBy: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={updateForm.status} onValueChange={(val) => setUpdateForm(prev => ({ ...prev, status: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLLECTION_PENDING">Collection Pending</SelectItem>
                  <SelectItem value="COLLECTED">Collected</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="TESTED">Tested</SelectItem>
                  <SelectItem value="DISCARDED">Discarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-notes">Notes (optional)</Label>
              <Textarea
                id="update-notes"
                value={updateForm.notes || ''}
                onChange={(e) =>
                  setUpdateForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
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