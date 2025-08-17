import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Role schema
const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.object({
    viewPatients: z.boolean().default(false),
    editPatients: z.boolean().default(false),
    viewAppointments: z.boolean().default(false),
    editAppointments: z.boolean().default(false),
    viewInventory: z.boolean().default(false),
    editInventory: z.boolean().default(false),
    viewSales: z.boolean().default(false),
    editSales: z.boolean().default(false),
    viewReports: z.boolean().default(false),
    editReports: z.boolean().default(false),
    manageStaff: z.boolean().default(false),
    systemSettings: z.boolean().default(false),
    manageRoles: z.boolean().default(false),
  }),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RoleManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: {
        viewPatients: false,
        editPatients: false,
        viewAppointments: false,
        editAppointments: false,
        viewInventory: false,
        editInventory: false,
        viewSales: false,
        editSales: false,
        viewReports: false,
        editReports: false,
        manageStaff: false,
        systemSettings: false,
        manageRoles: false,
      },
    },
  });

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoleFormData }) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setEditingRole(null);
      form.reset();
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    });
  };

  const permissionLabels = {
    viewPatients: "View Patients",
    editPatients: "Edit Patients",
    viewAppointments: "View Appointments",
    editAppointments: "Edit Appointments",
    viewInventory: "View Inventory",
    editInventory: "Edit Inventory",
    viewSales: "View Sales",
    editSales: "Edit Sales",
    viewReports: "View Reports",
    editReports: "Edit Reports",
    manageStaff: "Manage Staff",
    systemSettings: "System Settings",
    manageRoles: "Manage Roles",
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-role">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter role name" 
                          data-testid="input-role-name"
                          {...field} 
                        />
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
                          placeholder="Enter role description" 
                          data-testid="textarea-role-description"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel className="text-base font-semibold">Permissions</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`permissions.${key}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`checkbox-${key}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createRoleMutation.isPending}
                    data-testid="button-save-role"
                  >
                    {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role: Role) => (
          <Card key={role.id} data-testid={`card-role-${role.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {role.name}
                    {role.isSystemRole && (
                      <Badge variant="secondary">System</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                {!role.isSystemRole && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    data-testid={`button-edit-${role.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  Permissions ({Object.values(role.permissions).filter(Boolean).length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions)
                    .filter(([_, value]) => value)
                    .slice(0, 3)
                    .map(([key]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {permissionLabels[key as keyof typeof permissionLabels]}
                      </Badge>
                    ))}
                  {Object.values(role.permissions).filter(Boolean).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.values(role.permissions).filter(Boolean).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role permissions and details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter role name" 
                        data-testid="input-edit-role-name"
                        {...field} 
                      />
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
                        placeholder="Enter role description" 
                        data-testid="textarea-edit-role-description"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="text-base font-semibold">Permissions</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`permissions.${key}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid={`checkbox-edit-${key}`}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setEditingRole(null)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  data-testid="button-update-role"
                >
                  {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}