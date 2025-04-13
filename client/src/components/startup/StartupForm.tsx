import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploader } from './DocumentUploader';
import { useToast } from '@/hooks/use-toast';
import { uploadStartupImage, uploadStartupDocument } from '@/firebase/storage';
import { createStartup, addStartupDocument, StartupData } from '@/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

// Form schema
const startupFormSchema = z.object({
  name: z.string().min(2, 'Startup name must be at least 2 characters').max(100),
  description: z.string().min(30, 'Description must be at least 30 characters').max(1000),
  pitch: z.string().min(10, 'Pitch must be at least 10 characters').max(300),
  investmentStage: z.enum([
    'Pre-seed', 
    'Seed', 
    'Series A', 
    'Series B', 
    'Series C+',
    'Growth'
  ]),
  industry: z.enum([
    'Fintech',
    'Health Tech',
    'EdTech',
    'AI/ML',
    'Blockchain',
    'SaaS',
    'E-commerce',
    'Clean Energy',
    'Gaming',
    'Other'
  ]),
  fundingGoal: z.coerce.number().min(1000, 'Funding goal must be at least $1,000').max(100000000, 'Funding goal must be less than $100M'),
  upiId: z.string().min(3, 'UPI ID is required for fiat payments'),
});

type StartupFormValues = z.infer<typeof startupFormSchema>;

// Props interface
interface StartupFormProps {
  onSuccess?: (startup: StartupData) => void;
}

// Form component
const StartupForm = ({ onSuccess }: StartupFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File states
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [financialReport, setFinancialReport] = useState<File | null>(null);
  const [investorAgreement, setInvestorAgreement] = useState<File | null>(null);
  const [riskDisclosure, setRiskDisclosure] = useState<File | null>(null);

  // Form
  const form = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      name: '',
      description: '',
      pitch: '',
      investmentStage: 'Seed',
      industry: 'Fintech',
      fundingGoal: 100000,
      upiId: '',
    },
  });

  // Form submission handler
  const onSubmit = async (values: StartupFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a startup.',
        variant: 'destructive',
      });
      return;
    }

    if (!coverImage) {
      toast({
        title: 'Missing Cover Image',
        description: 'Please upload a cover image for your startup.',
        variant: 'destructive',
      });
      return;
    }

    if (!logoImage) {
      toast({
        title: 'Missing Logo',
        description: 'Please upload a logo for your startup.',
        variant: 'destructive',
      });
      return;
    }

    if (!qrCodeImage) {
      toast({
        title: 'Missing QR Code',
        description: 'Please upload a UPI QR code for receiving payments.',
        variant: 'destructive',
      });
      return;
    }

    if (!pitchDeck || !financialReport || !investorAgreement || !riskDisclosure) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents for your startup.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the startup first to get an ID
      const startupData = {
        name: values.name,
        description: values.description,
        pitch: values.pitch,
        investmentStage: values.investmentStage,
        industry: values.industry,
        founderId: user.uid,
        founderName: user.displayName || 'Unknown',
        upiId: values.upiId,
        qrCodeUrl: '',  // Will update these after upload
        coverImageUrl: '',
        logoUrl: '',
        fundingGoal: values.fundingGoal,
      };

      const createdStartup = await createStartup(startupData);
      const startupId = createdStartup.id as string;

      // Upload images
      const [uploadedCover, uploadedLogo, uploadedQR] = await Promise.all([
        uploadStartupImage(startupId, coverImage, 'cover'),
        uploadStartupImage(startupId, logoImage, 'logo'),
        uploadStartupImage(startupId, qrCodeImage, 'qrCode'),
      ]);

      // Update startup with image URLs
      await Promise.all([
        // Upload documents in parallel
        uploadStartupDocument(startupId, pitchDeck, 'pitchDeck').then(result => 
          addStartupDocument({
            startupId,
            type: 'pitchDeck',
            name: pitchDeck.name,
            url: result.url,
            contentType: pitchDeck.type,
            size: pitchDeck.size,
          })
        ),
        uploadStartupDocument(startupId, financialReport, 'financialReport').then(result => 
          addStartupDocument({
            startupId,
            type: 'financialReport',
            name: financialReport.name,
            url: result.url,
            contentType: financialReport.type,
            size: financialReport.size,
          })
        ),
        uploadStartupDocument(startupId, investorAgreement, 'investorAgreement').then(result => 
          addStartupDocument({
            startupId,
            type: 'investorAgreement',
            name: investorAgreement.name,
            url: result.url,
            contentType: investorAgreement.type,
            size: investorAgreement.size,
          })
        ),
        uploadStartupDocument(startupId, riskDisclosure, 'riskDisclosure').then(result => 
          addStartupDocument({
            startupId,
            type: 'riskDisclosure',
            name: riskDisclosure.name,
            url: result.url,
            contentType: riskDisclosure.type,
            size: riskDisclosure.size,
          })
        ),
      ]);

      // Update startup with image URLs
      const updatedStartup: StartupData = {
        ...createdStartup,
        coverImageUrl: uploadedCover.url,
        logoUrl: uploadedLogo.url,
        qrCodeUrl: uploadedQR.url,
      };

      toast({
        title: 'Startup Created',
        description: 'Your startup profile has been created successfully!',
      });

      if (onSuccess) {
        onSuccess(updatedStartup);
      }
    } catch (error) {
      console.error('Error creating startup:', error);
      toast({
        title: 'Error',
        description: 'Failed to create startup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Your Startup Profile</CardTitle>
        <CardDescription>
          Fill in the details below to create your startup profile and start raising funds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your startup name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your startup in detail..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of your startup, its mission, and vision.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pitch</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your short investment pitch..." 
                          {...field} 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        A concise pitch that will be displayed to potential investors.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Investment Details */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Investment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="investmentStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                            <SelectItem value="Seed">Seed</SelectItem>
                            <SelectItem value="Series A">Series A</SelectItem>
                            <SelectItem value="Series B">Series B</SelectItem>
                            <SelectItem value="Series C+">Series C+</SelectItem>
                            <SelectItem value="Growth">Growth</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fintech">Fintech</SelectItem>
                            <SelectItem value="Health Tech">Health Tech</SelectItem>
                            <SelectItem value="EdTech">EdTech</SelectItem>
                            <SelectItem value="AI/ML">AI/ML</SelectItem>
                            <SelectItem value="Blockchain">Blockchain</SelectItem>
                            <SelectItem value="SaaS">SaaS</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Clean Energy">Clean Energy</SelectItem>
                            <SelectItem value="Gaming">Gaming</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="fundingGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Goal (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <Input 
                            type="number" 
                            placeholder="100000" 
                            className="pl-7" 
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Set a realistic funding goal for your startup.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Payment Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Payment Information</h3>
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="yourname@bank" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your UPI ID for receiving fiat payments.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>UPI QR Code</FormLabel>
                  <DocumentUploader
                    accept="image/*"
                    maxSize={5242880} // 5MB
                    onFileSelect={setQrCodeImage}
                    currentFile={qrCodeImage}
                    placeholder="Upload UPI QR Code"
                  />
                  <FormDescription>
                    Upload a QR code image for your UPI ID (max 5MB).
                  </FormDescription>
                </div>
              </div>
              
              {/* Media Upload */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Cover Image</FormLabel>
                    <DocumentUploader
                      accept="image/*"
                      maxSize={5242880} // 5MB
                      onFileSelect={setCoverImage}
                      currentFile={coverImage}
                      placeholder="Upload Cover Image"
                    />
                    <FormDescription>
                      A banner image for your startup (max 5MB).
                    </FormDescription>
                  </div>
                  
                  <div>
                    <FormLabel>Logo</FormLabel>
                    <DocumentUploader
                      accept="image/*"
                      maxSize={3145728} // 3MB
                      onFileSelect={setLogoImage}
                      currentFile={logoImage}
                      placeholder="Upload Logo"
                    />
                    <FormDescription>
                      Your startup's logo (max 3MB).
                    </FormDescription>
                  </div>
                </div>
              </div>
              
              {/* Documents Upload */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Pitch Deck</FormLabel>
                    <DocumentUploader
                      accept=".pdf,.ppt,.pptx"
                      maxSize={10485760} // 10MB
                      onFileSelect={setPitchDeck}
                      currentFile={pitchDeck}
                      placeholder="Upload Pitch Deck"
                    />
                    <FormDescription>
                      Upload your pitch deck (PDF or PowerPoint, max 10MB).
                    </FormDescription>
                  </div>
                  
                  <div>
                    <FormLabel>Financial Report</FormLabel>
                    <DocumentUploader
                      accept=".pdf,.xls,.xlsx,.csv"
                      maxSize={10485760} // 10MB
                      onFileSelect={setFinancialReport}
                      currentFile={financialReport}
                      placeholder="Upload Financial Report"
                    />
                    <FormDescription>
                      Upload your financial report (PDF or spreadsheet, max 10MB).
                    </FormDescription>
                  </div>
                  
                  <div>
                    <FormLabel>Investor Agreement</FormLabel>
                    <DocumentUploader
                      accept=".pdf,.doc,.docx"
                      maxSize={10485760} // 10MB
                      onFileSelect={setInvestorAgreement}
                      currentFile={investorAgreement}
                      placeholder="Upload Investor Agreement"
                    />
                    <FormDescription>
                      Upload your investor agreement template (PDF or Word, max 10MB).
                    </FormDescription>
                  </div>
                  
                  <div>
                    <FormLabel>Risk Disclosure</FormLabel>
                    <DocumentUploader
                      accept=".pdf,.doc,.docx"
                      maxSize={10485760} // 10MB
                      onFileSelect={setRiskDisclosure}
                      currentFile={riskDisclosure}
                      placeholder="Upload Risk Disclosure"
                    />
                    <FormDescription>
                      Upload your risk disclosure document (PDF or Word, max 10MB).
                    </FormDescription>
                  </div>
                </div>
              </div>
            </div>
            
            <CardFooter className="px-0 pt-6 pb-0 flex justify-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Startup Profile'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StartupForm;
