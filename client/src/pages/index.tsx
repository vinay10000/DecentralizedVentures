import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { StartupData } from '@/firebase/firestore';
import { useState, useEffect } from 'react';
import { getAllStartups } from '@/firebase/firestore';
import StartupCard from '@/components/startup/StartupCard';
import { ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const [featuredStartups, setFeaturedStartups] = useState<StartupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const { startups } = await getAllStartups(undefined, 3);
        setFeaturedStartups(startups);
      } catch (error) {
        console.error('Error fetching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-dark-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-heading font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Invest in the</span>
                <span className="block text-primary-600 dark:text-primary-400">future of innovation</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                StartupVest connects investors with promising startups through a secure, decentralized platform. 
                Fund the next big innovation using crypto or traditional payments.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={user ? (user.role === 'investor' ? '/investor/dashboard' : '/startup/dashboard') : '/auth'}>
                  <Button size="lg" className="px-8">
                    {user ? 'Go to Dashboard' : 'Get Started'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/investor/discover">
                  <Button variant="outline" size="lg" className="px-8">
                    Explore Startups
                  </Button>
                </Link>
              </div>
              
              <div className="mt-10 space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Invest with crypto using MetaMask</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Secure UPI payments for fiat investments</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Direct messaging with founders</span>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-white dark:bg-dark-200 rounded-lg shadow-xl overflow-hidden">
                <img
                  className="w-full h-auto"
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                  alt="Startup team meeting"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Startups Section */}
      <section className="bg-gray-50 dark:bg-dark-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Featured Startups</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Discover promising startups looking for investment on our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-100 rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="pt-2 flex justify-between">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredStartups.length > 0 ? (
              featuredStartups.map((startup) => (
                <StartupCard key={startup.id} startup={startup} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No startups found</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/investor/discover">
              <Button size="lg">
                View All Startups
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-dark-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our platform connects startup founders with investors in a secure and transparent environment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-dark-200 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Create an Account</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sign up as an investor or startup founder and complete your profile to get started
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-200 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center text-secondary-600 dark:text-secondary-400 mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Discover Opportunities</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Investors can browse startups while founders can create detailed profiles to attract investment
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-200 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center text-accent-600 dark:text-accent-400 mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Invest Securely</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose between MetaMask (crypto) or UPI (fiat) to invest in startups you believe in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 dark:bg-primary-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold text-white">Ready to invest in the future?</h2>
          <p className="mt-4 text-lg text-primary-100">
            Join our platform today and connect with innovative startups or find investors for your big idea.
          </p>
          <div className="mt-8">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="px-8">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M15 8.5C15 7.11929 13.6569 6 12 6C10.3431 6 9 7.11929 9 8.5C9 9.88071 10.3431 11 12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 11V18M12 18L9 15M12 18L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-2 text-xl font-heading font-bold text-white">StartupVest</span>
              </div>
              <p className="mt-2 text-gray-400 max-w-sm">
                Connecting startup founders with investors through a secure, decentralized platform.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">How it Works</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-center">
              &copy; {new Date().getFullYear()} StartupVest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
