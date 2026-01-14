# 🌳 Git Branch Structure & Phase 2 Setup

**Updated:** January 14, 2026

---

## 📊 Current Branch Structure

```
MAIN REPO
│
├── main                              (Production - Old App)
│   └── Express.js backend
│   └── React/Vite frontend
│   └── NEVER TOUCH during migration
│
├── feat/nextjs-migration-phase1     (Merged into develop)
│   └── Phase 1: Complete ✅
│
├── develop                           (Migration Base) ← NEW
│   └── Long-lived development branch
│   └── All phases merge here first
│   └── Base for all feature branches
│
└── feat/nextjs-phase2               (Current Work) ← HERE
    └── API Routes Implementation
    └── Branch from: develop
    └── Testing as we go
```

---

## 🚀 Current Status

```
✅ Phase 1 Complete (feat/nextjs-migration-phase1)
   └── Infrastructure & Setup
   └── Merged into develop

🚧 Phase 2 Starting (feat/nextjs-phase2)
   └── API Routes Implementation
   └── Currently on this branch
   └── Testing strategy: Test as we go

⏳ Phase 3 Planned
   └── Frontend Integration
   
⏳ Phase 4 Planned
   └── Deployment & Optimization
```

---

## 🎯 Safety Strategy

### Why This Structure is Safe

1. **main** = Old working app (untouched) ✅
2. **develop** = Safe integration branch (new app in progress) ✅
3. **feat/** = Individual feature branches ✅
4. **Only merge to main** when entire migration is complete ✅

### Testing Checkpoints

```
Phase 1 ✅ (Infrastructure)
   ↓ (merged to develop)
Phase 2 🚧 (API Routes + Tests)
   ↓ (test as we go)
Phase 3 ⏳ (Frontend)
   ↓ (test integration)
Phase 4 ⏳ (Deploy)
   ↓ (final validation)
→ ONLY THEN merge develop → main
```

---

## 📝 What You're on Now

**Current Branch:** `feat/nextjs-phase2`  
**Tracking:** `origin/feat/nextjs-phase2`  
**Parent:** `develop`

### You can:
```bash
# Work and commit on this branch
git add .
git commit -m "feat: Add auth endpoints"
git push

# Check what's ahead
git log --oneline develop..feat/nextjs-phase2

# When ready, merge to develop
git checkout develop
git merge feat/nextjs-phase2 --no-ff
git push
```

---

## 🔄 Phase 2 Workflow

### Test As You Build Pattern

```
For each endpoint:

1. IMPLEMENT
   └── Create route/controller
   └── Add Zod validation
   └── Use Prisma for DB

2. TEST MANUALLY
   └── npm run dev
   └── curl http://localhost:3000/api/[endpoint]
   └── Verify response

3. WRITE AUTOMATED TEST
   └── Create test file
   └── Test happy path
   └── Test error cases
   └── npm run test

4. VERIFY
   └── npm run lint
   └── npm run build
   └── No errors?

5. COMMIT
   └── git add .
   └── git commit -m "feat: Add [endpoint]"
   └── git push

6. MOVE TO NEXT ENDPOINT
   └── Repeat
```

---

## 🧪 Testing Tools to Use

### Setup Vitest + Supertest

```bash
npm install --save-dev vitest @vitest/ui supertest @types/supertest
```

### Test File Structure

```typescript
// tests/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request } from './setup';

describe('POST /api/auth/register', () => {
  it('should register user with valid data', async () => {
    const res = await request.post('/api/auth/register')
      .send({
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject invalid email', async () => {
    const res = await request.post('/api/auth/register')
      .send({
        email: 'invalid',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

---

## 🚀 Start Phase 2 Now

### Step 1: Install Testing Tools
```bash
cd my-culture-app
npm install --save-dev vitest @vitest/ui supertest @types/supertest
```

### Step 2: Create Test Setup
```bash
# We'll create tests/setup.ts for test utilities
```

### Step 3: Implement First Endpoint
```bash
# POST /api/auth/register
# 1. Create route
# 2. Write test
# 3. Test manually
# 4. Commit
```

### Step 4: Continue Pattern
For each endpoint:
- Implement
- Test (manual + automated)
- Commit
- Move to next

---

## 📋 Phase 2 Endpoints (In Order)

### Week 1: Authentication (Priority 1)
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
GET    /api/auth/me              - Get current user
✓ Each with: Implementation + Test + Manual verification
```

### Week 2: User Management (Priority 2)
```
GET    /api/users                - List users (admin)
GET    /api/users/:id            - Get user by ID
PUT    /api/users/:id            - Update user
DELETE /api/users/:id            - Delete user
✓ Each with: Tests + Authorization checks
```

### Week 3: Content Management (Priority 3)
```
Organizations CRUD               - 5 endpoints
Events CRUD                      - 5 endpoints
Blogs CRUD                       - 4 endpoints
✓ Each with: Tests + Pagination
```

### Week 4: Polish (Priority 4)
```
Certificates endpoints           - 3 endpoints
Galleries endpoints              - 3 endpoints
Error handling improvements
API documentation
Final integration tests
```

---

## ✅ Commit Messages Template

```bash
# New endpoint
git commit -m "feat: Add POST /api/auth/register endpoint"

# With tests
git commit -m "feat: Add auth endpoints with comprehensive tests"

# Bug fix
git commit -m "fix: Validate email in login endpoint"

# Documentation
git commit -m "docs: Add API endpoint documentation"

# Refactor
git commit -m "refactor: Extract auth logic to controller"
```

---

## 📊 Progress Tracking

### Phase 2 Checklist

**Week 1: Auth Endpoints**
- [ ] POST /api/auth/register (impl + test)
- [ ] POST /api/auth/login (impl + test)
- [ ] GET /api/auth/me (impl + test)
- [ ] Test suite passing
- [ ] Manual testing complete

**Week 2: User Management**
- [ ] GET /api/users (impl + test)
- [ ] GET /api/users/:id (impl + test)
- [ ] PUT /api/users/:id (impl + test)
- [ ] DELETE /api/users/:id (impl + test)
- [ ] Authorization verified

**Week 3: Content Management**
- [ ] Organizations CRUD (5 endpoints + tests)
- [ ] Events CRUD (5 endpoints + tests)
- [ ] Blogs CRUD (4 endpoints + tests)
- [ ] Pagination working

**Week 4: Polish**
- [ ] Certificates endpoints (3 + tests)
- [ ] Galleries endpoints (3 + tests)
- [ ] Error handling comprehensive
- [ ] All tests passing
- [ ] API documentation
- [ ] Ready for Phase 3

---

## 🎯 Before Moving to Next Endpoint

Checklist:
```
[ ] Endpoint implemented
[ ] Zod validation applied
[ ] Manual test passed (curl/Postman)
[ ] Automated test written
[ ] Happy path tested
[ ] Error cases tested
[ ] Authorization verified
[ ] No TypeScript errors
[ ] No ESLint warnings
[ ] Code formatted (prettier)
[ ] Committed to feat/nextjs-phase2
[ ] Pushed to origin
```

---

## 🔐 Important Notes

1. **Don't touch main** - It stays as is ✅
2. **Build on develop** - All features branch from here ✅
3. **Test as you go** - No surprises at the end ✅
4. **Small commits** - Easy to review and revert if needed ✅
5. **Phase 3 uses Phase 2** - API must be working perfectly ✅

---

## 🚀 Ready? Let's Go!

### Next Action: Implement Auth Endpoints

1. Set up testing tools
2. Create test setup file
3. Implement POST /api/auth/register
4. Write tests
5. Test manually
6. Commit

**Let's build the API! 💪**
