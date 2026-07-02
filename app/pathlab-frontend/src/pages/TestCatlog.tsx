import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Search,
  TestTube
} from 'lucide-react';
import { motion } from 'framer-motion';
import { testsApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface Test {
  id: number;
  testName: string;
  description: string;
  price: number;
}

export const TestCatlog: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const data = await testsApi.getAll() as Test[];
        setTests(data);
        setFilteredTests(data);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [toast]);

  // Filter tests
  useEffect(() => {
    let filtered = tests;

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.id.toString().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTests(filtered);
  }, [tests, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Tests Management
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Browse, search, and manage your test catalog.
        </p>
      </motion.div>

      {/* Tests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg border border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TestTube className="h-6 w-6 text-primary" />
              <span>Available Tests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 shadow-sm focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-24">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test, index) => (
                    <motion.tr
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`
                        hover:bg-muted/40 transition-colors
                        ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      `}
                    >
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell className="font-semibold">{test.testName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {test.description}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(test.price)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredTests.length === 0 && (
              <div className="text-center py-16">
                <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">No tests found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm
                    ? "Try adjusting your search query"
                    : "No tests have been added yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};