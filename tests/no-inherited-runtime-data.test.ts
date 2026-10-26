// tests/no-inherited-runtime-data.test.ts
// Machine-checkable lint/test gate enforcing zero inherited runtime data
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getSourceFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        getSourceFiles(fullPath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('NWUCHAS-CMIS: Zero Inherited Runtime Data Enforcement Gate', () => {
  const rootSrc = path.resolve(__dirname, '../src');
  const nwuchasComponents = getSourceFiles(path.join(rootSrc, 'components'));
  const nwuchasServerModules = [
    ...getSourceFiles(path.join(rootSrc, 'server', 'admissions')),
    ...getSourceFiles(path.join(rootSrc, 'server', 'academics')),
    ...getSourceFiles(path.join(rootSrc, 'server', 'finance')),
    ...getSourceFiles(path.join(rootSrc, 'server', 'payments')),
    ...getSourceFiles(path.join(rootSrc, 'server', 'payroll')),
    ...getSourceFiles(path.join(rootSrc, 'server', 'clinical')),
    ...getSourceFiles(path.join(rootSrc, 'server', 'search')),
    path.join(rootSrc, 'server', 'institution.ts'),
    path.join(rootSrc, 'server', 'auth.ts'),
    path.join(rootSrc, 'server', 'authorization.ts'),
  ].filter((f) => fs.existsSync(f));
  const nwuchasModulesPages = getSourceFiles(path.join(rootSrc, 'app', 'modules'));
  const nwuchasApplyPages = getSourceFiles(path.join(rootSrc, 'app', 'apply'));

  const coreRuntimeFiles = [
    ...nwuchasComponents,
    ...nwuchasServerModules,
    ...nwuchasModulesPages,
    ...nwuchasApplyPages,
  ];

  it('proves zero runtime imports of legacySchoolData in active NWUCHAS modules', () => {
    const violations: { file: string; line: string }[] = [];

    for (const file of coreRuntimeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/from\s+['"].*legacySchoolData['"]/.test(line)) {
          violations.push({ file: path.relative(rootSrc, file), line: `${idx + 1}: ${line.trim()}` });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('proves zero runtime calls to generateLegacyLearners in active NWUCHAS modules', () => {
    const violations: { file: string; line: string }[] = [];

    for (const file of coreRuntimeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/generateLegacyLearners\(/.test(line)) {
          violations.push({ file: path.relative(rootSrc, file), line: `${idx + 1}: ${line.trim()}` });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('proves zero runtime references to LSS school student identifiers in active NWUCHAS components', () => {
    const violations: { file: string; line: string }[] = [];

    for (const file of coreRuntimeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/LSS-\d{4}/i.test(line)) {
          violations.push({ file: path.relative(rootSrc, file), line: `${idx + 1}: ${line.trim()}` });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('proves dedicated institution code is strictly NWUCHAS across core services', () => {
    const institutionFile = path.join(rootSrc, 'server', 'institution.ts');
    const content = fs.readFileSync(institutionFile, 'utf8');
    expect(content).toContain("code === 'NWUCHAS'");
  });
});
