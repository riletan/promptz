# Active Context

## Current Focus

The current focus appears to be on two new features:

1. **Project Rules Support**: Adding support for Amazon Q Developer project rules, allowing users to share and discover project rules that help enforce coding standards and best practices.

2. **Popularity Tracking**: Implementing a system to track prompt popularity based on user interactions, including copy counts and star counts.

Additionally, there's ongoing work on CI/CD workflows as indicated by the open `.github/workflows/ci.yml` file.

## Recent Changes

Based on the project structure and open files, recent work likely includes:

1. Implementation of Amazon Q project rules feature
2. Development of popularity tracking functionality
3. Updates to CI/CD workflows

## Active Components

The following components are currently being worked on:

- **Project Rules Feature**:

  - Data model for project rules
  - UI components for creating, editing, and browsing rules
  - Authorization rules for project rules

- **Popularity Tracking**:

  - Data model updates for tracking copy and star counts
  - Popularity score calculation
  - UI enhancements for displaying popularity

- **CI/CD Workflows**:
  - GitHub Actions workflow for pull request validation
  - Jest coverage reporting

## Current State

The application appears to be in active development with core functionality implemented and new features being added:

- User authentication via AWS Cognito
- Prompt creation, editing, and browsing
- Favoriting/starring functionality
- Search and filtering capabilities
- MCP integration
- Project rules support (in progress)
- Popularity tracking (in progress)

## Next Steps

Based on the current focus, potential next steps might include:

1. **Complete Project Rules Implementation**:

   - Finalize data model and schema
   - Implement CRUD operations
   - Create UI components for browsing and managing rules
   - Add download functionality

2. **Complete Popularity Tracking**:

   - Update prompt model with new fields
   - Implement interaction tracking
   - Create scheduled job for popularity score calculation
   - Add UI indicators for popular prompts

3. **Enhance CI/CD Pipeline**:
   - Improve test coverage
   - Optimize workflow performance

## Active Decisions

Key decisions that may be under consideration:

1. **Project Rules Implementation**:

   - How to structure the project rules data model
   - UI/UX for project rules browsing and creation
   - Authorization rules for project rules

2. **Popularity Tracking**:

   - Algorithm for calculating popularity scores
   - Visual indicators for popular prompts
   - Performance considerations for tracking interactions

3. **Technical Considerations**:
   - Data migration strategy for existing prompts
   - Scheduled job implementation for popularity score calculation
   - Test coverage for new features

## Open Questions

- How will project rules be differentiated from regular prompts in the UI?
- What metrics will be used to measure the success of the popularity tracking feature?
- Are there any performance concerns with tracking copy and star counts?
- How will the popularity score calculation be scheduled and executed?

## Dependencies and Blockers

- AWS Amplify configuration for new data models
- UI component development for new features
- Testing strategy for interaction tracking
- Data migration planning for existing prompts
