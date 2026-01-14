#!/bin/bash
# Phase 1 Verification Script
# Checks that all Phase 1 components are properly set up

echo "🔍 Phase 1 Infrastructure Verification"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the my-culture-app directory"
    exit 1
fi

echo "✅ Directory: $(pwd)"
echo ""

# Check Prisma schema
echo "📋 Checking Prisma Schema..."
if [ -f "prisma/schema.prisma" ]; then
    MODEL_COUNT=$(grep -c "^model " prisma/schema.prisma)
    ENUM_COUNT=$(grep -c "^enum " prisma/schema.prisma)
    echo "   ✅ Schema found: $MODEL_COUNT models, $ENUM_COUNT enums"
else
    echo "   ❌ Schema not found"
    exit 1
fi
echo ""

# Check TypeScript files
echo "📝 Checking TypeScript Infrastructure..."
FILES=(
    "src/lib/types/index.ts"
    "src/lib/validation.ts"
    "src/lib/auth.ts"
    "src/lib/prisma.ts"
    "src/lib/api.ts"
    "src/middleware.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
        exit 1
    fi
done
echo ""

# Check dependencies
echo "📦 Checking Dependencies..."
DEPS=(
    "@prisma/client"
    "prisma"
    "zod"
    "jsonwebtoken"
    "bcryptjs"
    "dotenv"
)

for dep in "${DEPS[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        VERSION=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep@" | sed 's/.*@//')
        echo "   ✅ $dep"
    else
        echo "   ❌ $dep not installed"
        exit 1
    fi
done
echo ""

# Check Prisma Client
echo "🔧 Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "   ✅ Prisma Client generated"
else
    echo "   ⚠️  Prisma Client not generated (run: npm run prisma:generate)"
fi
echo ""

# Check environment file
echo "🔐 Checking Environment Configuration..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local found"
    if grep -q "DATABASE_URL" .env.local; then
        echo "   ✅ DATABASE_URL configured"
    else
        echo "   ⚠️  DATABASE_URL not set"
    fi
    if grep -q "JWT_SECRET" .env.local; then
        echo "   ✅ JWT_SECRET configured"
    else
        echo "   ⚠️  JWT_SECRET not set"
    fi
else
    echo "   ⚠️  .env.local not found (template exists)"
fi
echo ""

# Check TypeScript compilation
echo "🎯 Checking TypeScript Compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "   ✅ No TypeScript errors"
else
    echo "   ⚠️  TypeScript errors found (check with: npx tsc --noEmit)"
fi
echo ""

# Summary
echo "======================================"
echo "✨ Phase 1 Verification Complete!"
echo ""
echo "📚 Summary:"
echo "   - Prisma Schema: $MODEL_COUNT models"
echo "   - TypeScript Files: ${#FILES[@]} files"
echo "   - Dependencies: ${#DEPS[@]} packages"
echo ""
echo "🚀 Next Steps:"
echo "   1. Update .env.local with your PostgreSQL credentials"
echo "   2. Run: npm run db:push"
echo "   3. Run: npm run prisma:seed"
echo "   4. Run: npm run dev"
echo "   5. Test: http://localhost:3000/api/health"
echo ""
