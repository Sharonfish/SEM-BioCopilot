# Inline Diff - Updated Implementation ✨

## Visual Layout

The new inline diff shows changes **directly in the editor** with proper separation:

```
┌─────────────────────────────────────────────────────────┐
│ Line 1  │ import pandas as pd                           │
│ Line 2  │ import numpy as np                            │
│ Line 3  │                                               │
├─────────┴───────────────────────────────────────────────┤
│ Line 4  │ def preprocess_data(df):        [RED BG]      │ ← Deleted (red)
├─────────────────────────────────────────────────────────┤
│         │ + def preprocess_data(df: pd.DataFrame) -> pd.DataFrame: │ [Accept] [Reject]
│         │   [GREEN BG]                                  │ ← Added (green)
│         │ + """Preprocess gene expression data"""      │
│         │   [GREEN BG]                                  │ ← Added (green)
├─────────┴───────────────────────────────────────────────┤
│ Line 5  │     # Remove missing values                   │
│ Line 6  │     df = df.dropna()                          │
└─────────┴───────────────────────────────────────────────┘
```

## Key Features

### 1. Separated Display

- **Red lines (deleted)**: Original lines with red background
- **Green lines (added)**: New lines shown in a separate zone below
- **Clear separation**: Visual distinction between old and new

### 2. Button Placement

Accept/Reject buttons appear:
- **On the right side** of the first added line (green)
- **Horizontally arranged**: [Accept] [Reject]
- **If only deletions**: Buttons appear in a small zone below the red line

### 3. Visual Indicators

- **Red background**: `rgba(220, 38, 38, 0.15)`
- **Red left border**: 3px solid `#dc2626`
- **Red gutter marker**: `−` symbol
- **Green background**: `rgba(34, 197, 94, 0.12)`
- **Green left border**: 3px solid `#16a34a`
- **Green prefix**: `+` symbol before each added line

## How It Works

### Monaco Editor Features

1. **Decorations**: Red highlighting for deleted lines
2. **View Zones**: Extra space below deleted lines to show added lines
3. **Custom DOM**: Buttons and green lines rendered as DOM elements

### Workflow

```
1. Code generated
         ↓
2. Diff calculated
         ↓
3. Red decorations applied to deleted lines
         ↓
4. View zones inserted below with green lines
         ↓
5. Buttons shown on right side
         ↓
6. User clicks Accept/Reject
         ↓
7. Changes applied immediately
```

## Example Scenarios

### Scenario 1: Modify Function Signature

**Before:**
```python
Line 10: def process_data(df):
Line 11:     return df.head()
```

**After AI Generation:**

```
Line 10: def process_data(df):                [RED BACKGROUND]
         + def process_data(df: pd.DataFrame) -> pd.DataFrame:  [Accept] [Reject]
         + """Process gene expression data"""
Line 11:     return df.head()
```

### Scenario 2: Delete Only (No Additions)

**Before:**
```python
Line 5: import sys
Line 6: import pandas as pd
```

**After AI Generation:**

```
Line 5: import sys                            [RED BACKGROUND]
        [Accept] [Reject]  ← Buttons in separate zone
Line 6: import pandas as pd
```

### Scenario 3: Multiple Changes

**Before:**
```python
Line 1: import pandas as pd
Line 2: import numpy as np
Line 3:
Line 4: def load_data(filename):
Line 5:     return pd.read_csv(filename)
```

**After AI Generation:**

```
Line 1: import pandas as pd                    [RED BACKGROUND]
Line 2: import numpy as np                     [RED BACKGROUND]
        + import pandas as pd
        + import numpy as np
        + from typing import Optional          [Accept] [Reject]

Line 3:
Line 4: def load_data(filename):               [RED BACKGROUND]
        + def load_data(filename: str) -> pd.DataFrame:  [Accept] [Reject]

Line 5:     return pd.read_csv(filename)
```

## Button Behavior

### Accept Button
- **Color**: Green (`#16a34a`)
- **Action**: Apply the change immediately
- **Effect**: 
  - Red line(s) removed
  - Green line(s) inserted
  - File marked as modified
  - Diff decorations cleared for this hunk

### Reject Button
- **Color**: Red (`#dc2626`)
- **Action**: Discard the change
- **Effect**:
  - Red line(s) kept
  - Green line(s) ignored
  - Diff decorations cleared for this hunk
  - No file modification

### Hover Effects
- **Opacity**: Reduces to 85% on hover
- **Transform**: Slight lift effect (planned)
- **Cursor**: Changes to pointer

## Technical Details

### View Zones

Monaco Editor's view zones allow inserting extra content:
- **Position**: After a specific line number
- **Height**: Specified in line units
- **Content**: Custom DOM node
- **Non-intrusive**: Doesn't modify actual file content

### Decorations

Applied to deleted lines:
```typescript
{
  isWholeLine: true,
  className: 'inline-diff-deleted-line',
  linesDecorationsClassName: 'inline-diff-gutter-deleted',
  glyphMarginClassName: 'inline-diff-glyph-deleted',
}
```

### Custom DOM for Added Lines

```typescript
const lineDiv = document.createElement('div')
lineDiv.style = 'display: flex; color: #22c55e; ...'

const prefix = document.createElement('span')
prefix.textContent = '+ '

const content = document.createElement('span')
content.textContent = line.content

const buttons = [acceptBtn, rejectBtn]
```

## Performance

- **Decorations**: O(n) where n = number of deleted lines
- **View Zones**: O(m) where m = number of hunks
- **DOM Nodes**: Minimal, only for added lines and buttons
- **Rendering**: Fast, < 50ms for typical changes

## Advantages

### ✅ vs Modal Diff
- See full file context
- No overlay blocking view
- Scroll naturally through changes
- Immediate visual feedback

### ✅ vs Inline Merge (Old Version)
- Clear separation of deleted vs added
- Not confusing (lines don't overlap)
- Buttons clearly associated with changes
- More readable

## Limitations

### Known Issues

1. **View zones don't scroll perfectly**: May need adjustment on zoom
2. **Button positioning**: Fixed on right, may clip on narrow editors
3. **Line wrapping**: Long lines in green zones don't wrap well

### Workarounds

- **Zoom**: Reload diff if zooming
- **Narrow editor**: Expand editor width
- **Long lines**: Keep generated code concise

## Future Improvements

- [ ] Responsive button positioning
- [ ] Keyboard navigation (Tab to next change)
- [ ] Minimap markers for all changes
- [ ] Smooth animations for accept/reject
- [ ] Batch operations (Accept all above/below)
- [ ] Undo individual accepts
- [ ] Per-line granularity (not just per-hunk)

## Styling Customization

You can customize colors in `injectInlineDiffStyles()`:

```typescript
// Deleted line background
background-color: rgba(220, 38, 38, 0.15)

// Added line background
background-color: rgba(34, 197, 94, 0.12)

// Button colors
Accept: #16a34a (green)
Reject: #dc2626 (red)
```

---

**Now you can review code changes inline, exactly like the image you showed! 🎨**

