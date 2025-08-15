import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain } from 'lucide-react';
const PERSONALITY_QUESTIONS = [
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
const PersonalityQuestions = ({ answers, onAnswerChange }) => {
    return (<Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Brain className="h-5 w-5"/>
          Personality & Compatibility
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help us understand your personality to find better matches
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {PERSONALITY_QUESTIONS.map((question, index) => (<div key={question.id} className="space-y-3">
            <h4 className="font-medium text-gray-900">
              {index + 1}. {question.question}
            </h4>
            
            {question.type === 'radio' && (<RadioGroup value={answers[question.id] || ''} onValueChange={(value) => onAnswerChange(question.id, value)}>
                {question.options?.map((option) => (<div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`}/>
                    <Label htmlFor={`${question.id}-${option.value}`} className="text-sm cursor-pointer leading-relaxed">
                      {option.label}
                    </Label>
                  </div>))}
              </RadioGroup>)}

            {question.type === 'select' && (<Select value={answers[question.id] || ''} onValueChange={(value) => onAnswerChange(question.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option"/>
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option) => (<SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>))}
                </SelectContent>
              </Select>)}
          </div>))}
      </CardContent>
    </Card>);
};
export default PersonalityQuestions;
