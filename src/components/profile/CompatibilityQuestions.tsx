
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';

interface CompatibilityQuestionsProps {
  questionAnswers: Record<number, string>;
  handleQuestionAnswer: (questionId: number, answer: string) => void;
}

const CompatibilityQuestions = ({ questionAnswers, handleQuestionAnswer }: CompatibilityQuestionsProps) => {
  const answeredQuestions = Object.keys(questionAnswers).length;
  const totalQuestions = compatibilityQuestions.length;

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

      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">
          Questions answered: {answeredQuestions} of {totalQuestions}
        </p>
        <Badge 
          className={`${answeredQuestions === totalQuestions ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
        >
          {answeredQuestions === totalQuestions ? 'Complete!' : 'In Progress'}
        </Badge>
      </div>
    </div>
  );
};

export default CompatibilityQuestions;
