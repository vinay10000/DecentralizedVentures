import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, FileText, X } from 'lucide-react';
import { StartupDocument } from '@/firebase/firestore';

interface DocumentViewerProps {
  documents: StartupDocument[];
  title?: string;
  isLoading?: boolean;
}

const DocumentViewer = ({ documents, title = "Documents", isLoading = false }: DocumentViewerProps) => {
  const [selectedDocument, setSelectedDocument] = useState<StartupDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const openPreview = (doc: StartupDocument) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };
  
  const closePreview = () => {
    setPreviewOpen(false);
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pitchDeck':
        return <FileText className="h-5 w-5 text-primary-500 dark:text-primary-400" />;
      case 'financialReport':
        return <FileText className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'investorAgreement':
        return <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'riskDisclosure':
        return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };
  
  const formatDocumentType = (type: string) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };
  
  const renderDocumentPreview = () => {
    if (!selectedDocument) return null;
    
    const { contentType, url } = selectedDocument;
    
    if (contentType.includes('pdf')) {
      return (
        <iframe 
          src={`${url}#toolbar=0&navpanes=0`} 
          className="w-full h-[80vh]" 
          title={selectedDocument.name}
        />
      );
    } else if (contentType.includes('image')) {
      return (
        <img 
          src={url} 
          alt={selectedDocument.name} 
          className="max-w-full max-h-[80vh] object-contain" 
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <FileText className="h-20 w-20 text-gray-400 mb-4" />
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Preview not available for this file type
          </p>
          <Button asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </a>
          </Button>
        </div>
      );
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-16 border rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="border rounded-lg p-4 flex items-center hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDocumentType(doc.type)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openPreview(doc)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Preview</span>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No documents available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh]">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={closePreview}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          
          <div className="overflow-auto">
            {renderDocumentPreview()}
          </div>
          
          <div className="flex justify-end mt-4">
            {selectedDocument && (
              <Button asChild>
                <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentViewer;
