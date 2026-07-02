import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { patientsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: number;
  name: string;
  email: string;
  contact: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  createdAt?: string;
  totalBookings?: number;
  lastVisit?: string;
}

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    contact: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    password: '',
  });
  const { toast } = useToast();

  // Load patients from API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientsApi.getAll();
        const mapped: Patient[] = (data as any[]).map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          contact: p.contactNumber ?? '',
          dateOfBirth: p.dateOfBirth,
          gender: (p.gender === 'M' ? 'male' : p.gender === 'F' ? 'female' : 'other') as Patient['gender'],
          address: p.address ?? '',
          createdAt: p.createdAt,
          totalBookings: p.totalBookings ?? 0,
          lastVisit: p.lastVisit ?? null
        }));
        setPatients(mapped);
        setFilteredPatients(mapped);
      } catch (error) {
        toast({ title: 'Failed to load patients', description: 'Please try again later.', variant: 'destructive' });
      }
    };
    load();
  }, [toast]);

  // Filter patients
  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.includes(searchTerm) ||
        String(patient.id).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm, genderFilter]);

  const handleAddPatient = async () => {
    try {
      const payload = {
        name: addForm.name,
        gender: addForm.gender === 'male' ? 'M' : addForm.gender === 'female' ? 'F' : 'O',
        dateOfBirth: addForm.dateOfBirth,
        contactNumber: addForm.contact || undefined,
        email: addForm.email,
        password: addForm.password,
        address: addForm.address || undefined,
      } as const;
      const created = await patientsApi.create(payload as any);
      const mapped: Patient = {
        id: (created as any).id,
        name: (created as any).name,
        email: (created as any).email,
        contact: (created as any).contactNumber ?? '',
        dateOfBirth: (created as any).dateOfBirth,
        gender: ((created as any).gender === 'M' ? 'male' : (created as any).gender === 'F' ? 'female' : 'other') as Patient['gender'],
        address: (created as any).address ?? '',
        createdAt: (created as any).createdAt,
      };

      setPatients(prev => [...prev, mapped]);
      setAddForm({
        name: '',
        email: '',
        contact: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        password: '',
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Patient added successfully",
        description: `${mapped.name} has been added to the system.`,
      });
    } catch (error) {
      toast({
        title: "Error adding patient",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPatient = async () => {
    if (!selectedPatient) return;

    try {
      const toUpdate = {
        name: (editForm.name ?? selectedPatient.name) as string,
        gender: ((editForm.gender ?? selectedPatient.gender) === 'male' ? 'M' : (editForm.gender ?? selectedPatient.gender) === 'female' ? 'F' : 'O') as 'M' | 'F' | 'O',
        dateOfBirth: (editForm.dateOfBirth ?? selectedPatient.dateOfBirth) as string,
        contactNumber: (editForm.contact ?? selectedPatient.contact) as string,
        email: (editForm.email ?? selectedPatient.email) as string,
        address: (editForm.address ?? selectedPatient.address) as string,
      } as const;

      const updated = await patientsApi.update(selectedPatient.id, toUpdate as any);
      const mapped: Patient = {
        id: (updated as any).id,
        name: (updated as any).name,
        email: (updated as any).email,
        contact: (updated as any).contactNumber ?? '',
        dateOfBirth: (updated as any).dateOfBirth,
        gender: ((updated as any).gender === 'M' ? 'male' : (updated as any).gender === 'F' ? 'female' : 'other') as Patient['gender'],
        address: (updated as any).address ?? '',
        createdAt: (updated as any).createdAt,
      };

      setPatients(prev => prev.map(p => (p.id === selectedPatient.id ? mapped : p)));
      setIsEditDialogOpen(false);
      setSelectedPatient(null);
      setEditForm({});
      
      toast({
        title: "Patient updated successfully",
        description: `${mapped.name}'s information has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error updating patient",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePatient = async (patientId: number) => {
    try {
      await patientsApi.delete(patientId);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      toast({
        title: "Patient deleted successfully",
        description: "Patient has been removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Error deleting patient",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      male: 'bg-blue-100 text-blue-800',
      female: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[gender as keyof typeof colors] || colors.other}>
        {gender.charAt(0).toUpperCase() + gender.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients Management</h1>
            <p className="text-muted-foreground">
              Manage patient records and information.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter patient information to create a new record.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Full Name</Label>
                  <Input
                    id="add-name"
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-contact">Contact</Label>
                  <Input
                    id="add-contact"
                    value={addForm.contact}
                    onChange={(e) => setAddForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-dob">Date of Birth</Label>
                  <Input
                    id="add-dob"
                    type="date"
                    value={addForm.dateOfBirth}
                    onChange={(e) => setAddForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-gender">Gender</Label>
                  <Select value={addForm.gender} onValueChange={(value: any) => setAddForm(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">Password</Label>
                  <Input
                    id="add-password"
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Set initial password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-address">Address</Label>
                  <Textarea
                    id="add-address"
                    value={addForm.address}
                    onChange={(e) => setAddForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPatient}>Add Patient</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Patients', value: patients.length, color: 'text-blue-600' },
          { title: 'Male Patients', value: patients.filter(p => p.gender === 'male').length, color: 'text-green-600' },
          { title: 'Female Patients', value: patients.filter(p => p.gender === 'female').length, color: 'text-pink-600' },
          { title: 'Active This Month', value: patients.filter(p => p.lastVisit && new Date(p.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: 'text-purple-600' },
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

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>All Patients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, contact, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient, index) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{patient.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.contact}</TableCell>
                      <TableCell>
                        {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                      </TableCell>
                      <TableCell>
                        {getGenderBadge(patient.gender)}
                      </TableCell>
                      <TableCell>{patient.totalBookings}</TableCell>
                      <TableCell>
                        {patient.lastVisit ? format(new Date(patient.lastVisit), 'MMM dd, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setEditForm(patient);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePatient(patient.id)}
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

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || genderFilter !== 'all'
                    ? 'Try adjusting your search filters'
                    : 'No patients have been registered yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="font-semibold">Patient ID</Label>
                      <p>{selectedPatient.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="font-semibold">Email</Label>
                      <p>{selectedPatient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="font-semibold">Date of Birth</Label>
                      <p>{format(new Date(selectedPatient.dateOfBirth), 'PPP')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="font-semibold">Contact</Label>
                      <p>{selectedPatient.contact}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Gender</Label>
                    <div className="mt-1">{getGenderBadge(selectedPatient.gender)}</div>
                  </div>
                  <div>
                    <Label className="font-semibold">Total Bookings</Label>
                    <p className="text-2xl font-bold text-primary">{selectedPatient.totalBookings}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <Label className="font-semibold">Address</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPatient.address}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact">Contact</Label>
              <Input
                id="edit-contact"
                value={editForm.contact || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, contact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={editForm.dateOfBirth || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={editForm.gender as any || ''} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={editForm.address || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPatient}>Update Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};