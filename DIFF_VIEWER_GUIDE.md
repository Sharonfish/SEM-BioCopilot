# Inline Diff Viewer - GitHub-Style Code Review 🔍

## Overview

BioCopilot now features a sophisticated **inline diff viewer** that works exactly like GitHub's merge conflict resolution, allowing you to review and accept/reject code changes **line by line**.

## How It Works

### Workflow

```
1. Generate Code (in Code Gen mode)
         ↓
2. Diff Viewer Opens Automatically
         ↓
3. Review Changes Line by Line
         ↓
4. Accept or Reject Each Change
         ↓
5. Apply Accepted Changes to Editor
```

## Features

### 🎯 Line-by-Line Diff Display

- **Red Lines (-)**: Code that will be deleted
- **Green Lines (+)**: Code that will be added
- **Gray Lines**: Context (unchanged code)
- **Line Numbers**: Shows old and new line positions

### ✅ Granular Control

- **Accept/Reject Per Change**: Each code chunk has its own buttons
- **Accept All**: Apply all changes at once
- **Reject All**: Discard all changes
- **Collapsible Hunks**: Expand/collapse change sections

### 📊 Change Summary

- Total number of changes
- Lines added/deleted count
- Accepted/rejected status tracking

## Visual Guide

### What You'll See

```
┌─────────────────────────────────────────────────────┐
│  Review Code Changes                          [X]   │
│  +15 added  -8 deleted  3 changes                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ▼ Change #1  Lines 10-15        [Accept] [Reject] │
│  ┌──────────────────────────────────────────────┐  │
│  │ 8  │   # Context before                       │  │
│  │ 9  │   import pandas as pd                    │  │
│  │ 10 │ - def process_data(df):                  │  │ RED
│  │ 10 │ + def process_data(df) -> pd.DataFrame:  │  │ GREEN
│  │ 11 │ + """Process gene expression data"""    │  │ GREEN
│  │ 12 │     scaler = StandardScaler()            │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ▶ Change #2  Lines 20-22        [Accept] [Reject] │
│                                                      │
│  ▶ Change #3  Lines 35-40        [Accept] [Reject] │
│                                                      │
├─────────────────────────────────────────────────────┤
│  [Cancel]              [Reject All] [Accept All]    │
└─────────────────────────────────────────────────────┘
```

## Usage Example

### Scenario: Adding Type Hints

**Step 1: Select code in editor**
```python
def process_data(df):
    scaler = StandardScaler()
    return scaler.fit_transform(df)
```

**Step 2: Go to "Generate Code" mode**
- Enter prompt: "Add type hints and docstrings"
- Click "Generate Code"

**Step 3: Review in Diff Viewer**
```diff
  10 | - def process_data(df):
  11 | + def process_data(df: pd.DataFrame) -> np.ndarray:
  12 | + """
  13 | + Process gene expression data with standardization.
  14 | + 
  15 | + Args:
  16 | +     df: Input DataFrame with gene expression values
  17 | + 
  18 | + Returns:
  19 | +     Standardized expression array
  20 | + """
  21 |     scaler = StandardScaler()
```

**Step 4: Accept or Reject**
- Click "Accept" on the change you want
- Click "Reject" on changes you don't want
- Or use "Accept All" / "Reject All"

**Step 5: Changes Applied**
- Accepted changes are applied to the editor
- File is marked as modified (•)
- You can save with Ctrl+S

## Features in Detail

### 1. Collapsible Change Hunks

Each change block can be collapsed or expanded:
- **▼ Expanded**: Shows full diff with context
- **▶ Collapsed**: Shows only summary
- Click the chevron to toggle

### 2. Context Lines

Each change shows **3 lines of context** before and after:
- Helps you understand the change in context
- Gray color indicates unchanged lines
- Ensures you know exactly where changes occur

### 3. Status Indicators

**Pending** (default):
- White/gray background
- Accept/Reject buttons visible
- Can be modified

**Accepted**:
- Green border and background
- Shows ✓ Accepted
- Will be applied when you close

**Rejected**:
- Red border and background
- Shows ✗ Rejected
- Will be ignored when you close

### 4. Smart Application

- Only **accepted** hunks are applied
- Changes applied from bottom to top (preserves line numbers)
- Original code preserved if all changes rejected
- Undo available via editor undo (Ctrl+Z)

## Technical Details

### Diff Algorithm

Uses a simple but effective line-by-line comparison:
1. Compares original vs generated code
2. Identifies added, deleted, and unchanged lines
3. Groups changes into "hunks"
4. Provides context lines around each change

### Components

**InlineDiffViewer.tsx**
- Main diff display component
- Handles all UI for reviewing changes
- Shows line numbers, +/- indicators
- Accept/Reject buttons per hunk

**diff-utils.ts**
- `calculateLineDiff()`: Compute diffs
- `applyDiffHunks()`: Apply accepted changes
- `getDiffSummary()`: Get change statistics

**copilotModeStore.ts**
- Stores diff hunks
- Manages diff viewer visibility
- Tracks accept/reject status

## Keyboard Shortcuts (Planned)

Future keyboard shortcuts:
- `Ctrl+Y` - Accept current hunk
- `Ctrl+N` - Reject current hunk
- `Ctrl+Shift+Y` - Accept all
- `Ctrl+Shift+N` - Reject all
- `Escape` - Close diff viewer

## Best Practices

### ✅ Do's

- **Review Carefully**: Always read each change before accepting
- **Test After**: Test code after applying changes
- **Small Prompts**: Use specific, targeted prompts for better results
- **Context**: Keep context lines to understand changes
- **Selective Accept**: Accept only changes you understand

### ❌ Don'ts

- **Don't Blind Accept**: Never accept all without review
- **Don't Skip Testing**: Always test after applying changes
- **Don't Trust Fully**: AI can make mistakes
- **Don't Ignore Context**: Context lines show important information

## Comparison with Cursor IDE

### Similarities ✅

- Line-by-line diff display
- Accept/Reject per change
- Visual indicators (red/green)
- Change grouping

### Differences

- **Hunk-Based**: Changes grouped into hunks (vs individual lines in Cursor)
- **Overlay View**: Full-screen modal (vs inline in Cursor)
- **Collapse/Expand**: Can hide/show hunks
- **Batch Operations**: Accept/Reject all at once

## Troubleshooting

### Issue: Diff viewer doesn't show

**Check:**
- Did code generation complete?
- Are there actual differences?
- Check browser console for errors

### Issue: Changes not applied

**Check:**
- Did you click "Accept" on the changes?
- Did you close the diff viewer (triggers application)?
- Check if the file tab shows modified (•)

### Issue: Wrong lines changed

**Cause:** Diff algorithm detected incorrect boundaries

**Solution:**
- Reject the change
- Try with smaller code selection
- Be more specific in your prompt

### Issue: Can't see all changes

**Solution:**
- Scroll in the diff viewer
- Click chevrons to expand collapsed hunks

## Advanced Usage

### Multi-Hunk Review

When AI generates multiple changes:
1. Review each hunk independently
2. Accept good changes
3. Reject problematic ones
4. AI learns from your patterns (future feature)

### Partial Acceptance

You can mix accept/reject:
- Accept hunks 1 and 3
- Reject hunk 2
- Only accepted changes apply

### Context Understanding

Use context lines to verify:
- Change doesn't break surrounding code
- Indentation is correct
- Logic flow makes sense

## Performance

### Optimization

- Diffs calculated client-side (fast)
- No server round-trip for review
- Changes applied in single operation
- Efficient for large files (tested up to 1000 lines)

### Limitations

- Very large files (>5000 lines) may be slow
- Complex diffs with many changes might be hard to review
- Suggestion: Break into smaller changes

## Future Enhancements

Planned improvements:
- [ ] Inline diff (in editor, not overlay)
- [ ] Side-by-side diff view option
- [ ] Syntax highlighting in diff
- [ ] Smart merge conflict resolution
- [ ] Diff export/share
- [ ] Change history and rollback
- [ ] AI suggestions on rejected changes

## Integration with Other Features

### Works With:

- ✅ Code Editor (Monaco)
- ✅ File tab management
- ✅ Code Generation mode
- ✅ Auto-save (after accept)

### Future Integration:

- [ ] Git integration (commit after accept)
- [ ] Undo/Redo stack
- [ ] Multi-file changes
- [ ] Collaborative review

---

**Happy Coding with Intelligent Diff Review! 🚀**

