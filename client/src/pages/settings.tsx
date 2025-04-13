import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import WalletConnect from '@/components/auth/WalletConnect';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/auth';
import { uploadUserProfilePicture } from '../firebase/storage';

const Settings = () => {
  const { user, updateUserData } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPreviewUrl(user.photoURL || null);
    }
  }, [user]);
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile in Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      let photoURL = user.photoURL;
      
      // Upload profile image if changed
      if (profileImage) {
        const uploadResult = await uploadUserProfilePicture(user.uid, profileImage);
        photoURL = uploadResult.url;
      }
      
      // Update display name and photo URL
      await updateProfile(currentUser, {
        displayName,
        photoURL,
      });
      
      // Refresh user data in context
      await updateUserData();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={previewUrl || undefined} alt={displayName} />
                        <AvatarFallback>{displayName ? displayName.charAt(0) : 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="profile-image" className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                          Change Image
                        </Label>
                        <Input 
                          id="profile-image" 
                          type="file" 
                          accept="image/*" 
                          className="sr-only"
                          onChange={handleProfileImageChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="display-name">Full Name</Label>
                          <Input 
                            id="display-name" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            disabled 
                            className="bg-gray-50 dark:bg-dark-200"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Email cannot be changed directly. Please contact support.
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="role">Account Type</Label>
                          <Input 
                            id="role" 
                            value={user?.role === 'investor' ? 'Investor' : 'Startup Founder'} 
                            disabled 
                            className="bg-gray-50 dark:bg-dark-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallet" className="space-y-6">
              <WalletConnect showSkip={false} />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notification settings coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Security settings coming soon.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
