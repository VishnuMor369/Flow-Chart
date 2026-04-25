import { Edge, Node } from '@xyflow/react';

// Advanced data generator for hierarchical branching
export interface TopicData {
  id: string;
  label: string;
  desc: string;
  details?: string[];
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
  { id: 'internet', label: 'Internet', desc: 'Understand how the internet works.', phase: 'beginner' },
  { id: 'how-dns', label: 'How DNS works', desc: 'Domain Name System.', parents: ['internet'], phase: 'beginner', details: ['A Records', 'CNAME Records', 'Name Servers'] },
  { id: 'how-http', label: 'HTTP / HTTPS', desc: 'Hypertext Transfer Protocol.', parents: ['internet'], phase: 'beginner', details: ['Status Codes', 'Request Methods', 'Headers'] },
  
  { id: 'html', label: 'HTML', desc: 'Basics of HTML.', parents: ['internet'], phase: 'beginner' },
  { id: 'html-forms', label: 'Forms and Validations', desc: 'Collecting user input.', parents: ['html'], phase: 'beginner', details: ['Input Types', 'Form Attributes', 'Custom Validation'] },
  { id: 'html-seo', label: 'SEO Basics', desc: 'Meta tags and semantic HTML.', parents: ['html'], phase: 'beginner', details: ['Meta tags', 'Semantic HTML', 'Robots.txt'] },

  { id: 'css', label: 'CSS', desc: 'Styling the web.', parents: ['html'], phase: 'beginner' },
  { id: 'css-layout', label: 'Layouts', desc: 'Positioning elements.', parents: ['css'], phase: 'beginner', details: ['Flexbox', 'CSS Grid', 'Floats', 'Positioning'] },
  { id: 'css-responsive', label: 'Responsive Design', desc: 'Media queries and mobile-first.', parents: ['css'], phase: 'beginner', details: ['Media Queries', 'rem vs em', 'Mobile-first approach'] },

  { id: 'js', label: 'JavaScript', desc: 'Making the web interactive.', parents: ['css'], phase: 'intermediate' },
  { id: 'js-dom', label: 'DOM Manipulation', desc: 'Interacting with HTML via JS.', parents: ['js'], phase: 'intermediate', details: ['Selecting elements', 'Modifying classes/styles', 'Event Listeners'] },
  { id: 'js-async', label: 'Async JS', desc: 'Promises, Async/Await.', parents: ['js'], phase: 'intermediate', details: ['Callbacks', 'Promises', 'Async/Await', 'Event Loop'] },
  { id: 'js-apis', label: 'Web APIs', desc: 'Fetch, Storage, etc.', parents: ['js'], phase: 'intermediate', details: ['Fetch API', 'Local Storage', 'Session Storage'] },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub.', parents: ['js'], phase: 'intermediate', details: ['Git Basics', 'Branching', 'Merging', 'Rebasing', 'GitHub/GitLab'] },
  
  { id: 'frameworks', label: 'Frameworks', desc: 'React, Vue, or Angular.', parents: ['vcs'], phase: 'intermediate' },
  { id: 'react', label: 'React.js', desc: 'Component based UI.', parents: ['frameworks'], phase: 'intermediate', details: ['Components', 'JSX', 'Props & State'] },
  { id: 'react-hooks', label: 'Hooks', desc: 'useState, useEffect, etc.', parents: ['react'], phase: 'intermediate', details: ['useState', 'useEffect', 'useContext', 'useMemo', 'Custom Hooks'] },
  { id: 'react-router', label: 'Routing', desc: 'React Router Dom.', parents: ['react'], phase: 'intermediate', details: ['BrowserRouter', 'Routes', 'Link', 'useNavigate'] },
  { id: 'state-mgmt', label: 'State Management', desc: 'Redux, Zustand, etc.', parents: ['react'], phase: 'intermediate', details: ['Redux Toolkit', 'Zustand', 'Context API', 'Jotai'] },
  
  { id: 'build-tools', label: 'Build Tools', desc: 'Bundlers and Task Runners.', parents: ['frameworks'], phase: 'advanced', details: ['Vite', 'Webpack', 'esbuild', 'Rollup'] },
  { id: 'testing', label: 'Testing', desc: 'Ensuring code quality.', parents: ['build-tools'], phase: 'advanced', details: ['Jest', 'React Testing Library', 'Cypress', 'Playwright'] },
  { id: 'ssr', label: 'SSR / SSG', desc: 'Server Side Rendering.', parents: ['testing'], phase: 'advanced', details: ['Next.js', 'Remix', 'Astro'] },
]);

// --- BACKEND ---
export const backendData = generateGraph([
  { id: 'internet', label: 'Internet Basics', desc: 'Understand how the web functions.', phase: 'beginner' },
  { id: 'dns-http', label: 'DNS & HTTP', desc: 'Networking protocols.', parents: ['internet'], phase: 'beginner', details: ['DNS Resolution', 'HTTP/HTTPS Protocols', 'Ports'] },
  
  { id: 'os', label: 'OS & General Knowledge', desc: 'Core system concepts.', parents: ['internet'], phase: 'beginner' },
  { id: 'os-terminal', label: 'Terminal Usage', desc: 'Navigating CLI.', parents: ['os'], phase: 'beginner', details: ['Bash/Zsh', 'Basic Commands', 'Piping'] },
  { id: 'os-threads', label: 'Processes & Threads', desc: 'Concurrency.', parents: ['os'], phase: 'beginner', details: ['Process Management', 'Multithreading', 'Concurrency vs Parallelism'] },
  
  { id: 'language', label: 'Programming Language', desc: 'Pick a backend language.', parents: ['os'], phase: 'beginner', details: ['Node.js', 'Python', 'Go', 'Rust', 'Java', 'C#'] },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub.', parents: ['language'], phase: 'beginner', details: ['Git Commits', 'Branching strategies', 'Pull Requests'] },
  
  { id: 'rdbms', label: 'Relational Databases', desc: 'SQL databases.', parents: ['vcs'], phase: 'intermediate' },
  { id: 'sql', label: 'SQL Basics', desc: 'Writing queries.', parents: ['rdbms'], phase: 'intermediate', details: ['SELECT statements', 'Joins (Inner, Left, Right)', 'Group By', 'Having'] },
  { id: 'db-design', label: 'Database Design', desc: 'Structuring data properly.', parents: ['rdbms'], phase: 'intermediate', details: ['Normalization (1NF-3NF)', 'Indexes', 'ACID properties', 'N+1 Problem'] },
  
  { id: 'nosql', label: 'NoSQL Databases', desc: 'Non-relational data.', parents: ['rdbms'], phase: 'intermediate', details: ['MongoDB', 'Cassandra', 'DynamoDB', 'Document vs Key-Value'] },
  
  { id: 'apis', label: 'APIs', desc: 'Communication between services.', parents: ['nosql'], phase: 'intermediate' },
  { id: 'rest', label: 'RESTful APIs', desc: 'Standard conventions.', parents: ['apis'], phase: 'intermediate', details: ['Resource Naming', 'Status Codes', 'Idempotency'] },
  { id: 'graphql', label: 'GraphQL', desc: 'Query language for APIs.', parents: ['apis'], phase: 'intermediate', details: ['Schemas', 'Resolvers', 'Mutations'] },
  
  { id: 'caching', label: 'Caching', desc: 'Improving performance.', parents: ['apis'], phase: 'intermediate', details: ['Redis', 'Memcached', 'CDN', 'Client-side caching'] },
  
  { id: 'security', label: 'Web Security', desc: 'Protecting your application.', parents: ['caching'], phase: 'advanced', details: ['CORS', 'CSP', 'OWASP Top 10', 'Hashing algorithms'] },
  { id: 'auth', label: 'Authentication', desc: 'Verifying users.', parents: ['security'], phase: 'advanced', details: ['Token-based auth (JWT)', 'Session Auth', 'OAuth 2.0', 'SSO'] },
  
  { id: 'testing', label: 'Testing', desc: 'Ensuring backend reliability.', parents: ['security'], phase: 'advanced', details: ['Unit Testing', 'Integration Testing', 'Mocking/Stubbing'] },
  
  { id: 'cicd', label: 'CI/CD', desc: 'Continuous Integration & Deployment.', parents: ['testing'], phase: 'advanced', details: ['GitHub Actions', 'Jenkins', 'Automated deployments'] },
  
  { id: 'docker', label: 'Containerization', desc: 'Docker and beyond.', parents: ['cicd'], phase: 'advanced', details: ['Docker Basics', 'Docker Compose', 'Containerizing Node/Python apps'] },
  
  { id: 'architecture', label: 'Architecture & Patterns', desc: 'Scalable system design.', parents: ['docker'], phase: 'advanced' },
  { id: 'microservices', label: 'Microservices', desc: 'Decoupling applications.', parents: ['architecture'], phase: 'advanced', details: ['Service Discovery', 'API Gateways', 'Circuit Breakers'] },
  { id: 'message', label: 'Message Brokers', desc: 'Asynchronous communication.', parents: ['architecture'], phase: 'advanced', details: ['RabbitMQ', 'Apache Kafka', 'Amazon SQS', 'Redis Pub/Sub'] },
]);

// --- FULL STACK ---
export const fullstackData = generateGraph([
  { id: 'internet', label: 'Internet Fundamentals', desc: 'Understand the web, HTTP, and DNS.', phase: 'beginner', details: ['HTTP/HTTPS', 'DNS', 'Domain Names'] },
  
  { id: 'frontend', label: 'Frontend Basics', desc: 'HTML, CSS, and basic JavaScript.', parents: ['internet'], phase: 'beginner' },
  { id: 'html-css', label: 'HTML & CSS', desc: 'Structure and styles.', parents: ['frontend'], phase: 'beginner', details: ['Semantic HTML', 'CSS Flexbox/Grid'] },
  { id: 'js', label: 'JavaScript', desc: 'Interactivity.', parents: ['frontend'], phase: 'beginner', details: ['JS DOM Manipulation', 'JS ES6+ Features'] },
  
  { id: 'vcs', label: 'Version Control', desc: 'Git and GitHub.', parents: ['frontend'], phase: 'beginner', details: ['Commits', 'Branches', 'Merging'] },
  
  { id: 'framework', label: 'Frontend Framework', desc: 'React, Vue, or Angular.', parents: ['vcs'], phase: 'intermediate' },
  { id: 'react', label: 'React.js', desc: 'UI Library.', parents: ['framework'], phase: 'intermediate', details: ['Components', 'State & Props', 'React Router', 'Hooks'] },
  { id: 'css-fw', label: 'CSS Frameworks', desc: 'Tailwind, Styled Components.', parents: ['framework'], phase: 'intermediate', details: ['Tailwind CSS', 'CSS Modules', 'Sass'] },
  
  { id: 'backend-lang', label: 'Backend Language', desc: 'Node.js or Python.', parents: ['framework'], phase: 'intermediate', details: ['Node.js', 'Express.js', 'Python/Django', 'API creation'] },
  
  { id: 'databases', label: 'Databases', desc: 'SQL and NoSQL.', parents: ['backend-lang'], phase: 'intermediate' },
  { id: 'sql', label: 'PostgreSQL/MySQL', desc: 'Relational.', parents: ['databases'], phase: 'intermediate', details: ['Schemas', 'Queries', 'Prisma ORM'] },
  { id: 'nosql', label: 'MongoDB', desc: 'Document based.', parents: ['databases'], phase: 'intermediate', details: ['Documents', 'Collections', 'Mongoose'] },
  
  { id: 'apis', label: 'APIs & Integration', desc: 'REST APIs and connecting frontend to backend.', parents: ['databases'], phase: 'intermediate', details: ['REST Conventions', 'Fetching data in React', 'CORS issues'] },
  
  { id: 'auth', label: 'Authentication', desc: 'JWT, OAuth, and session management.', parents: ['apis'], phase: 'advanced', details: ['JWT (JSON Web Tokens)', 'Cookies', 'OAuth 2.0', 'Password Hashing (Bcrypt)'] },
  
  { id: 'ssr', label: 'Meta Frameworks', desc: 'Next.js for Full Stack.', parents: ['auth'], phase: 'advanced' },
  { id: 'nextjs', label: 'Next.js Features', desc: 'SSR, SSG, API routes.', parents: ['ssr'], phase: 'advanced', details: ['Server Components', 'API Routes', 'App Router', 'Data Fetching'] },
  
  { id: 'deployment', label: 'Deployment', desc: 'Vercel, Heroku, or VPS.', parents: ['ssr'], phase: 'advanced', details: ['Vercel deployment', 'Render', 'Linux Server basics', 'Nginx reverse proxy'] },
  
  { id: 'docker', label: 'Containerization', desc: 'Dockerizing full stack applications.', parents: ['deployment'], phase: 'advanced', details: ['Dockerfiles', 'Docker Compose for Fullstack'] },
]);

// --- DEVOPS ---
export const devopsData = generateGraph([
  { id: 'language', label: 'Programming Language', desc: 'Learn Python, Go, or Ruby for scripting.', phase: 'beginner', details: ['Python', 'Go', 'Bash Scripting', 'Ruby'] },
  
  { id: 'os', label: 'OS Concepts', desc: 'Linux basics, terminal, and networking.', parents: ['language'], phase: 'beginner' },
  { id: 'linux', label: 'Linux Admin', desc: 'Managing linux servers.', parents: ['os'], phase: 'beginner', details: ['Linux Kernel', 'Shell commands', 'Process Management', 'File Systems'] },
  { id: 'networking', label: 'Networking & Security', desc: 'Protocols and firewalls.', parents: ['os'], phase: 'beginner', details: ['OSI Model', 'TCP/IP', 'DNS', 'HTTP/HTTPS', 'SSH', 'Firewalls', 'SSL/TLS'] },
  
  { id: 'servers', label: 'Server Management', desc: 'Web servers and reverse proxies.', parents: ['networking'], phase: 'beginner', details: ['Nginx', 'Apache', 'HAProxy', 'Forward/Reverse Proxies'] },
  
  { id: 'containers', label: 'Containers', desc: 'Docker and containerization concepts.', parents: ['servers'], phase: 'intermediate' },
  { id: 'docker', label: 'Docker Mastery', desc: 'Images and containers.', parents: ['containers'], phase: 'intermediate', details: ['Dockerfiles', 'LXC', 'Container vs VM', 'Docker Compose'] },
  
  { id: 'cicd', label: 'CI/CD', desc: 'Automation pipelines.', parents: ['containers'], phase: 'intermediate' },
  { id: 'github-actions', label: 'GitHub Actions', desc: 'CI/CD workflows.', parents: ['cicd'], phase: 'intermediate', details: ['Workflows', 'Runners', 'Secrets', 'Matrix builds'] },
  { id: 'jenkins', label: 'Jenkins', desc: 'Classic CI/CD.', parents: ['cicd'], phase: 'intermediate', details: ['Pipelines', 'Plugins', 'Nodes'] },
  
  { id: 'iac', label: 'Infrastructure as Code', desc: 'Managing infrastructure via code.', parents: ['cicd'], phase: 'intermediate' },
  { id: 'terraform', label: 'Terraform', desc: 'Provisioning.', parents: ['iac'], phase: 'intermediate', details: ['Providers', 'Modules', 'State management'] },
  { id: 'ansible', label: 'Ansible', desc: 'Configuration.', parents: ['iac'], phase: 'intermediate', details: ['Playbooks', 'Inventories', 'Roles'] },
  
  { id: 'orchestration', label: 'Container Orchestration', desc: 'Kubernetes (K8s).', parents: ['iac'], phase: 'advanced' },
  { id: 'k8s', label: 'Kubernetes', desc: 'Managing clusters.', parents: ['orchestration'], phase: 'advanced', details: ['Architecture', 'Pods & Deployments', 'Services & Ingress', 'Helm Charts'] },
  { id: 'service-mesh', label: 'Service Mesh', desc: 'Advanced microservices networking.', parents: ['orchestration'], phase: 'advanced', details: ['Istio', 'Linkerd', 'Consul'] },
  
  { id: 'cloud', label: 'Cloud Providers', desc: 'AWS, GCP, or Azure.', parents: ['orchestration'], phase: 'advanced' },
  { id: 'aws', label: 'AWS Essentials', desc: 'Amazon Web Services.', parents: ['cloud'], phase: 'advanced', details: ['EC2', 'S3', 'RDS', 'VPC', 'IAM'] },
  
  { id: 'monitoring', label: 'Monitoring & Logging', desc: 'Observability tools.', parents: ['cloud'], phase: 'advanced' },
  { id: 'prometheus', label: 'Prometheus & Grafana', desc: 'Metrics and dashboards.', parents: ['monitoring'], phase: 'advanced', details: ['PromQL', 'Exporters', 'Alertmanager'] },
  { id: 'elk', label: 'ELK Stack', desc: 'Log management.', parents: ['monitoring'], phase: 'advanced', details: ['Elasticsearch', 'Logstash', 'Kibana'] },
]);

// --- MACHINE LEARNING ---
export const mlData = generateGraph([
  { id: 'python', label: 'Python Programming', desc: 'Master Python for Data Science.', phase: 'beginner' },
  { id: 'py-data', label: 'Data Structures', desc: 'Lists, Tuples, Sets, Dictionaries.', parents: ['python'], phase: 'beginner', details: ['Lists & Arrays', 'Tuples', 'Dictionaries & Maps', 'Sets'] },
  { id: 'py-funcs', label: 'Functions & Classes', desc: 'Functional and OOP Python.', parents: ['python'], phase: 'beginner', details: ['Lambda Functions', 'Decorators', 'Classes', 'Inheritance'] },
  { id: 'py-files', label: 'File Handling', desc: 'Reading and writing data.', parents: ['python'], phase: 'beginner', details: ['Reading CSVs', 'JSON parsing', 'File streams'] },
  
  { id: 'math', label: 'Mathematics', desc: 'Linear Algebra and Calculus.', parents: ['py-data', 'py-funcs'], phase: 'beginner' },
  { id: 'math-linear', label: 'Linear Algebra', desc: 'Vectors and Matrices.', parents: ['math'], phase: 'beginner', details: ['Vectors & Matrices', 'Eigenvalues', 'Matrix Multiplication'] },
  { id: 'math-calc', label: 'Calculus', desc: 'Derivatives and gradients.', parents: ['math'], phase: 'beginner', details: ['Derivatives', 'Partial Derivatives', 'Gradients'] },
  { id: 'stats', label: 'Statistics', desc: 'Distributions and Probability.', parents: ['math'], phase: 'beginner', details: ['Probability Theory', 'Normal Distribution', 'Bayes Theorem', 'Hypothesis Testing'] },
  
  { id: 'data-manipulation', label: 'Data Manipulation', desc: 'Cleaning and handling data.', parents: ['math-linear', 'math-calc', 'stats'], phase: 'intermediate' },
  { id: 'data-pandas', label: 'Pandas', desc: 'DataFrames and manipulation.', parents: ['data-manipulation'], phase: 'intermediate', details: ['DataFrames', 'Series', 'Handling Missing Data'] },
  { id: 'data-numpy', label: 'NumPy', desc: 'Numerical operations.', parents: ['data-manipulation'], phase: 'intermediate', details: ['NDArrays', 'Broadcasting', 'Vectorization'] },
  
  { id: 'data-viz', label: 'Data Visualization', desc: 'Understanding data visually.', parents: ['data-pandas', 'data-numpy'], phase: 'intermediate', details: ['Matplotlib', 'Seaborn', 'Plotly', 'Histograms & Scatter plots'] },
  
  { id: 'classical-ml', label: 'Classical ML', desc: 'Scikit-learn algorithms.', parents: ['data-viz'], phase: 'intermediate' },
  { id: 'ml-regression', label: 'Regression', desc: 'Predicting continuous values.', parents: ['classical-ml'], phase: 'intermediate', details: ['Linear Regression', 'Ridge/Lasso', 'Polynomial'] },
  { id: 'ml-classification', label: 'Classification', desc: 'Categorizing data.', parents: ['classical-ml'], phase: 'intermediate', details: ['Logistic Regression', 'SVM', 'Decision Trees', 'Random Forests'] },
  { id: 'ml-clustering', label: 'Clustering', desc: 'Unsupervised learning.', parents: ['classical-ml'], phase: 'intermediate', details: ['K-Means', 'DBSCAN', 'Hierarchical'] },
  
  { id: 'deep-learning', label: 'Deep Learning', desc: 'Neural Networks.', parents: ['ml-regression', 'ml-classification'], phase: 'advanced' },
  { id: 'dl-basics', label: 'Neural Net Basics', desc: 'Perceptrons and backprop.', parents: ['deep-learning'], phase: 'advanced', details: ['Perceptrons', 'Backpropagation', 'Activation Functions', 'Optimizers'] },
  { id: 'dl-frameworks', label: 'Frameworks', desc: 'Tools for building models.', parents: ['deep-learning'], phase: 'advanced', details: ['PyTorch', 'TensorFlow', 'Keras'] },
  
  { id: 'cv', label: 'Computer Vision', desc: 'Processing images.', parents: ['dl-basics', 'dl-frameworks'], phase: 'advanced', details: ['Convolutional Neural Networks (CNNs)', 'OpenCV', 'Image Classification', 'Object Detection (YOLO)'] },
  { id: 'nlp', label: 'NLP', desc: 'Processing text and language.', parents: ['dl-basics', 'dl-frameworks'], phase: 'advanced', details: ['Recurrent Neural Networks (RNNs)', 'LSTMs', 'Word Embeddings (Word2Vec)', 'Transformers', 'Hugging Face'] },
  
  { id: 'mlops', label: 'MLOps', desc: 'Model deployment and lifecycle.', parents: ['cv', 'nlp'], phase: 'advanced', details: ['Model Serialization (Pickle/ONNX)', 'FastAPI/Flask deployment', 'Docker for ML models', 'MLflow', 'Cloud Deployments (AWS SageMaker)'] },
]);

// --- BLOCKCHAIN ---
export const blockchainData = generateGraph([
  { id: 'crypto', label: 'Cryptography Basics', desc: 'The math behind blockchain.', phase: 'beginner' },
  { id: 'hash', label: 'Hash Functions', desc: 'SHA-256 and similar.', parents: ['crypto'], phase: 'beginner', details: ['Hash Functions (SHA-256)', 'Collision Resistance'] },
  { id: 'pkc', label: 'Public Key Cryptography', desc: 'Asymmetric encryption.', parents: ['crypto'], phase: 'beginner', details: ['Public/Private Keys', 'Digital Signatures', 'Elliptic Curve Cryptography'] },
  
  { id: 'fundamentals', label: 'Blockchain Fundamentals', desc: 'How blockchains actually work.', parents: ['hash', 'pkc'], phase: 'beginner' },
  { id: 'consensus', label: 'Consensus Mechanisms', desc: 'PoW vs PoS.', parents: ['fundamentals'], phase: 'beginner', details: ['Proof of Work', 'Proof of Stake', 'Delegated PoS'] },
  { id: 'nodes', label: 'Nodes & Networks', desc: 'Decentralized architecture.', parents: ['fundamentals'], phase: 'beginner', details: ['Full Nodes', 'Miners/Validators', 'P2P Networks'] },
  
  { id: 'ethereum', label: 'Ethereum Concepts', desc: 'The leading smart contract platform.', parents: ['consensus', 'nodes'], phase: 'intermediate' },
  { id: 'evm', label: 'EVM & Gas', desc: 'Ethereum Virtual Machine.', parents: ['ethereum'], phase: 'intermediate', details: ['Ethereum Virtual Machine (EVM)', 'Gas & Fees', 'Accounts vs Smart Contracts'] },
  
  { id: 'smart-contracts', label: 'Smart Contracts', desc: 'Writing decentralized code.', parents: ['evm'], phase: 'intermediate' },
  { id: 'solidity', label: 'Solidity', desc: 'Programming language.', parents: ['smart-contracts'], phase: 'intermediate', details: ['Solidity syntax', 'Data Types', 'Functions & Modifiers', 'Events'] },
  { id: 'standards', label: 'Token Standards', desc: 'ERC tokens.', parents: ['smart-contracts'], phase: 'intermediate', details: ['ERC-20 (Fungible)', 'ERC-721 (NFTs)', 'ERC-1155'] },
  
  { id: 'web3', label: 'Web3.js / Ethers.js', desc: 'Connecting frontend to blockchain.', parents: ['solidity'], phase: 'intermediate', details: ['Ethers.js', 'Web3.js', 'Providers & Signers', 'Contract Interaction', 'React integrations (wagmi)'] },
  
  { id: 'frameworks', label: 'Dev Frameworks', desc: 'Testing and deployment tools.', parents: ['web3'], phase: 'intermediate', details: ['Hardhat', 'Foundry', 'Truffle', 'Local Blockchain (Anvil/Ganache)', 'Writing tests in JS/Solidity'] },
  
  { id: 'security', label: 'Security & Auditing', desc: 'Writing safe contracts.', parents: ['frameworks'], phase: 'advanced' },
  { id: 'vulns', label: 'Common Vulnerabilities', desc: 'What to avoid.', parents: ['security'], phase: 'advanced', details: ['Reentrancy Attacks', 'Integer Overflow/Underflow', 'Front-running', 'Access Control flaws'] },
  { id: 'audit-tools', label: 'Auditing Tools', desc: 'Automated analysis.', parents: ['security'], phase: 'advanced', details: ['Slither', 'Mythril', 'Echidna'] },
  
  { id: 'storage', label: 'Decentralized Storage', desc: 'Storing data off-chain.', parents: ['security'], phase: 'advanced', details: ['IPFS', 'Arweave', 'Filecoin', 'Pinata'] },
  
  { id: 'scaling', label: 'L2 Scaling', desc: 'Making blockchains faster.', parents: ['storage'], phase: 'advanced', details: ['Optimistic Rollups', 'ZK Rollups', 'Sidechains (Polygon)'] },
  
  { id: 'defi', label: 'DeFi Concepts', desc: 'Decentralized Finance.', parents: ['scaling'], phase: 'advanced', details: ['Decentralized Exchanges (DEXs)', 'Automated Market Makers (AMMs)', 'Liquidity Pools', 'Lending Protocols', 'Flash Loans'] },
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
