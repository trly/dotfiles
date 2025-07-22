# Global Agent Instructions

## Development Philosophy

### Test-Driven Development (TDD)
**CRITICAL RULE**: For Go, Java, and Python projects:
1. **Always write tests for the desired behavior FIRST**
2. **Then implement code until the initial tests pass**
3. **Never skip this step** - tests must be written before implementation

### Testing Standards
- Write comprehensive test coverage for new functionality
  - Focus on behavior driven development, then unit testing for new code.
  - New tests should focus on desired public facing behavior before testing specific implementation units
- Use existing test frameworks and patterns found in the project
  - CRITICAL RULE: If a project doesn't contain any existing tests, only introduce tests for NEW code, unless otherwise instructed.
  - If no tests exist in a project, use the following frameworks for specific langages.
  #### Go tests
  - built-in testing libraries
  #### Java
  - JUnit5
  - AssertJ
  #### Python
  - pytest
- Ensure tests are clear, focused, and test one thing at a time
- Include edge cases and error conditions in tests
- Include all logic branches in tests

## Code Quality Standards
- Follow existing code conventions and patterns in each project
- Prioritize readability and maintainability
- Use meaningful variable and function names
- Keep functions focused and single-purpose

## Project Management
- Always use todo_write to plan and track tasks
- Break down complex tasks into smaller, manageable steps
- Mark todos as completed immediately when finished
- Run quality checks (lint, format, typecheck) after code changes

## Communication
- Be concise and direct in responses
- Focus on the specific task at hand
- Avoid unnecessary explanations unless requested
- Use file links for code references

## Security
- Never expose or log secrets, API keys, or sensitive data
- Use environment variables for configuration
- Follow security best practices for each language/framework

## Language-Specific Notes
- **Python**: Use type hints, follow PEP 8, prefer f-strings
- **Go**: Follow standard Go conventions, use proper error handling
- **Java**: Follow standard Java conventions, use appropriate design patterns

---
*This file contains default preferences. Project-specific AGENT.md files take precedence.*
