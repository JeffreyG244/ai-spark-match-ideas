
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Users, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { diverseUsersData } from '@/data/diverseUsersData';
import { motion, AnimatePresence } from 'framer-motion';

const Discover = () => {
  const { signOut } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});

  const handleSwipe = (direction: 'like' | 'pass', userIndex: number) => {
    setSwipeDirection(direction);
    
    // Add a small delay for animation, then move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    const userIndex = currentIndex;
    
    if (info.offset.x > threshold) {
      handleSwipe('like', userIndex);
    } else if (info.offset.x < -threshold) {
      handleSwipe('pass', userIndex);
    }
  };

  const handleImageLoad = (userId: string) => {
    setImageLoaded(prev => ({ ...prev, [userId]: true }));
  };

  const currentUser = diverseUsersData[currentIndex];
  const hasMoreProfiles = currentIndex < diverseUsersData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover New Connections</h1>
          <p className="text-gray-600">Swipe right to like, left to pass</p>
        </div>

        {/* Swipe Card Container */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md h-[600px]">
            {!hasMoreProfiles ? (
              <Card className="border-purple-200 p-8 text-center">
                <CardContent>
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No More Profiles</h3>
                  <p className="text-gray-600 mb-6">
                    You've seen all available profiles. Check back later for new connections!
                  </p>
                  <Link to="/matches">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      View Your Matches
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {currentUser && (
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ 
                      scale: 0.9, 
                      opacity: 0,
                      x: swipeDirection === 'like' ? 300 : swipeDirection === 'pass' ? -300 : 0,
                      rotate: swipeDirection === 'like' ? 15 : swipeDirection === 'pass' ? -15 : 0
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    drag="x"
                    dragConstraints={{ left: -50, right: 50 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ 
                      rotate: 5,
                      scale: 1.02,
                      cursor: 'grabbing',
                      zIndex: 10
                    }}
                    className="absolute w-full cursor-grab active:cursor-grabbing"
                    style={{ willChange: 'transform' }}
                  >
                    <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 shadow-xl overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 overflow-hidden relative">
                          {!imageLoaded[currentUser.id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                            </div>
                          )}
                          <img 
                            src={currentUser.photos[0]} 
                            alt={`${currentUser.firstName} ${currentUser.lastName}`}
                            className={`w-full h-full object-cover transition-opacity duration-500 ${
                              imageLoaded[currentUser.id] ? 'opacity-100' : 'opacity-0'
                            }`}
                            loading="eager"
                            onLoad={() => handleImageLoad(currentUser.id)}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
                              handleImageLoad(currentUser.id);
                            }}
                            style={{ backfaceVisibility: 'hidden' }}
                          />
                        </div>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-xl">{currentUser.firstName} {currentUser.lastName}</span>
                          <Badge className="bg-purple-100 text-purple-800">
                            {Math.floor(Math.random() * 20) + 20} years
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{Math.floor(Math.random() * 10) + 1} miles away</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {currentUser.bio}
                        </p>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Core Values</h4>
                          <div className="flex flex-wrap gap-1">
                            {currentUser.values.split(', ').map((value, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-purple-300 text-purple-700">
                                {value.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Green Flags</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{currentUser.greenFlags}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Action Buttons */}
            {hasMoreProfiles && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('pass', currentIndex)}
                  className="w-14 h-14 bg-white border-2 border-red-300 rounded-full flex items-center justify-center shadow-lg hover:border-red-400 transition-colors"
                >
                  <X className="h-6 w-6 text-red-500" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('like', currentIndex)}
                  className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Heart className="h-6 w-6 text-white" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Swipe Instructions */}
        {hasMoreProfiles && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              💡 Drag the card or use the buttons below to interact
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
