# Citation Network Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with the newly migrated Semantic Scholar API for the Citation Network feature.

---

## ✅ Prerequisites

- [x] Node.js installed (v18 or later)
- [x] npm installed
- [x] BioCopilot repository cloned
- [x] API key already configured in `.env.local` ✅

---

## 📦 Step 1: Install Dependencies

```bash
# Install all dependencies
npm install

# Install testing dependencies (if not already installed)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @swc/jest
```

**Expected output:** Dependencies installed successfully

---

## 🔑 Step 2: Verify API Configuration

```bash
# Check that API key is configured
cat .env.local | grep SEMANTIC_SCHOLAR_API_KEY

# Should see:
# SEMANTIC_SCHOLAR_API_KEY=4cpckMap2F8phvsRjCgr1azzEiNSsTpm3AleiknM
```

✅ **Status:** API key already configured!

---

## 🏃 Step 3: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
> biocopilot@0.1.0 dev
> next dev

  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

---

## 🧪 Step 4: Test the API

### Option A: Browser Test

1. Navigate to: http://localhost:3000/api/citation/search
2. You should see:
```json
{
  "status": "ok",
  "service": "Citation Search API (Semantic Scholar)",
  "configured": true,
  "rateLimit": "1 request per second",
  "message": "Citation search is ready"
}
```

### Option B: Command Line Test

```bash
# Test search endpoint
curl -X POST http://localhost:3000/api/citation/search \
  -H "Content-Type: application/json" \
  -d '{"query":"CRISPR gene editing","maxResults":5}'
```

**Expected output:** JSON with 5 papers about CRISPR

---

## ✅ Step 5: Verify Everything Works

Run the automated tests:

```bash
# Run all tests
npm test

# Or run with coverage
npm run test:coverage
```

**Expected result:** Tests pass ✅

---

## 🎯 Next Steps

### For Developers

1. **Read the migration guide:**
   ```bash
   open SEMANTIC_SCHOLAR_MIGRATION.md
   ```

2. **Review the API service code:**
   ```bash
   code src/services/semanticScholarApi.ts
   ```

3. **Try the API functions:**
   ```typescript
   import { searchPapers } from '@/src/services/semanticScholarApi';

   const papers = await searchPapers('CRISPR', { maxResults: 10 });
   console.log(`Found ${papers.length} papers`);
   ```

### For QA Testers

1. **Read the testing guide:**
   ```bash
   open MANUAL_TESTING_GUIDE.md
   ```

2. **Start manual testing:**
   - Navigate to http://localhost:3000/citation-network
   - Follow test procedures in the guide

3. **Use the checklist:**
   ```bash
   open IMPLEMENTATION_CHECKLIST.md
   ```

### For Product Managers

1. **Review project status:**
   ```bash
   open CITATION_NETWORK_COMPLETE.md
   ```

2. **Check feature coverage:**
   - ✅ API migration complete
   - ✅ Testing infrastructure ready
   - 🔄 UI integration pending

---

## 📚 Documentation Map

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| `QUICK_START.md` (this file) | Get started quickly | 5 min |
| `CITATION_NETWORK_COMPLETE.md` | Project overview | 10 min |
| `SEMANTIC_SCHOLAR_MIGRATION.md` | API migration details | 15 min |
| `TESTING_README.md` | Testing infrastructure | 10 min |
| `IMPLEMENTATION_CHECKLIST.md` | Feature checklist | Reference |
| `MANUAL_TESTING_GUIDE.md` | Testing procedures | 4+ hours |

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# API Testing
curl http://localhost:3000/api/citation/search  # Health check

curl -X POST http://localhost:3000/api/citation/search \
  -H "Content-Type: application/json" \
  -d '{"query":"protein folding","maxResults":10}'  # Search
```

---

## 🐛 Troubleshooting

### Issue: Server won't start

**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Issue: API returns error

**Solution:**
```bash
# Check API key is set
cat .env.local | grep SEMANTIC_SCHOLAR_API_KEY

# Should output your API key
# If not, add it to .env.local:
echo "SEMANTIC_SCHOLAR_API_KEY=4cpckMap2F8phvsRjCgr1azzEiNSsTpm3AleiknM" >> .env.local

# Restart server
npm run dev
```

### Issue: Tests fail

**Solution:**
```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @swc/jest

# Run tests again
npm test
```

### Issue: "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
npm install

# Or install specific package
npm install <package-name>
```

---

## ✅ Verification Checklist

Before you start developing:

- [x] API key configured in `.env.local`
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts (`npm run dev`)
- [ ] API health check passes (http://localhost:3000/api/citation/search)
- [ ] Tests run successfully (`npm test`)
- [ ] You've read `CITATION_NETWORK_COMPLETE.md`

---

## 🎓 Learning Path

**Beginner:**
1. Read this Quick Start ✅
2. Read `CITATION_NETWORK_COMPLETE.md`
3. Try the API with curl
4. Review `src/services/semanticScholarApi.ts`

**Intermediate:**
1. Read `SEMANTIC_SCHOLAR_MIGRATION.md`
2. Run the test suite
3. Review test files in `src/__tests__/`
4. Try writing a simple test

**Advanced:**
1. Read `TESTING_README.md`
2. Follow `MANUAL_TESTING_GUIDE.md`
3. Review `IMPLEMENTATION_CHECKLIST.md`
4. Contribute new features or tests

---

## 📞 Need Help?

1. **Check the docs** - Most questions are answered in:
   - `SEMANTIC_SCHOLAR_MIGRATION.md` (API questions)
   - `TESTING_README.md` (Testing questions)
   - `MANUAL_TESTING_GUIDE.md` (How to test)

2. **Search the code** - Look at working examples:
   - `src/services/semanticScholarApi.ts` (API usage)
   - `src/__tests__/semanticScholarApi.test.ts` (Test examples)

3. **Try it yourself** - Best way to learn:
   ```bash
   npm run dev
   # Then experiment with the API
   ```

---

## 🎯 Success!

If you can:
- ✅ Start the dev server
- ✅ See the API health check response
- ✅ Run a search and get results
- ✅ Run tests successfully

**You're ready to go! 🚀**

---

## 🗺️ What's Next?

### Immediate (This Week)
- Update UI components to use new API
- Test citation network page
- Verify graph rendering

### Short Term (Next Sprint)
- Complete manual testing
- Add new features (recommendations, TL;DR)
- Performance optimization

### Long Term
- Advanced caching
- Analytics integration
- User onboarding
- Feature expansion

---

**Time to Complete This Guide:** ~10 minutes
**Last Updated:** 2025-12-01
**Questions?** Check `CITATION_NETWORK_COMPLETE.md`

🎉 **Happy Coding!** 🎉
