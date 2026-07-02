
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as React from "react";
import {
  Microscope,
  Clock,
  Shield,
  Award,
  ArrowRight,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { testsApi } from '@/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Test {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const LandingPage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const testsData = await testsApi.getAll();
      const mapped = (testsData as any[]).map((t) => ({
        id: String(t.id),
        name: t.testName ?? t.name,
        description: t.description ?? '',
        price: Number(t.price) || 0,
      })) as Test[];
      setTests(mapped);
    } catch (error) {
      toast.error("Failed to load tests", { description: "Please try again later." });
      setTests([]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section id='home' className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 py-20 sm:py-28 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="secondary" className="mb-4 text-sm sm:text-base">
                Trusted Healthcare Partner
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                PathLab Pro{" "}
                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Pathology
                </span>{" "}
                Laboratory
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience precision diagnostics with state-of-the-art
                technology. Fast, accurate, and reliable lab results you can
                trust.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8"
                  onClick={() => navigate("/patient-client")}
                >
                  Book Test Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base sm:text-lg px-6 sm:px-8"
                  onClick={() => navigate("/test-catalog")}
                >
                  View Test Catalog
                </Button>
              </div>
            </motion.div>

            {/* Hero Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8">
                <div className="grid grid-cols-2 gap-6 sm:gap-8">
                  {[
                    {
                      icon: Microscope,
                      title: "Advanced Technology",
                      text: "Latest diagnostic equipment",
                      bg: "bg-blue-100 dark:bg-blue-900",
                      color: "text-blue-600",
                    },
                    {
                      icon: Clock,
                      title: "Quick Results",
                      text: "Same day reporting",
                      bg: "bg-teal-100 dark:bg-teal-900",
                      color: "text-teal-600",
                    },
                    {
                      icon: Shield,
                      title: "Accurate Results",
                      text: "99.9% precision rate",
                      bg: "bg-green-100 dark:bg-green-900",
                      color: "text-green-600",
                    },
                    {
                      icon: Award,
                      title: "Certified Lab",
                      text: "ISO 15189 accredited",
                      bg: "bg-orange-100 dark:bg-orange-900",
                      color: "text-orange-600",
                    },
                  ].map((feature, i) => (
                    <div key={i} className="text-center">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 ${feature.bg} rounded-full flex items-center justify-center mx-auto mb-4`}
                      >
                        <feature.icon
                          className={`h-7 w-7 sm:h-8 sm:w-8 ${feature.color}`}
                        />
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {feature.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Why Choose PathLab Pro Pathology Laboratory?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              We combine cutting-edge technology with expert care to deliver the
              most accurate diagnostic results for your health.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Microscope,
                title: "State-of-the-art Equipment",
                description:
                  "Our laboratory is equipped with the latest diagnostic technology ensuring precise and reliable results.",
              },
              {
                icon: Users,
                title: "Expert Team",
                description:
                  "Certified pathologists and lab technicians with years of experience in diagnostic medicine.",
              },
              {
                icon: Clock,
                title: "Quick Turnaround",
                description:
                  "Most test results available within 24 hours with emergency reporting available.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section id="test" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Available Tests & Pricing
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Comprehensive range of diagnostic tests at competitive prices
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/test-catalog")}
              className="text-base sm:text-lg px-6 sm:px-8"
            >
              View Full Catalog
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      {test.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      {test.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        ₹{test.price}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/patient-client")}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? Our team is here to help you with all your
              diagnostic needs.
            </p>
            <div className="mt-8 space-y-3 sm:space-y-4">
              <p className="text-base sm:text-lg">
                <strong>Phone:</strong> +91 9876543210
              </p>
              <p className="text-base sm:text-lg">
                <strong>Email:</strong> info@pathlabpro.com
              </p>
              <p className="text-base sm:text-lg">
                <strong>Address:</strong> Fake Street 123, City, State, 123456
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}