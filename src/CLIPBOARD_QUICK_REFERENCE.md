# Clipboard & Copy-Paste Quick Reference 🚀

## TL;DR

### ✅ Copy-Paste DISABLED:
- Exercise code editor
- Assessment code questions  
- Project code editor

### ✅ Copy-Paste ENABLED:
- ManageAccount (copy user code)
- All other text fields
- Chat assistant
- Report issue
- Profile
- Everything else

---

## For Users

### When Writing Code (Exercises/Assessments/Projects):
- ❌ **Cannot** copy code
- ❌ **Cannot** paste code
- ❌ **Cannot** use Ctrl+C, Ctrl+V
- ✅ **Can** type freely
- ✅ **Can** submit solutions
- 💡 **Why?** Academic integrity - you must write your own code!

### When Managing Account:
- ✅ **Can** copy user code
- ✅ Copy button works perfectly
- ✅ Clipboard API with fallbacks
- ✅ Works in all browsers

### Everywhere Else:
- ✅ Copy-paste works normally
- ✅ No restrictions
- ✅ Full functionality

---

## For Developers

### To Disable Copy-Paste (Assessment Areas):
```typescript
import { getCopyPastePreventionProps } from '../utils/preventCopyPaste';

<Textarea
  {...getCopyPastePreventionProps()}
/>
```

### To Enable Copy Function (User-Facing):
```typescript
import { copyToClipboard } from '../utils/clipboardUtils';

const handleCopy = async () => {
  const success = await copyToClipboard(text);
};
```

### Components with Prevention:
- `ExerciseViewer.tsx` - Line 455
- `Assessment.tsx` - Line 781  
- `ProjectViewer.tsx` - Line 333

### Components with Copy Enabled:
- `ManageAccount.tsx` - Copy user code button

---

## Error Handling

### Clipboard API Blocked?
✅ **Automatic silent fallback** to execCommand  
✅ **Works in all contexts** (HTTP/HTTPS/iframes)  
✅ **No scary error logs** - only logs unexpected errors  
✅ **Graceful degradation** - user never sees failures  

### Prevention Not Working?
1. Check props are spread correctly
2. Verify import path
3. Check browser console for logs

---

## Browser Support

### Copy-Paste Prevention:
✅ Chrome/Edge  
✅ Firefox  
✅ Safari  
✅ Mobile browsers  

### Clipboard Copy:
✅ All modern browsers  
✅ HTTP and HTTPS  
✅ With fallback methods  

---

## Quick Tests

### Test Prevention:
1. Go to an Exercise
2. Try Ctrl+C in code editor
3. Should see: "Copy disabled..." in console
4. ✅ Prevention working!

### Test Copy Button:
1. Go to Profile → Manage Account
2. Click "Copy Code" button
3. Should see: "Copied to clipboard!"
4. ✅ Copy working!

---

**Last Updated**: January 2025  
**Status**: Production Ready ✅
