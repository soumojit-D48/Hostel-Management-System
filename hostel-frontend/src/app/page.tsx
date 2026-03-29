'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { 
  Building2, 
  Shield, 
  Users, 
  Bell, 
  BarChart3, 
  Package,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Lock,
  MessageSquare,
  Clock,
  TrendingUp,
  LogIn,
  User,
  LayoutDashboard
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Issue Reporting',
      description: 'Report and track hostel issues like plumbing, electrical, cleaning, and more with real-time status updates.',
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      icon: Bell,
      title: 'Announcements',
      description: 'Stay informed with important hostel announcements, notices, and priority-based alerts.',
      color: 'success',
      gradient: 'from-success-500 to-success-600',
    },
    {
      icon: Package,
      title: 'Lost & Found',
      description: 'Report lost items and help reunite found items with their owners quickly and easily.',
      color: 'warning',
      gradient: 'from-warning-500 to-warning-600',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and reports for management to make data-driven decisions.',
      color: 'info',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Tailored experiences for Students, Staff, and Management with appropriate permissions.',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Instant notifications and live updates for all activities across the hostel system.',
      color: 'error',
      gradient: 'from-error-500 to-error-600',
    },
  ];

  const stats = [
    { value: '24/7', label: 'System Availability' },
    { value: '100%', label: 'Real-Time Updates' },
    { value: '3', label: 'User Roles' },
    { value: '0', label: 'Delay in Updates' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'The issue reporting system made it so easy to report maintenance problems. Got quick responses!',
      avatar: 'S',
    },
    {
      name: 'Michael Chen',
      role: 'Hostel Manager',
      content: 'The analytics dashboard helps us track patterns and allocate resources efficiently.',
      avatar: 'M',
    },
    {
      name: 'Emily Davis',
      role: 'Staff',
      content: 'Real-time notifications keep everyone updated. Great for coordination!',
      avatar: 'E',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                HostelEase
              </span>
            </div>
            <div className="flex items-center gap-3">
              {mounted && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 font-medium shadow-lg shadow-primary-500/25 transition-all hover:scale-105"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 font-medium shadow-lg shadow-primary-500/25 transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Modern Hostel Management Solution
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 leading-tight">
                Manage Your Hostel{' '}
                <span className="bg-gradient-to-r from-primary-500 to-warning-500 bg-clip-text text-transparent">
                  Smarter
                </span>{' '}
                Than Ever
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10">
                A comprehensive platform for managing hostel issues, announcements, 
                lost & found items, and communication - all in real-time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {mounted && user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 font-semibold shadow-xl shadow-primary-500/25 transition-all hover:scale-105"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 font-semibold shadow-xl shadow-primary-500/25 transition-all hover:scale-105"
                    >
                      Start Managing
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-8 py-4 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold transition-all"
                    >
                      Create Free Account
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-200/50 dark:shadow-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Powerful features designed to make hostel management effortless and efficient.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-800/50 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-950"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Get started in minutes with our simple onboarding process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Create Account', description: 'Register with your email and choose your role - Student, Staff, or Management.' },
                { step: '02', title: 'Explore Features', description: 'Access your personalized dashboard with features tailored to your role.' },
                { step: '03', title: 'Start Managing', description: 'Report issues, view announcements, track items, and stay connected.' },
              ].map((item, index) => (
                <div key={index} className="relative p-8 rounded-2xl bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="text-6xl font-bold text-primary-100 dark:text-primary-900/30 absolute top-4 right-6">{item.step}</div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3 mt-4">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                What Users Say
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Loved by students, staff, and management alike.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-warning-500 text-warning-500" />
                    ))}
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{testimonial.name}</p>
                      <p className="text-sm text-neutral-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of hostels already using HostelEase to manage their facilities efficiently.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-neutral-100 font-semibold transition-all hover:scale-105"
                  >
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-semibold transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                HostelEase
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-success-500" />
                Secure & Reliable
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary-500" />
                24/7 Support
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-warning-500" />
                Always Updated
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © 2026 HostelEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
