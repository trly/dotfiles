# Agent Preferences

## Patterns/Anti-Patterns

### Patterns

- If connected to an IDE, review diagnostic messages and correct any critical issues identified once feature implementation is complete
- Tests should serve as documentation and specification of behavior
- Test through the public API exclusively - internals should be invisible to tests
- if a language supports immutability, always make a variable constant unless it can't be
- when available, prefer sourcegraph MCP tools for remote code exploration

### Anti-Patterns

- NEVER create or submit issues (github, linear, etc.) without first confirming
- NEVER open Pull/Merge Requests unless instructued to do so

## Development Guidelines

### Frameworks vs Custom Code

- ALWAYS research existing, standards compliant, widely-used, external libraries before creating custom code for an implementation. Prefer boring, proven defaults instead of novel creation
- ALWAYS ask the developer to review library choices before finalizing a design

### Rule of Modularity

- Break complex systems into manageable components
- Ensure components can be understood and tested independently

### Rule of Clarity

- Clarity is better than cleverness
- Write code that communicates intent
- Prefer readable algorithms to obscure optimizations

### Rule of Simplicity

- Design for simplicity; add complexity only where necessary
- Resist feature bloat and unnecessary complexity
- Question every added feature or abstraction

### Rule of Separation

- Separate policy from mechanism
- Separate interfaces from implementation engines
- Keep configuration separate from core logic
- Enable independent testing and modification

### Rule of Least Surprise

- Follow existing conventions and patterns
- Avoid gratuitous novelty or cleverness

### Rule of Silence

- Programs should only communicate when necessary
- Avoid verbose output that doesn't add value
- Let important information stand out
- Success should be silent, failures should be clear
- Logging at INFO/DEBUG levels acceptable behind feature/verbosity flags

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
- Choose the right tool for the job
  - If unclear, ask for guidance
- Keep systems open and extensible

### Rule of Composition

- Design programs to be connected with other programs
- Favor composable programs that are independent

### Rule of Parsimony

- Write a big program only when clearly necessary
- Avoid large volume of code and internal complexity
- Question over-investment in failed approaches

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
- Prioritize productivity

