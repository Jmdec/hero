const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');
const files = [
  'src/app/api/admin/contacts/[id]/reply/route.ts',
  'src/app/api/admin/contacts/[id]/route.ts',
  'src/app/api/admin/contacts/route.ts',
  'src/app/api/admin/testimonials/[id]/route.ts',
  'src/app/api/admin/testimonials/route.ts',
  'src/app/api/analytics/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/verify-email/route.ts',
  'src/app/api/chat/[conversationId]/email-history/route.ts',
  'src/app/api/contact/public/[token]/route.ts',
  'src/app/api/contact/route.ts',
  'src/app/api/newsletter/subscribe/route.ts',
  'src/app/api/newsletter/unsubscribe/route.ts',
  'src/app/api/quotations/[id]/notify-payment-approved/route.ts',
  'src/app/api/quotations/[id]/pay/route.ts',
  'src/app/api/quotations/[id]/payment-approved/route.ts',
  'src/app/api/quotations/[id]/payment-link/route.ts',
  'src/app/api/quotations/[id]/route.ts',
  'src/app/api/quotations/[id]/send-contract/route.ts',
  'src/app/api/quotations/[id]/send-email/route.ts',
  'src/app/api/quotations/[id]/send-payment-link/route.ts',
  'src/app/api/quotations/[id]/verify-payment/route.ts',
  'src/app/api/quotations/route.ts',
  'src/app/api/testimonials/[id]/route.ts',
  'src/app/api/testimonials/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/announcements/route.ts',
  'src/app/api/admin/announcements/route.ts',
  'src/app/api/admin/announcements/[id]/route.ts',
];

const importLine = 'import { getBackendBaseUrl, getBackendApiBaseUrl, getBackendAppBaseUrl } from "@/lib/backend";';

const replacements = [
  {
    find: 'const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";',
    replace: 'const API_URL = getBackendBaseUrl();',
  },
  {
    find: 'const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "http://localhost:8000";',
    replace: 'const API_URL = getBackendBaseUrl();',
  },
  {
    find: 'const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\\/\\+$/g, "");',
    replace: 'const API_URL = getBackendBaseUrl();',
  },
  {
    find: "const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\\/\\+$/g, '');",
    replace: 'const API_URL = getBackendBaseUrl();',
  },
  {
    find: 'const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";',
    replace: 'const LARAVEL_API_URL = getBackendApiBaseUrl();',
  },
  {
    find: 'const LARAVEL_API_URL = (process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\\/\\+$/g, "");',
    replace: 'const LARAVEL_API_URL = getBackendApiBaseUrl();',
  },
  {
    find: "const LARAVEL_API_URL = (process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\\/\\+$/g, '');",
    replace: 'const LARAVEL_API_URL = getBackendApiBaseUrl();',
  },
  {
    find: 'const LARAVEL_BASE_URL = process.env.LARAVEL_APP_URL ?? LARAVEL_API_URL.replace(/\\/api\\/?$/, "");',
    replace: 'const LARAVEL_BASE_URL = process.env.LARAVEL_APP_URL ?? getBackendAppBaseUrl();',
  },
];

for (const filePath of files) {
  const absolute = path.join(baseDir, filePath);
  if (!fs.existsSync(absolute)) {
    console.warn(`SKIP missing ${filePath}`);
    continue;
  }
  let content = fs.readFileSync(absolute, 'utf8');
  let original = content;

  const needsImport = replacements.some(({ find }) => content.includes(find)) || content.includes('const API_URL = getBackendBaseUrl();') || content.includes('const LARAVEL_API_URL = getBackendApiBaseUrl();');
  if (needsImport && !content.includes(importLine)) {
    const importMatch = content.match(/^(import .*?from .*?;\r?\n)+/m);
    if (importMatch) {
      const lastImport = importMatch[0].trimEnd().split(/\r?\n/).pop();
      const insertIndex = content.indexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertIndex) + '\n' + importLine + content.slice(insertIndex);
    } else {
      content = importLine + '\n\n' + content;
    }
  }

  for (const { find, replace } of replacements) {
    if (content.includes(find)) {
      content = content.split(find).join(replace);
    }
  }

  // convert getApiBaseUrl use if present
  if (content.includes('function getApiBaseUrl()')) {
    content = content.replace(/function getApiBaseUrl\(\)[\s\S]*?^const API_URL = getApiBaseUrl\(\);\r?\n/m, 'const API_URL = getBackendBaseUrl();\n');
  }

  if (content !== original) {
    console.log(`PATCH ${filePath}`);
    fs.writeFileSync(absolute, content, 'utf8');
  }
}
console.log('Done');
