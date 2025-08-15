import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
const SecurityMonitor = () => {
    const { user } = useAuth();
    const [securityEvents, setSecurityEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user) {
            loadSecurityEvents();
        }
    }, [user]);
    const loadSecurityEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('security_events')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) {
                console.error('Error loading security events:', error);
                return;
            }
            // Convert the database response to match our interface
            const formattedEvents = (data || []).map(event => ({
                id: event.id.toString(), // Convert number to string
                event_type: event.event_type,
                severity: event.severity,
                details: event.details || '',
                created_at: event.created_at,
                ip_address: event.ip_address || undefined
            }));
            setSecurityEvents(formattedEvents);
        }
        catch (error) {
            console.error('Error loading security events:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getSeverityIcon = (severity) => {
        switch (severity.toLowerCase()) {
            case 'high':
            case 'critical':
                return <AlertTriangle className="h-4 w-4 text-red-500"/>;
            case 'medium':
                return <Shield className="h-4 w-4 text-yellow-500"/>;
            case 'low':
                return <CheckCircle className="h-4 w-4 text-green-500"/>;
            default:
                return <Clock className="h-4 w-4 text-gray-500"/>;
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading) {
        return (<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>);
    }
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600"/>
          Security Monitor
        </CardTitle>
        <p className="text-sm text-gray-600">Recent security events for your account</p>
      </CardHeader>
      <CardContent>
        {securityEvents.length === 0 ? (<div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2"/>
            <p className="text-gray-600">No security events recorded</p>
            <p className="text-sm text-gray-500">Your account is secure</p>
          </div>) : (<div className="space-y-3">
            {securityEvents.map((event) => (<div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {getSeverityIcon(event.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{event.event_type}</span>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{event.details}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3"/>
                    <span>{new Date(event.created_at).toLocaleString()}</span>
                    {event.ip_address && (<>
                        <span>•</span>
                        <span>IP: {event.ip_address}</span>
                      </>)}
                  </div>
                </div>
              </div>))}
          </div>)}
      </CardContent>
    </Card>);
};
export default SecurityMonitor;
