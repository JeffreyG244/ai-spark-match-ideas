
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain } from 'lucide-react';

const PERSONALITY_QUESTIONS = [
  {
    id: 'age',
    question: 'What is your age?',
    type: 'number',
    min: 18,
    max: 80,
    placeholder: 'Enter your age'
  },
  {
    id: 'gender',
    question: 'What is your gender?',
    type: 'select',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Non-binary', label: 'Non-binary' },
      { value: 'Other', label: 'Other' },
      { value: 'Prefer not to say', label: 'Prefer not to say' }
    ]
  },
  {
    id: 'sexual_orientation',
    question: 'What is your sexual orientation?',
    type: 'select',
    options: [
      { value: 'Straight', label: 'Straight' },
      { value: 'Gay', label: 'Gay' },
      { value: 'Lesbian', label: 'Lesbian' },
      { value: 'Bisexual', label: 'Bisexual' },
      { value: 'Pansexual', label: 'Pansexual' },
      { value: 'Asexual', label: 'Asexual' },
      { value: 'Questioning', label: 'Questioning' },
      { value: 'Other', label: 'Other' }
    ]
  },
  {
    id: 'partner_gender',
    question: 'What gender are you interested in?',
    type: 'select',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Non-binary', label: 'Non-binary' },
      { value: 'Any', label: 'Any gender' }
    ]
  },
  {
    id: 'partner_age_min',
    question: 'Minimum age preference for partner',
    type: 'number',
    min: 18,
    max: 80,
    placeholder: 'Minimum age'
  },
  {
    id: 'partner_age_max',
    question: 'Maximum age preference for partner',
    type: 'number',
    min: 18,
    max: 80,
    placeholder: 'Maximum age'
  },
  {
    id: 'location',
    question: 'What city are you located in?',
    type: 'text',
    placeholder: 'Enter your city'
  },
  {
    id: 'relationship_goals',
    question: 'What are you looking for?',
    type: 'select',
    options: [
      { value: 'Long-term relationship', label: 'Long-term relationship' },
      { value: 'Casual dating', label: 'Casual dating' },
      { value: 'Marriage', label: 'Marriage' },
      { value: 'Friendship', label: 'Friendship' },
      { value: 'Not sure yet', label: 'Not sure yet' }
    ]
  },
  {
    id: 'social_energy',
    question: 'How do you recharge your energy?',
    type: 'radio',
    options: [
      { value: 'alone', label: 'Quiet time alone or with close friends' },
      { value: 'social', label: 'Being around lots of people and social events' },
      { value: 'balanced', label: 'A mix of both depending on my mood' }
    ]
  },
  {
    id: 'decision_making',
    question: 'How do you typically make important decisions?',
    type: 'radio',
    options: [
      { value: 'logical', label: 'Logic, facts, and careful analysis' },
      { value: 'emotional', label: 'Gut feelings and emotional intelligence' },
      { value: 'collaborative', label: 'Discussing with trusted friends and family' }
    ]
  },
  {
    id: 'lifestyle_pace',
    question: 'What\'s your ideal lifestyle pace?',
    type: 'radio',
    options: [
      { value: 'adventurous', label: 'Fast-paced with lots of new experiences' },
      { value: 'balanced', label: 'Steady rhythm with occasional adventures' },
      { value: 'peaceful', label: 'Calm and predictable with deep routines' }
    ]
  },
  {
    id: 'conflict_style',
    question: 'How do you handle disagreements in relationships?',
    type: 'radio',
    options: [
      { value: 'direct', label: 'Address issues head-on with open communication' },
      { value: 'diplomatic', label: 'Find compromise and middle ground' },
      { value: 'space', label: 'Take time to cool down before discussing' }
    ]
  },
  {
    id: 'future_planning',
    question: 'How do you approach planning your future?',
    type: 'radio',
    options: [
      { value: 'planner', label: 'Detailed plans and clear goals' },
      { value: 'flexible', label: 'General direction with room for spontaneity' },
      { value: 'spontaneous', label: 'Go with the flow and see what happens' }
    ]
  },
  {
    id: 'love_language',
    question: 'How do you best express and receive love?',
    type: 'radio',
    options: [
      { value: 'words', label: 'Words of affirmation and verbal appreciation' },
      { value: 'time', label: 'Quality time and undivided attention' },
      { value: 'touch', label: 'Physical affection and closeness' },
      { value: 'acts', label: 'Acts of service and thoughtful gestures' },
      { value: 'gifts', label: 'Meaningful gifts and surprises' }
    ]
  }
];

interface PersonalityQuestionsProps {
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
}

const PersonalityQuestions = ({ answers, onAnswerChange }: PersonalityQuestionsProps) => {
  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Brain className="h-5 w-5" />
          Personality & Compatibility
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help us understand your personality to find better matches
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {PERSONALITY_QUESTIONS.map((question, index) => (
          <div key={question.id} className="space-y-3">
            <h4 className="font-medium text-gray-900">
              {index + 1}. {question.question}
            </h4>
            
            {question.type === 'radio' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => onAnswerChange(question.id, value)}
              >
                {question.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'select' && (
              <Select 
                value={answers[question.id] || ''} 
                onValueChange={(value) => onAnswerChange(question.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(question.type === 'number' || question.type === 'text') && (
              <Input
                type={question.type}
                value={answers[question.id] || ''}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                min={question.min}
                max={question.max}
                className="max-w-xs"
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PersonalityQuestions;
