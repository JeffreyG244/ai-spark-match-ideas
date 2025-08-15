import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Info } from 'lucide-react';
const CookieConsent = () => {
    const [showConsent, setShowConsent] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);
    const acceptAll = () => {
        localStorage.setItem('cookie-consent', JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString()
        }));
        setShowConsent(false);
    };
    const acceptNecessary = () => {
        localStorage.setItem('cookie-consent', JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString()
        }));
        setShowConsent(false);
    };
    if (!showConsent)
        return null;
    return (<div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto border-2 border-blue-200 bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1"/>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Cookie Consent</h3>
              <p className="text-gray-600 mb-4">
                We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>
              
              {showDetails && (<div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Cookie Types:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Necessary:</strong> Essential for website functionality (authentication, security)</li>
                    <li><strong>Analytics:</strong> Help us understand how visitors use our site</li>
                    <li><strong>Marketing:</strong> Used to show relevant advertisements</li>
                  </ul>
                </div>)}
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptAll} className="bg-blue-600 hover:bg-blue-700">
                  Accept All
                </Button>
                <Button onClick={acceptNecessary} variant="outline">
                  Necessary Only
                </Button>
                <Button onClick={() => setShowDetails(!showDetails)} variant="ghost" size="sm" className="text-blue-600">
                  <Info className="h-4 w-4 mr-1"/>
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
            <Button onClick={acceptNecessary} variant="ghost" size="sm" className="flex-shrink-0">
              <X className="h-4 w-4"/>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default CookieConsent;
