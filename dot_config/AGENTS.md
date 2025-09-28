# Agent Preferences

This file contains personal preferences for working with AI agents

## Core Development Philosophy

### Test-Driven Development (TDD)

- **Always** write tests before implementing features
- Exception: exploratory spike prototypes (must be discarded or retro-fitted with tests)
- Use red-green-refactor cycle: write failing test → make it pass → refactor
- Tests should serve as documentation and specification of behavior
- Validate feature designs through tests before implementation
- **No "unit tests"** - this term is not helpful. User facing tests should verify expected behavior, treating implementation as a black box
- Test through the public API exclusively - internals should be invisible to tests
- No 1:1 mapping between test files and implementation files

### Oracle Consultation

- **Always** consult the Oracle before implementing complex features or architecture changes
- Escalation criteria: when design/architecture uncertainty ≥ MEDIUM complexity
- Use the Oracle to review designs, validate approaches, and get expert guidance
- Pass relevant context and files to the Oracle for comprehensive analysis
- When using subagents, always validate designs and implementations with the oracle

## Unix Philosophy Guidelines

Follow these principles in all code and system design

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

### Rule of Composition

- Design programs to be connected with other programs
- Write programs as simple filters that process text streams
- Favor composable programs that are independent
- Use simple, textual, stream-oriented formats

### Rule of Parsimony

- Write a big program only when clearly necessary
- Avoid large volume of code and internal complexity
- Large programs hurt maintainability
- Question overinvestment in failed approaches

### Rule of Transparency

- Design for visibility to make inspection and debugging easier
- Software should be transparent and discoverable
- Make it easy to understand what the program is doing
- Design debugging options from the beginning

### Rule of Robustness

- Robustness is the child of transparency and simplicity
- Design to perform well under unexpected conditions
- Make internals easy for humans to reason about
- Design tolerance for unusual or bulky inputs

### Rule of Representation

- Fold knowledge into data, so program logic can be stupid and robust
- Data is more tractable than program logic
- Choose data structure complexity over code complexity
- Actively shift complexity from code to data

### Rule of Economy

- Programmer time is expensive; conserve it over machine time
- Write applications in higher-level languages when possible
- Teach machines to do more low-level programming work
- Prioritize developer productivity

### Rule of Generation

- Avoid hand-hacking; write programs to write programs
- Generated code is cheaper and more reliable than hand-hacked
- Target repetitive, mind-numbing code for generation
- Automate to reduce delays and errors

### Rule of Extensibility

- Design for the future, because it will be here sooner than you think
- Never assume you have the final answer
- Leave room for data formats and code to grow
- Organize code for future developers to extend without rebuilding

## Agent Collaboration Workflow

### Quality Gates

- No reduction in test coverage
- Security review for authentication, authorization, or data handling
- Style and lint checks must pass

## Security Guidelines

- Never store, log, or expose secrets or API keys
- Sanitize prompts before sending to external services
- Use environment variables and secure storage for sensitive data
- Flag any code that handles authentication or authorization for review
