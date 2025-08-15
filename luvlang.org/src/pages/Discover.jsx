import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import NavigationTabs from '@/components/navigation/NavigationTabs';
import SwipeableDailyMatch from '@/components/discover/SwipeableDailyMatch';
import DiscoverHeader from '@/components/discover/DiscoverHeader';
import EmptyState from '@/components/discover/EmptyState';
export default function Discover() {
    const { user } = useAuth();
    const { matches, isLoading, loadMatches } = useMatches();
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [isTriggering, setIsTriggering] = useState(false);
    const [showN8NResults, setShowN8NResults] = useState(false);
    useEffect(() => {
        if (user) {
            loadMatches();
        }
    }, [user]);
    const triggerN8NWorkflow = async () => {
        setIsTriggering(true);
        try {
            const response = await fetch('http://localhost:5678/webhook/luvlang-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                    action: 'discover_matches',
                    timestamp: new Date().toISOString(),
                    preferences: {
                        age_range: [25, 35],
                        distance: 50,
                        enhanced_matching: true
                    }
                })
            });
            if (response.ok) {
                const result = await response.json();
                console.log('N8N discover workflow triggered:', result);
                setShowN8NResults(true);
                // Reload matches after workflow completes
                setTimeout(() => {
                    loadMatches();
                }, 2000);
            }
        }
        catch (error) {
            console.error('N8N workflow failed:', error);
        }
        finally {
            setIsTriggering(false);
        }
    };
    const handleSwipe = (direction, matchId) => {
        console.log(`Swiped ${direction} on match ${matchId}`);
        if (direction === 'right') {
            // Handle like/match
            // This would typically update the database
        }
        // Move to next match
        if (currentMatchIndex < matches.length - 1) {
            setCurrentMatchIndex(currentMatchIndex + 1);
        }
        else {
            setCurrentMatchIndex(0);
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading potential matches...</p>
        </div>
      </div>);
    }
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6 space-y-6">
        <DiscoverHeader />

        {/* N8N Workflow Integration Card */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-600"/>
              AI-Powered Discovery
            </CardTitle>
            <p className="text-sm text-gray-600">
              Trigger advanced matching algorithms for personalized results
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={triggerN8NWorkflow} disabled={isTriggering} className="bg-purple-600 hover:bg-purple-700">
                {isTriggering ? (<>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>) : (<>
                    <Zap className="h-4 w-4 mr-2"/>
                    Find My Perfect Matches
                  </>)}
              </Button>
              
              <Link to="/matches">
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2"/>
                  View All Matches ({matches.length})
                </Button>
              </Link>
            </div>

            {showN8NResults && (<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✨ AI matching workflow completed! New matches have been generated based on your preferences.
                </p>
              </div>)}
          </CardContent>
        </Card>

        {/* Swipeable Match Cards */}
        {matches.length > 0 ? (<div className="space-y-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Discover Your Perfect Match
              </h2>
              <p className="text-gray-600">
                Swipe right to like, left to pass
              </p>
            </motion.div>

            <div className="max-w-md mx-auto">
              {matches[currentMatchIndex] && (<SwipeableDailyMatch match={matches[currentMatchIndex]} onSwipe={handleSwipe}/>)}
            </div>

            <div className="text-center">
              <Badge variant="secondary">
                {currentMatchIndex + 1} of {matches.length} matches
              </Badge>
            </div>
          </div>) : (<EmptyState title="No matches yet" description="Trigger the AI matching workflow to find your perfect matches!" action={<Button onClick={triggerN8NWorkflow} disabled={isTriggering}>
                <Zap className="h-4 w-4 mr-2"/>
                Start Matching
              </Button>}/>)}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Link to="/daily-matches" className="block text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2"/>
                <h3 className="font-semibold mb-1">Daily Matches</h3>
                <p className="text-sm text-gray-600">Curated matches just for you</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Link to="/messages" className="block text-center">
                <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2"/>
                <h3 className="font-semibold mb-1">Messages</h3>
                <p className="text-sm text-gray-600">Chat with your matches</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Link to="/matches" className="block text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2"/>
                <h3 className="font-semibold mb-1">All Matches</h3>
                <p className="text-sm text-gray-600">See everyone who likes you</p>
              </Link>
            </CardContent>
          </Card>
        </div>

        <NavigationTabs />
      </div>
    </motion.div>);
}
