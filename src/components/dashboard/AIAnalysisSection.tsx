import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

const AIAnalysisSection = () => {
  const { analysisResult, loading, error, triggerAnalysis, isAnalysisComplete, hasAnalysis } = useAIAnalysis();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            Loading analysis results...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Error loading analysis: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnalysis) {
    return (
      <Card className="bg-gradient-to-br from-love-primary/10 to-love-secondary/10 border-love-primary/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-love-text">
            <div className="w-10 h-10 bg-gradient-to-br from-love-primary to-love-secondary rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-love-text-light">
            Get personalized compatibility insights and match recommendations based on your profile.
          </p>
          <Button 
            onClick={triggerAnalysis} 
            disabled={loading}
            className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 
              text-white font-semibold px-6 py-2 rounded-xl shadow-lg shadow-love-primary/30 
              hover:shadow-xl hover:shadow-love-primary/40 transition-all duration-300"
          >
            {loading ? 'Starting Analysis...' : 'Start AI Analysis'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (analysisResult?.processing_status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {isAnalysisComplete && analysisResult?.compatibility_score && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.round((analysisResult.compatibility_score || 0) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Compatibility Score</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.personality_analysis && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Personality Insights
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {JSON.stringify(analysisResult.personality_analysis, null, 2)}
                  </div>
                </div>
              )}

              {analysisResult.match_recommendations && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Match Recommendations
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {JSON.stringify(analysisResult.match_recommendations, null, 2)}
                  </div>
                </div>
              )}
            </div>

            {analysisResult.processed_at && (
              <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                Analysis completed: {new Date(analysisResult.processed_at).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {!isAnalysisComplete && analysisResult?.processing_status === 'pending' && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">AI Analysis in Progress</p>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your profile to provide personalized insights. This usually takes a few minutes.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={triggerAnalysis} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Reprocessing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAnalysisSection;