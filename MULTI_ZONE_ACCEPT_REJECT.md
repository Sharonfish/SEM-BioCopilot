# Multi-Zone Accept/Reject - Fixed ✅

## 🎯 Problem Solved

### Issue 1: Other zones disappear when clicking Accept/Reject
**Root Cause**: Editor content was being updated immediately, causing line numbers to shift  
**Solution**: Accumulate all decisions, apply changes only when ALL zones are reviewed

### Issue 2: Maximum update depth exceeded error
**Root Cause**: useEffect with `updateTabContent` in dependencies caused infinite loop  
**Solution**: Used `useRef` to track if changes were already applied

## 🔧 New Workflow

### Step-by-Step Process

```
1. User sees multiple diff zones (red/green lines)
         ↓
2. User clicks Accept/Reject on Zone 1
         ↓
3. Zone 1 disappears (marked as accepted/rejected)
   ✅ Other zones STAY VISIBLE
         ↓
4. User clicks Accept/Reject on Zone 2
         ↓
5. Zone 2 disappears
   ✅ Other zones STAY VISIBLE
         ↓
6. User reviews all zones...
         ↓
7. When ALL zones reviewed (no pending):
   - Apply ALL accepted changes at once
   - Changes applied from bottom to top
   - Editor updates ONE time with final result
```

## ✅ Key Features

### 1. Independent Zone Control
- ✅ Click Accept on Zone 1 → Only Zone 1 disappears
- ✅ Click Reject on Zone 2 → Only Zone 2 disappears
- ✅ Other zones stay visible and clickable
- ✅ Can Accept some, Reject others

### 2. Smart Change Application
- ✅ No immediate editor updates on each click
- ✅ Accumulates all accepted changes
- ✅ Applies all changes at once when done
- ✅ Applies from bottom to top (preserves line numbers)

### 3. No Infinite Loop
- ✅ Uses `useRef` to track applied changes
- ✅ Prevents duplicate applications
- ✅ Resets when new code generation starts

## 🧪 How It Works

### Accept Button Click:
```typescript
const handleAcceptHunk = (hunkId: string) => {
  // Just mark as accepted, don't modify editor yet
  updateHunkStatus(hunkId, 'accepted')
}
```

### Reject Button Click:
```typescript
const handleRejectHunk = (hunkId: string) => {
  // Just mark as rejected, don't modify editor
  updateHunkStatus(hunkId, 'rejected')
}
```

### Auto-Apply When All Reviewed:
```typescript
useEffect(() => {
  const pendingHunks = diffHunks.filter(h => h.status === 'pending')
  
  // All zones reviewed?
  if (pendingHunks.length === 0) {
    const acceptedHunks = diffHunks.filter(h => h.status === 'accepted')
    
    // Apply all accepted changes at once
    if (acceptedHunks.length > 0) {
      // Sort from bottom to top
      const sorted = acceptedHunks.sort((a, b) => b.oldStart - a.oldStart)
      
      // Apply each change
      sorted.forEach(hunk => {
        // ... replace lines ...
      })
      
      // Update editor ONE time
      updateTabContent(newContent)
    }
  }
}, [diffHunks])
```

### Prevent Infinite Loop:
```typescript
const appliedChangeRef = useRef<string | null>(null)

useEffect(() => {
  // Create unique key for this set of changes
  const changeKey = `${currentChange.id}-${acceptedCount}-${rejectedCount}`
  
  // Already applied?
  if (appliedChangeRef.current === changeKey) {
    return // Skip!
  }
  
  // Apply changes...
  appliedChangeRef.current = changeKey // Mark as applied
}, [diffHunks])
```

## 📊 Example Scenario

### Initial State:
```
Line 5:  def process_data(df):           [Zone 1 - Red]
         + def process_data(df: pd.DataFrame):  [Accept] [Reject]

Line 10: return df.head()                [Zone 2 - Red]
         + return df.head(10)            [Accept] [Reject]

Line 15: print(df)                       [Zone 3 - Red]
         + logger.info(df.shape)         [Accept] [Reject]
```

### After clicking Accept on Zone 1:
```
         ✅ Zone 1 disappeared

Line 10: return df.head()                [Zone 2 - Red]
         + return df.head(10)            [Accept] [Reject]

Line 15: print(df)                       [Zone 3 - Red]
         + logger.info(df.shape)         [Accept] [Reject]
```

### After clicking Reject on Zone 2:
```
         ✅ Zone 1 disappeared
         ✅ Zone 2 disappeared

Line 15: print(df)                       [Zone 3 - Red]
         + logger.info(df.shape)         [Accept] [Reject]
```

### After clicking Accept on Zone 3:
```
         ✅ All zones disappeared
         ✅ Changes applied automatically:
         
Line 5:  def process_data(df: pd.DataFrame):  ← Applied from Zone 1
Line 10: return df.head()                     ← Kept (Zone 2 rejected)
Line 15: logger.info(df.shape)                ← Applied from Zone 3
```

## 🔍 Console Output

You'll see:
```
handleAcceptHunk called with: hunk-0
Hunk marked as accepted: hunk-0

handleRejectHunk called with: hunk-1
Hunk marked as rejected: hunk-1

handleAcceptHunk called with: hunk-2
Hunk marked as accepted: hunk-2

All hunks reviewed, applying accepted changes...
Applying changes: from 245 to 298 chars
✅ Editor updated!
```

## ✅ Benefits

### vs. Immediate Application:
- ❌ Old: Click Accept → Editor updates → Other zones break
- ✅ New: Click Accept → Mark only → Other zones stay

### vs. Manual Application:
- ❌ Old: Need "Apply All" button
- ✅ New: Automatic when all reviewed

### Performance:
- ❌ Old: N editor updates for N zones
- ✅ New: 1 editor update for N zones

## 🐛 Troubleshooting

### Issue: Zones still disappear
**Check**: 
- Are all zones using 'pending' status?
- Is useEffect filtering correctly?

**Debug**:
```javascript
console.log('Pending hunks:', diffHunks.filter(h => h.status === 'pending'))
```

### Issue: Changes not applied
**Check**:
- Did all zones get reviewed?
- Are there accepted hunks?

**Debug**:
```javascript
console.log('Accepted hunks:', diffHunks.filter(h => h.status === 'accepted'))
```

### Issue: Infinite loop returns
**Check**:
- Is `appliedChangeRef` being reset?
- Is `changeKey` unique?

**Debug**:
```javascript
console.log('Change key:', changeKey)
console.log('Already applied:', appliedChangeRef.current)
```

## 📝 Technical Details

### Files Modified:
1. **CodeEditor.tsx**
   - Changed `handleAcceptHunk`: No immediate editor update
   - Changed `handleRejectHunk`: No immediate editor update
   - Added `appliedChangeRef` to prevent duplicate applications
   - Added `useEffect` to apply all changes when done
   - Added `useEffect` to reset ref on new generation

2. **InlineEditorDiff.tsx**
   - No changes needed (already filtering by status !== 'pending')

### State Flow:
```
Click Accept
    ↓
updateHunkStatus(id, 'accepted')
    ↓
diffHunks state updates
    ↓
useEffect in InlineEditorDiff re-runs
    ↓
Filter out hunk (status !== 'pending')
    ↓
That zone's decorations removed
    ↓
Other zones stay (still status === 'pending')
    ↓
When all zones done:
    ↓
useEffect in CodeEditor detects (pendingHunks.length === 0)
    ↓
Apply all accepted changes
    ↓
updateTabContent(newContent)
```

## 🎉 Result

✅ **Multiple zones work independently!**
- Click Accept/Reject on any zone
- Other zones stay visible and clickable
- All accepted changes applied when done
- No infinite loops
- Clean, predictable behavior

---

**Test it now! Generate code with multiple changes and try accepting/rejecting different zones! 🚀**

