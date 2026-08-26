
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

  const cleanPublicDomains = extracted.filter((domain) => {

    return !domain.includes('-git-');
  });

  let primaryPublicDomain = cleanPublicDomains[0] || extracted[0] || '';

  if (!primaryPublicDomain && isProduction && projectName) {
    primaryPublicDomain = `${projectName}.vercel.app`;
  }

  const cleanDeploymentUrl = deploymentUrl.replace(/^https?:\/\//, '');

  if (!primaryPublicDomain) {
    primaryPublicDomain = cleanDeploymentUrl;
  }

  const allDomains = Array.from(new Set([...cleanPublicDomains, ...extracted])).filter(Boolean);

  return {
    primaryPublicDomain,
    allDomains,
    deploymentUrl: cleanDeploymentUrl,
  };
}

