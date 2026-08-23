/**
 * Resolves the primary public domain and all assigned aliases for a Vercel project deployment.
 * Ensures anonymous visitors can access the public site without Vercel auth restrictions.
 */
export function resolveDeploymentDomains(
  rawAliases: any = [],
  deploymentUrl: string = '',
  projectName: string = '',
  target: string = 'production'
): {
  primaryPublicDomain: string;
  allDomains: string[];
  deploymentUrl: string;
} {
  const isProduction = target?.toLowerCase() === 'production';

  // Normalize rawAliases into clean domain strings
  let extracted: string[] = [];
  if (Array.isArray(rawAliases)) {
    extracted = rawAliases
      .map((item: any) => {
        if (typeof item === 'string') return item.trim().replace(/^https?:\/\//, '');
        if (typeof item === 'object' && item) {
          return (item.alias || item.domain || '').trim().replace(/^https?:\/\//, '');
        }
        return '';
      })
      .filter(Boolean);
  } else if (typeof rawAliases === 'string' && rawAliases.trim()) {
    extracted = [rawAliases.trim().replace(/^https?:\/\//, '')];
  }

  // Filter and prioritize clean public domains
  // 1. Custom domains (e.g. example.com)
  // 2. Clean production vercel.app aliases without -git- or hash indicators
  const cleanPublicDomains = extracted.filter((domain) => {
    // Avoid branch preview hashes like `repo-git-main-team.vercel.app`
    return !domain.includes('-git-');
  });

  // Pick the best public domain:
  // Priority A: First clean public domain from cleanPublicDomains
  // Priority B: First alias in extracted list
  // Priority C: If production and projectName exists, `${projectName}.vercel.app`
  // Priority D: deploymentUrl
  let primaryPublicDomain = cleanPublicDomains[0] || extracted[0] || '';

  if (!primaryPublicDomain && isProduction && projectName) {
    primaryPublicDomain = `${projectName}.vercel.app`;
  }

  const cleanDeploymentUrl = deploymentUrl.replace(/^https?:\/\//, '');

  if (!primaryPublicDomain) {
    primaryPublicDomain = cleanDeploymentUrl;
  }

  // Deduplicate all unique domains
  const allDomains = Array.from(new Set([...cleanPublicDomains, ...extracted])).filter(Boolean);

  return {
    primaryPublicDomain,
    allDomains,
    deploymentUrl: cleanDeploymentUrl,
  };
}
