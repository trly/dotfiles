# Agent Preferences

This file contains personal preferences for working with AI agents

## Core Development Philosophy

### Test-Driven Development (TDD)

- **Always** write tests before implementing features
- Exception: exploratory spike prototypes (must be discarded or retro-fitted with tests)
- Use red-green-refactor cycle: write failing test → make it pass → refactor
- Tests should serve as documentation and specification of behavior
- Validate feature designs through tests before implementation

### Oracle Consultation

- **Always** consult the Oracle before implementing complex features or architecture changes
- Escalation criteria: when design/architecture uncertainty ≥ MEDIUM complexity
- Use the Oracle to review designs, validate approaches, and get expert guidance
- Pass relevant context and files to the Oracle for comprehensive analysis
- When using subagents, always validate designs and implementations with the oracle

## Unix Philosophy Guidelines

Follow these principles in all code and system design:

### Rule of Modularity

- Write simple parts connected by clean interfaces
- Break complex systems into manageable components
- Ensure components can be understood and tested independently

### Rule of Clarity  

- Clarity is better than cleverness
- Write code that communicates intent to other programmers
- Prefer readable algorithms over obscure optimizations
- Code should be self-documenting

### Rule of Simplicity

- Design for simplicity; add complexity only where necessary
- Resist feature bloat and unnecessary complexity
- Value small, elegant solutions
- Question every added feature or abstraction

### Rule of Separation

- Separate policy from mechanism
- Separate interfaces from implementation engines
- Keep configuration separate from core logic
- Enable independent testing and modification

### Rule of Least Surprise

- Interfaces should be intuitive and predictable
- Follow established conventions and patterns
- Avoid gratuitous novelty or cleverness
- Build on users' existing knowledge

### Rule of Silence

- Programs should only communicate when necessary
- Avoid verbose output that doesn't add value
- Let important information stand out
- Success should be silent, failures should be clear
- Logging at INFO/DEBUG levels acceptable behind feature flags

### Rule of Repair

- Handle errors gracefully when possible
- When you must fail, fail noisily and immediately
- Make problems easy to diagnose
- Never fail silently or corrupt data

### Rule of Optimization

- Prototype before polishing
- Get it working before optimizing
- Measure before optimizing
- Focus optimization on actual bottlenecks

### Rule of Diversity

- Distrust claims for "one true way"
- Embrace flexibility and multiple approaches
- Choose the right tool for the job
- Keep systems open and extensible

## Agent Collaboration Workflow

### Task Lifecycle

1. **Define task** - Clearly describe requirements and acceptance criteria
2. **Write tests first** - Create failing tests that specify expected behavior  
3. **Consult Oracle** - For complex features or architectural decisions
4. **Implement** - Use TDD cycle to build functionality
5. **Validate** - Ensure all tests pass and quality gates are met

### Quality Gates

- All tests must pass in CI/CD
- No reduction in test coverage
- Oracle approval required for MEDIUM+ complexity changes
- Security review for authentication, authorization, or data handling
- Style and lint checks must pass

### Context & Communication

- Always provide full file paths when referencing code
- Include relevant test files and documentation
- Ask clarifying questions rather than making assumptions
- Reveal reasoning and thought process for review

## Security Guidelines

- Never store, log, or expose secrets or API keys
- Sanitize prompts before sending to external services
- Use environment variables and secure storage for sensitive data
- Flag any code that handles authentication or authorization for review

## Implementation Guidelines

1. **Start with tests** - Define behavior through tests before writing implementation
2. **Consult Oracle** - Get expert guidance on complex decisions
3. **Keep it simple** - Favor simple, clear solutions
4. **Separate concerns** - Maintain clear boundaries between components  
5. **Fail fast** - Make errors obvious and actionable
6. **Measure first** - Profile before optimizing
7. **Stay modular** - Design for composability and reuse
