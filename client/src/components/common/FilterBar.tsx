import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

export interface FilterOptions {
  searchTerm?: string;
  investmentStage?: string;
  industry?: string;
  sortBy?: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const FilterBar = ({ onFilterChange, initialFilters }: FilterBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [investmentStage, setInvestmentStage] = useState(initialFilters?.investmentStage || 'All Stages');
  const [industry, setIndustry] = useState(initialFilters?.industry || 'All Industries');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'Newest First');
  
  // Debounce search term to avoid too many filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        searchTerm,
        investmentStage,
        industry,
        sortBy
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, investmentStage, industry, sortBy, onFilterChange]);
  
  const handleInvestmentStageChange = (value: string) => {
    setInvestmentStage(value);
  };
  
  const handleIndustryChange = (value: string) => {
    setIndustry(value);
  };
  
  const handleSortByChange = (value: string) => {
    setSortBy(value);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-1 block">Search</Label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                id="search"
                placeholder="Search startups..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <Label htmlFor="stage" className="mb-1 block">Stage</Label>
            <Select value={investmentStage} onValueChange={handleInvestmentStageChange}>
              <SelectTrigger id="stage" className="w-full md:w-[180px]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Stages">All Stages</SelectItem>
                <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Series A</SelectItem>
                <SelectItem value="Series B">Series B</SelectItem>
                <SelectItem value="Series C+">Series C+</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <Label htmlFor="industry" className="mb-1 block">Industry</Label>
            <Select value={industry} onValueChange={handleIndustryChange}>
              <SelectTrigger id="industry" className="w-full md:w-[180px]">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Industries">All Industries</SelectItem>
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
          </div>
          
          <div className="w-full md:w-auto">
            <Label htmlFor="sort" className="mb-1 block">Sort By</Label>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger id="sort" className="w-full md:w-[180px]">
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newest First">Newest First</SelectItem>
                <SelectItem value="Funding Goal">Funding Goal</SelectItem>
                <SelectItem value="Progress">Funding Progress</SelectItem>
                <SelectItem value="Most Investors">Most Investors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
