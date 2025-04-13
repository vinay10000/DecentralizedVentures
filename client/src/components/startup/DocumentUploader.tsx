import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X } from 'lucide-react';

interface DocumentUploaderProps {
  accept: string;
  maxSize: number; // in bytes
  onFileSelect: (file: File | null) => void;
  currentFile: File | null;
  placeholder: string;
}

export const DocumentUploader = ({
  accept,
  maxSize,
  onFileSelect,
  currentFile,
  placeholder
}: DocumentUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      onFileSelect(null);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    const fileType = file.type;
    const acceptedTypes = accept.split(',').map(type => type.trim());

    // Handle special cases like .pdf, .doc, etc.
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!acceptedTypes.some(type => {
      // Check if it's a mime type (e.g., image/*)
      if (type.includes('/')) {
        return type === '*/*' || type === fileType || (type.endsWith('/*') && fileType.startsWith(type.split('/*')[0]));
      }
      // Otherwise, it's a file extension (e.g., .pdf)
      return type === fileExtension;
    })) {
      toast({
        title: 'Unsupported file type',
        description: `Please upload a file with the following format: ${accept}`,
        variant: 'destructive',
      });
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(file);
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-md p-4 ${
        isDragging 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'border-gray-300 dark:border-gray-700'
      } transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {currentFile ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded">
              <UploadCloud className="h-5 w-5 text-primary-500 dark:text-primary-400" />
            </div>
            <div className="ml-3 text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">{currentFile.name}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
            onClick={removeFile}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
          <div className="mt-2">
            <label htmlFor={`file-upload-${placeholder}`} className="cursor-pointer">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                Click to upload
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400"> or drag and drop</span>
              <Input
                id={`file-upload-${placeholder}`}
                type="file"
                className="sr-only"
                accept={accept}
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {placeholder}
          </p>
        </div>
      )}
    </div>
  );
};
