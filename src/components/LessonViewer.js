import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  Quiz,
  MenuBook,
  Lightbulb,
  Code,
} from '@mui/icons-material';
import { lessonContent } from '../data/lessonContent';

const LessonViewer = ({ lesson, onBack, onComplete, isCompleted }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(isCompleted);

  const content = lessonContent[lesson.id] || [];
  const totalSteps = content.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
    
    // Check if all answers are correct
    const currentQuiz = content[currentStep];
    if (currentQuiz.type === 'quiz') {
      const allCorrect = currentQuiz.questions.every(q => 
        quizAnswers[q.id] === q.correctAnswer
      );
      
      if (allCorrect && currentStep === totalSteps - 1) {
        setLessonCompleted(true);
        setTimeout(() => {
          onComplete(lesson.id);
        }, 2000);
      }
    }
  };

  const renderContent = (item) => {
    switch (item.type) {
      case 'intro':
        return (
          <Card sx={{ background: lesson.color, color: 'white', mb: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                {lesson.icon}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                {item.title}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                {item.subtitle}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        );

      case 'content':
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MenuBook sx={{ mr: 2, color: '#1976D2' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976D2' }}>
                  {item.title}
                </Typography>
              </Box>
              
              {item.sections.map((section, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                    {section.subtitle}
                  </Typography>
                  
                  {section.content.map((paragraph, pIndex) => (
                    <Typography 
                      key={pIndex} 
                      variant="body1" 
                      sx={{ mb: 2, lineHeight: 1.7, color: 'text.secondary' }}
                    >
                      {paragraph}
                    </Typography>
                  ))}
                  
                  {section.examples && (
                    <Paper sx={{ p: 3, backgroundColor: '#f5f5f5', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Lightbulb sx={{ mr: 1, color: '#FF9800' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Exemplos:
                        </Typography>
                      </Box>
                      {section.examples.map((example, eIndex) => (
                        <Typography key={eIndex} variant="body2" sx={{ mb: 1, ml: 2 }}>
                          • {example}
                        </Typography>
                      ))}
                    </Paper>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        );

      case 'interactive':
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Code sx={{ mr: 2, color: '#4CAF50' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                  {item.title}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                {item.description}
              </Typography>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2 
              }}>
                {item.activities.map((activity, index) => (
                  <Paper 
                    key={index}
                    sx={{ 
                      p: 3, 
                      border: '2px solid #e0e0e0',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#4CAF50',
                        backgroundColor: '#f9f9f9'
                      },
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {activity.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      case 'quiz':
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Quiz sx={{ mr: 2, color: '#9C27B0' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#9C27B0' }}>
                  {item.title}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
                {item.description}
              </Typography>

              {item.questions.map((question, qIndex) => (
                <Paper key={question.id} sx={{ p: 3, mb: 3, backgroundColor: '#fafafa' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {qIndex + 1}. {question.question}
                  </Typography>
                  
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={quizAnswers[question.id] || ''}
                      onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                    >
                      {question.options.map((option, oIndex) => (
                        <FormControlLabel
                          key={oIndex}
                          value={option}
                          control={<Radio />}
                          label={option}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>

                  {showQuizResults && (
                    <Alert
                      severity={quizAnswers[question.id] === question.correctAnswer ? 'success' : 'error'}
                      sx={{ mt: 2 }}
                    >
                      {quizAnswers[question.id] === question.correctAnswer 
                        ? '✅ Correto!' 
                        : `❌ Incorreto. A resposta correta é: ${question.correctAnswer}`
                      }
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {question.explanation}
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              ))}

              {!showQuizResults && (
                <Button
                  variant="contained"
                  onClick={handleQuizSubmit}
                  disabled={item.questions.some(q => !quizAnswers[q.id])}
                  sx={{ mt: 2 }}
                >
                  Verificar Respostas
                </Button>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'transparent',
          mb: 3,
        }}
      >
        <Toolbar sx={{ px: 0, minHeight: { xs: 48, md: 64 } }}>
          <IconButton
            onClick={onBack}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              mr: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {lesson.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {lesson.subtitle}
            </Typography>
          </Box>

          {lessonCompleted && (
            <Chip
              icon={<CheckCircle />}
              label="Concluída"
              color="success"
              variant="filled"
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Progresso da Lição
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#1976D2',
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {content.map((item, index) => (
              <Step key={index}>
                <StepLabel>
                  <Typography variant="caption">
                    {item.stepLabel || `Passo ${index + 1}`}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Content */}
      {content[currentStep] && renderContent(content[currentStep])}

      {/* Navigation */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<NavigateBefore />}
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outlined"
            >
              Anterior
            </Button>

            <Typography variant="body2" color="text.secondary">
              {currentStep + 1} de {totalSteps}
            </Typography>

            <Button
              endIcon={<NavigateNext />}
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              variant="contained"
            >
              Próximo
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {lessonCompleted && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🎉 Parabéns! Você concluiu esta lição!
          </Typography>
          <Typography variant="body2">
            Continue para a próxima lição ou pratique o que aprendeu no simulador.
          </Typography>
        </Alert>
      )}
    </Container>
  );
};

export default LessonViewer;