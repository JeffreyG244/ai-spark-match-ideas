import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, CreditCard, UserX } from 'lucide-react';
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, description, type, requireConfirmText = false, confirmText = 'CONFIRM' }) => {
    const [inputText, setInputText] = useState('');
    const getIcon = () => {
        switch (type) {
            case 'delete':
                return <Trash2 className="h-6 w-6 text-red-600"/>;
            case 'payment':
                return <CreditCard className="h-6 w-6 text-blue-600"/>;
            case 'block':
                return <UserX className="h-6 w-6 text-orange-600"/>;
            default:
                return <AlertTriangle className="h-6 w-6 text-yellow-600"/>;
        }
    };
    const getActionClass = () => {
        switch (type) {
            case 'delete':
                return 'bg-red-600 hover:bg-red-700';
            case 'payment':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'block':
                return 'bg-orange-600 hover:bg-orange-700';
            default:
                return 'bg-yellow-600 hover:bg-yellow-700';
        }
    };
    const handleConfirm = () => {
        if (requireConfirmText && inputText !== confirmText) {
            return;
        }
        onConfirm();
        setInputText('');
        onClose();
    };
    const handleClose = () => {
        setInputText('');
        onClose();
    };
    return (<AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            {getIcon()}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
            {requireConfirmText && (<div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Type "{confirmText}" to confirm:
                </label>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder={confirmText}/>
              </div>)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className={getActionClass()} disabled={requireConfirmText && inputText !== confirmText}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>);
};
export default ConfirmationDialog;
