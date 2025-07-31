import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Camera,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    email: (user as any)?.email || "",
    phone: "",
    address: "",
    dateOfBirth: "",
    bio: ""
  });

  const { data: profileData } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: (user as any)?.email || "",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
      dateOfBirth: profileData?.dateOfBirth || "",
      bio: profileData?.bio || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateProfileMutation.isPending}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(user as any)?.profileImageUrl} />
                <AvatarFallback className="text-lg">
                  {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="mt-4">
              {(user as any)?.firstName} {(user as any)?.lastName}
            </CardTitle>
            <CardDescription>{(user as any)?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Role</span>
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Staff
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Member Since</span>
              <span className="text-sm font-medium">
                {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Last updated: {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString() : "Never"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-slate-50">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{formData.firstName || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-slate-50">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{formData.lastName || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded-md bg-slate-50">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{formData.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-slate-50">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{formData.phone || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-slate-50">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    {isEditing ? (
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-slate-50">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{formData.address || "Not set"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  {isEditing ? (
                    <textarea
                      className="w-full p-2 border rounded-md resize-none"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="p-2 border rounded-md bg-slate-50 min-h-[80px]">
                      <p className="text-sm">{formData.bio || "No bio added yet"}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-slate-500">Preferences settings coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}