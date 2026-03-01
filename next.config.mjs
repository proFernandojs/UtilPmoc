/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const repositoryParts = process.env.GITHUB_REPOSITORY?.split('/')
const repositoryOwner = repositoryParts?.[0]
const repositoryName = repositoryParts?.[1]
const isUserOrOrgSite = !!repositoryOwner && repositoryName === `${repositoryOwner}.github.io`
const basePath = isGithubActions && repositoryName && !isUserOrOrgSite ? `/${repositoryName}` : ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
