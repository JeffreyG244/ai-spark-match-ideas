import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Heart, 
  Users, 
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react';

const AnalysisResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { analysisResult, loading, error, triggerAnalysis } = useAIAnalysis();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // If no analysis exists, trigger one
    if (!analysisResult && !loading) {
      triggerAnalysis();
    }
  }, [user, analysisResult, loading, triggerAnalysis, navigate]);

  const getCompatibilityLevel = (score: number) => {
    if (score >= 85) return { label: 'Exceptional', color: 'text-love-primary', bg: 'bg-love-primary/10' };
    if (score >= 75) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-400/10' };
    if (score >= 65) return { label: 'Very Good', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (score >= 55) return { label: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { label: 'Average', color: 'text-orange-400', bg: 'bg-orange-400/10' };
  };

  const formatPersonalityTraits = (analysis: any) => {
    if (!analysis || typeof analysis !== 'object') return [];
    
    const traits = [];
    if (analysis.personality_type) traits.push({ label: 'Personality Type', value: analysis.personality_type });
    if (analysis.communication_style) traits.push({ label: 'Communication Style', value: analysis.communication_style });
    if (analysis.emotional_intelligence) traits.push({ label: 'Emotional Intelligence', value: `${analysis.emotional_intelligence}/10` });
    if (analysis.leadership_style) traits.push({ label: 'Leadership Style', value: analysis.leadership_style });
    if (analysis.core_values) traits.push({ label: 'Core Values', value: Array.isArray(analysis.core_values) ? analysis.core_values.join(', ') : analysis.core_values });
    
    return traits;
  };

  const formatMatchRecommendations = (recommendations: any) => {
    if (!recommendations || typeof recommendations !== 'object') return [];
    
    const formatted = [];
    if (recommendations.ideal_match_traits) formatted.push({ title: 'Ideal Match Traits', items: Array.isArray(recommendations.ideal_match_traits) ? recommendations.ideal_match_traits : [recommendations.ideal_match_traits] });
    if (recommendations.compatibility_factors) formatted.push({ title: 'Key Compatibility Factors', items: Array.isArray(recommendations.compatibility_factors) ? recommendations.compatibility_factors : [recommendations.compatibility_factors] });
    if (recommendations.relationship_insights) formatted.push({ title: 'Relationship Insights', items: Array.isArray(recommendations.relationship_insights) ? recommendations.relationship_insights : [recommendations.relationship_insights] });
    
    return formatted;
  };

  if (loading && !analysisResult) {
    return (
      <div className="min-h-screen bg-love-background">
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-love-border bg-love-card text-love-text">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-love-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-love-primary animate-pulse" />
                </div>
                <CardTitle className="text-3xl font-bold mb-2">Analyzing Your Profile</CardTitle>
                <p className="text-love-text-light">Our AI is processing your profile to create your personalized compatibility analysis...</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-love-primary animate-spin" />
                    <span className="text-love-text-light">Processing your personality profile...</span>
                  </div>
                  <Progress value={33} className="h-2" />
                  
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-love-secondary animate-pulse" />
                    <span className="text-love-text-light">Analyzing compatibility factors...</span>
                  </div>
                  <Progress value={66} className="h-2" />
                  
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-love-accent animate-bounce" />
                    <span className="text-love-text-light">Generating match recommendations...</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                
                <div className="bg-love-surface/50 rounded-lg p-4 text-center">
                  <p className="text-love-text-muted text-sm">
                    This usually takes 30-60 seconds. We're creating a comprehensive analysis tailored specifically for you.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-love-background">
        <div className="container mx-auto p-6">
          <Card className="border-love-border bg-love-card text-love-text max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4">Analysis Error</h2>
              <p className="text-love-text-light mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-love-primary hover:bg-love-primary/80"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!analysisResult || analysisResult.processing_status !== 'completed') {
    return (
      <div className="min-h-screen bg-love-background">
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-love-border bg-love-card text-love-text">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-love-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-love-primary animate-pulse" />
                </div>
                <CardTitle className="text-3xl font-bold mb-2">Analysis In Progress</CardTitle>
                <p className="text-love-text-light">Status: {analysisResult?.processing_status || 'Initializing'}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-love-primary mx-auto mb-4"></div>
                <p className="text-love-text-muted">Please wait while we complete your analysis...</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const compatibilityScore = analysisResult.compatibility_score || 0;
  const compatibilityLevel = getCompatibilityLevel(compatibilityScore);
  const personalityTraits = formatPersonalityTraits(analysisResult.personality_analysis);
  const matchRecommendations = formatMatchRecommendations(analysisResult.match_recommendations);

  return (
    <div className="min-h-screen bg-love-background">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-love-primary to-love-secondary rounded-full flex items-center justify-center shadow-2xl"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-love-text">Your Personal Analysis</h1>
            <p className="text-xl text-love-text-light max-w-2xl mx-auto">
              Discover your unique compatibility profile and what makes you an exceptional match
            </p>
          </div>

          {/* Main Compatibility Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="border-love-border bg-gradient-to-br from-love-card to-love-surface text-love-text">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <BarChart3 className="h-6 w-6 text-love-primary" />
                  Your Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <div className="text-6xl font-bold text-love-primary mb-2">
                    {Math.round(compatibilityScore)}
                  </div>
                  <div className="text-lg text-love-text-light">out of 100</div>
                  <Badge className={`${compatibilityLevel.bg} ${compatibilityLevel.color} border-none text-lg px-4 py-1 mt-4`}>
                    {compatibilityLevel.label} Profile
                  </Badge>
                </div>
                
                <div className="max-w-md mx-auto">
                  <Progress value={compatibilityScore} className="h-3" />
                </div>
                
                <p className="text-love-text-light max-w-lg mx-auto">
                  This score represents your overall dating market appeal and compatibility potential based on your profile, personality, and preferences.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personality Analysis */}
          {personalityTraits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card className="border-love-border bg-love-card text-love-text">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Brain className="h-6 w-6 text-love-secondary" />
                    Your Personality Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personalityTraits.map((trait, index) => (
                      <motion.div
                        key={trait.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="bg-love-surface/50 rounded-lg p-4"
                      >
                        <div className="text-sm font-medium text-love-text-muted mb-1">{trait.label}</div>
                        <div className="text-love-text font-semibold">{trait.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Match Recommendations */}
          {matchRecommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Card className="border-love-border bg-love-card text-love-text">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-love-accent" />
                    Your Match Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {matchRecommendations.map((section, index) => (
                    <div key={section.title}>
                      <h3 className="text-lg font-semibold text-love-text mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-love-primary" />
                        {section.title}
                      </h3>
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + index * 0.1 + itemIndex * 0.05 }}
                            className="flex items-start gap-3 bg-love-surface/30 rounded-lg p-3"
                          >
                            <div className="w-2 h-2 bg-love-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-love-text-light">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                      {index < matchRecommendations.length - 1 && <Separator className="mt-6 bg-love-border" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/80 hover:to-love-secondary/80 text-white font-semibold py-3 px-8 text-lg"
            >
              <Heart className="h-5 w-5 mr-2" />
              Start Finding Matches
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="border-love-border text-love-text hover:bg-love-surface/50 py-3 px-8 text-lg"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>
          </motion.div>

          {/* Technical Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-love-border bg-love-surface/30 text-love-text">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Technical Analysis Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold">Analysis ID:</span> {analysisResult.id}
                    </div>
                    <div>
                      <span className="font-semibold">Processed At:</span> {new Date(analysisResult.processed_at || analysisResult.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Raw Personality Data:</span>
                      <pre className="mt-2 p-4 bg-love-card rounded-lg text-sm overflow-auto">
                        {JSON.stringify(analysisResult.personality_analysis, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="font-semibold">Raw Recommendations:</span>
                      <pre className="mt-2 p-4 bg-love-card rounded-lg text-sm overflow-auto">
                        {JSON.stringify(analysisResult.match_recommendations, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisResults;