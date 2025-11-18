# Quick Start: Code Explanation Feature

## 🚀 How to Use in 3 Steps

### 1. Select Code
In the IDE editor, use your mouse to **select any code** you want explained.

### 2. Click "Explain"
A floating button will appear near your selection. Click it!

### 3. Read the Explanation
A panel will show below with:
- What the code does
- Key concepts explained
- Relevance to bioinformatics

## ⚙️ Setup (Optional)

### For AI-Powered Explanations

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### Without API Key

No problem! The feature works in **mock mode**:
- Still provides useful code analysis
- No external API calls needed
- Great for testing

## 📝 Example

Try selecting this code in the IDE:

```python
scaler = StandardScaler()
df[cols] = scaler.fit_transform(df[cols])
```

You'll get an explanation about:
- What StandardScaler does
- Why scaling matters in bioinformatics
- When to use this technique

## 🎯 Tips

- **Select wisely**: Select 1-10 lines for best results
- **Be specific**: Select the exact code you're curious about
- **Copy easily**: Use the copy button to save explanations
- **Close anytime**: Click X to dismiss the panel

## 🔧 Troubleshooting

**Button doesn't appear?**
- Make sure you're actually selecting text (not just clicking)

**Slow response?**
- First explanation may be slow as it initializes
- Consider using GPT-3.5-turbo instead of GPT-4 for faster responses

**Error message?**
- Check your OpenAI API key in `.env.local`
- Or use mock mode (no key needed)

---

**That's it! Start exploring your code with AI assistance! 🤖✨**

