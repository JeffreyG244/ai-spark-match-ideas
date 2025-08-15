import React from 'react';
const PhotoUploadGuidelines = ({ photoCount }) => {
    return (<>
      {/* Upload Guidelines */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-800 mb-2">Photo Guidelines</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Upload 3-6 clear, recent photos of yourself</li>
          <li>• Include a mix of close-up and full-body shots</li>
          <li>• Show your interests and personality</li>
          <li>• Avoid group photos where you're hard to identify</li>
          <li>• Maximum file size: 5MB per photo</li>
        </ul>
      </div>

      {/* Completion Status */}
      {photoCount >= 3 && (<div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 font-medium">
            ✅ Great! You have {photoCount} photos uploaded
          </p>
        </div>)}
    </>);
};
export default PhotoUploadGuidelines;
