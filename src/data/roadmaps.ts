import { Edge, Node } from '@xyflow/react';

// Advanced data generator for hierarchical branching
export interface TopicData {
  id: string;
  label: string;
  desc: string;
  details?: string[];
  parents?: string[];
  depth?: number; // Calculated dynamically if not provided
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

  topics.forEach((topic) => {
    const depth = topic.depth !== undefined ? topic.depth : getDepth(topic.id);
    
    nodes.push({
      id: topic.id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: {
        label: topic.label,
        description: topic.desc,
        details: topic.details || [],
        completed: false,
        expanded: depth < 2, // Only expand the top 2 levels initially
        depth: depth,
        isLocked: false, // Calculated dynamically in the component
        hasChildren: topics.some(t => t.parents?.includes(topic.id))
      },
      hidden: depth >= 2, // Hide nodes deep in the tree initially
    });

    if (topic.parents) {
      topic.parents.forEach((parent) => {
        edges.push({
          id: `e-${parent}-${topic.id}`,
          source: parent,
          target: topic.id,
          animated: true,
          style: { stroke: '#8bc34a', strokeWidth: 2 },
          hidden: depth >= 2,
        });
      });
    }
  });

  return { nodes, edges };
};

// --- FRONTEND ---
export const frontendData = generateGraph([
  { id: 'internet', label: 'Internet', desc: 'Understand how the internet works.', details: ['How does the internet work?', 'What is HTTP?', 'Browsers and how they work', 'DNS and how it works', 'What is Domain Name?', 'What is hosting?'] },
  
  { id: 'html', label: 'HTML', desc: 'Basics of HTML.', parents: ['internet'], details: ['Basics and Writing HTML', 'Forms and Validations', 'Conventions and Best Practices'] },
  { id: 'html-seo', label: 'SEO Basics', desc: 'Meta tags and semantic HTML.', parents: ['html'], details: ['Meta tags', 'Semantic HTML', 'Robots.txt'] },
  { id: 'html-accessibility', label: 'Accessibility', desc: 'ARIA and accessible design.', parents: ['html'], details: ['ARIA attributes', 'Screen reader support', 'Color contrast'] },

  { id: 'css', label: 'CSS', desc: 'Styling the web.', parents: ['html'], details: ['Basics', 'Selectors', 'Box Model'] },
  { id: 'css-layout', label: 'Layouts', desc: 'Positioning elements.', parents: ['css'], details: ['Flexbox', 'CSS Grid', 'Floats', 'Positioning'] },
  { id: 'css-responsive', label: 'Responsive Design', desc: 'Media queries and mobile-first.', parents: ['css'], details: ['Media Queries', 'rem vs em', 'Mobile-first approach'] },

  { id: 'js', label: 'JavaScript', desc: 'Making the web interactive.', parents: ['css'], details: ['Syntax and Basic Constructs', 'Data types', 'Functions'] },
  { id: 'js-dom', label: 'DOM Manipulation', desc: 'Interacting with HTML via JS.', parents: ['js'], details: ['Selecting elements', 'Modifying classes/styles', 'Event Listeners'] },
  { id: 'js-async', label: 'Async JS', desc: 'Promises, Async/Await.', parents: ['js'], details: ['Callbacks', 'Promises', 'Async/Await', 'Event Loop'] },
  { id: 'js-apis', label: 'Web APIs', desc: 'Fetch, Storage, etc.', parents: ['js'], details: ['Fetch API', 'Local Storage', 'Session Storage'] },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub.', parents: ['js'], details: ['Git Basics', 'Branching', 'Merging', 'Rebasing', 'GitHub/GitLab'] },
  
  { id: 'frameworks', label: 'Frameworks', desc: 'React, Vue, or Angular.', parents: ['vcs'], details: ['React.js', 'Vue.js', 'Angular', 'Svelte'] },
  { id: 'react', label: 'React.js', desc: 'Component based UI.', parents: ['frameworks'], details: ['Components', 'JSX', 'Props & State'] },
  { id: 'react-hooks', label: 'Hooks', desc: 'useState, useEffect, etc.', parents: ['react'], details: ['useState', 'useEffect', 'useContext', 'useMemo', 'Custom Hooks'] },
  { id: 'react-router', label: 'Routing', desc: 'React Router Dom.', parents: ['react'], details: ['BrowserRouter', 'Routes', 'Link', 'useNavigate'] },
  { id: 'state-mgmt', label: 'State Management', desc: 'Redux, Zustand, etc.', parents: ['react'], details: ['Redux Toolkit', 'Zustand', 'Context API', 'Jotai'] },
  
  { id: 'build-tools', label: 'Build Tools', desc: 'Bundlers and Task Runners.', parents: ['frameworks'], details: ['Vite', 'Webpack', 'esbuild', 'Rollup'] },
  { id: 'testing', label: 'Testing', desc: 'Ensuring code quality.', parents: ['build-tools'], details: ['Jest', 'React Testing Library', 'Cypress', 'Playwright'] },
  { id: 'ssr', label: 'SSR / SSG', desc: 'Server Side Rendering.', parents: ['testing'], details: ['Next.js', 'Remix', 'Astro'] },
]);

// --- BACKEND ---
export const backendData = generateGraph([
  { id: 'internet', label: 'Internet Basics', desc: 'Understand how the web functions.', details: ['HTTP/HTTPS', 'DNS', 'Web Browsers', 'Hosting'] },
  
  { id: 'os', label: 'OS & General Knowledge', desc: 'Core system concepts.', parents: ['internet'], details: ['Terminal usage', 'Memory Management', 'Processes vs Threads', 'I/O Management'] },
  
  { id: 'language', label: 'Programming Language', desc: 'Pick a backend language.', parents: ['os'], details: ['Node.js (JavaScript/TypeScript)', 'Python', 'Go', 'Rust', 'Java', 'C#'] },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub.', parents: ['language'], details: ['Git Basics', 'Branching', 'Pull Requests'] },
  
  { id: 'rdbms', label: 'Relational Databases', desc: 'SQL databases.', parents: ['vcs'], details: ['PostgreSQL', 'MySQL', 'MariaDB', 'SQL syntax', 'Joins', 'Transactions'] },
  { id: 'db-design', label: 'Database Design', desc: 'Structuring data properly.', parents: ['rdbms'], details: ['Normalization', 'Indexes', 'ACID properties', 'N+1 Problem'] },
  
  { id: 'nosql', label: 'NoSQL Databases', desc: 'Non-relational data.', parents: ['rdbms'], details: ['MongoDB', 'Cassandra', 'DynamoDB', 'Document vs Key-Value vs Graph'] },
  
  { id: 'apis', label: 'APIs', desc: 'Communication between services.', parents: ['nosql'], details: ['RESTful APIs', 'JSON/XML', 'GraphQL', 'gRPC', 'WebSockets'] },
  
  { id: 'caching', label: 'Caching', desc: 'Improving performance.', parents: ['apis'], details: ['Redis', 'Memcached', 'CDN', 'Client-side caching', 'Server-side caching'] },
  
  { id: 'security', label: 'Web Security', desc: 'Protecting your application.', parents: ['caching'], details: ['HTTPS', 'CORS', 'CSP', 'OWASP Top 10', 'Hashing algorithms', 'Token-based auth (JWT)', 'OAuth'] },
  
  { id: 'testing', label: 'Testing', desc: 'Ensuring backend reliability.', parents: ['security'], details: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'Mocking/Stubbing'] },
  
  { id: 'cicd', label: 'CI/CD', desc: 'Continuous Integration & Deployment.', parents: ['testing'], details: ['GitHub Actions', 'Jenkins', 'GitLab CI', 'Automated deployments'] },
  
  { id: 'docker', label: 'Containerization', desc: 'Docker and beyond.', parents: ['cicd'], details: ['Docker Basics', 'Docker Compose', 'Containerizing Node/Python apps'] },
  
  { id: 'architecture', label: 'Architecture & Patterns', desc: 'Scalable system design.', parents: ['docker'], details: ['Monolith vs Microservices', 'Serverless', 'CQRS', 'Event-Driven Architecture'] },
  
  { id: 'message', label: 'Message Brokers', desc: 'Asynchronous communication.', parents: ['architecture'], details: ['RabbitMQ', 'Apache Kafka', 'Amazon SQS', 'Redis Pub/Sub'] },
]);

// --- FULL STACK ---
export const fullstackData = generateGraph([
  { id: 'internet', label: 'Internet Fundamentals', desc: 'Understand the web, HTTP, and DNS.', details: ['HTTP/HTTPS', 'DNS', 'Domain Names'] },
  
  { id: 'frontend', label: 'Frontend Basics', desc: 'HTML, CSS, and basic JavaScript.', parents: ['internet'], details: ['Semantic HTML', 'CSS Flexbox/Grid', 'JS DOM Manipulation', 'JS ES6+ Features'] },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub.', parents: ['frontend'], details: ['Commits', 'Branches', 'Merging'] },
  
  { id: 'framework', label: 'Frontend Framework', desc: 'React, Vue, or Angular.', parents: ['vcs'], details: ['React.js', 'Components', 'State & Props', 'React Router'] },
  { id: 'css-fw', label: 'CSS Frameworks', desc: 'Tailwind, Styled Components.', parents: ['framework'], details: ['Tailwind CSS', 'CSS Modules', 'Sass'] },
  
  { id: 'backend-lang', label: 'Backend Language', desc: 'Node.js or Python.', parents: ['framework'], details: ['Node.js', 'Express.js', 'Python/Django', 'API creation'] },
  
  { id: 'databases', label: 'Databases', desc: 'SQL and NoSQL.', parents: ['backend-lang'], details: ['PostgreSQL', 'MongoDB', 'Mongoose/Prisma ORM'] },
  
  { id: 'apis', label: 'APIs & Integration', desc: 'REST APIs and connecting frontend to backend.', parents: ['databases'], details: ['REST Conventions', 'Fetching data in React', 'CORS issues'] },
  
  { id: 'auth', label: 'Authentication', desc: 'JWT, OAuth, and session management.', parents: ['apis'], details: ['JWT (JSON Web Tokens)', 'Cookies', 'OAuth 2.0', 'Password Hashing (Bcrypt)'] },
  
  { id: 'ssr', label: 'Meta Frameworks', desc: 'Next.js for Full Stack.', parents: ['auth'], details: ['Next.js', 'Server Components', 'API Routes in Next.js'] },
  
  { id: 'deployment', label: 'Deployment', desc: 'Vercel, Heroku, or VPS.', parents: ['ssr'], details: ['Vercel deployment', 'Render', 'Linux Server basics', 'Nginx reverse proxy'] },
  
  { id: 'docker', label: 'Containerization', desc: 'Dockerizing full stack applications.', parents: ['deployment'], details: ['Dockerfiles', 'Docker Compose for Fullstack'] },
]);

// --- DEVOPS ---
export const devopsData = generateGraph([
  { id: 'language', label: 'Programming Language', desc: 'Learn Python, Go, or Ruby for scripting.', details: ['Python', 'Go', 'Bash Scripting', 'Ruby'] },
  
  { id: 'os', label: 'OS Concepts', desc: 'Linux basics, terminal, and networking.', parents: ['language'], details: ['Linux Kernel', 'Shell commands', 'Process Management', 'File Systems'] },
  { id: 'networking', label: 'Networking & Security', desc: 'Protocols and firewalls.', parents: ['os'], details: ['OSI Model', 'TCP/IP', 'DNS', 'HTTP/HTTPS', 'SSH', 'Firewalls', 'SSL/TLS'] },
  
  { id: 'servers', label: 'Server Management', desc: 'Web servers and reverse proxies.', parents: ['networking'], details: ['Nginx', 'Apache', 'HAProxy', 'Forward/Reverse Proxies'] },
  
  { id: 'containers', label: 'Containers', desc: 'Docker and containerization concepts.', parents: ['servers'], details: ['Docker', 'LXC', 'Container vs VM', 'Docker Compose'] },
  
  { id: 'cicd', label: 'CI/CD', desc: 'Automation pipelines.', parents: ['containers'], details: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI'] },
  
  { id: 'iac', label: 'Infrastructure as Code', desc: 'Managing infrastructure via code.', parents: ['cicd'], details: ['Terraform', 'Ansible', 'Chef', 'Puppet', 'CloudFormation'] },
  
  { id: 'orchestration', label: 'Container Orchestration', desc: 'Kubernetes (K8s).', parents: ['iac'], details: ['Kubernetes Architecture', 'Pods & Deployments', 'Services & Ingress', 'Helm Charts'] },
  { id: 'service-mesh', label: 'Service Mesh', desc: 'Advanced microservices networking.', parents: ['orchestration'], details: ['Istio', 'Linkerd', 'Consul'] },
  
  { id: 'cloud', label: 'Cloud Providers', desc: 'AWS, GCP, or Azure.', parents: ['orchestration'], details: ['AWS (EC2, S3, RDS, VPC)', 'Google Cloud', 'Azure', 'IAM Roles'] },
  
  { id: 'monitoring', label: 'Monitoring & Logging', desc: 'Observability tools.', parents: ['cloud'], details: ['Prometheus', 'Grafana', 'ELK Stack (Elasticsearch, Logstash, Kibana)', 'Datadog', 'Jaeger/OpenTelemetry'] },
]);

// --- MACHINE LEARNING ---
export const mlData = generateGraph([
  { id: 'python', label: 'Python Programming', desc: 'Master Python for Data Science.', details: ['Data Structures', 'Functions & Classes', 'File Handling', 'Jupyter Notebooks'] },
  
  { id: 'math', label: 'Mathematics', desc: 'Linear Algebra and Calculus.', parents: ['python'], details: ['Vectors & Matrices', 'Eigenvalues', 'Derivatives & Gradients', 'Partial Derivatives'] },
  { id: 'stats', label: 'Statistics', desc: 'Distributions and Probability.', parents: ['math'], details: ['Probability Theory', 'Normal Distribution', 'Bayes Theorem', 'Hypothesis Testing'] },
  
  { id: 'data-manipulation', label: 'Data Manipulation', desc: 'Cleaning and handling data.', parents: ['stats'], details: ['Pandas (DataFrames)', 'NumPy (Arrays)', 'Handling Missing Data', 'Feature Scaling'] },
  
  { id: 'data-viz', label: 'Data Visualization', desc: 'Understanding data visually.', parents: ['data-manipulation'], details: ['Matplotlib', 'Seaborn', 'Plotly', 'Histograms & Scatter plots'] },
  
  { id: 'classical-ml', label: 'Classical ML', desc: 'Scikit-learn algorithms.', parents: ['data-viz'], details: ['Scikit-learn', 'Linear/Logistic Regression', 'Decision Trees', 'Random Forests', 'K-Means Clustering', 'SVM'] },
  
  { id: 'deep-learning', label: 'Deep Learning', desc: 'Neural Networks.', parents: ['classical-ml'], details: ['PyTorch', 'TensorFlow / Keras', 'Perceptrons', 'Backpropagation', 'Activation Functions'] },
  
  { id: 'cv', label: 'Computer Vision', desc: 'Processing images.', parents: ['deep-learning'], details: ['Convolutional Neural Networks (CNNs)', 'OpenCV', 'Image Classification', 'Object Detection (YOLO)'] },
  { id: 'nlp', label: 'NLP', desc: 'Processing text and language.', parents: ['deep-learning'], details: ['Recurrent Neural Networks (RNNs)', 'LSTMs', 'Word Embeddings (Word2Vec)', 'Transformers', 'Hugging Face'] },
  
  { id: 'mlops', label: 'MLOps', desc: 'Model deployment and lifecycle.', parents: ['nlp'], details: ['Model Serialization (Pickle/ONNX)', 'FastAPI/Flask deployment', 'Docker for ML models', 'MLflow', 'Cloud Deployments (AWS SageMaker)'] },
]);

// --- BLOCKCHAIN ---
export const blockchainData = generateGraph([
  { id: 'crypto', label: 'Cryptography Basics', desc: 'The math behind blockchain.', details: ['Hash Functions (SHA-256)', 'Public Key Cryptography', 'Digital Signatures', 'Elliptic Curve Cryptography'] },
  
  { id: 'fundamentals', label: 'Blockchain Fundamentals', desc: 'How blockchains actually work.', parents: ['crypto'], details: ['Distributed Ledgers', 'Consensus Mechanisms (PoW, PoS)', 'Blocks & Transactions', 'Nodes & Miners'] },
  
  { id: 'ethereum', label: 'Ethereum Concepts', desc: 'The leading smart contract platform.', parents: ['fundamentals'], details: ['Ethereum Virtual Machine (EVM)', 'Gas & Fees', 'Wallets (MetaMask)', 'Accounts vs Smart Contracts'] },
  
  { id: 'smart-contracts', label: 'Smart Contracts', desc: 'Writing decentralized code.', parents: ['ethereum'], details: ['Solidity syntax', 'Data Types', 'Functions & Modifiers', 'Events', 'ERC-20 & ERC-721 Token Standards'] },
  
  { id: 'web3', label: 'Web3.js / Ethers.js', desc: 'Connecting frontend to blockchain.', parents: ['smart-contracts'], details: ['Ethers.js', 'Web3.js', 'Providers & Signers', 'Contract Interaction', 'React integrations (wagmi)'] },
  
  { id: 'frameworks', label: 'Dev Frameworks', desc: 'Testing and deployment tools.', parents: ['web3'], details: ['Hardhat', 'Foundry', 'Truffle', 'Local Blockchain (Anvil/Ganache)', 'Writing tests in JS/Solidity'] },
  
  { id: 'security', label: 'Security & Auditing', desc: 'Writing safe contracts.', parents: ['frameworks'], details: ['Reentrancy Attacks', 'Integer Overflow/Underflow', 'Front-running', 'Access Control flaws', 'Slither / Mythril tools'] },
  
  { id: 'storage', label: 'Decentralized Storage', desc: 'Storing data off-chain.', parents: ['security'], details: ['IPFS (InterPlanetary File System)', 'Arweave', 'Filecoin', 'Pinata'] },
  
  { id: 'scaling', label: 'L2 Scaling', desc: 'Making blockchains faster.', parents: ['storage'], details: ['Optimistic Rollups (Optimism, Arbitrum)', 'ZK Rollups (zkSync, Starknet)', 'Sidechains (Polygon)'] },
  
  { id: 'defi', label: 'DeFi Concepts', desc: 'Decentralized Finance.', parents: ['scaling'], details: ['Decentralized Exchanges (DEXs)', 'Automated Market Makers (AMMs)', 'Liquidity Pools', 'Lending Protocols (Aave, Compound)', 'Flash Loans'] },
]);

export const getRoadmapById = (id: string) => {
  switch (id) {
    case 'frontend': return frontendData;
    case 'backend': return backendData;
    case 'full-stack': return fullstackData;
    case 'devops': return devopsData;
    case 'machine-learning': return mlData;
    case 'blockchain': return blockchainData;
    default: return frontendData;
  }
};
