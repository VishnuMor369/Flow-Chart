import { Edge, Node } from '@xyflow/react';

// Advanced data generator for hierarchical branching
export interface TopicData {
  id: string;
  label: string;
  desc: string;
  details?: string[];
  links?: { title: string; url: string; type: 'video' | 'article' | 'course' }[];
  parents?: string[];
  depth?: number;
  phase?: 'beginner' | 'intermediate' | 'advanced';
}

const generateGraph = (topics: TopicData[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Calculate depth based on parents
  const getDepth = (topicId: string, visited = new Set<string>()): number => {
    if (visited.has(topicId)) return 0;
    visited.add(topicId);
    
    const topic = topics.find(t => t.id === topicId);
    if (!topic || !topic.parents || topic.parents.length === 0) return 0;
    
    const parentDepths = topic.parents.map(p => getDepth(p, new Set(visited)));
    return Math.max(...parentDepths) + 1;
  };

  const phases = [...new Set(topics.map(t => t.phase).filter(Boolean))];
  
  phases.forEach((phase) => {
    const label = phase === 'beginner' ? 'Beginner Phase' : phase === 'intermediate' ? 'Intermediate Phase' : 'Advanced Phase';
    nodes.push({
      id: phase as string,
      type: 'groupNode',
      position: { x: 0, y: 0 },
      data: {
        label,
        completed: false, 
      },
      style: { width: 0, height: 0 },
    });
  });

  topics.forEach((topic) => {
    const depth = topic.depth !== undefined ? topic.depth : getDepth(topic.id);
    const hasDetails = topic.details && topic.details.length > 0;
    
    nodes.push({
      id: topic.id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      parentId: topic.phase,
      data: {
        label: topic.label,
        description: topic.desc,
        details: topic.details || [],
        links: topic.links || [],
        completed: false,
        expanded: true, 
        depth: depth,
        isLocked: false,
        hasChildren: topics.some(t => t.parents?.includes(topic.id)) || hasDetails
      },
      hidden: false, 
    });

    if (topic.parents) {
      topic.parents.forEach((parent) => {
        edges.push({
          id: `e-${parent}-${topic.id}`,
          source: parent,
          target: topic.id,
          animated: true,
          style: { stroke: '#8bc34a', strokeWidth: 2 },
          hidden: false,
        });
      });
    }

    if (hasDetails) {
      topic.details!.forEach((detail, index) => {
        const detailId = `${topic.id}-detail-${index}`;
        const detailDepth = depth + 1;
        nodes.push({
          id: detailId,
          type: 'customNode',
          position: { x: 0, y: 0 },
          parentId: topic.phase,
          data: {
            label: detail,
            description: `Part of ${topic.label}`,
            details: [],
            links: [],
            completed: false,
            expanded: true,
            depth: detailDepth,
            isLocked: false,
            hasChildren: false,
          },
          hidden: false,
        });

        edges.push({
          id: `e-${topic.id}-${detailId}`,
          source: topic.id,
          target: detailId,
          animated: true,
          style: { stroke: '#8bc34a', strokeWidth: 1, strokeDasharray: '4,4' },
          hidden: false,
        });
      });
    }
  });

  return { nodes, edges };
};

// --- FRONTEND ---
export const frontendData = generateGraph([
  { id: 'internet', label: 'Internet', desc: 'How does the internet work?', phase: 'beginner' },
  { id: 'internet-dns', label: 'DNS', desc: 'Domain Name System', parents: ['internet'], phase: 'beginner' },
  { id: 'internet-http', label: 'HTTP / HTTPS', desc: 'Hypertext Transfer Protocol', parents: ['internet'], phase: 'beginner' },
  { id: 'internet-hosting', label: 'Hosting', desc: 'Web Hosting Basics', parents: ['internet'], phase: 'beginner' },
  
  { id: 'html', label: 'HTML', desc: 'HyperText Markup Language', parents: ['internet'], phase: 'beginner' },
  { id: 'html-basics', label: 'Basics', desc: 'Tags, Elements, Attributes', parents: ['html'], phase: 'beginner' },
  { id: 'html-forms', label: 'Forms and Validations', desc: 'Inputs and constraints', parents: ['html'], phase: 'beginner' },
  { id: 'html-seo', label: 'SEO Basics', desc: 'Search Engine Optimization', parents: ['html'], phase: 'beginner' },
  { id: 'html-accessibility', label: 'Accessibility', desc: 'A11y fundamentals', parents: ['html'], phase: 'beginner' },

  { id: 'css', label: 'CSS', desc: 'Cascading Style Sheets', parents: ['html'], phase: 'beginner' },
  { id: 'css-basics', label: 'Basics', desc: 'Selectors, Specificity, Box Model', parents: ['css'], phase: 'beginner' },
  { id: 'css-layout', label: 'Layouts', desc: 'Flexbox, Grid, Positioning', parents: ['css'], phase: 'beginner' },
  { id: 'css-responsive', label: 'Responsive Design', desc: 'Media Queries, Mobile-first', parents: ['css'], phase: 'beginner' },

  { id: 'js', label: 'JavaScript', desc: 'Adding interactivity', parents: ['css'], phase: 'intermediate' },
  { id: 'js-basics', label: 'Syntax & Basic Constructs', desc: 'Variables, Types, Functions', parents: ['js'], phase: 'intermediate' },
  { id: 'js-dom', label: 'DOM Manipulation', desc: 'Selecting, Modifying elements', parents: ['js'], phase: 'intermediate' },
  { id: 'js-fetch', label: 'Fetch API / Ajax', desc: 'Network requests', parents: ['js'], phase: 'intermediate' },
  { id: 'js-es6', label: 'ES6+ Features', desc: 'Arrow functions, destructuring', parents: ['js'], phase: 'intermediate' },
  { id: 'js-async', label: 'Async JavaScript', desc: 'Promises, Async/Await', parents: ['js'], phase: 'intermediate' },

  { id: 'vcs', label: 'Version Control Systems', desc: 'Tracking code changes', parents: ['js'], phase: 'intermediate' },
  { id: 'vcs-git', label: 'Git Basics', desc: 'Commits, Branches, Merges', parents: ['vcs'], phase: 'intermediate' },
  { id: 'vcs-github', label: 'GitHub/GitLab', desc: 'Remote repositories', parents: ['vcs'], phase: 'intermediate' },

  { id: 'pkg-mgr', label: 'Package Managers', desc: 'npm, yarn, pnpm', parents: ['vcs'], phase: 'intermediate' },
  { id: 'css-arch', label: 'CSS Architecture', desc: 'BEM, Tailwind, CSS-in-JS', parents: ['pkg-mgr'], phase: 'intermediate' },
  { id: 'css-pre', label: 'CSS Preprocessors', desc: 'Sass, Less, PostCSS', parents: ['css-arch'], phase: 'intermediate' },

  { id: 'frameworks', label: 'Frontend Frameworks', desc: 'React, Vue, Angular', parents: ['css-pre'], phase: 'intermediate' },
  { id: 'react', label: 'React.js', desc: 'Component based UI', parents: ['frameworks'], phase: 'intermediate', details: ['Hooks', 'Context', 'JSX'] },
  
  { id: 'state-mgmt', label: 'State Management', desc: 'Redux, Zustand, Vuex', parents: ['frameworks'], phase: 'advanced' },
  
  { id: 'build-tools', label: 'Build Tools', desc: 'Bundlers, Task Runners', parents: ['state-mgmt'], phase: 'advanced' },
  { id: 'build-bundlers', label: 'Module Bundlers', desc: 'Webpack, Vite, Rollup', parents: ['build-tools'], phase: 'advanced' },
  { id: 'build-linters', label: 'Linters & Formatters', desc: 'ESLint, Prettier', parents: ['build-tools'], phase: 'advanced' },

  { id: 'testing', label: 'Testing', desc: 'Quality Assurance', parents: ['build-tools'], phase: 'advanced' },
  { id: 'test-unit', label: 'Unit Testing', desc: 'Jest, Vitest', parents: ['testing'], phase: 'advanced' },
  { id: 'test-e2e', label: 'E2E Testing', desc: 'Cypress, Playwright', parents: ['testing'], phase: 'advanced' },

  { id: 'ssr', label: 'SSR / SSG', desc: 'Server Side Rendering', parents: ['testing'], phase: 'advanced' },
  { id: 'ssr-next', label: 'Next.js', desc: 'React Framework', parents: ['ssr'], phase: 'advanced' },
  
  { id: 'graphql', label: 'GraphQL', desc: 'API Query Language', parents: ['ssr'], phase: 'advanced' },
  { id: 'pwa', label: 'Progressive Web Apps', desc: 'Service Workers, Manifests', parents: ['graphql'], phase: 'advanced' },
]);

// --- BACKEND ---
export const backendData = generateGraph([
  { id: 'internet', label: 'Internet', desc: 'How does the internet work?', phase: 'beginner' },
  { id: 'internet-dns', label: 'DNS', desc: 'Domain Name System', parents: ['internet'], phase: 'beginner' },
  { id: 'internet-http', label: 'HTTP / HTTPS', desc: 'Hypertext Transfer Protocol', parents: ['internet'], phase: 'beginner' },
  
  { id: 'os', label: 'OS & General Knowledge', desc: 'Terminal, Processes, Threads', parents: ['internet'], phase: 'beginner' },
  { id: 'os-terminal', label: 'Terminal Usage', desc: 'Bash, Zsh, Basic Commands', parents: ['os'], phase: 'beginner' },
  { id: 'os-networking', label: 'Networking Basics', desc: 'TCP/IP, Sockets', parents: ['os'], phase: 'beginner' },

  { id: 'language', label: 'Programming Language', desc: 'Node.js, Python, Java, Go, etc.', parents: ['os'], phase: 'beginner' },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub', parents: ['language'], phase: 'beginner' },
  
  { id: 'rdbms', label: 'Relational Databases', desc: 'SQL databases', parents: ['vcs'], phase: 'intermediate' },
  { id: 'sql', label: 'SQL Basics', desc: 'SELECT, JOINs, Group By', parents: ['rdbms'], phase: 'intermediate' },
  { id: 'rdbms-postgres', label: 'PostgreSQL', desc: 'Advanced relational DB', parents: ['rdbms'], phase: 'intermediate' },
  { id: 'db-design', label: 'Database Design', desc: 'Normalization, Indexes, ACID', parents: ['rdbms'], phase: 'intermediate' },
  
  { id: 'nosql', label: 'NoSQL Databases', desc: 'Document, Key-Value, Graph', parents: ['rdbms'], phase: 'intermediate' },
  { id: 'nosql-mongo', label: 'MongoDB', desc: 'Document store', parents: ['nosql'], phase: 'intermediate' },
  
  { id: 'apis', label: 'APIs', desc: 'REST, GraphQL, gRPC', parents: ['nosql'], phase: 'intermediate' },
  { id: 'rest', label: 'RESTful APIs', desc: 'Standard conventions', parents: ['apis'], phase: 'intermediate' },
  { id: 'graphql', label: 'GraphQL', desc: 'Query language for APIs', parents: ['apis'], phase: 'intermediate' },
  
  { id: 'caching', label: 'Caching', desc: 'Redis, Memcached', parents: ['apis'], phase: 'intermediate' },
  { id: 'caching-redis', label: 'Redis', desc: 'In-memory data store', parents: ['caching'], phase: 'intermediate' },
  
  { id: 'security', label: 'Web Security Knowledge', desc: 'CORS, HTTPS, OWASP', parents: ['caching'], phase: 'advanced' },
  { id: 'security-auth', label: 'Authentication', desc: 'JWT, OAuth, Sessions', parents: ['security'], phase: 'advanced' },
  { id: 'security-hashing', label: 'Hashing', desc: 'Bcrypt, Scrypt', parents: ['security'], phase: 'advanced' },
  
  { id: 'testing', label: 'Testing', desc: 'Unit, Integration, E2E', parents: ['security'], phase: 'advanced' },
  
  { id: 'cicd', label: 'CI/CD', desc: 'Continuous Integration & Deployment', parents: ['testing'], phase: 'advanced' },
  
  { id: 'docker', label: 'Containerization', desc: 'Docker, Podman', parents: ['cicd'], phase: 'advanced' },
  
  { id: 'architecture', label: 'Architecture & System Design', desc: 'Monoliths vs Microservices', parents: ['docker'], phase: 'advanced' },
  { id: 'arch-message', label: 'Message Brokers', desc: 'RabbitMQ, Kafka', parents: ['architecture'], phase: 'advanced' },
  { id: 'arch-websockets', label: 'WebSockets', desc: 'Real-time communication', parents: ['architecture'], phase: 'advanced' },
  { id: 'arch-graphql', label: 'GraphQL Server', desc: 'Apollo Server', parents: ['architecture'], phase: 'advanced' },
]);

// --- DEVOPS ---
export const devopsData = generateGraph([
  { id: 'prereq', label: 'Learn a Programming Language', desc: 'Python, Go, Node.js, Ruby, C++', phase: 'beginner' },
  
  { id: 'os', label: 'OS Concepts', desc: 'Process Management, Threads, Sockets', parents: ['prereq'], phase: 'beginner' },
  { id: 'os-terminal', label: 'Learn to live in terminal', desc: 'Bash Scripting, Text Manipulation (awk, sed, grep)', parents: ['os'], phase: 'beginner' },
  { id: 'os-networking', label: 'Networking & Security', desc: 'DNS, OSI Model, HTTP/HTTPS, SSL/TLS', parents: ['os-terminal'], phase: 'beginner' },
  
  { id: 'servers', label: 'Server Management', desc: 'Reverse Proxies, Caching Server, Forward Proxy', parents: ['os-networking'], phase: 'intermediate' },
  { id: 'servers-nginx', label: 'Nginx / Apache', desc: 'Web server setup', parents: ['servers'], phase: 'intermediate' },
  
  { id: 'containers', label: 'Containers', desc: 'Docker, Podman', parents: ['servers'], phase: 'intermediate' },
  { id: 'containers-orchestration', label: 'Container Orchestration', desc: 'Kubernetes, Docker Swarm', parents: ['containers'], phase: 'intermediate' },
  
  { id: 'cicd', label: 'CI/CD Pipelines', desc: 'Jenkins, GitHub Actions, GitLab CI', parents: ['containers-orchestration'], phase: 'intermediate' },
  
  { id: 'cloud', label: 'Cloud Providers', desc: 'AWS, Azure, Google Cloud', parents: ['cicd'], phase: 'advanced' },
  
  { id: 'iac', label: 'Infrastructure as Code', desc: 'Terraform, CloudFormation, Pulumi', parents: ['cloud'], phase: 'advanced' },
  { id: 'iac-config', label: 'Configuration Management', desc: 'Ansible, Chef, Puppet', parents: ['iac'], phase: 'advanced' },
  
  { id: 'monitoring', label: 'Infrastructure Monitoring', desc: 'Prometheus, Grafana, Datadog', parents: ['iac-config'], phase: 'advanced' },
  { id: 'logs', label: 'Application Logs Management', desc: 'ELK Stack, Splunk, Loki', parents: ['monitoring'], phase: 'advanced' },
  
  { id: 'cloud-design', label: 'Cloud Design Patterns', desc: 'High Availability, Auto-scaling', parents: ['logs'], phase: 'advanced' },
]);

// --- FULL STACK ---
export const fullstackData = generateGraph([
  { id: 'internet', label: 'Internet Fundamentals', desc: 'HTTP, DNS, Hosting', phase: 'beginner' },
  
  { id: 'frontend', label: 'Frontend Fundamentals', desc: 'HTML, CSS, JavaScript', parents: ['internet'], phase: 'beginner' },
  { id: 'frontend-react', label: 'Frontend Framework', desc: 'React, Vue, or Angular', parents: ['frontend'], phase: 'intermediate' },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git & GitHub', parents: ['frontend-react'], phase: 'intermediate' },
  
  { id: 'backend', label: 'Backend Language', desc: 'Node.js, Python, Java, Go', parents: ['vcs'], phase: 'intermediate' },
  
  { id: 'db', label: 'Databases', desc: 'Relational (SQL) and NoSQL', parents: ['backend'], phase: 'intermediate' },
  { id: 'db-sql', label: 'PostgreSQL / MySQL', desc: 'Relational logic', parents: ['db'], phase: 'intermediate' },
  { id: 'db-nosql', label: 'MongoDB', desc: 'Document databases', parents: ['db'], phase: 'intermediate' },
  
  { id: 'api', label: 'APIs', desc: 'REST, GraphQL', parents: ['db'], phase: 'intermediate' },
  
  { id: 'auth', label: 'Authentication', desc: 'JWT, OAuth', parents: ['api'], phase: 'advanced' },
  
  { id: 'deployment', label: 'Deployment & Hosting', desc: 'Vercel, Heroku, AWS, Docker', parents: ['auth'], phase: 'advanced' },
  
  { id: 'testing', label: 'Testing', desc: 'Jest, Cypress', parents: ['deployment'], phase: 'advanced' },
]);

// --- MACHINE LEARNING ---
export const machineLearningData = generateGraph([
  { id: 'math', label: 'Math Foundations', desc: 'Linear Algebra, Calculus', phase: 'beginner' },
  { id: 'stats', label: 'Statistics & Probability', desc: 'Distributions, Hypothesis Testing', parents: ['math'], phase: 'beginner' },
  
  { id: 'python', label: 'Python Programming', desc: 'Core Python skills', parents: ['stats'], phase: 'beginner' },
  { id: 'python-data', label: 'Data Processing Libraries', desc: 'Pandas, NumPy, SciPy', parents: ['python'], phase: 'beginner' },
  { id: 'python-viz', label: 'Data Visualization', desc: 'Matplotlib, Seaborn, Plotly', parents: ['python-data'], phase: 'beginner' },
  
  { id: 'ml-basics', label: 'Machine Learning Basics', desc: 'Supervised vs Unsupervised', parents: ['python-viz'], phase: 'intermediate' },
  { id: 'ml-supervised', label: 'Supervised Learning', desc: 'Linear Regression, Logistic Regression, Decision Trees', parents: ['ml-basics'], phase: 'intermediate' },
  { id: 'ml-unsupervised', label: 'Unsupervised Learning', desc: 'K-Means, PCA', parents: ['ml-supervised'], phase: 'intermediate' },
  { id: 'ml-eval', label: 'Model Evaluation', desc: 'Cross Validation, Metrics (F1, RMSE)', parents: ['ml-unsupervised'], phase: 'intermediate' },
  
  { id: 'dl', label: 'Deep Learning', desc: 'Neural Networks Fundamentals', parents: ['ml-eval'], phase: 'advanced' },
  { id: 'dl-frameworks', label: 'Deep Learning Frameworks', desc: 'PyTorch, TensorFlow/Keras', parents: ['dl'], phase: 'advanced' },
  { id: 'dl-cv', label: 'Computer Vision', desc: 'CNNs, Image Classification, Object Detection', parents: ['dl-frameworks'], phase: 'advanced' },
  { id: 'dl-nlp', label: 'Natural Language Processing', desc: 'RNNs, LSTMs, Transformers, LLMs', parents: ['dl-cv'], phase: 'advanced' },
  
  { id: 'mlops', label: 'MLOps', desc: 'Model Deployment, Monitoring, MLflow', parents: ['dl-nlp'], phase: 'advanced' },
]);

// --- BLOCKCHAIN ---
export const blockchainData = generateGraph([
  { 
    id: 'basics', 
    label: 'Blockchain Basics', 
    desc: 'What is Blockchain? How it works?', 
    phase: 'beginner',
    links: [
      { title: 'But how does bitcoin actually work?', url: 'https://www.youtube.com/watch?v=bBC-nXj3Ng4', type: 'video' },
      { title: 'Blockchain Explained', url: 'https://www.investopedia.com/terms/b/blockchain.asp', type: 'article' }
    ]
  },
  { 
    id: 'crypto', 
    label: 'Cryptography', 
    desc: 'Hash functions, Public Key Cryptography', 
    parents: ['basics'], 
    phase: 'beginner',
    links: [
      { title: 'Public Key Cryptography', url: 'https://www.youtube.com/watch?v=GSIDS_lvRv4', type: 'video' }
    ]
  },
  { id: 'consensus', label: 'Consensus Mechanisms', desc: 'PoW, PoS, DPoS', parents: ['crypto'], phase: 'beginner' },
  
  { id: 'ethereum', label: 'Ethereum Ecosystem', desc: 'EVM, Gas, Accounts', parents: ['consensus'], phase: 'beginner' },
  
  { id: 'solidity', label: 'Smart Contracts (Solidity)', desc: 'Writing decentralized logic', parents: ['ethereum'], phase: 'intermediate' },
  { id: 'solidity-advanced', label: 'Advanced Solidity', desc: 'Security patterns, Optimization', parents: ['solidity'], phase: 'intermediate' },
  
  { id: 'web3', label: 'Web3 Integration', desc: 'ethers.js, web3.js', parents: ['solidity-advanced'], phase: 'intermediate' },
  { id: 'dapps', label: 'DApp Development', desc: 'React integration, Wagmi, WalletConnect', parents: ['web3'], phase: 'intermediate' },
  
  { id: 'frameworks', label: 'Development Frameworks', desc: 'Hardhat, Foundry, Truffle', parents: ['dapps'], phase: 'intermediate' },
  
  { id: 'ipfs', label: 'Decentralized Storage', desc: 'IPFS, Arweave', parents: ['frameworks'], phase: 'advanced' },
  
  { id: 'oracles', label: 'Oracles', desc: 'Chainlink, External Data', parents: ['ipfs'], phase: 'advanced' },
  { id: 'defi', label: 'DeFi Protocols', desc: 'DEXs, Lending, AMMs', parents: ['oracles'], phase: 'advanced' },
  { id: 'security', label: 'Smart Contract Security', desc: 'Reentrancy, Auditing tools', parents: ['defi'], phase: 'advanced' },
]);

export const getRoadmapById = (id: string) => {
  switch (id) {
    case 'frontend': return frontendData;
    case 'backend': return backendData;
    case 'devops': return devopsData;
    case 'full-stack': return fullstackData;
    case 'machine-learning': return machineLearningData;
    case 'blockchain': return blockchainData;
    default: return frontendData;
  }
};
