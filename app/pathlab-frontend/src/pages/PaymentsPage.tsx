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
import { Search, Filter, Eye, Edit3, CreditCard, CheckCircle, Clock, Trash2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { bookingsApi, paymentsApi } from '@/api';
import { toast } from 'sonner';

interface Payment {
  id: number;
  bookingId: number;
  patientName: string;
  patientContactNumber: string;
  testNames: string[];
  bookingDate: string;
  status: string; // normalized to lowercase in the UI
  totalAmount: number;
  paidAt?: string;
}

interface Booking {
  id: number;
  patient: {
    name: string;
    email: string;
    contactNumber: string;
  };
}

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ bookingId: number | null; amount: number; status: string; }>({ bookingId: null, amount: 0, status: 'PENDING' });
  const [updateForm, setUpdateForm] = useState<{ amount: number; status: string; }>({ amount: 0, status: 'PENDING' });
  const [search, setSearch] = useState('');
  const [isLoadingPayments] = useState(false);

  // initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, bookingsRes] = await Promise.all([
          paymentsApi.getAll() as Promise<any[]>,
          bookingsApi.getAll() as Promise<any[]>,
        ]);

        const mappedPayments: Payment[] = (paymentsRes || []).map((p: any) => ({
          id: p.id,
          bookingId: p.bookingId ?? null,
          patientName: p.patientName ?? '',
          patientContactNumber: p.patientContactNumber ?? '',
          testNames: p.testNames ?? [],
          bookingDate: p.bookingDate ?? '',
          status: (p.status ?? 'pending').toLowerCase(),
          totalAmount: Number(p.totalAmount ?? 0),
          paidAt: p.paidAt ?? undefined,
        }));

        const mappedBookings: Booking[] = (bookingsRes || []).map((b: any) => ({
          id: b.id,
          patient: {
            name: b.patient?.name ?? '',
            email: b.patient?.email ?? '',
            contactNumber: b.patient?.contactNumber ?? '',
          },
        }));

        setPayments(mappedPayments);
        setFilteredPayments(mappedPayments);
        setBookings(mappedBookings);
      } catch (error) {
        console.error('Failed to fetch payments/bookings:', error);
        toast.error('Failed to fetch payments.');
      }
    };
    fetchData();
  }, []); // not depending on toast (toast is a stable import)

  // client-side filtering
  useEffect(() => {
    let filtered = payments;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.patientName.toLowerCase().includes(lower) ||
        payment.testNames.join(', ').toLowerCase().includes(lower) ||
        String(payment.id).includes(lower) ||
        (payment.patientContactNumber ?? '').toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'default' as const, icon: Clock, color: 'text-orange-600' },
      paid: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
    } as const;

    const key = (status || '').toLowerCase() as keyof typeof variants;
    const config = variants[key] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className={config.color}>{status}</span>
      </Badge>
    );
  };

  // refresh payments from server
  const refreshPayments = async () => {
    try {
      const paymentsRes = await paymentsApi.getAll() as any[];
      const mappedPayments: Payment[] = (paymentsRes || []).map((p: any) => ({
        id: p.id,
        bookingId: p.bookingId ?? null,
        patientName: p.patientName ?? '',
        patientContactNumber: p.patientContactNumber ?? '',
        testNames: p.testNames ?? [],
        bookingDate: p.bookingDate ?? '',
        status: (p.status ?? 'pending').toLowerCase(),
        totalAmount: Number(p.totalAmount ?? 0),
        paidAt: p.paidAt ?? undefined,
      }));
      setPayments(mappedPayments);
      setFilteredPayments(mappedPayments);
    } catch (err) {
      console.error('refreshPayments failed', err);
      toast.error('Failed to refresh payments.');
    }
  };

  const handleCreate = async () => {
    try {
      if (!createForm.bookingId || createForm.amount <= 0 || !createForm.status) {
        toast.error('Fill all required fields.');
        return;
      }

      // check duplicates by bookingId only
      const existingPayment = payments.find((p) => p.bookingId === createForm.bookingId);
      if (existingPayment) {
        toast.error(`A payment already exists for Booking #${createForm.bookingId}.`);
        return;
      }

      const payload = {
        bookingId: createForm.bookingId,
        amount: createForm.amount,
        // backend's CreatePaymentRequest likely expects uppercase enum value (PENDING/PAID)
        paymentStatus: String(createForm.status).toUpperCase(),
      };

      await paymentsApi.create(payload as any);
      await refreshPayments();

      setIsCreateOpen(false);
      setCreateForm({ bookingId: null, amount: 0, status: 'PENDING' });

      toast.success('Payment created successfully.');
    } catch (error) {
      console.error('create payment error', error);
      toast.error('Error creating payment. Please try again.');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedPayment) return;

      const current = await paymentsApi.getById(String(selectedPayment.id)) as any;

      const payload = {
        amount: updateForm.amount ?? current.totalAmount,
        paymentStatus: (updateForm.status ?? current.status).toUpperCase(),
      };

      if (
        Number(payload.amount) === Number(current.totalAmount) &&
        payload.paymentStatus === (current.status ?? '').toUpperCase()
      ) {
        toast('No changes detected.');
        return;
      }

      await paymentsApi.update(String(selectedPayment.id), payload as any);
      await refreshPayments();

      setIsUpdateOpen(false);
      setSelectedPayment(null);

      toast.success('Payment updated.');
    } catch (error) {
      console.error('update payment error', error);
      toast.error('Error updating payment. Please try again.');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    try {
      await paymentsApi.delete(paymentId);
      await refreshPayments();
      toast.success('Payment deleted successfully.');
    } catch (error) {
      console.error('delete payment error', error);
      toast.error('Error deleting payment. Please try again.');
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
          Payments Management
        </h1>
        <p className="text-muted-foreground">Manage and track all payments.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Payments', value: payments.length, color: 'text-blue-600' },
          { title: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: 'text-orange-600' },
          { title: 'Paid', value: payments.filter(p => p.status === 'paid').length, color: 'text-green-600' },
        ].map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>All Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by patient name, payment ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateOpen(true)} className="sm:ml-auto">Add Payment</Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, index) => (
                    <motion.tr key={payment.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.patientName}</div>
                          <div className="text-sm text-muted-foreground">{payment.patientContactNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {payment.testNames.map((test, idx) => <Badge key={idx} variant="outline" className="mr-1">{test}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(payment.bookingDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{payment.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog open={isDialogOpen && selectedPayment?.id === payment.id} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}><Eye className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-full sm:max-w-lg w-full">
                              <DialogHeader>
                                <DialogTitle>Payment Details - {selectedPayment?.id}</DialogTitle>
                                <DialogDescription>View and manage payment information</DialogDescription>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-8">
                                  <div>
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Patient Information</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div><p className="text-sm font-semibold text-gray-700">Name</p><p>{selectedPayment.patientName}</p></div>
                                      <div><p className="text-sm font-semibold text-gray-700">Contact Number</p><p>{selectedPayment.patientContactNumber}</p></div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Payment Information</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div><p className="text-sm font-semibold text-gray-700">Payment ID</p><p>{selectedPayment.id}</p></div>
                                      <div><p className="text-sm font-semibold text-gray-700">Booking Date</p><p>{format(new Date(selectedPayment.bookingDate), "PPP")}</p></div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">Tests</p>
                                        <div className="flex flex-wrap gap-2 mt-1">{selectedPayment.testNames.map((test, idx) => <Badge key={idx} variant="outline">{test}</Badge>)}</div>
                                      </div>
                                      <div><p className="text-sm font-semibold text-gray-700">Amount</p><p>{selectedPayment.totalAmount.toFixed(2)}</p></div>
                                      <div><p className="text-sm font-semibold text-gray-700">Current Status</p><div className="mt-1">{getStatusBadge(selectedPayment.status)}</div></div>
                                      <div><p className="text-sm font-semibold text-gray-700">Paid At</p><p>{selectedPayment.paidAt ? format(new Date(selectedPayment.paidAt), "PPP HH:mm") : 'Not paid'}</p></div>
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
                              paymentsApi.downloadInvoice(payment.id);
                            }}
                            disabled={isLoadingPayments}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setSelectedPayment(payment);
                              const current = await paymentsApi.getById(String(payment.id)) as any;
                              setUpdateForm({
                                amount: current.totalAmount || 0,
                                status: (current.status || "PENDING").toUpperCase(),
                              });

                              setIsUpdateOpen(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => handleDeletePayment(payment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">{searchTerm || statusFilter !== 'all' ? 'Try adjusting your search filters' : 'No payments have been made yet'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-full sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
            <DialogDescription>Select booking and fill details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Booking ({bookings.length} available)</Label>
              <Select value={String(createForm.bookingId ?? '')} onValueChange={(val) => setCreateForm((prev) => ({ ...prev, bookingId: Number(val) || null }))}>
                <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <input type="text" placeholder="Search bookings..." className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  {bookings.length === 0 ? (
                    <SelectItem value="no-bookings" disabled>No bookings available</SelectItem>
                  ) : (
                    bookings
                      .filter((b) => b.patient.name.toLowerCase().includes(search.toLowerCase()) || b.patient.email.toLowerCase().includes(search.toLowerCase()) || b.patient.contactNumber.toLowerCase().includes(search.toLowerCase()))
                      .map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>Booking #{b.id} - {b.patient.name} ({b.patient.email})</SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div><Label>Amount</Label><Input type="number" step="0.01" value={createForm.amount} onChange={(e) => setCreateForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} /></div>

            <div>
              <Label>Status</Label>
              <Select value={createForm.status} onValueChange={(val) => setCreateForm(prev => ({ ...prev, status: val }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="max-w-full sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
            <DialogDescription>Change details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Amount</Label><Input type="number" step="0.01" value={updateForm.amount} onChange={(e) => setUpdateForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} /></div>
            <div>
              <Label>Status</Label>
              <Select value={updateForm.status} onValueChange={(val) => setUpdateForm(prev => ({ ...prev, status: val }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
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
export default PaymentsPage;