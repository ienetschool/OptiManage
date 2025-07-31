import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Calendar,
  User,
  Activity,
  Heart,
  Droplets,
  Thermometer
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: string;
  diagnosis: string;
  treatment: string;
  bloodPressure?: string;
  bloodSugar?: string;
  bloodGroup?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
  allergies?: string;
  medications?: string;
  notes: string;
  recordDate: string;
  createdAt: string;
  doctorName: string;
}

const recordTypes = [
  "General Examination",
  "Eye Examination", 
  "Vision Test",
  "Contact Lens Fitting",
  "Surgery Consultation",
  "Follow-up",
  "Emergency"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function MedicalRecords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    patientId: "",
    recordType: "",
    diagnosis: "",
    treatment: "",
    bloodPressure: "",
    bloodSugar: "",
    bloodGroup: "",
    temperature: "",
    pulse: "",
    weight: "",
    height: "",
    allergies: "",
    medications: "",
    notes: ""
  });

  const { data: medicalRecords = [], isLoading } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records", searchTerm, filterType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterType !== "all") params.append("type", filterType);
      
      const response = await fetch(`/api/medical-records?${params}`);
      if (!response.ok) throw new Error("Failed to fetch medical records");
      return response.json();
    }
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await fetch("/api/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    }
  });

  const createRecordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/medical-records", data);
    },
    onSuccess: () => {
      toast({
        title: "Medical Record Created",
        description: "Medical record has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create medical record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/medical-records/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Medical Record Deleted",
        description: "Medical record has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete medical record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      patientId: "",
      recordType: "",
      diagnosis: "",
      treatment: "",
      bloodPressure: "",
      bloodSugar: "",
      bloodGroup: "",
      temperature: "",
      pulse: "",
      weight: "",
      height: "",
      allergies: "",
      medications: "",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.recordType || !formData.diagnosis) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createRecordMutation.mutate(formData);
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.recordType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || record.recordType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-600">Manage patient medical records and health information</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Medical Record</DialogTitle>
              <DialogDescription>
                Add a new medical record for a patient
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Record Type *</Label>
                  <Select value={formData.recordType} onValueChange={(value) => setFormData({ ...formData, recordType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    placeholder="120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Blood Sugar</Label>
                  <Input
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                    placeholder="mg/dL"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <Input
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="°F"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pulse</Label>
                  <Input
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                    placeholder="bpm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weight</Label>
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="kg/lbs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="cm/ft"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Diagnosis *</Label>
                <Textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Treatment *</Label>
                <Textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Enter treatment plan..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any known allergies..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Textarea
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="List current medications..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRecordMutation.isPending}>
                  {createRecordMutation.isPending ? "Creating..." : "Create Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {recordTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Loading medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No medical records found</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{record.patientName}</h3>
                      <Badge variant="outline">{record.recordType}</Badge>
                    </div>
                    <p className="text-slate-600">{record.diagnosis}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(record.recordDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{record.doctorName}</span>
                      </div>
                    </div>
                    {/* Vital Signs */}
                    <div className="flex items-center space-x-4 text-sm">
                      {record.bloodPressure && (
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{record.bloodPressure}</span>
                        </div>
                      )}
                      {record.bloodSugar && (
                        <div className="flex items-center space-x-1">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span>{record.bloodSugar} mg/dL</span>
                        </div>
                      )}
                      {record.temperature && (
                        <div className="flex items-center space-x-1">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span>{record.temperature}°F</span>
                        </div>
                      )}
                      {record.bloodGroup && (
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4 text-purple-500" />
                          <span>{record.bloodGroup}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteRecordMutation.mutate(record.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}