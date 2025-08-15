import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Zap, FileText, CheckCircle, AlertTriangle, XCircle, Play, Loader2 } from 'lucide-react';
import { PreLaunchSecurityAudit } from '@/services/security/PreLaunchSecurityAudit';
import { toast } from 'sonner';
const PreLaunchDashboard = () => {
    const [securityResults, setSecurityResults] = useState([]);
    const [performanceResults, setPerformanceResults] = useState([]);
    const [complianceResults, setComplianceResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const runAllAudits = async () => {
        setIsRunning(true);
        try {
            toast.info('Running comprehensive pre-launch audit...');
            // Run all audits concurrently
            const [security, performance, compliance] = await Promise.all([
                PreLaunchSecurityAudit.runCompleteSecurityAudit(),
                PreLaunchSecurityAudit.runPerformanceAudit(),
                PreLaunchSecurityAudit.runComplianceAudit()
            ]);
            setSecurityResults(security);
            setPerformanceResults(performance);
            setComplianceResults(compliance);
            setHasRun(true);
            toast.success('Pre-launch audit completed!');
        }
        catch (error) {
            console.error('Audit failed:', error);
            toast.error('Audit failed. Please try again.');
        }
        finally {
            setIsRunning(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pass':
            case 'good':
                return <CheckCircle className="w-4 h-4 text-green-500"/>;
            case 'warning':
            case 'needs_improvement':
                return <AlertTriangle className="w-4 h-4 text-yellow-500"/>;
            case 'fail':
            case 'poor':
                return <XCircle className="w-4 h-4 text-red-500"/>;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-500"/>;
        }
    };
    const getStatusBadge = (status) => {
        const variant = status === 'pass' || status === 'good' ? 'default' :
            status === 'warning' || status === 'needs_improvement' ? 'secondary' :
                'destructive';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
    };
    const calculateOverallScore = () => {
        const allResults = [...securityResults, ...complianceResults];
        if (allResults.length === 0)
            return 0;
        const scores = allResults.map(result => {
            switch (result.status) {
                case 'pass': return 100;
                case 'warning': return 70;
                case 'fail': return 0;
                default: return 50;
            }
        });
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };
    const isReadyForLaunch = () => {
        const criticalFails = [...securityResults, ...complianceResults].filter(result => result.status === 'fail');
        return criticalFails.length === 0;
    };
    return (<div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Pre-Launch Security & Performance Audit</h1>
        <p className="text-gray-600">Comprehensive checks before going live</p>
        
        <Button onClick={runAllAudits} disabled={isRunning} size="lg" className="bg-purple-600 hover:bg-purple-700">
          {isRunning ? (<>
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
              Running Audit...
            </>) : (<>
              <Play className="w-4 h-4 mr-2"/>
              Run Complete Audit
            </>)}
        </Button>
      </div>

      {hasRun && (<div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateOverallScore()}%</div>
              <p className="text-xs text-muted-foreground">
                Security & Compliance Score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Launch Readiness</CardTitle>
              {isReadyForLaunch() ? (<CheckCircle className="h-4 w-4 text-green-500"/>) : (<XCircle className="h-4 w-4 text-red-500"/>)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isReadyForLaunch() ? 'Ready' : 'Not Ready'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isReadyForLaunch() ? 'All critical checks passed' : 'Critical issues found'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {securityResults.length + performanceResults.length + complianceResults.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Security, Performance & Compliance
              </p>
            </CardContent>
          </Card>
        </div>)}

      {hasRun && (<Tabs defaultValue="security" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4"/>
              Security
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4"/>
              Performance
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <FileText className="w-4 h-4"/>
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Audit Results</CardTitle>
                <CardDescription>
                  Critical security checks for your dating platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {securityResults.map((result, index) => (<div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="space-y-1">
                        <p className="font-medium">{result.message}</p>
                        <p className="text-sm text-gray-600">{result.category}</p>
                        {result.recommendation && (<p className="text-sm text-blue-600">{result.recommendation}</p>)}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Audit Results</CardTitle>
                <CardDescription>
                  Performance metrics and optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceResults.map((result, index) => (<div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="space-y-1">
                        <p className="font-medium">{result.metric}: {result.value}{result.metric.includes('Time') ? 'ms' : result.metric.includes('Memory') ? 'MB' : 'KB'}</p>
                        <p className="text-sm text-gray-600">Threshold: {result.threshold}{result.metric.includes('Time') ? 'ms' : result.metric.includes('Memory') ? 'MB' : 'KB'}</p>
                        {result.recommendation && (<p className="text-sm text-blue-600">{result.recommendation}</p>)}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Audit Results</CardTitle>
                <CardDescription>
                  Legal and regulatory compliance checks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {complianceResults.map((result, index) => (<div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="space-y-1">
                        <p className="font-medium">{result.message}</p>
                        <p className="text-sm text-gray-600">{result.category}</p>
                        {result.recommendation && (<p className="text-sm text-blue-600">{result.recommendation}</p>)}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>)}

      {hasRun && isReadyForLaunch() && (<Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500"/>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Ready for Launch!</h3>
                <p className="text-green-700">All critical security and compliance checks have passed. Your dating platform is ready to go live.</p>
              </div>
            </div>
          </CardContent>
        </Card>)}
    </div>);
};
export default PreLaunchDashboard;
