import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
const LegalFooter = () => {
    return (<Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="font-bold text-gray-900 mb-2">Legal Questions?</h3>
          <p className="text-gray-600 mb-4">
            For questions about our legal policies or to report concerns, contact our legal team.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="mailto:legal@luvlang.com" className="text-purple-600 hover:text-purple-800 font-medium">
              legal@luvlang.com
            </a>
            <span className="text-gray-400">|</span>
            <Link to="/contact" className="text-purple-600 hover:text-purple-800 font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>);
};
export default LegalFooter;
