import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, Plus, Trash2, AlertTriangle, Crown, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RoleManagementService } from '@/services/security/RoleManagementService';
const RoleManager = () => {
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');
    useEffect(() => {
        checkAdminStatus();
        loadUserRoles();
    }, []);
    const checkAdminStatus = async () => {
        try {
            const adminStatus = await RoleManagementService.checkUserRole('admin');
            setIsAdmin(adminStatus);
        }
        catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        }
    };
    const loadUserRoles = async () => {
        try {
            setLoading(true);
            // Get user roles and join with profiles table for email
            const { data: roles, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('granted_at', { ascending: false });
            if (error) {
                throw error;
            }
            if (roles && roles.length > 0) {
                // Get user emails from profiles table
                const userIds = roles.map(role => role.user_id);
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('user_id, email')
                    .in('user_id', userIds);
                if (profilesError) {
                    console.error('Error loading profiles:', profilesError);
                }
                const rolesWithEmails = roles.map(role => ({
                    ...role,
                    user_email: profiles?.find(p => p.user_id === role.user_id)?.email || 'Unknown'
                }));
                setUserRoles(rolesWithEmails);
            }
            else {
                setUserRoles([]);
            }
        }
        catch (error) {
            console.error('Failed to load user roles:', error);
            setUserRoles([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAssignRole = async () => {
        if (!newUserEmail || !newUserRole)
            return;
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('email', newUserEmail)
                .single();
            if (profileError || !profile) {
                alert('User not found with that email address.');
                return;
            }
            await RoleManagementService.assignUserRole(profile.user_id, newUserRole);
            await loadUserRoles();
            setNewUserEmail('');
            setNewUserRole('user');
        }
        catch (error) {
            console.error('Failed to assign role:', error);
            alert('Failed to assign role. Please try again.');
        }
    };
    const handleRevokeRole = async (roleId, userId) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('id', roleId);
            if (error) {
                throw error;
            }
            await loadUserRoles();
        }
        catch (error) {
            console.error('Failed to revoke role:', error);
            alert('Failed to revoke role. Please try again.');
        }
    };
    const getRoleColor = (role) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-600 text-white';
            case 'admin': return 'bg-red-600 text-white';
            case 'moderator': return 'bg-blue-600 text-white';
            case 'user': return 'bg-green-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };
    const getRoleIcon = (role) => {
        switch (role) {
            case 'super_admin': return <Crown className="h-4 w-4"/>;
            case 'admin': return <Shield className="h-4 w-4"/>;
            case 'moderator': return <UserCheck className="h-4 w-4"/>;
            default: return <Users className="h-4 w-4"/>;
        }
    };
    if (!isAdmin) {
        return (<div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            You don't have permission to manage user roles.
          </AlertDescription>
        </Alert>
      </div>);
    }
    if (loading) {
        return (<div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading role management...</span>
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-green-600"/>
          Role Management
        </h1>
      </div>

      {/* Assign New Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5"/>
            Assign Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">User Email</label>
              <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" className="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="border rounded px-3 py-2">
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <Button onClick={handleAssignRole}>
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            Current User Roles ({userRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userRoles.map((userRole) => (<div key={userRole.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge className={getRoleColor(userRole.role)}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(userRole.role)}
                      {userRole.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </Badge>
                  <div>
                    <div className="font-medium">{userRole.user_email}</div>
                    <div className="text-sm text-gray-500">
                      User ID: {userRole.user_id.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Granted: {new Date(userRole.granted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <Button size="sm" variant="destructive" onClick={() => handleRevokeRole(userRole.id, userRole.user_id)}>
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>))}
            
            {userRoles.length === 0 && (<div className="text-center py-8 text-gray-500">
                No user roles assigned yet.
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default RoleManager;
