import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Eye,
  Plus,
  TestTube,
  Clock,
  CheckCircle,
  Edit2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { bookingsApi, resultsApi } from '@/api';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface BookingTest {
  id: number;
  test: {
    id: number;
    testName: string;
    description: string;
    sampleType: string;
    price: number;
    parameters: TestParameter[];
  };
}

interface TestParameter {
  id: number;
  name: string;
  unit: string;
  refRangeMale: string;
  refRangeFemale: string;
  refRangeChild: string;
}

interface TestResult {
  parameterId: number;
  parameterName: string;
  value: string;
  unit: string;
  referenceRange: string;
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

interface Test {
  id: number;
  testName: string;
  parameters: TestParameter[];
}

interface Booking {
  id: number;
  bookingDate: string;
  status: string;
  createdAt: string;
  patient: Patient;
  bookingTests: BookingTest[];
}

interface PatientInfo {
  id: number;
  name: string;
  age: number;
  gender: string;
}

interface ParameterResult {
  parameterId: number;
  name: string;
  unit: string;
  refRangeMale: string;
  refRangeFemale: string;
  refRangeChild: string;
  value: string;
  status: string;
}

interface TestResultGroup {
  testId: number;
  testName: string;
  interpretation: string;
  parameters: ParameterResult[];
}

interface BookingResultsResponse {
  bookingId: number;
  patient: PatientInfo;
  tests: TestResultGroup[];
}

// Professional Report Component (View Only, Grouped by Tests)
const ProfessionalReport: React.FC<{
  booking: Booking;
  resultsResponse: BookingResultsResponse;
  onClose: () => void;
}> = ({ booking, resultsResponse, onClose }) => {

  const getReferenceRange = (parameter: ParameterResult, gender: string, age: number): string => {
    if (age < 18) return parameter.refRangeChild;
    if (gender === 'F') return parameter.refRangeFemale;
    return parameter.refRangeMale;
  };

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    const colors: Record<'normal' | 'high' | 'low' | 'critical', string> = {
      normal: 'bg-green-100 text-green-800',
      high: 'bg-red-100 text-red-800',
      low: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-200 text-red-900',
    };

    const color =
      (['normal', 'high', 'low', 'critical'] as const).includes(
        lowerStatus as any
      )
        ? colors[lowerStatus as keyof typeof colors]
        : 'bg-gray-100 text-gray-800';

    return (
      <Badge className={color}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const allParameters = resultsResponse.tests.flatMap(t => t.parameters);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laboratory Report</h2>
        <div className="flex space-x-2">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white dark:bg-gray-900 p-8 border dark:border-gray-700 rounded-lg shadow-sm">
        {/* Letterhead */}
        <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-600">PathLab Pro</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Accredited by ISO 15189:2012</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fake Street 123, City, State, 123456</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Phone: +91 9876543210 | Email: info@pathlabpro.com
          </p>
        </div>

        {/* Report Header */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-600">PATIENT INFORMATION</h3>
            <div className="space-y-2 text-sm dark:text-gray-200">
              <div><strong>Name:</strong> {resultsResponse.patient.name}</div>
              <div><strong>Age:</strong> {resultsResponse.patient.age} years</div>
              <div><strong>Gender:</strong> {resultsResponse.patient.gender === 'M' ? 'Male' : resultsResponse.patient.gender === 'F' ? 'Female' : 'Other'}</div>
              <div><strong>Contact:</strong> {booking.patient.contactNumber}</div>
              <div><strong>Email:</strong> {booking.patient.email}</div>
              <div><strong>Address:</strong> {booking.patient.address}</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-600">REPORT INFORMATION</h3>
            <div className="space-y-2 text-sm dark:text-gray-200">
              <div><strong>Report ID:</strong> R{String(booking.id).padStart(3, '0')}</div>
              <div><strong>Booking ID:</strong> {booking.id}</div>
              <div><strong>Booking Date:</strong> {format(new Date(booking.bookingDate), 'PPP')}</div>
              <div><strong>Report Date:</strong> {format(new Date(), 'PPP')}</div>
              <div><strong>Status:</strong> <Badge variant="outline">{booking.status}</Badge></div>
            </div>
          </div>
        </div>

        {/* Test Results Sections */}
        {resultsResponse.tests.map((testGroup) => (
          <div key={testGroup.testId} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">{testGroup.testName}</h3>
            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 dark:bg-gray-800">
                    <TableHead className="font-semibold">Parameter</TableHead>
                    <TableHead className="font-semibold text-center">Value</TableHead>
                    <TableHead className="font-semibold text-center">Unit</TableHead>
                    <TableHead className="font-semibold text-center">Reference Range</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testGroup.parameters.map((param) => (
                    <TableRow
                      key={param.parameterId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">{param.name}</TableCell>
                      <TableCell className="text-center font-semibold">{param.value}</TableCell>
                      <TableCell className="text-center">{param.unit}</TableCell>
                      <TableCell className="text-center">
                        {getReferenceRange(param, resultsResponse.patient.gender, resultsResponse.patient.age)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(param.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {testGroup.interpretation && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Interpretation</h4>
                <p className="text-sm dark:text-gray-200">{testGroup.interpretation}</p>
              </div>
            )}
          </div>
        ))}

        {/* Summary Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-600">SUMMARY</h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm dark:text-gray-200">
              <div><strong>Total Parameters:</strong> {allParameters.length}</div>
              <div><strong>Normal Results:</strong> {allParameters.filter(p => p.status.toLowerCase() === 'normal').length}</div>
              <div><strong>Abnormal Results:</strong> {allParameters.filter(p => p.status.toLowerCase() !== 'normal').length}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-blue-600 pt-4 mt-8">
          <div className="grid grid-cols-2 gap-8 text-sm dark:text-gray-200">
            <div>
              <p><strong>Report Generated By:</strong> Laboratory Information System</p>
              <p><strong>Date:</strong> {format(new Date(), 'PPP')}</p>
            </div>
            <div className="text-right">
              <p><strong>Authorized Signatory:</strong></p>
              <div className="mt-8 border-t border-gray-400 dark:border-gray-600 w-32 ml-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pathologist</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>This is a computer-generated report. No signature is required.</p>
            <p>For any queries, please contact our laboratory at +91 98765 43210</p>
          </div>
        </div>
      </div>
    </div>
  );

};

export const ReportsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingResults, setBookingResults] = useState<BookingResultsResponse | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [testsForBooking, setTestsForBooking] = useState<BookingTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [completedTestIds, setCompletedTestIds] = useState<Set<number>>(new Set());
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [isEditingTest, setIsEditingTest] = useState<Test | null>(null);
  const [editTestResults, setEditTestResults] = useState<TestResult[]>([]);
  const [testInterpretation, setTestInterpretation] = useState<string>('');
  const [editTestInterpretation, setEditTestInterpretation] = useState<string>('');


const filteredAvailableBookings = bookings.filter((booking) => {
  const matchesSearch =
    booking.patient.name.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
    booking.id.toString().includes(bookingSearchTerm) ||
    booking.bookingTests.some(bt =>
      bt.test.testName.toLowerCase().includes(bookingSearchTerm.toLowerCase())
    );

  const matchesStatus =
    statusFilter === "all" || booking.status === statusFilter;

  return matchesSearch && matchesStatus;
});


  // Load bookings from API
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const bookingsData = await bookingsApi.getAll();
      setBookings(bookingsData as Booking[]);
      setFilteredBookings(bookingsData as Booking[]);
    } catch (error) {
      toast.error("Failed to load bookings", { description: "Please try again later." });
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestsAndResultsForBooking = async (bookingId: number) => {
    try {
      const testsData = await bookingsApi.getTestsByBooking(bookingId.toString()) as BookingTest[];
      setTestsForBooking(testsData);

      const resultsData = await resultsApi.getByBookingId(bookingId) as BookingResultsResponse;
      const completed = new Set(resultsData.tests.map(t => t.testId));
      setCompletedTestIds(completed);
    } catch (error) {
      toast.error("Failed to load tests or results", { description: "Please try again later." });
      setTestsForBooking([]);
      setCompletedTestIds(new Set());
    }
  };

  // Filter bookings
useEffect(() => {
  const filtered = bookings.filter((booking) => {
    const matchesSearch =
      booking.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingTests.some(bt =>
        bt.test.testName.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      booking.id.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  setFilteredBookings(filtered);
}, [bookings, searchTerm, statusFilter]);


  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'secondary' | 'default', icon: any, color: string }> = {
      completed: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-blue-600' },
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
    };
    const config = variants[status.toLowerCase()] || variants['pending'];
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`flex items-center space-x-1 ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    loadTestsAndResultsForBooking(booking.id);
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getReferenceRange = (parameter: TestParameter, gender: string, age: number): string => {
    if (age < 18) return parameter.refRangeChild;
    if (gender === 'F') return parameter.refRangeFemale;
    return parameter.refRangeMale;
  };

  const updateTestResult = (index: number, value: string) => {
    setTestResults(prev =>
      prev.map((result, i) => i === index ? { ...result, value } : result)
    );
  };

  const updateEditTestResult = (index: number, value: string) => {
    setEditTestResults(prev =>
      prev.map((result, i) => i === index ? { ...result, value } : result)
    );
  };

const handleSaveTestResults = async () => {
  if (!selectedBooking || !selectedTest || testResults.length === 0) {
    toast.error("Missing information");
    return;
  }

  const hasEmptyValues = testResults.some(result => !result.value.trim());
  if (hasEmptyValues) {
    toast.error("Incomplete results", { description: "Please fill in all test result values." });
    return;
  }

  try {
    setIsLoading(true);

    const payload = {
      enteredBy: 1, // Replace with actual user ID
      interpretation: testInterpretation,
      results: testResults.map(result => ({
        parameterId: result.parameterId,
        value: result.value,
      })),
    };

    await resultsApi.create({
      bookingId: selectedBooking.id,
      testId: selectedTest.id,
      ...payload,
      savedResults: []
    });

    setCompletedTestIds(prev => new Set([...prev, selectedTest.id]));
    setSelectedTest(null);
    setTestResults([]);
    toast.success("Test results saved successfully");

    // Refresh bookings to reflect changes
    await loadBookings();
  } catch (error) {
    toast.error("Failed to save test results");
  } finally {
    setIsLoading(false);
  }
};

const handleUpdateTestResults = async () => {
  if (!selectedBooking || !isEditingTest || editTestResults.length === 0) {
    toast.error("Missing information");
    return;
  }

  const hasEmptyValues = editTestResults.some(result => !result.value.trim());
  if (hasEmptyValues) {
    toast.error("Incomplete results", { description: "Please fill in all test result values." });
    return;
  }

  try {
    setIsLoading(true);

    const payload = {
      enteredBy: 1,
      interpretation: editTestInterpretation,
      results: editTestResults.map(result => ({
        parameterId: result.parameterId,
        value: result.value,
      })),
    };

    await resultsApi.update({
      bookingId: selectedBooking.id,
      testId: isEditingTest.id,
      ...payload,
      savedResults: []
    });

    setIsEditingTest(null);
    setEditTestResults([]);
    await loadResultsByBookingId(selectedBooking.id);
    toast.success("Test results updated successfully");

    // Refresh bookings to reflect changes
    await loadBookings();
  } catch (error) {
    toast.error("Failed to update test results");
  } finally {
    setIsLoading(false);
  }
};

const handleDeleteTestResults = async (testId: number) => {
  if (!selectedBooking) return;

  try {
    setIsLoading(true);
    await resultsApi.delete(selectedBooking.id, testId);

    toast.success("Test results deleted successfully");

    // Refresh results + bookings
    await loadResultsByBookingId(selectedBooking.id);
    await loadTestsAndResultsForBooking(selectedBooking.id);
    await loadBookings();

    setIsEditingTest(null);
    setEditTestResults([]);
  } catch (error) {
    toast.error("Failed to delete test results", { description: "Please try again later." });
  } finally {
    setIsLoading(false);
  }
};

  const loadResultsByBookingId = async (bookingId: number) => {
    try {
      setIsLoadingResults(true);
      const resultsData = await resultsApi.getByBookingId(bookingId) as BookingResultsResponse;
      setBookingResults(resultsData);
    } catch (error) {
      toast.error("Failed to load test results", { description: "Please try again later." });
      setBookingResults(null);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleViewReport = async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
    await loadResultsByBookingId(booking.id);
  };

  const handleEditReport = async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsUpdateDialogOpen(true);
    await loadTestsAndResultsForBooking(booking.id);
    await loadResultsByBookingId(booking.id);
  };

  const allCompleted = testsForBooking.length > 0 && completedTestIds.size === testsForBooking.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
          <p className="text-muted-foreground">
            Create and manage test reports.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Select a booking and enter test results to generate a report.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="booking" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="booking">Select Booking</TabsTrigger>
                <TabsTrigger value="results">Enter Results</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              <TabsContent value="booking" className="space-y-4">
                <div className="space-y-4">
                  <Label>Available Bookings</Label>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient name, test, or booking ID..."
                      value={bookingSearchTerm}
                      onChange={(e) => setBookingSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid gap-4">
                    {filteredAvailableBookings.map((booking) => (
                      <Card
                        key={booking.id}
                        className={`cursor-pointer transition-all ${selectedBooking?.id === booking.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                          }`}
                        onClick={() => handleBookingSelect(booking)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.patient.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {calculateAge(booking.patient.dateOfBirth)} years, {booking.patient.gender}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                Booking Date: {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                Status: {booking.status}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Booking ID</p>
                              <p className="text-sm text-muted-foreground">{booking.id}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                </div>
              </TabsContent>
              <TabsContent value="results" className="space-y-4">
                {selectedBooking ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label>Select Test</Label>
                      <Badge variant="outline">
                        {completedTestIds.size} / {testsForBooking.length} tests completed
                      </Badge>
                    </div>
                    <Select
                      onValueChange={(val) => {
                        const bt = testsForBooking.find(bt => bt.test.id === Number(val));
                        if (bt) {
                          const age = calculateAge(selectedBooking.patient.dateOfBirth);
                          setSelectedTest(bt.test);
                          setTestResults(bt.test.parameters.map(param => ({
                            parameterId: param.id,
                            parameterName: param.name,
                            value: '',
                            unit: param.unit,
                            referenceRange: getReferenceRange(param, selectedBooking.patient.gender, age),
                          })));
                          setTestInterpretation('');

                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a test" />
                      </SelectTrigger>
                      <SelectContent>
                        {testsForBooking.map((bt) => (
                          <SelectItem
                            key={bt.test.id}
                            value={bt.test.id.toString()}
                            disabled={completedTestIds.has(bt.test.id)}
                          >
                            {bt.test.testName} {completedTestIds.has(bt.test.id) ? '(Completed)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedTest && (
                      <div className="mt-6 space-y-4">
                        <h4 className="font-semibold">{selectedTest.testName} Parameters</h4>
                        {testResults.map((result, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                  <Label>Parameter Name</Label>
                                  <Input
                                    value={result.parameterName}
                                    disabled
                                    className="bg-muted"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Value *</Label>
                                  <Input
                                    value={result.value}
                                    onChange={(e) => updateTestResult(index, e.target.value)}
                                    placeholder="Enter value"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Unit</Label>
                                  <Input
                                    value={result.unit}
                                    disabled
                                    className="bg-muted"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Reference Range</Label>
                                  <Input
                                    value={result.referenceRange}
                                    disabled
                                    className="bg-muted"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Card>
                          <CardContent className="p-4">
                            <div className="mt-4">
                              <Label>Interpretation (optional)</Label>
                              <Textarea
                                value={testInterpretation}
                                onChange={(e) => setTestInterpretation(e.target.value)}
                                placeholder="Enter interpretation for this test"
                                className="mt-2"
                                rows={3}
                              />

                            </div>

                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">
                                * Please ensure all values are entered correctly before saving.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Button onClick={handleSaveTestResults} disabled={isLoading}>
                          {isLoading ? 'Saving...' : `Save Results for ${selectedTest.testName}`}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Please select a booking first.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="review" className="space-y-4">
                {selectedBooking && (
                  <div className="space-y-4">
                    <Button onClick={() => loadResultsByBookingId(selectedBooking.id)} disabled={isLoadingResults}>
                      {isLoadingResults ? 'Loading...' : 'Load Current Results'}
                    </Button>
                    {bookingResults && bookingResults.tests.map((testGroup) => (
                      <Card key={testGroup.testId}>
                        <CardHeader>
                          <CardTitle>{testGroup.testName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {testGroup.parameters.map((param) => (
                              <div key={param.parameterId} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                <span className="font-medium">{param.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span>{param.value} {param.unit}</span>
                                  <Badge className={
                                    param.status.toLowerCase() === 'normal' ? 'bg-green-100 text-green-800' :
                                      param.status.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                                        param.status.toLowerCase() === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-200 text-red-900'
                                  }>
                                    {param.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        {testGroup.interpretation && (
                          <div className="mt-4 p-3 bg-muted/50 rounded">
                            <span className="font-medium">Interpretation:</span> {testGroup.interpretation}
                          </div>
                        )}

                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!allCompleted} onClick={() => setIsCreateDialogOpen(false)}>
                Finish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Report Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Report - Booking {selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              Update test results for {selectedBooking?.patient.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <Label>Select Test to Update</Label>
                  <Badge variant="outline">
                    {completedTestIds.size} / {testsForBooking.length} tests completed
                  </Badge>
                </div>
                <Select
                  onValueChange={(val) => {
                    const testGroup = bookingResults?.tests.find(t => t.testId === Number(val));
                    if (testGroup && selectedBooking) {
                      const age = calculateAge(selectedBooking.patient.dateOfBirth);
                      setIsEditingTest({ id: testGroup.testId, testName: testGroup.testName, parameters: [] });
                      setEditTestResults(testGroup.parameters.map(param => ({
                        parameterId: param.parameterId,
                        parameterName: param.name,
                        value: param.value,
                        unit: param.unit,
                        referenceRange: getReferenceRange(
                          {
                            id: param.parameterId,
                            name: param.name,
                            unit: param.unit,
                            refRangeMale: param.refRangeMale,
                            refRangeFemale: param.refRangeFemale,
                            refRangeChild: param.refRangeChild
                          },
                          selectedBooking.patient.gender,
                          age
                        ),
                      })));
                      setEditTestInterpretation(testGroup.interpretation || '');
                    }

                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test to update" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingResults?.tests.map((testGroup) => (
                      <SelectItem key={testGroup.testId} value={testGroup.testId.toString()}>
                        {testGroup.testName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isEditingTest && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Edit {isEditingTest.testName} Parameters</h4>
                    {editTestResults.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                              <Label>Parameter Name</Label>
                              <Input
                                value={result.parameterName}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Value *</Label>
                              <Input
                                value={result.value}
                                onChange={(e) => updateEditTestResult(index, e.target.value)}
                                placeholder="Enter value"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit</Label>
                              <Input
                                value={result.unit}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Reference Range</Label>
                              <Input
                                value={result.referenceRange}
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="mt-4">
                      <Label>Interpretation (optional)</Label>
                      <Textarea
                        value={editTestInterpretation}
                        onChange={(e) => setEditTestInterpretation(e.target.value)}
                        placeholder="Enter interpretation for this test"
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleUpdateTestResults} disabled={isLoading}>
                        {isLoading ? 'Updating...' : `Update Results for ${isEditingTest.testName}`}
                      </Button>
      <Button
        variant="destructive"
        onClick={() => handleDeleteTestResults(isEditingTest.id)}
      >
        Delete Results
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setIsEditingTest(null);
          setEditTestResults([]);
        }}
      >
        Cancel
      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Bookings', value: bookings.length, color: 'text-blue-600' },
          { title: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, color: 'text-green-600' },
          { title: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>All Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, test name, or booking ID..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">B{String(booking.id).padStart(3, '0')}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {calculateAge(booking.patient.dateOfBirth)} years, {booking.patient.gender === 'M' ? 'Male' : 'Female'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.bookingTests.map(bt => bt.test.testName).join(', ')}</TableCell>
                    <TableCell>
                      {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(booking)}
                          disabled={isLoadingResults}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(booking)}
                          disabled={isLoadingResults}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            resultsApi.downloadReport(booking.id);
                          }}
                          disabled={isLoadingResults}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search filters'
                  : 'No bookings have been created yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Laboratory Report - Booking {selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              Professional laboratory report for {selectedBooking?.patient.name}
            </DialogDescription>
          </DialogHeader>
          {isLoadingResults ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading report data...</p>
              </div>
            </div>
          ) : selectedBooking && bookingResults && bookingResults.tests.length > 0 ? (
            <ProfessionalReport
              booking={selectedBooking}
              resultsResponse={bookingResults}
              onClose={() => setIsViewDialogOpen(false)}
            />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No test results found</h3>
              <p className="text-muted-foreground">
                No test results are available for this booking yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
