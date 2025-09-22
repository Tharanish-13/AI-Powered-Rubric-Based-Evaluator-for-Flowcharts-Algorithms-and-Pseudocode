import { PrismaClient, SubmissionStatus } from '@prisma/client';
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-demo'
});

// Processing queue to track status
const processingQueue: Map<string, { status: string; progress: number; error?: string }> = new Map();

export interface ProcessingResult {
  processingId: string;
  status: string;
}

export async function processSubmission(submissionId: string): Promise<ProcessingResult> {
  const processingId = `${submissionId}-${Date.now()}`;
  
  // Initialize processing status
  processingQueue.set(processingId, { status: 'started', progress: 0 });

  // Process asynchronously
  processSubmissionAsync(submissionId, processingId).catch(error => {
    console.error('Background processing error:', error);
    processingQueue.set(processingId, { 
      status: 'error', 
      progress: 0, 
      error: error.message 
    });
  });

  return { processingId, status: 'started' };
}

async function processSubmissionAsync(submissionId: string, processingId: string) {
  try {
    // Update processing status
    processingQueue.set(processingId, { status: 'loading', progress: 10 });

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true
      }
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Update status in database
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.PROCESSING }
    });

    processingQueue.set(processingId, { status: 'extracting', progress: 30 });

    // Extract content based on file type
    let extractedContent: string = '';
    const filePath = path.join(process.cwd(), submission.filePath);

    if (submission.fileType.startsWith('image/')) {
      // Use OCR for images
      extractedContent = await extractTextFromImage(filePath);
    } else {
      // For other file types, use placeholder extraction
      extractedContent = await extractTextFromDocument(filePath, submission.fileType);
    }

    processingQueue.set(processingId, { status: 'analyzing', progress: 60 });

    // Analyze with AI
    const aiAssessment = await analyzeWithAI(extractedContent, submission.assignment.rubricConfig);

    processingQueue.set(processingId, { status: 'saving', progress: 90 });

    // Save assessment
    const assessment = await prisma.assessment.create({
      data: {
        submissionId: submission.id,
        aiScore: aiAssessment.score,
        finalScore: aiAssessment.score,
        feedback: aiAssessment.feedback,
        rubricScores: aiAssessment.rubricScores,
        confidence: aiAssessment.confidence,
        aiProcessedAt: new Date()
      }
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.ASSESSED }
    });

    processingQueue.set(processingId, { status: 'completed', progress: 100 });

  } catch (error) {
    console.error('Processing error:', error);
    
    // Update submission status to error
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.SUBMITTED }
    });

    processingQueue.set(processingId, { 
      status: 'error', 
      progress: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR extraction error:', error);
    return 'Failed to extract text from image';
  }
}

async function extractTextFromDocument(filePath: string, fileType: string): Promise<string> {
  // For demo purposes, return placeholder content
  // In production, you would use appropriate libraries like:
  // - mammoth for .docx files
  // - pdf-parse for .pdf files
  // - node-pptx for .pptx files
  
  return `Document content extracted from ${path.basename(filePath)}. 
  This is a placeholder for the actual document content that would be extracted using appropriate libraries.`;
}

interface AIAssessment {
  score: number;
  feedback: any;
  rubricScores: any;
  confidence: number;
}

async function analyzeWithAI(content: string, rubricConfig: any): Promise<AIAssessment> {
  try {
    const prompt = `
    Please analyze the following educational content based on the provided rubric:

    Content:
    ${content}

    Rubric:
    ${JSON.stringify(rubricConfig, null, 2)}

    Please provide:
    1. An overall score (0-100)
    2. Detailed feedback for each rubric criterion
    3. Specific scores for each rubric criterion
    4. Confidence level in the assessment (0-1)
    5. Constructive suggestions for improvement

    Respond in JSON format with the structure:
    {
      "score": number,
      "feedback": {
        "overall": "string",
        "criteria": [
          {
            "name": "string",
            "feedback": "string",
            "suggestions": "string"
          }
        ]
      },
      "rubricScores": {
        "criteriaName": score
      },
      "confidence": number
    }
    `;

    // For demo purposes, return mock assessment
    // In production, you would call OpenAI API
    const mockAssessment: AIAssessment = {
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      feedback: {
        overall: "This is a comprehensive analysis of the submitted work. The algorithm demonstrates good understanding of the problem domain.",
        criteria: [
          {
            name: "Logic Flow",
            feedback: "The logical flow is generally clear and follows a structured approach.",
            suggestions: "Consider adding more detailed comments to explain complex steps."
          },
          {
            name: "Algorithm Efficiency",
            feedback: "The algorithm shows good efficiency characteristics.",
            suggestions: "Could be optimized further by reducing nested loops."
          }
        ]
      },
      rubricScores: {
        "Logic Flow": Math.floor(Math.random() * 25) + 75,
        "Algorithm Efficiency": Math.floor(Math.random() * 25) + 75,
        "Code Quality": Math.floor(Math.random() * 25) + 75,
        "Documentation": Math.floor(Math.random() * 25) + 75
      },
      confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7-1.0
    };

    return mockAssessment;

    // Uncomment below for actual OpenAI integration:
    /*
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert educational assessment AI that analyzes student work based on provided rubrics."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message?.content || '{}');
    return result;
    */
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return default assessment on error
    return {
      score: 75,
      feedback: {
        overall: "Assessment completed with basic analysis. Manual review recommended.",
        criteria: []
      },
      rubricScores: {},
      confidence: 0.5
    };
  }
}

export async function getProcessingStatus(submissionId: string): Promise<any> {
  // Find the latest processing entry for this submission
  for (const [processingId, status] of processingQueue.entries()) {
    if (processingId.startsWith(submissionId)) {
      return status;
    }
  }
  
  return { status: 'not_found', progress: 0 };
}

// Clean up old processing entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [processingId, status] of processingQueue.entries()) {
    const timestamp = parseInt(processingId.split('-').pop() || '0');
    // Remove entries older than 1 hour
    if (now - timestamp > 3600000) {
      processingQueue.delete(processingId);
    }
  }
}, 300000); // Run every 5 minutes