## Immediate Tasks (First Iteration)

- Create private GitHub repository for this project
- Use GitHub MCP to push current work
- Commit finished work as first iteration
- After this iteration is committed, start planning next phase

## Future Updates

- Remove fallback fake questions functionality
- Display proper error messages when:
  - API key is missing
  - No questions are available/returned
- Current implementation has fallback questions, but topics might change, making hardcoded fallback questions irrelevant

- Update npm scripts to use standard shorthand commands
- Replace long script names with common conventions (e.g., `npm start`, `npm dev`, `npm build`)
- Make it easier for people to use with familiar standard commands

- Add content source options for quiz generation:
  - Option 1: Search the internet for the topic
  - Option 2: Upload a document to generate questions from
  - Option 3: Parse content from a URL
- Display clear instructions at startup so users know their options
- Make the interface intuitive with both document upload and URL/web search capabilities
- Generate quiz questions based on the actual information users want to learn

- Update README to reflect all changes:
  - New npm script commands
  - Content source options (document upload, URL parsing, web search)
  - Error handling updates
  - Any other functionality changes
