# Promptz Technology Stack

## Frontend Technologies

### Core Framework

- **Next.js 15.2.0**: React framework with App Router for server and client components
- **React 19.0.0**: UI library for component-based development
- **TypeScript**: Strongly typed programming language for improved developer experience

### UI Components and Styling

- **Tailwind CSS 3.4.x**: Utility-first CSS framework
- **Shadcn UI**: Component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library
- **next-themes**: Theme management for dark/light mode

### Form Handling

- **React Hook Form 7.54.x**: Form state management and validation
- **Zod 3.24.x**: Schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### UI Utilities

- **clsx/tailwind-merge**: Utility for conditional class names
- **class-variance-authority**: Creating variant components
- **cmdk**: Command menu component
- **sonner**: Toast notifications
- **tailwindcss-animate**: Animation utilities for Tailwind

## Backend Technologies

### AWS Amplify Gen 2

- **@aws-amplify/backend 1.14.x**: Backend definition and deployment
- **@aws-amplify/backend-cli 1.4.x**: CLI for Amplify Gen 2
- **@aws-amplify/adapter-nextjs 1.5.x**: Next.js integration for Amplify

### AWS Services

- **Amazon Cognito**: User authentication and management
- **AWS AppSync**: GraphQL API service
- **Amazon DynamoDB**: NoSQL database
- **Amazon EventBridge**: Event bus for application events
- **AWS Step Functions**: Workflow orchestration
- **AWS Lambda**: Serverless compute (used in triggers)
- **Amazon CloudWatch**: Monitoring and logging (in production)
- **AWS IAM**: Identity and access management

### Infrastructure as Code

- **AWS CDK 2.x**: Infrastructure definition
- **aws-cdk-lib 2.181.x**: CDK libraries
- **constructs 10.4.x**: CDK construct library

## Development Tools

### Code Quality

- **ESLint 9.21.x**: JavaScript/TypeScript linting
- **Prettier 3.5.x**: Code formatting
- **commitlint**: Commit message linting
- **husky**: Git hooks
- **lint-staged**: Run linters on staged files

### Testing

- **Jest 29.7.x**: Testing framework
- **React Testing Library 16.2.x**: React component testing
- **@testing-library/jest-dom**: DOM testing utilities
- **jsdom**: DOM implementation for Node.js

### Build Tools

- **esbuild 0.25.x**: JavaScript bundler
- **postcss 8.5.x**: CSS transformation tool
- **ts-node 10.9.x**: TypeScript execution environment

## Development Environment

### Required Tools

- **Node.js**: v14.x or later
- **npm**: v6.14.4 or later
- **git**: v2.14.1 or later

### Environment Configuration

- **Environment Variables**:
  - `PROMPTZ_ENV`: Controls environment-specific configurations
  - Various secrets for authentication providers

### Project Structure

- `/amplify`: Amplify backend configuration
  - `/auth`: Authentication resources
  - `/data`: Data models and schema
  - `/messaging`: Event messaging resources
  - `/workflows`: Step Functions workflows
- `/app`: Next.js app router pages and layouts
  - `/lib`: Server-side utilities and actions
  - `/ui`: UI components organized by feature
- `/components`: Shared React components
- `/public`: Static assets
- `/.amazonq`: Amazon Q Developer configuration
  - `/rules`: Custom rules for Amazon Q
  - `/project-intelligence`: Project documentation for context

## Deployment Configuration

### Amplify Configuration

- **Production vs. Sandbox**: Different configurations based on `PROMPTZ_ENV`
  - Production: Enhanced security, logging, social providers
  - Sandbox: Simplified setup for development

### CI/CD

- **GitHub Actions**: Automated testing and linting
- **Amplify Deployment**: Continuous deployment from GitHub

## Development Workflow

### Local Development

- `npm run dev`: Start local development server with Turbopack
- `npm run lint`: Run ESLint
- `npm run test`: Run Jest tests
- `npm run pr`: Run lint and tests (for pull requests)
- `npm run sandbox`: Deploy sandbox environment

### Version Control

- **Commitizen**: Standardized commit messages
- **Husky**: Pre-commit hooks for code quality

## Known Constraints

1. **AWS Region Limitations**:

   - Certain features like Amazon SES require specific region setup

2. **Authentication Providers**:

   - Social providers not configured due to increased complexity

3. **Development Environment**:

   - Requires AWS credentials with appropriate permissions
   - Sandbox deployment needed for full testing

4. **Data Model Constraints**:

   - Limited search capabilities due to Amazon DynamoDB

5. **Frontend Limitations**:

   - Server components cannot use browser-only APIs
   - Client components needed for interactive elements

6. **Testing Constraints**:
   - Mock implementations needed for AWS services
   - Jest configuration for Next.js App Router
