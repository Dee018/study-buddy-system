# 🔬 XP Display Debug Guide

## After deploying the latest changes, check these console logs:

### 1️⃣ Database Query (ProgressService)

Look for:

```
[ProgressService] 🔍 getUserProgress raw data from DB: {
  userId: '...',
  total_xp: ???,  ← Should be 200
  ...
}
```

**If total_xp is 200:** Database has correct value ✅
**If total_xp is 100 or undefined:** Database issue ❌

### 2️⃣ ProgressContext State Setting

Look for:

```
[ProgressContext] 🔍 About to set state from progressRow: {
  parsed_total_xp: ???,  ← Should be 200
  progressRow_total_xp: ???,  ← Should be 200
  final_value: ???  ← Should be 200
}
```

**If all show 200:** Parsing works correctly ✅
**If any show 100:** Parsing bug ❌

### 3️⃣ ProgressContext totalXP State

Look for:

```
[ProgressContext] 📊 totalXP state changed: ???  ← Should be 200
```

**If 200:** Context state correct ✅
**If 100:** State setting issue ❌

### 4️⃣ App.tsx Progress Sync

Look for:

```
[App] Progress sync effect triggered: {
  contextTotalXP: ???,  ← Should be 200
  newPoints: ???  ← Should be 200
}
```

**If both 200:** Sync works ✅
**If 100:** Context not providing correct value ❌

### 5️⃣ Bootstrap Initial Load

Look for:

```
[Bootstrap] Progress data loaded: {
  total_xp: ???  ← Should be 200
}
[Bootstrap] Setting initial userData: {
  actualTotalXP: ???  ← Should be 200
}
```

**If both 200:** Bootstrap works ✅
**If 100:** Bootstrap calculation wrong ❌

### 6️⃣ ProgressSyncManager (if used)

Look for:

```
[ProgressSync] ✅ Applied top-level columns: {
  total_xp: ???  ← Should be 200
}
```

**If 200:** Query fix works ✅
**If 100 or missing:** Query still broken ❌

## 🎯 What Each Log Tells Us:

| Log Shows 200              | Log Shows 100/0 | Diagnosis                     |
| -------------------------- | --------------- | ----------------------------- |
| Database                   | App Display     | **Data lost in parsing/sync** |
| Database & Parse           | Display         | **React state not updating**  |
| Database & Parse & Context | Display         | **App.tsx sync not working**  |
| None                       | Display         | **Database has wrong value**  |

## 🔧 Quick Fixes Based on Logs:

### If database shows 100:

```sql
-- Check actual database value
SELECT user_id, total_xp FROM user_progress WHERE user_id = 'your-id';

-- If wrong, update it
UPDATE user_progress SET total_xp = 200 WHERE user_id = 'your-id';
```

### If parsing shows 100 but DB shows 200:

- Issue in ProgressContext.tsx parsing logic (lines 170-186)
- Check that we're reading from top-level columns: `progressRow.total_xp`

### If context state shows 100 but parsing shows 200:

- Issue in `setTotalXP()` call (line 197)
- Check React state not being overwritten

### If App sync shows 100 but context shows 200:

- Issue in App.tsx useEffect (lines 223-261)
- Check `progressContext.totalXP` is being read correctly

## 📸 What The Console Should Look Like (Success):

```
[ProgressService] 🔍 getUserProgress raw data from DB: { total_xp: 200 }
[ProgressContext] 🔍 About to set state: { parsed_total_xp: 200, final_value: 200 }
[ProgressContext] ✅ Progress hydrated - totalXP set to: 200
[ProgressContext] 📊 totalXP state changed: 200
[Bootstrap] Progress data loaded: { total_xp: 200 }
[Bootstrap] Setting initial userData: { actualTotalXP: 200 }
[App] Progress sync effect triggered: { contextTotalXP: 200, newPoints: 200 }
[App] ✅ Syncing progress to userData { newPoints: 200 }
```

Then navigation bar shows: **✨ 200** ✅

## 🚨 If Still Showing 100:

1. **Check deployment**: Ensure Railway deployed the latest code
2. **Hard reload**: Ctrl+Shift+R (clear cache)
3. **Check database**: Run SQL query to verify `total_xp` column value
4. **Check logs**: Share the complete console output showing the numbered steps above
5. **Check network**: Look at Network tab for the `user_progress` API call

## 📋 Information Needed If Still Broken:

Please provide:

1. Screenshot of console showing all logs above
2. Network tab showing the `/rest/v1/user_progress?user_id=...` request & response
3. Your user ID
4. Result of SQL query: `SELECT total_xp, current_level FROM user_progress WHERE user_id = 'your-id'`
