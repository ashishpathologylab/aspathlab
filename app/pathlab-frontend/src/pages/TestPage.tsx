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
    Calendar,
    Trash2,
    FileText,
    X,
    CheckCircle,
    Droplet,
    Clock,
    Beaker,
    Layers,
    FlaskRound,
    Circle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { testsApi, Test, TestParameter, CreateTestRequest, UpdateTestRequest } from '@/api/tests';
import { useToast } from '@/hooks/use-toast';

export const TestPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [filteredTests, setFilteredTests] = useState<Test[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Test>>({});
    const [addForm, setAddForm] = useState<CreateTestRequest>({
        testName: '',
        description: '',
        sampleType: 'BLOOD',
        price: 0,
        parameters: []
    });
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();

    // Load tests from API
    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            setLoading(true);
            const data = await testsApi.getAll();
            setTests(data);
            setFilteredTests(data);
        } catch (error) {
            console.error('Error loading tests:', error);
            toast({
                title: "Error loading tests",
                description: "Failed to load tests from server.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter tests
    useEffect(() => {
        let filtered = tests;

        if (searchTerm) {
            filtered = filtered.filter(test =>
                test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                test.sampleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                test.parameters.some(param =>
                    param.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (priceFilter !== 'all') {
            filtered = filtered.filter(test => {
                switch (priceFilter) {
                    case 'low': return test.price < 500;
                    case 'mid': return test.price >= 500 && test.price <= 1000;
                    case 'high': return test.price > 1000;
                    default: return true;
                }
            });
        }

        setFilteredTests(filtered);
    }, [tests, searchTerm, priceFilter]);

    const handleAddTest = async () => {
        try {
            setLoading(true);
            const newTest = await testsApi.create(addForm);
            setTests(prev => [...prev, newTest]);
            setAddForm({
                testName: '',
                description: '',
                sampleType: 'BLOOD',
                price: 0,
                parameters: []
            });
            setIsAddDialogOpen(false);

            toast({
                title: "Test added successfully",
                description: `${newTest.testName} has been added to the system.`,
            });
        } catch (error) {
            console.error('Error adding test:', error);
            toast({
                title: "Error adding test",
                description: "Failed to create test. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditTest = async () => {
        if (!selectedTest) return;

        try {
            setLoading(true);
            const updateRequest: UpdateTestRequest = {
                testName: editForm.testName || selectedTest.testName,
                description: editForm.description || selectedTest.description,
                sampleType: editForm.sampleType || selectedTest.sampleType,
                price: editForm.price || selectedTest.price,
                parameters: editForm.parameters || selectedTest.parameters
            };

            const updatedTest = await testsApi.update(selectedTest.id!, updateRequest);
            setTests(prev =>
                prev.map(test =>
                    test.id === selectedTest.id ? updatedTest : test
                )
            );

            setIsEditDialogOpen(false);
            setSelectedTest(null);
            setEditForm({});

            toast({
                title: "Test updated successfully",
                description: `${updatedTest.testName} has been updated.`,
            });
        } catch (error) {
            console.error('Error updating test:', error);
            toast({
                title: "Error updating test",
                description: "Failed to update test. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTest = async (testId: number) => {
        try {
            setLoading(true);
            await testsApi.delete(testId);
            setTests(prev => prev.filter(test => test.id !== testId));

            toast({
                title: "Test deleted successfully",
                description: "The test has been removed from the system.",
            });
        } catch (error) {
            console.error('Error deleting test:', error);
            toast({
                title: "Error deleting test",
                description: "Failed to delete test. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const addParameter = () => {
        setAddForm(prev => ({
            ...prev,
            parameters: [...prev.parameters, { name: '', unit: '' }]
        }));
    };

    const removeParameter = (index: number) => {
        setAddForm(prev => ({
            ...prev,
            parameters: prev.parameters.filter((_, i) => i !== index)
        }));
    };

    const updateParameter = (index: number, field: keyof TestParameter, value: string) => {
        setAddForm(prev => ({
            ...prev,
            parameters: prev.parameters.map((param, i) =>
                i === index ? { ...param, [field]: value } : param
            )
        }));
    };

    const resetAddForm = () => {
        setAddForm({
            testName: '',
            description: '',
            sampleType: 'BLOOD',
            price: 0,
            parameters: []
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: 'secondary' | 'outline'; icon: any; color: string }
        > = {
            pending: { variant: 'outline', icon: Clock, color: 'text-gray-600' },
            completed: { variant: 'secondary', icon: CheckCircle, color: 'text-green-600' },
            blood: { variant: 'secondary', icon: Droplet, color: 'text-red-600' },
            saliva: { variant: 'secondary', icon: Beaker, color: 'text-blue-600' },
            tissue: { variant: 'secondary', icon: Layers, color: 'text-pink-600' },
            urine: { variant: 'secondary', icon: FlaskRound, color: 'text-yellow-600' },
            other: { variant: 'outline', icon: Circle, color: 'text-gray-500' },
        };

        const key = (status || '').toLowerCase();
        const config = variants[key] || { variant: 'outline', icon: Circle, color: 'text-gray-400' };
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center space-x-1">
                <Icon className={`h-3 w-3 ${config.color}`} />
                <span className={config.color}>{status}</span>
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
                        <h1 className="text-3xl font-bold tracking-tight">Tests Management</h1>
                        <p className="text-muted-foreground">
                            Manage available lab tests and their parameters.
                        </p>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetAddForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Test
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Test</DialogTitle>
                                <DialogDescription>
                                    Enter test information and parameters to create a new record.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="add-testName">Test Name *</Label>
                                        <Input
                                            id="add-testName"
                                            value={addForm.testName}
                                            onChange={(e) =>
                                                setAddForm((prev) => ({ ...prev, testName: e.target.value }))
                                            }
                                            placeholder="Enter test name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="add-price">Price (₹) *</Label>
                                        <Input
                                            id="add-price"
                                            type="number"
                                            value={addForm.price}
                                            onChange={(e) =>
                                                setAddForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                                            }
                                            placeholder="Enter price"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Sample Type</Label>
                                    <Select value={addForm.sampleType} onValueChange={(val) => setAddForm(prev => ({ ...prev, sampleType: val }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Sample Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BLOOD">Blood</SelectItem>
                                            <SelectItem value="URINE">Urine</SelectItem>
                                            <SelectItem value="SALIVA">Saliva</SelectItem>
                                            <SelectItem value="TISSUE">Tissue</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="add-description">Description</Label>
                                    <Textarea
                                        id="add-description"
                                        value={addForm.description}
                                        onChange={(e) =>
                                            setAddForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        placeholder="Enter test description"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Parameters *</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Parameter
                                        </Button>
                                    </div>

                                    {addForm.parameters.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            At least one parameter is required.
                                        </p>
                                    )}

                                    {addForm.parameters.map((param, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Parameter {index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeParameter(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Name *</Label>
                                                    <Input
                                                        value={param.name}
                                                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                                                        placeholder="Parameter name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Unit</Label>
                                                    <Input
                                                        value={param.unit || ''}
                                                        onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                                                        placeholder="Unit (e.g., mg/dL)"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Male Range</Label>
                                                    <Input
                                                        value={param.refRangeMale || ''}
                                                        onChange={(e) => updateParameter(index, 'refRangeMale', e.target.value)}
                                                        placeholder="Male reference range"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Female Range</Label>
                                                    <Input
                                                        value={param.refRangeFemale || ''}
                                                        onChange={(e) => updateParameter(index, 'refRangeFemale', e.target.value)}
                                                        placeholder="Female reference range"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Child Range</Label>
                                                    <Input
                                                        value={param.refRangeChild || ''}
                                                        onChange={(e) => updateParameter(index, 'refRangeChild', e.target.value)}
                                                        placeholder="Child reference range"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddTest}
                                    disabled={loading || !addForm.testName || addForm.price <= 0 || addForm.parameters.length === 0 || addForm.parameters.some(p => !p.name)}
                                >
                                    {loading ? 'Adding...' : 'Add Test'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Tests', value: tests.length, color: 'text-blue-600' },
                    { title: 'CBC Tests', value: tests.filter(t => t.testName.toLowerCase().includes('cbc')).length, color: 'text-green-600' },
                    { title: 'Lipid Profile Tests', value: tests.filter(t => t.testName.toLowerCase().includes('lipid')).length, color: 'text-pink-600' },
                    { title: 'Avg. Price', value: tests.length > 0 ? `₹${(tests.reduce((sum, t) => sum + t.price, 0) / tests.length).toFixed(2)}` : '₹0', color: 'text-purple-600' },
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

            {/* Tests Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>All Tests</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search + Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by test name, description, or parameters..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={priceFilter} onValueChange={setPriceFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Prices</SelectItem>
                                    <SelectItem value="low">Below ₹500</SelectItem>
                                    <SelectItem value="mid">₹500 - ₹1000</SelectItem>
                                    <SelectItem value="high">Above ₹1000</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">Loading tests...</p>
                            </div>
                        )}

                        {/* Table */}
                        {!loading && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Test ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Sample Type</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Parameters</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTests.map((test, index) => (
                                            <motion.tr
                                                key={test.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">{test.id}</TableCell>
                                                <TableCell>{test.testName}</TableCell>
                                                <TableCell className="max-w-xs truncate">{test.description || '—'}</TableCell>
                                                <TableCell>{getStatusBadge(test.sampleType ?? '')}</TableCell>
                                                <TableCell>₹{test.price}</TableCell>
                                                <TableCell>{test.parameters.length}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTest(test);
                                                                setIsViewDialogOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTest(test);
                                                                setEditForm(test);
                                                                setIsEditDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteTest(test.id!)}
                                                            disabled={loading}
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
                        )}

                        {/* Empty state */}
                        {!loading && filteredTests.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No tests found</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm || priceFilter !== 'all'
                                        ? 'Try adjusting your search filters'
                                        : 'No tests have been added yet'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* View Test Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl w-full">
                    <DialogHeader>
                        <DialogTitle>Test Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {selectedTest?.testName}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTest && (
                        <div className="overflow-y-auto max-h-[70vh] pr-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="font-semibold">Test ID</Label>
                                            <p>{selectedTest.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="font-semibold">Test Name</Label>
                                            <p>{selectedTest.testName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="font-semibold">Price</Label>
                                            <p>₹{selectedTest.price}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="font-semibold">Description</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedTest.description || 'No description provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Sample Type</Label>
                                        <p>
                                            {selectedTest.sampleType ? getStatusBadge(selectedTest.sampleType) : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Total Parameters</Label>
                                        <p className="text-2xl font-bold text-primary">
                                            {selectedTest.parameters.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Parameters List */}
                            <div>
                                <Label className="font-semibold">Parameters</Label>
                                <div className="mt-2 space-y-2">
                                    {selectedTest.parameters.map((param) => (
                                        <div key={param.id || param.name} className="p-3 border rounded-md">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium">{param.name}</span>
                                                <span className="text-muted-foreground text-sm">{param.unit || '—'}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div>Male: {param.refRangeMale || "—"}</div>
                                                <div>Female: {param.refRangeFemale || "—"}</div>
                                                <div>Child: {param.refRangeChild || "—"}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Test Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Test</DialogTitle>
                        <DialogDescription>
                            Update test information and parameters
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-testName">Test Name *</Label>
                                <Input
                                    id="edit-testName"
                                    value={editForm.testName || ''}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, testName: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Price (₹) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={editForm.price || ''}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, price: parseFloat(e.target.value) }))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Sample Type</Label>
                                <Select
                                    value={editForm.sampleType || 'BLOOD'}
                                    onValueChange={(val) => setEditForm(prev => ({ ...prev, sampleType: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Sample Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BLOOD">Blood</SelectItem>
                                        <SelectItem value="URINE">Urine</SelectItem>
                                        <SelectItem value="SALIVA">Saliva</SelectItem>
                                        <SelectItem value="TISSUE">Tissue</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description || ''}
                                onChange={(e) =>
                                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                                }
                                rows={3}
                            />
                        </div>

                        {/* Edit Parameters */}
                        <div className="space-y-4">
                            <Label>Parameters</Label>
                            {editForm.parameters?.map((param, index) => (
                                <div key={index} className="border rounded-lg p-3 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                value={param.name}
                                                onChange={(e) => {
                                                    const newParams = [...(editForm.parameters || [])];
                                                    newParams[index] = { ...newParams[index], name: e.target.value };
                                                    setEditForm(prev => ({ ...prev, parameters: newParams }));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unit</Label>
                                            <Input
                                                value={param.unit || ''}
                                                onChange={(e) => {
                                                    const newParams = [...(editForm.parameters || [])];
                                                    newParams[index] = { ...newParams[index], unit: e.target.value };
                                                    setEditForm(prev => ({ ...prev, parameters: newParams }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label>Male Range</Label>
                                            <Input
                                                value={param.refRangeMale || ''}
                                                onChange={(e) => {
                                                    const newParams = [...(editForm.parameters || [])];
                                                    newParams[index] = { ...newParams[index], refRangeMale: e.target.value };
                                                    setEditForm(prev => ({ ...prev, parameters: newParams }));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Female Range</Label>
                                            <Input
                                                value={param.refRangeFemale || ''}
                                                onChange={(e) => {
                                                    const newParams = [...(editForm.parameters || [])];
                                                    newParams[index] = { ...newParams[index], refRangeFemale: e.target.value };
                                                    setEditForm(prev => ({ ...prev, parameters: newParams }));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Child Range</Label>
                                            <Input
                                                value={param.refRangeChild || ''}
                                                onChange={(e) => {
                                                    const newParams = [...(editForm.parameters || [])];
                                                    newParams[index] = { ...newParams[index], refRangeChild: e.target.value };
                                                    setEditForm(prev => ({ ...prev, parameters: newParams }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditTest}
                            disabled={loading || !editForm.testName || (editForm.price || 0) <= 0}
                        >
                            {loading ? 'Updating...' : 'Update Test'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};