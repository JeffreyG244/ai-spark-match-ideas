import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Save, Heart } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { toast } from '@/hooks/use-toast';
const CompatibilityQuestions = ({ questionAnswers, handleQuestionAnswer, onSaveAnswers, isSaving }) => {
    const { validateContent } = useSecurityValidation();
    const handleSecureAnswerSelection = async (questionId, answer) => {
        // Security validation for answer content
        const validation = await validateContent(answer, 'answer');
        if (!validation.allowed) {
            toast({
                title: 'Invalid Answer',
                description: validation.reason || 'Answer contains inappropriate content',
                variant: 'destructive'
            });
            return;
        }
        handleQuestionAnswer(questionId, answer);
    };
    const answeredCount = Object.keys(questionAnswers).length;
    const totalQuestions = compatibilityQuestions.length;
    const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600"/>
          <h3 className="text-lg font-semibold">Compatibility Questions</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          {answeredCount}/{totalQuestions} Complete
        </Badge>
      </div>

      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-purple-600"/>
          <span className="text-sm font-medium text-purple-700">
            Progress: {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }}/>
        </div>
      </div>

      <div className="space-y-8">
        {compatibilityQuestions.map((question) => (<Card key={question.id} className="border-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-gray-800">
                {question.id}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={questionAnswers[question.id] || ''} onValueChange={(value) => handleSecureAnswerSelection(question.id, value)} className="space-y-3">
                {question.options.map((option, index) => (<div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${question.id}-option${index}`} className="text-purple-600"/>
                    <Label htmlFor={`q${question.id}-option${index}`} className="text-sm leading-relaxed cursor-pointer hover:text-purple-700 transition-colors">
                      {option}
                    </Label>
                  </div>))}
              </RadioGroup>
            </CardContent>
          </Card>))}
      </div>

      <div className="flex justify-center pt-6">
        <Button onClick={onSaveAnswers} disabled={isSaving || answeredCount === 0} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg font-medium transition-colors">
          {isSaving ? (<>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving Answers...
            </>) : (<>
              <Save className="h-4 w-4 mr-2"/>
              Save Compatibility Answers
            </>)}
        </Button>
      </div>
    </div>);
};
export default CompatibilityQuestions;
