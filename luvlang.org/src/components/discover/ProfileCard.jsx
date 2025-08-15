import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
const ProfileCard = ({ user, swipeDirection, onDragEnd, cardIndex }) => {
    return (<motion.div key={cardIndex} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{
            scale: 0.9,
            opacity: 0,
            x: swipeDirection === 'like' ? 300 : swipeDirection === 'pass' ? -300 : 0,
            rotate: swipeDirection === 'like' ? 15 : swipeDirection === 'pass' ? -15 : 0
        }} transition={{
            duration: 0.3,
            ease: "easeOut"
        }} drag="x" dragConstraints={{ left: -50, right: 50 }} dragElastic={0.2} onDragEnd={onDragEnd} whileDrag={{
            rotate: 5,
            scale: 1.02,
            cursor: 'grabbing',
            zIndex: 10
        }} className="absolute w-full cursor-grab active:cursor-grabbing">
      <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 overflow-hidden">
            <img src={user.photos && user.photos.length > 0 ? user.photos[0] : "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" onError={(e) => {
            const target = e.currentTarget;
            target.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
        }}/>
          </div>
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl">{user.firstName} {user.lastName}</span>
            <Badge className="bg-purple-100 text-purple-800">
              {Math.floor(Math.random() * 20) + 20} years
            </Badge>
          </CardTitle>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1"/>
            <span>{Math.floor(Math.random() * 10) + 1} miles away</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {user.bio || 'No bio available'}
          </p>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Core Values</h4>
            <div className="flex flex-wrap gap-1">
              {(user.values || 'No values listed').split(', ').map((value, i) => (<Badge key={i} variant="outline" className="text-xs border-purple-300 text-purple-700">
                  {value.trim()}
                </Badge>))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Green Flags</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{user.green_flags || 'No green flags listed'}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>);
};
export default ProfileCard;
