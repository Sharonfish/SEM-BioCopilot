# Inline Editor Diff - VS Code Style 🎨

## Overview

BioCopilot now features **inline diff display** directly in the code editor! Changes are shown **on the actual code lines** with accept/reject buttons floating above each change, just like VS Code's merge conflict resolution.

## How It Works

### Visual Representation

Instead of a separate modal, diffs are displayed **inline** in the editor:

```
┌─────────────────────────────────────────────┐
│ 1  │ import pandas as pd                    │
│ 2  │ import numpy as np                     │
│ 3  │                                        │
├────┴──────────────────────────────────────────┤
│ [✓ Accept] [✗ Reject]  ← Floating buttons   │
├──────────────────────────────────────────────┤
│ 4  │ def process_data(df):  ← Red bg (delete)│
├──────────────────────────────────────────────┤
│    │ + def process_data(df: pd.DataFrame) -> pd.DataFrame:│ ← Green (add)
│    │ + """Process gene expression data.""" │ ← Green (add)
├──────────────────────────────────────────────┤
│ 5  │     scaler = StandardScaler()          │
│ 6  │     return scaler.fit_transform(df)    │
└────┴────────────────────────────────────────┘
```

### Key Features

1. **Red Background**: Lines to be deleted
   - Red left border (3px)
   - Red gutter marker (−)
   - Light red background

2. **Green Overlay**: Lines to be added
   - Green text with prefix (+)
   - Green background
   - Shown inline as "before" content

3. **Floating Action Buttons**
   - Appear above each change hunk
   - Dark background with hover effects
   - Accept button (green)
   - Reject button (red)

4. **Immediate Application**
   - Clicking "Accept" applies the change instantly
   - Clicking "Reject" discards the change
   - No need to close a modal

## Workflow

```
1. User generates code (Code Gen mode)
         ↓
2. Diff calculated automatically
         ↓
3. Red/green highlights appear in editor
         ↓
4. Floating buttons show above each change
         ↓
5. User clicks "Accept" or "Reject"
         ↓
6. Change applied/discarded immediately
         ↓
7. Editor updates in real-time
```

## Technical Implementation

### Components

**InlineEditorDiff.tsx**
- `useInlineEditorDiff` hook
- Monaco editor decorations
- Content widgets for buttons
- CSS injection for styling

**CodeEditor.tsx**
- Integrates the inline diff hook
- Handles accept/reject actions
- Applies changes to editor content

### Monaco Editor Features Used

1. **Decorations**: Visual highlighting of lines
   - `className`: CSS classes for styling
   - `linesDecorationsClassName`: Gutter decorations
   - `minimap`: Minimap markers
   - `overviewRuler`: Scrollbar markers

2. **Content Widgets**: Floating UI elements
   - Positioned above specific lines
   - Custom DOM nodes
   - Interactive buttons

3. **Before Content**: Pseudo-lines for additions
   - Shows new code without modifying file
   - Green colored prefix
   - Inline styling

## Styling

### CSS Classes

```css
.inline-diff-deleted {
  background-color: rgba(255, 0, 0, 0.15);
  border-left: 3px solid #dc2626;
}

.inline-diff-added {
  background-color: rgba(0, 255, 0, 0.15);
  border-left: 3px solid #16a34a;
}

.inline-diff-added-line {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  display: block;
  padding: 2px 4px;
}

.inline-diff-actions {
  display: flex;
  gap: 4px;
  background: rgba(30, 30, 30, 0.95);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

## Usage Example

### Scenario: Add Error Handling

**Original Code:**
```python
def load_data(filename):
    return pd.read_csv(filename)
```

**Prompt:** "Add error handling for file not found"

**Inline Diff Shows:**

```
Line 1: def load_data(filename):  [Red background]
        [✓ Accept] [✗ Reject]

        + def load_data(filename):  [Green]
        +     try:                  [Green]

Line 2:     return pd.read_csv(filename)  [Red background]

        +         return pd.read_csv(filename)  [Green]
        +     except FileNotFoundError:         [Green]
        +         raise ValueError(...)          [Green]
```

**Actions:**
- Click **Accept** → Changes applied instantly
- Click **Reject** → Changes discarded
- Mix and match for each hunk

## Advantages Over Modal Diff

### ✅ Benefits

1. **Context Preserved**: See surrounding code
2. **No Context Switching**: Stay in editor
3. **Faster Review**: Immediate visual feedback
4. **Familiar UX**: Like VS Code merge conflicts
5. **Less Clicks**: No modal to close
6. **Real-time**: Changes apply instantly

### 📊 Comparison

| Feature | Inline Diff | Modal Diff |
|---------|-------------|------------|
| **Context visibility** | ✅ Full file | ❌ Limited |
| **Navigation** | ✅ Scroll naturally | ❌ Separate scroll |
| **Application** | ✅ Instant | ⏱️ On close |
| **Multi-change** | ✅ Independent | 🔗 Grouped |
| **Screen space** | ✅ Uses editor | 📦 Overlay |
| **Familiarity** | ✅ VS Code-like | 🆕 Custom |

## Keyboard Shortcuts (Planned)

Future enhancements:
- `Ctrl+Shift+Y` - Accept hunk under cursor
- `Ctrl+Shift+N` - Reject hunk under cursor
- `F8` - Navigate to next change
- `Shift+F8` - Navigate to previous change

## Best Practices

### ✅ Do's

- **Review in context**: See how changes fit with surrounding code
- **Accept incrementally**: Accept changes one by one
- **Use minimap**: See all changes at a glance (red/green markers)
- **Scroll freely**: Navigate the file while reviewing

### ❌ Don'ts

- **Don't blind accept**: Always read the changes
- **Don't edit while reviewing**: Finish review first
- **Don't ignore context**: Context lines show important info

## Troubleshooting

### Issue: Buttons not showing

**Check:**
- Are there pending hunks?
- Is the editor focused?
- Try scrolling to the changed line

**Fix:**
- Refresh the page
- Re-generate the code

### Issue: Colors not visible

**Check:**
- Editor theme (must be dark mode)
- CSS styles loaded

**Fix:**
- Check browser console for errors
- Reload the page

### Issue: Accept doesn't work

**Check:**
- Is the change status "pending"?
- Console errors?

**Fix:**
- Check `currentChange` state
- Verify `applyDiffHunks` function

## Performance

- **Decorations**: Very fast, < 10ms
- **Widgets**: Lightweight DOM nodes
- **Updates**: Reactive to state changes
- **Scaling**: Works well up to 50 hunks

## Future Enhancements

Planned improvements:
- [ ] Side-by-side view option
- [ ] Inline editing of suggested code
- [ ] Multi-cursor for batch accept
- [ ] Smart conflict resolution
- [ ] Diff export to file
- [ ] Per-line accept/reject (finer granularity)
- [ ] Undo specific accepts
- [ ] Change history viewer

## Integration

### Works With:

- ✅ Monaco Editor
- ✅ Code Generation mode
- ✅ File tab management
- ✅ Zustand state management

### Future Integration:

- [ ] Git integration (show git diffs)
- [ ] Multi-file diffs
- [ ] Diff templates
- [ ] Custom diff algorithms

---

**Enjoy seamless inline diff review! 🚀**

No more context switching, no more modals. Just pure, inline code review. ✨

