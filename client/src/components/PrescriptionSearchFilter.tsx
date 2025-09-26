import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  SlidersHorizontal,
  Download,
  RefreshCw,
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface PrescriptionItem {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  doctorSpecialization: string;
  prescriptionDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  diagnosis: string;
  treatment: string;
  notes: string;
  sphereRight?: string;
  cylinderRight?: string;
  axisRight?: string;
  sphereLeft?: string;
  cylinderLeft?: string;
  axisLeft?: string;
  pdDistance?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastModified: string;
  createdBy: string;
}

interface FilterOptions {
  searchTerm: string;
  status: string[];
  dateRange: DateRange | undefined;
  doctorNames: string[];
  patientNames: string[];
  diagnoses: string[];
  priority: string[];
  hasVisionPrescription: boolean | null;
  hasMedications: boolean | null;
  tags: string[];
  sortBy: 'date' | 'patient' | 'doctor' | 'status' | 'priority';
  sortOrder: 'asc' | 'desc';
}

interface PrescriptionSearchFilterProps {
  prescriptions: PrescriptionItem[];
  onFilteredResults: (filtered: PrescriptionItem[]) => void;
  onExport?: (filtered: PrescriptionItem[]) => void;
  className?: string;
}

const PrescriptionSearchFilter: React.FC<PrescriptionSearchFilterProps> = ({
  prescriptions,
  onFilteredResults,
  onExport,
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: [],
    dateRange: undefined,
    doctorNames: [],
    patientNames: [],
    diagnoses: [],
    priority: [],
    hasVisionPrescription: null,
    hasMedications: null,
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const doctors = [...new Set(prescriptions.map(p => p.doctorName))].sort();
    const patients = [...new Set(prescriptions.map(p => p.patientName))].sort();
    const diagnoses = [...new Set(prescriptions.map(p => p.diagnosis).filter(Boolean))].sort();
    const allTags = [...new Set(prescriptions.flatMap(p => p.tags || []))].sort();
    
    return {
      doctors,
      patients,
      diagnoses,
      tags: allTags
    };
  }, [prescriptions]);

  // Apply filters and sorting
  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptions.filter(prescription => {
      // Text search
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = [
          prescription.prescriptionNumber,
          prescription.patientName,
          prescription.patientCode,
          prescription.doctorName,
          prescription.diagnosis,
          prescription.treatment,
          prescription.notes,
          ...(prescription.medications?.map(m => `${m.name} ${m.dosage}`) || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(prescription.status)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const prescriptionDate = parseISO(prescription.prescriptionDate);
        const from = filters.dateRange.from ? startOfDay(filters.dateRange.from) : new Date(0);
        const to = filters.dateRange.to ? endOfDay(filters.dateRange.to) : new Date();
        
        if (!isWithinInterval(prescriptionDate, { start: from, end: to })) {
          return false;
        }
      }

      // Doctor filter
      if (filters.doctorNames.length > 0 && !filters.doctorNames.includes(prescription.doctorName)) {
        return false;
      }

      // Patient filter
      if (filters.patientNames.length > 0 && !filters.patientNames.includes(prescription.patientName)) {
        return false;
      }

      // Diagnosis filter
      if (filters.diagnoses.length > 0 && !filters.diagnoses.includes(prescription.diagnosis)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(prescription.priority)) {
        return false;
      }

      // Vision prescription filter
      if (filters.hasVisionPrescription !== null) {
        const hasVision = !!(prescription.sphereRight || prescription.sphereLeft);
        if (filters.hasVisionPrescription !== hasVision) {
          return false;
        }
      }

      // Medications filter
      if (filters.hasMedications !== null) {
        const hasMeds = !!(prescription.medications && prescription.medications.length > 0);
        if (filters.hasMedications !== hasMeds) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const prescriptionTags = prescription.tags || [];
        if (!filters.tags.some(tag => prescriptionTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.prescriptionDate).getTime() - new Date(b.prescriptionDate).getTime();
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'doctor':
          comparison = a.doctorName.localeCompare(b.doctorName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [prescriptions, filters]);

  // Update parent component when filtered results change
  useEffect(() => {
    onFilteredResults(filteredPrescriptions);
  }, [filteredPrescriptions, onFilteredResults]);

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      status: [],
      dateRange: undefined,
      doctorNames: [],
      patientNames: [],
      diagnoses: [],
      priority: [],
      hasVisionPrescription: null,
      hasMedications: null,
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.doctorNames.length > 0) count++;
    if (filters.patientNames.length > 0) count++;
    if (filters.diagnoses.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.hasVisionPrescription !== null) count++;
    if (filters.hasMedications !== null) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const handleMultiSelectChange = (key: keyof FilterOptions, value: string, checked: boolean) => {
    const currentValues = filters[key] as string[];
    if (checked) {
      updateFilter(key, [...currentValues, value]);
    } else {
      updateFilter(key, currentValues.filter(v => v !== value));
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Search & Filter Prescriptions</CardTitle>
            <CardDescription>
              {filteredPrescriptions.length} of {prescriptions.length} prescriptions
              {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filters active)`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport(filteredPrescriptions)}
                disabled={filteredPrescriptions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export ({filteredPrescriptions.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFilterCount() === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prescriptions, patients, doctors, medications..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.status.join(',')} onValueChange={(value) => updateFilter('status', value ? value.split(',') : [])}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => updateFilter('dateRange', range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Doctor Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Doctors</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filterOptions.doctors.map(doctor => (
                    <div key={doctor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`doctor-${doctor}`}
                        checked={filters.doctorNames.includes(doctor)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('doctorNames', doctor, checked as boolean)
                        }
                      />
                      <Label htmlFor={`doctor-${doctor}`} className="text-sm">
                        {doctor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Patients</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filterOptions.patients.map(patient => (
                    <div key={patient} className="flex items-center space-x-2">
                      <Checkbox
                        id={`patient-${patient}`}
                        checked={filters.patientNames.includes(patient)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('patientNames', patient, checked as boolean)
                        }
                      />
                      <Label htmlFor={`patient-${patient}`} className="text-sm">
                        {patient}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Diagnoses</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {filterOptions.diagnoses.map(diagnosis => (
                    <div key={diagnosis} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diagnosis-${diagnosis}`}
                        checked={filters.diagnoses.includes(diagnosis)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('diagnoses', diagnosis, checked as boolean)
                        }
                      />
                      <Label htmlFor={`diagnosis-${diagnosis}`} className="text-sm">
                        {diagnosis}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Priority</Label>
                <div className="space-y-1">
                  {['urgent', 'high', 'medium', 'low'].map(priority => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priority.includes(priority)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('priority', priority, checked as boolean)
                        }
                      />
                      <Label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                        {priority}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Type Filters */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Content Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-vision"
                      checked={filters.hasVisionPrescription === true}
                      onCheckedChange={(checked) => 
                        updateFilter('hasVisionPrescription', checked ? true : null)
                      }
                    />
                    <Label htmlFor="has-vision" className="text-sm">
                      Has Vision Prescription
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-medications"
                      checked={filters.hasMedications === true}
                      onCheckedChange={(checked) => 
                        updateFilter('hasMedications', checked ? true : null)
                      }
                    />
                    <Label htmlFor="has-medications" className="text-sm">
                      Has Medications
                    </Label>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              {filterOptions.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tags</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                    {filterOptions.tags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={filters.tags.includes(tag)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange('tags', tag, checked as boolean)
                          }
                        />
                        <Label htmlFor={`tag-${tag}`} className="text-sm">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {filters.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.searchTerm}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('searchTerm', '')}
                />
              </Badge>
            )}
            {filters.status.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status.join(', ')}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', [])}
                />
              </Badge>
            )}
            {(filters.dateRange?.from || filters.dateRange?.to) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Date: {filters.dateRange?.from && format(filters.dateRange.from, 'MMM dd')} - {filters.dateRange?.to && format(filters.dateRange.to, 'MMM dd')}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('dateRange', undefined)}
                />
              </Badge>
            )}
            {filters.doctorNames.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Doctors: {filters.doctorNames.length}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('doctorNames', [])}
                />
              </Badge>
            )}
            {filters.patientNames.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Patients: {filters.patientNames.length}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('patientNames', [])}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionSearchFilter;