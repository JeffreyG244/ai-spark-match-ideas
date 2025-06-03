
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Save, Heart } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';

interface CompatibilityQuestionsProps {
  questionAnswers: Record<number, string>;
  handleQuestionAnswer: (questionId: number, answer: string) => void;
  onSaveAnswers: () => void;
  isSaving: boolean;
}

const CompatibilityQuestions = ({ 
  questionAnswers, 
  handleQuestionAnswer, 
  onSaveAnswers, 
  isSaving 
}: CompatibilityQuestionsProps) => {
  const answeredQuestions = Object.keys(questionAnswers).length;
  const totalQuestions = compatibilityQuestions.length;
  const compatibilityScore = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div className="space-y-8">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-800">AI Compatibility Matching</h3>
            <p className="text-sm text-blue-600">
              Answer these questions to improve your match accuracy and find deeper connections
            </p>
          </div>
        </div>
      </div>

      {/* Professional Statement */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-4">
          <Heart className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">Maximize Your Match Potential</h3>
            <p className="text-purple-700 leading-relaxed">
              The more thoughtfully and authentically you respond to these questions, the more precisely our AI can identify your ideal match. Detailed, honest answers unlock deeper compatibility insights and connect you with someone who truly aligns with your values and relationship goals.
            </p>
          </div>
        </div>
      </div>

      {compatibilityQuestions.map((question) => (
        <Card key={question.id} className="border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800">
              {question.id}. {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={questionAnswers[question.id] || ''}
              onValueChange={(value) => handleQuestionAnswer(question.id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-start space-x-2 py-2">
                  <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                  <Label 
                    htmlFor={`q${question.id}-${index}`} 
                    className="text-sm leading-relaxed cursor-pointer flex-1"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Questions answered: {answeredQuestions} of {totalQuestions}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge 
              className={`${answeredQuestions === totalQuestions ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
            >
              {answeredQuestions === totalQuestions ? 'Complete!' : 'In Progress'}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              Compatibility Score: {compatibilityScore}%
            </Badge>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={onSaveAnswers}
            disabled={isSaving || answeredQuestions === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Answers...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Compatibility Answers
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityQuestions;
