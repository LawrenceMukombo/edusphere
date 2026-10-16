// GET /api/docs
import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'EduSphere SMIS API',
      version: '1.0.0',
      description: 'Enterprise School Management Information System RESTful APIs — Zambia-first, modular, and multi-tenant.',
      contact: {
        name: 'EduSphere Engineering Team',
        email: 'api@edusphere.zm',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/auth/login': {
        post: {
          summary: 'Authenticate user and obtain JWT session token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@edusphere.zm' },
                    password: { type: 'string', example: 'Password123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Authenticated successfully' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/students': {
        get: {
          summary: 'List enrolled learners with optional class/search filters',
          responses: { 200: { description: 'Learner array retrieved' } },
        },
        post: {
          summary: 'Admit and register a new pupil',
          responses: { 201: { description: 'Learner admitted' } },
        },
      },
      '/api/academics/scores': {
        post: {
          summary: 'Record or batch-update student marks for an assessment',
          responses: { 200: { description: 'Marks recorded successfully' } },
        },
      },
      '/api/attendance': {
        get: { summary: 'Get daily class attendance register' },
        post: { summary: 'Submit register or reconcile offline batch' },
      },
      '/api/finance/invoices': {
        get: { summary: 'List invoices' },
        post: { summary: 'Issue new student invoice with idempotency key' },
      },
      '/api/finance/payments': {
        get: { summary: 'List recorded fee payments' },
        post: { summary: 'Record payment and generate receipt' },
      },
      '/api/parent/children': {
        get: { summary: 'Get authorized children for current parent/guardian' },
      },
      '/api/hr': {
        get: { summary: 'Staff directory and TCZ practising certificate alerts' },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
