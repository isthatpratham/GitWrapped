const https = require('https');

const query = `query {
  user(login: "torvalds") {
    login
    name
    avatarUrl
    bio
    createdAt
    websiteUrl
    twitterUsername
    company
    location
    followers { totalCount }
    following { totalCount }
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER, first: 1) {
      totalCount
      nodes {
        id
        name
        nameWithOwner
        description
        createdAt
        pushedAt
        updatedAt
        stargazerCount
        forkCount
        isPrivate
        isFork
        isArchived
        diskUsage
        url
        homepageUrl
        primaryLanguage { name color }
        languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
          totalSize
          edges { size node { name color } }
        }
        watchers { totalCount }
        openIssues: issues(states: OPEN) { totalCount }
        openPullRequests: pullRequests(states: OPEN) { totalCount }
        repositoryTopics(first: 1) { nodes { topic { name } } }
      }
    }
    starredRepositories { totalCount }
    gists(privacy: PUBLIC) { totalCount }
    packages { totalCount }
    sponsoring { totalCount }
    sponsors { totalCount }
    pullRequests(first: 1, states: MERGED) {
      totalCount
      nodes {
        id
        title
        state
        createdAt
        mergedAt
        closedAt
        url
        additions
        deletions
        changedFiles
        comments { totalCount }
        reviewRequests { totalCount }
        baseRepository { nameWithOwner }
      }
    }
    issues(first: 1, filterBy: { createdBy: "torvalds" }) {
      totalCount
      nodes {
        id
        title
        state
        createdAt
        closedAt
        url
        comments { totalCount }
        reactions { totalCount }
        labels(first: 1) { nodes { name color } }
        repository { nameWithOwner }
      }
    }
    contributionsCollection(from: "2023-01-01T00:00:00Z", to: "2023-12-31T23:59:59Z") {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoriesWithContributedCommits
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { firstDay contributionDays { date contributionCount contributionLevel color } }
      }
      commitContributionsByRepository(maxRepositories: 1) {
        repository { nameWithOwner primaryLanguage { name color } }
        contributions { totalCount }
      }
    }
  }
}`;

const req = https.request({
  hostname: 'api.github.com',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN,
    'User-Agent': 'Node.js',
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.errors) {
      console.error(JSON.stringify(json.errors, null, 2));
      process.exit(1);
    } else {
      console.log("SUCCESS");
    }
  });
});
req.write(JSON.stringify({ query }));
req.end();
