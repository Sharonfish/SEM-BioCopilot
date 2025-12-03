# AI Copilot Dual Mode Feature 🤖

## Overview

BioCopilot now features a powerful dual-mode AI Copilot that works like Cursor IDE, offering two distinct modes:

1. **Q&A Mode** - Ask questions and get intelligent answers
2. **Code Generation Mode** - Generate code with accept/reject workflow

## Features

### 🎯 Mode 1: Ask Questions (Q&A)

Ask anything about bioinformatics, code concepts, or general programming questions and get AI-powered answers.

#### Key Features:
- 💬 Chat-style interface
- 🧠 Context-aware responses
- 📜 Conversation history
- ⚡ Real-time answers
- 🗑️ Clear history option

#### Usage:
1. Click the "Ask Questions" tab in the Copilot panel
2. Type your question in the input field
3. Press Send or Enter
4. Receive AI-powered answer instantly

#### Example Questions:
- "How does StandardScaler work?"
- "Explain PCA in bioinformatics"
- "What's the difference between fit() and transform()?"
- "How to handle missing values in gene expression data?"

---

### 💻 Mode 2: Generate Code

Generate or modify code with AI assistance, featuring a Cursor-like accept/reject workflow.

#### Key Features:
- 🎯 Works on selected code or entire file
- ✨ AI-powered code generation
- 👁️ Preview changes before applying
- ✅ Accept/Reject buttons
- 🔄 Maintains code style and context

#### Usage:

**For Selected Code:**
1. Select code in the editor
2. Switch to "Generate Code" tab
3. Describe what you want to do
4. Click "Generate Code"
5. Review the proposed changes
6. Click "Accept" to apply or "Reject" to discard

**For Entire File:**
1. Open a file (no selection needed)
2. Switch to "Generate Code" tab
3. Enter your prompt
4. AI generates the complete modified file
5. Accept or Reject the changes

#### Example Prompts:
- "Add error handling"
- "Add docstrings to all functions"
- "Optimize for performance"
- "Add type hints"
- "Refactor this code"
- "Add comments explaining the algorithm"

---

## Technical Implementation

### Architecture

```
User Input
    ↓
Copilot Panel (Mode Selector)
    ├─→ Q&A Mode → /api/copilot/qa → OpenAI → Answer
    └─→ Code Gen Mode → /api/copilot/generate → OpenAI → Code Preview → Accept/Reject
```

### Components

1. **CopilotPanel.tsx** - Main panel with mode tabs
2. **QAMode.tsx** - Q&A interface with chat history
3. **CodeGenMode.tsx** - Code generation with preview/accept/reject
4. **copilotModeStore.ts** - State management for both modes
5. **editorSelectionStore.ts** - Tracks current editor selection

### API Endpoints

#### `/api/copilot/qa`
**Request:**
```json
{
  "question": "How does PCA work?",
  "history": [/* previous messages */]
}
```

**Response:**
```json
{
  "answer": "Principal Component Analysis..."
}
```

#### `/api/copilot/generate`
**Request:**
```json
{
  "prompt": "Add error handling",
  "currentCode": "def foo():\n    pass",
  "language": "python",
  "fileName": "script.py",
  "hasSelection": true,
  "selectionRange": { "startLine": 1, "endLine": 5 }
}
```

**Response:**
```json
{
  "code": "def foo():\n    try:\n        pass\n    except Exception as e:\n        print(f'Error: {e}')"
}
```

---

## Setup

### Option 1: With OpenAI API (Recommended)

1. **Get API Key**
   ```bash
   # Visit https://platform.openai.com/api-keys
   # Create or sign in to your account
   # Generate a new API key
   ```

2. **Configure Environment**
   ```bash
   # Create .env.local file
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart Server**
   ```bash
   npm run dev
   ```

### Option 2: Mock Mode (No API Key)

Without an API key, both modes work in mock mode:
- Q&A provides basic answers for common questions
- Code Gen applies simple transformations
- Perfect for testing and development

---

## Workflow Examples

### Example 1: Learning About Code

**Scenario:** You see unfamiliar code and want to understand it

1. Select the code you're curious about
2. Switch to "Ask Questions" mode
3. Ask: "What does this code do?"
4. Get detailed explanation
5. Ask follow-up questions as needed

### Example 2: Adding Features

**Scenario:** You want to add error handling to a function

1. Select the function
2. Switch to "Generate Code" mode
3. Prompt: "Add comprehensive error handling"
4. Review the generated code with try-catch blocks
5. Accept if it looks good, or reject and try again with different prompt

### Example 3: Refactoring

**Scenario:** You have working code but want to improve it

1. Open the file (no selection needed for full file)
2. Switch to "Generate Code" mode
3. Prompt: "Refactor for better readability and add comments"
4. Review the completely refactored version
5. Accept to apply changes

---

## State Management

### Copilot Mode Store

```typescript
interface CopilotModeStore {
  mode: 'qa' | 'codegen'
  qaHistory: QAMessage[]
  codeChanges: CodeChange[]
  currentChange: CodeChange | null
  loading: boolean
}
```

### Editor Selection Store

```typescript
interface EditorSelectionStore {
  text: string | null
  startLine: number | null
  endLine: number | null
  hasSelection: boolean
}
```

---

## Best Practices

### For Q&A Mode:
- ✅ Ask specific, clear questions
- ✅ Provide context when needed
- ✅ Use follow-up questions for clarification
- ❌ Don't ask multiple unrelated questions at once

### For Code Generation:
- ✅ Be specific about what you want
- ✅ Review generated code carefully before accepting
- ✅ Test the code after accepting
- ✅ Use smaller selections for more targeted changes
- ❌ Don't blindly accept without review
- ❌ Don't use for critical security-sensitive code without thorough review

---

## Keyboard Shortcuts (Future)

Planned shortcuts:
- `Ctrl+K` - Open Q&A input
- `Ctrl+Shift+K` - Open Code Gen input
- `Ctrl+Enter` - Submit prompt
- `Ctrl+Y` - Accept change
- `Ctrl+N` - Reject change

---

## Comparison with Cursor IDE

### Similarities:
- ✅ Code generation with preview
- ✅ Accept/Reject workflow
- ✅ Context-aware AI
- ✅ Works on selections or full files

### Differences:
- 🆕 Separate Q&A mode
- 🆕 Bioinformatics-specialized prompts
- 🆕 Chat history in Q&A
- 🔄 Different UI (integrated in side panel)

---

## Troubleshooting

### Q&A Mode Issues

**Problem:** Slow responses
- **Solution:** Check internet connection
- **Solution:** Consider using GPT-3.5-turbo instead of GPT-4

**Problem:** Generic answers
- **Solution:** Be more specific in your questions
- **Solution:** Provide code context in your question

### Code Generation Issues

**Problem:** Generated code doesn't match expectations
- **Solution:** Reject and rephrase your prompt
- **Solution:** Be more specific about requirements
- **Solution:** Try smaller code selections

**Problem:** Can't see the changes
- **Solution:** Make sure you've clicked "Accept"
- **Solution:** Check if the file tab shows unsaved changes (•)

**Problem:** Code breaks after accepting
- **Solution:** Always review generated code before accepting
- **Solution:** Test the code immediately after accepting
- **Solution:** Use version control to revert if needed

---

## Cost Optimization

### OpenAI Usage:
- **Q&A Mode:** ~$0.03-0.06 per 1K tokens (GPT-4)
- **Code Gen:** ~$0.06-0.12 per request (depends on code size)

### Tips to Save Costs:
1. Use GPT-3.5-turbo (10x cheaper) in API config
2. Keep conversations focused (history affects cost)
3. Use mock mode during development
4. Clear Q&A history regularly
5. Be specific in prompts (fewer iterations)

---

## Future Enhancements

Planned features:
- [ ] Inline code suggestions (like GitHub Copilot)
- [ ] Multi-file code generation
- [ ] Code diff viewer with line-by-line changes
- [ ] Conversation export/import
- [ ] Custom prompts library
- [ ] Voice input for Q&A
- [ ] Batch code generation
- [ ] Integration with local LLMs

---

## Security & Privacy

### Data Handling:
- ✅ Code sent to OpenAI API only when you submit
- ✅ No automatic background code analysis
- ✅ Conversation history stored locally in browser
- ✅ No telemetry or tracking

### Recommendations:
- ⚠️ Don't share sensitive credentials in code
- ⚠️ Review generated code for security issues
- ⚠️ Consider using local LLMs for sensitive projects
- ⚠️ Be aware that OpenAI sees your prompts and code

---

## FAQ

**Q: Can I use this offline?**
A: No, it requires internet connection for OpenAI API. Future versions may support local LLMs.

**Q: Does it work with languages other than Python?**
A: Yes! It works with any language supported by Monaco Editor (Python, JavaScript, R, etc.)

**Q: How accurate is the code generation?**
A: GPT-4 is very capable but not perfect. Always review and test generated code.

**Q: Can I customize the AI model?**
A: Yes, edit the API files to change model, temperature, or max_tokens.

**Q: Is my code private?**
A: Code sent to OpenAI API is subject to their privacy policy. For sensitive code, consider local LLMs.

---

**Happy Coding with AI! 🚀✨**

