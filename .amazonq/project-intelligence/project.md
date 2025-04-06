# Promptz Project Overview

## Purpose

Promptz is the ultimate prompting hub for Amazon Q Developer, designed to help users discover, create, and perfect their prompts for every step of the software development lifecycle. It serves as a central repository where developers can share, discover, and manage effective prompts for Amazon Q Developer.

## Problem Statement

Amazon Q Developer is a powerful AI assistant for software development, but crafting effective prompts requires skill and experience. Developers often:

1. Struggle to create prompts that yield optimal results
2. Waste time recreating similar prompts for recurring tasks
3. Have no centralized way to share successful prompts with teammates or the community
4. Need guidance on prompt structure for specific development tasks

Promptz solves these challenges by providing a platform where developers can:

- Discover high-quality, community-vetted prompts
- Share their own successful prompts
- Organize prompts by categories, tags, and use cases
- Learn prompt engineering best practices through examples

## Core Functionality

Promptz operates as a web application with the following key features:

### Prompt Management

- Create, edit, and delete prompts
- Categorize prompts with tags
- Mark prompts as public or private
- Star/favorite prompts for quick access

### Project Rules

- Create and manage project-specific rules for Amazon Q
- Share rules with the community
- Download rules for local use with Amazon Q

### Discovery

- Search for prompts by keywords, tags, categories
- Filter prompts by various attributes
- Sort prompts by relevance, popularity, or recency
- Browse featured and trending prompts

### User Management

- User registration and authentication
- User profiles with created and starred prompts
- Activity tracking for prompt interactions

### Analytics and Events

- Track prompt usage and popularity
- Capture interaction events (copying, starring, etc.)
- Process events through event-driven architecture

## Development Approach

Promptz is built using modern web development practices:

1. **Frontend**: Next.js with React 19, using the App Router for server components and client components where needed
2. **Styling**: Tailwind CSS with Shadcn UI components for a clean, responsive design
3. **Backend**: AWS Amplify Gen 2 for serverless infrastructure
4. **Authentication**: Amazon Cognito with social login options
5. **Database**: DynamoDB for data storage
6. **Event Processing**: EventBridge and Step Functions for event-driven workflows
7. **Deployment**: Continuous deployment through AWS Amplify and Github

## Core Requirements

1. **User-Friendly Interface**: Intuitive navigation and prompt management
2. **Performance**: Fast loading times and responsive design
3. **Scalability**: Handle growing user base and prompt repository
4. **Security**: Protect user data and ensure proper access controls
5. **Extensibility**: Support for future features and integrations

## Goals

- Enable prompt discovery and sharing
- Create an ecosystem of prompt-related tools
- Integrate with other developer tools
- Build a vibrant community of prompt engineers
