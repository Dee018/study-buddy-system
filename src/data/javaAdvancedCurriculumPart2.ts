// Advanced Track Java Curriculum - Part 2: Modules 11 & 12
// Comprehensive Java Curriculum for Advanced-Level Learners
// Includes: Lessons, Hands-on Exercises, Assessment Projects

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  starterCode: string;
  solutionCode?: string;
  expectedOutput?: string;
  hints: string[];
  points: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  starterCode: string;
  expectedFeatures: string[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

export interface DetailedLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Intermediate' | 'Expert';
  completed?: boolean;
  locked?: boolean;
  concepts: string[];
  theoreticalFoundation: string[];
  netBeansGuidance: string[];
  codeExamples: {
    title: string;
    description: string;
    code: string;
    explanation: string;
  }[];
  practiceExercises: string[];
}

export interface DetailedModule {
  id: string;
  week: number;
  title: string;
  description: string;
  objectives: string[];
  category: 'Beginner' | 'Learner' | 'Advanced';
  requiredLevel: 'Beginner' | 'Learner' | 'Advanced';
  estimatedHours: number;
  completed?: boolean;
  locked?: boolean;

  learningPhilosophy: string;
  theoreticalFoundation: string[];
  netBeansSetup?: string[];

  lessons: DetailedLesson[];
  handsOnExercises: Exercise[];
  assessmentProject: Project;
}

// Module 11: Asynchronous Programming
export const module11: DetailedModule = {
  id: 'advanced-module-11',
  week: 11,
  title: 'Asynchronous Programming - Concurrent Task Management',
  description: 'Master asynchronous programming in Java using modern concurrency APIs. Learn to build responsive, non-blocking applications with CompletableFuture.',
  category: 'Advanced',
  requiredLevel: 'Advanced',
  estimatedHours: 5,

  objectives: [
    'Understand synchronous vs asynchronous programming paradigms',
    'Master CompletableFuture for async operations',
    'Implement complex async task composition and coordination',
    'Handle errors gracefully in concurrent environments',
    'Build responsive, non-blocking applications'
  ],

  learningPhilosophy: 'This module transforms your understanding of program execution from sequential, blocking operations to concurrent, non-blocking patterns. You\'ll learn to write responsive applications that efficiently utilize system resources.',

  theoreticalFoundation: [
    'Asynchronous programming allows programs to perform multiple operations concurrently',
    'Traditional synchronous code executes sequentially',
    'Async programming improves responsiveness',
    'CompletableFuture provides powerful API for composing async operations',
    'Understanding Executor framework is essential',
    'Async programming requires careful error handling'
  ],

  netBeansSetup: [
    'Ensure Java 8 or higher for CompletableFuture support',
    'Use NetBeans debugger with thread view',
    'Enable Java 8+ language features',
    'Configure exception breakpoints',
    'Use profiler for concurrent task analysis'
  ],

  lessons: [
    {
      id: 'advanced-lesson-11-1',
      title: 'Synchronous vs Asynchronous Programming',
      description: 'Understand fundamental differences between synchronous and asynchronous execution models.',
      duration: '55 minutes',
      difficulty: 'Expert',
      concepts: [
        'Synchronous execution model',
        'Asynchronous execution model',
        'Blocking vs non-blocking operations',
        'Concurrency vs parallelism',
        'Thread pools and Executor framework',
        'Async programming use cases'
      ],
      theoreticalFoundation: [
        'Synchronous programming executes operations sequentially',
        'Blocking operations halt program execution',
        'Asynchronous programming allows non-blocking execution',
        'Concurrency means multiple tasks making progress',
        'Parallelism means simultaneous execution',
        'Executor framework manages thread pools',
        'CompletableFuture provides high-level async API'
      ],
      netBeansGuidance: [
        'Create Java project with Java 8+ compatibility',
        'Use Run > Profile to observe thread behavior',
        'Debug > Threads shows active execution',
        'Set breakpoints in async callbacks'
      ],
      codeExamples: [],
      practiceExercises: [
        'Compare sync vs async file reading',
        'Implement task scheduler',
        'Measure execution times',
        'Experiment with thread pool sizes'
      ]
    },
    {
      id: 'advanced-lesson-11-2',
      title: 'CompletableFuture Fundamentals',
      description: 'Master CompletableFuture API for creating, composing, and managing asynchronous operations.',
      duration: '70 minutes',
      difficulty: 'Expert',
      concepts: [
        'CompletableFuture creation',
        'supplyAsync and runAsync',
        'thenApply, thenAccept, thenRun',
        'Chaining operations',
        'Combining multiple futures',
        'Exception handling'
      ],
      theoreticalFoundation: [
        'CompletableFuture represents async computation',
        'supplyAsync executes task and returns result',
        'runAsync executes task without result',
        'thenApply transforms result',
        'thenAccept consumes result',
        'thenRun executes action after completion',
        'Method chaining creates async pipelines'
      ],
      netBeansGuidance: [
        'Use code completion for CompletableFuture methods',
        'Set breakpoints in lambdas',
        'Inspect future states in Variables window',
        'Enable exception breakpoints'
      ],
      codeExamples: [],
      practiceExercises: [
        'Create product search with multiple sources',
        'Implement weather service',
        'Build data aggregation pipeline',
        'Create parallel file processor'
      ]
    },
    {
      id: 'advanced-lesson-11-3',
      title: 'Exception Handling in Async Code',
      description: 'Master error handling techniques for asynchronous operations.',
      duration: '60 minutes',
      difficulty: 'Expert',
      concepts: [
        'exceptionally method',
        'handle method',
        'whenComplete method',
        'Exception propagation',
        'Fallback strategies',
        'Error recovery patterns'
      ],
      theoreticalFoundation: [
        'Async exceptions don\'t propagate like sync code',
        'CompletableFuture wraps exceptions',
        'exceptionally provides fallback values',
        'handle processes success and failure',
        'whenComplete executes cleanup',
        'Proper error handling prevents silent failures'
      ],
      netBeansGuidance: [
        'Add exception breakpoints for CompletionException',
        'Set breakpoints in exception handlers',
        'Use Variables window for exception details',
        'Monitor exception stack traces'
      ],
      codeExamples: [],
      practiceExercises: [
        'Implement retry logic',
        'Create timeout handling',
        'Build circuit breaker pattern',
        'Develop fallback strategies'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'advanced-ex-11-1',
      title: 'Async Data Fetcher',
      description: 'Build system fetching data from multiple sources',
      difficulty: 'Medium',
      instructions: [
        'Create async methods for different data sources',
        'Use CompletableFuture for concurrent fetching',
        'Combine results from all sources',
        'Handle timeouts and errors',
        'Display aggregated results'
      ],
      starterCode: `import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class AsyncDataFetcher {
    
    public CompletableFuture<String> fetchFromDatabase() {
        return CompletableFuture.supplyAsync(() -> {
            // Simulate database query
            try {
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "Database Data";
        });
    }
    
    public CompletableFuture<String> fetchFromAPI() {
        // Implement API fetch
        return null;
    }
    
    public CompletableFuture<String> fetchFromCache() {
        // Implement cache fetch
        return null;
    }
    
    public void fetchAllData() {
        // Combine all futures and display results
    }
}`,
      expectedOutput: `=== Async Data Fetcher System ===

Starting concurrent data fetches at 10:15:00...

[Thread-1] Fetching from Cache... (Expected: 0.5s)
[Thread-2] Fetching from API... (Expected: 1.5s)
[Thread-3] Fetching from Database... (Expected: 2.0s)

[Thread-1] ✓ Cache fetch completed at 10:15:00.5
[Thread-2] ✓ API fetch completed at 10:15:01.5
[Thread-3] ✓ Database fetch completed at 10:15:02.0

--- Aggregated Results ---
Cache: User session data loaded
API: Weather forecast for New York: 72°F, Sunny
Database: Customer records retrieved (150 entries)

Total execution time: 2.1 seconds
✓ All data sources fetched successfully using CompletableFuture`,
      hints: [
        'Use CompletableFuture.allOf for coordination',
        'Add timeout with completeOnTimeout',
        'Handle exceptions with exceptionally'
      ],
      points: 120
    },
    {
      id: 'advanced-ex-11-2',
      title: 'Async File Processor',
      description: 'Process multiple files concurrently',
      difficulty: 'Hard',
      instructions: [
        'Read multiple files asynchronously',
        'Process each file content',
        'Aggregate results',
        'Handle file not found errors',
        'Report processing statistics'
      ],
      starterCode: `import java.util.concurrent.CompletableFuture;
import java.nio.file.*;
import java.util.*;

public class AsyncFileProcessor {
    
    public CompletableFuture<String> processFile(String filename) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Read and process file
                String content = Files.readString(Path.of(filename));
                // Process content
                return content.toUpperCase();
            } catch (Exception e) {
                throw new RuntimeException("Error processing " + filename, e);
            }
        });
    }
    
    public void processMultipleFiles(List<String> filenames) {
        // Process all files concurrently
    }
}`,
      expectedOutput: `=== Async File Processor ===

Processing 5 files concurrently...

[10:20:00.100] Started processing: document1.txt
[10:20:00.102] Started processing: document2.txt
[10:20:00.103] Started processing: document3.txt
[10:20:00.105] Started processing: document4.txt
[10:20:00.107] Started processing: document5.txt

[10:20:00.250] ✓ Completed: document1.txt (Lines: 45, Words: 320)
[10:20:00.275] ✓ Completed: document3.txt (Lines: 32, Words: 215)
[10:20:00.290] ✗ Error: document4.txt (File not found)
[10:20:00.310] ✓ Completed: document2.txt (Lines: 78, Words: 542)
[10:20:00.325] ✓ Completed: document5.txt (Lines: 51, Words: 389)

--- Processing Statistics ---
Total files processed: 4/5
Total lines: 206
Total words: 1,466
Failed: 1 (document4.txt)
Total time: 0.3 seconds

✓ Concurrent processing completed with error handling`,
      hints: [
        'Use Files.readString for reading',
        'Map filenames to CompletableFuture',
        'Use allOf for coordination',
        'Collect results after completion'
      ],
      points: 150
    },
    {
      id: 'advanced-ex-11-3',
      title: 'Async Web Scraper',
      description: 'Build concurrent web scraping system',
      difficulty: 'Hard',
      instructions: [
        'Simulate fetching web pages asynchronously',
        'Extract data from pages',
        'Handle failed requests with retry',
        'Implement rate limiting',
        'Aggregate and display results'
      ],
      starterCode: `import java.util.concurrent.*;
import java.util.*;

public class AsyncWebScraper {
    private ExecutorService executor;
    
    public AsyncWebScraper() {
        executor = Executors.newFixedThreadPool(5);
    }
    
    public CompletableFuture<String> fetchPage(String url) {
        return CompletableFuture.supplyAsync(() -> {
            // Simulate HTTP request
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "<html>Page content for " + url + "</html>";
        }, executor);
    }
    
    public CompletableFuture<String> extractData(String html) {
        // Extract useful data
        return null;
    }
    
    public void scrapeMultiplePages(List<String> urls) {
        // Implement concurrent scraping
    }
}`,
      expectedOutput: `=== Async Web Scraper ===

Scraping 10 URLs with rate limiting (5 concurrent threads)...

[Batch 1 - 5 URLs]
[10:25:01] Fetching: https://example.com/page1
[10:25:01] Fetching: https://example.com/page2
[10:25:01] Fetching: https://example.com/page3
[10:25:01] Fetching: https://example.com/page4
[10:25:01] Fetching: https://example.com/page5

[10:25:02] ✓ Extracted: page1 - Title: "Java Programming Guide"
[10:25:02] ✓ Extracted: page2 - Title: "Best Practices"
[10:25:02] ✗ Failed: page3 - Retrying... (Attempt 1/3)
[10:25:02] ✓ Extracted: page4 - Title: "Design Patterns"
[10:25:02] ✓ Extracted: page5 - Title: "Code Examples"

[Batch 2 - 5 URLs]
[10:25:03] Fetching: https://example.com/page6
[10:25:03] ✓ Retry successful: page3 - Title: "Advanced Topics"
...

--- Scraping Summary ---
Successfully scraped: 10/10 URLs
Total data extracted: 10 pages
Retry attempts: 1
Total time: 3.2 seconds
Average time per page: 0.32 seconds

✓ Concurrent web scraping completed with retry logic`,
      hints: [
        'Use custom executor for rate limiting',
        'Chain fetchPage and extractData',
        'Implement retry with recursion',
        'Use exceptionally for error handling'
      ],
      points: 150
    }
  ],

  assessmentProject: {
    id: 'advanced-project-11',
    title: 'Concurrent Data Processing Pipeline',
    description: 'Build comprehensive async data processing system with multiple stages.',
    objectives: [
      'Implement multi-stage async pipeline',
      'Coordinate multiple async operations',
      'Handle errors and timeouts',
      'Optimize performance with concurrency'
    ],
    requirements: [
      'Data ingestion from multiple sources',
      'Async validation stage',
      'Parallel processing stage',
      'Aggregation stage',
      'Error handling and retry logic',
      'Timeout management',
      'Progress reporting',
      'Performance metrics'
    ],
    starterCode: `import java.util.concurrent.*;
import java.util.*;

class DataRecord {
    private String id;
    private String data;
    private boolean valid;
    
    // Implement
}

public class DataProcessingPipeline {
    private ExecutorService executor;
    
    public DataProcessingPipeline() {
        executor = Executors.newFixedThreadPool(10);
    }
    
    public CompletableFuture<List<DataRecord>> ingestData() {
        // Fetch data from multiple sources
        return null;
    }
    
    public CompletableFuture<DataRecord> validateRecord(DataRecord record) {
        // Validate async
        return null;
    }
    
    public CompletableFuture<DataRecord> processRecord(DataRecord record) {
        // Process async
        return null;
    }
    
    public CompletableFuture<String> aggregateResults(List<DataRecord> records) {
        // Aggregate
        return null;
    }
    
    public void runPipeline() {
        // Orchestrate entire pipeline
    }
    
    public static void main(String[] args) {
        // Run pipeline
    }
}`,
    expectedFeatures: [
      'Multi-stage async pipeline',
      'Parallel processing',
      'Error handling with retry',
      'Timeout management',
      'Progress tracking',
      'Performance metrics',
      'Graceful shutdown',
      'Comprehensive logging'
    ],
    estimatedTime: '4-5 hours',
    difficulty: 'Hard',
    points: 300
  }
};

// Module 12: Multithreading and Final Integration Project
export const module12: DetailedModule = {
  id: 'advanced-module-12',
  week: 12,
  title: 'Multithreading and Final Integration Project',
  description: 'Master concurrent programming with Java multithreading, implement thread synchronization, and synthesize all learned concepts into a comprehensive final project.',
  category: 'Advanced',
  requiredLevel: 'Advanced',
  estimatedHours: 6,

  objectives: [
    'Master Java multithreading concepts and lifecycle',
    'Implement robust synchronization mechanisms',
    'Apply advanced threading patterns',
    'Utilize ExecutorService and thread pools',
    'Design and develop comprehensive final project',
    'Demonstrate professional Java development'
  ],

  learningPhilosophy: 'This culminating module represents the apex of your Java learning journey. Multithreading unlocks the power of modern multi-core processors. By mastering concurrent programming, you gain the ability to build high-performance, responsive applications.',

  theoreticalFoundation: [
    'Multithreading enables concurrent execution',
    'Threads share memory space',
    'Thread states reflect execution lifecycle',
    'Synchronization prevents race conditions',
    'Producer-consumer pattern solves bounded-buffer problems',
    'Deadlock prevention requires careful lock ordering',
    'Modern concurrency utilities simplify thread management',
    'Thread pools reuse worker threads efficiently'
  ],

  netBeansSetup: [
    'Use Debug > Threads window',
    'Set breakpoints for thread observation',
    'Enable Debug > Stack > Show Monitors',
    'Use Variables window for thread data',
    'NetBeans detects potential deadlocks',
    'Profile concurrent applications'
  ],

  lessons: [
    {
      id: 'advanced-lesson-12-1',
      title: 'Multithreading Fundamentals',
      description: 'Master thread creation, lifecycle management, priorities, and daemon threads.',
      duration: '70 minutes',
      difficulty: 'Expert',
      concepts: [
        'Thread class and Runnable interface',
        'Thread lifecycle states',
        'Thread creation patterns',
        'Thread priorities',
        'Daemon vs user threads',
        'Thread interruption'
      ],
      theoreticalFoundation: [
        'Threads represent independent execution paths',
        'Runnable promotes better OOP design',
        'Thread states reflect OS management',
        'Priorities provide scheduling hints',
        'Daemon threads terminate with user threads',
        'Proper interruption enables graceful termination'
      ],
      netBeansGuidance: [
        'Use Threads window to visualize execution',
        'Set breakpoints to observe behavior',
        'NetBeans highlights synchronization issues',
        'Track messages in Output window'
      ],
      codeExamples: [],
      practiceExercises: [
        'Create concurrent counting threads',
        'Implement time monitoring daemon',
        'Build download simulator',
        'Practice graceful interruption'
      ]
    },
    {
      id: 'advanced-lesson-12-2',
      title: 'Synchronization and Thread Safety',
      description: 'Master synchronization to prevent race conditions and ensure data integrity.',
      duration: '75 minutes',
      difficulty: 'Expert',
      concepts: [
        'Race conditions',
        'Synchronized methods and blocks',
        'Intrinsic locks',
        'Lock granularity',
        'Volatile keyword',
        'Deadlock prevention'
      ],
      theoreticalFoundation: [
        'Race conditions cause unpredictable results',
        'Synchronization ensures mutual exclusion',
        'Synchronized keyword acquires locks',
        'Synchronized blocks provide fine control',
        'Locks are reentrant',
        'Volatile ensures visibility',
        'Deadlock requires circular dependencies'
      ],
      netBeansGuidance: [
        'NetBeans highlights synchronized keywords',
        'Threads window shows blocking',
        'Set breakpoints in synchronized blocks',
        'Deadlock detector identifies issues'
      ],
      codeExamples: [],
      practiceExercises: [
        'Create thread-safe shopping cart',
        'Implement synchronized inventory',
        'Build thread-safe resource pool',
        'Fix race conditions'
      ]
    },
    {
      id: 'advanced-lesson-12-3',
      title: 'Producer-Consumer Pattern',
      description: 'Master inter-thread communication using wait/notify mechanisms.',
      duration: '65 minutes',
      difficulty: 'Expert',
      concepts: [
        'Producer-consumer problem',
        'wait() and notify() methods',
        'notifyAll() usage',
        'Bounded buffers',
        'Thread coordination'
      ],
      theoreticalFoundation: [
        'Producer-consumer solves data sharing',
        'wait() releases lock and suspends',
        'notify() wakes one waiting thread',
        'Always use in synchronized blocks',
        'Check conditions in while loops',
        'Bounded buffers prevent overflow'
      ],
      netBeansGuidance: [
        'Debug with multiple breakpoints',
        'Watch buffer state',
        'Observe wait/notify',
        'Track blocked threads'
      ],
      codeExamples: [],
      practiceExercises: [
        'Multi-producer multi-consumer system',
        'Task queue with thread pool',
        'Message passing system',
        'Print queue simulation'
      ]
    },
    {
      id: 'advanced-lesson-12-4',
      title: 'Final Project Integration',
      description: 'Plan and design comprehensive final project integrating all concepts.',
      duration: '90 minutes',
      difficulty: 'Expert',
      concepts: [
        'System architecture',
        'Component integration',
        'Testing strategies',
        'Documentation',
        'Code organization',
        'Performance optimization'
      ],
      theoreticalFoundation: [
        'Professional projects require planning',
        'Architecture defines relationships',
        'Integration testing ensures compatibility',
        'Documentation aids maintenance',
        'Package organization promotes modularity',
        'Performance optimization resolves bottlenecks'
      ],
      netBeansGuidance: [
        'Create proper package structure',
        'Use refactoring tools',
        'Implement comprehensive testing',
        'Generate Javadoc',
        'Use profiling tools'
      ],
      codeExamples: [],
      practiceExercises: [
        'Create architecture diagram',
        'Design class hierarchy',
        'Write specifications',
        'Plan testing strategy'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'advanced-ex-12-1',
      title: 'Multi-threaded Download Manager',
      description: 'Create download manager simulating concurrent downloads',
      difficulty: 'Medium',
      instructions: [
        'Create DownloadTask simulating downloads',
        'Implement progress tracking',
        'Use multiple threads',
        'Display real-time progress',
        'Handle interruption gracefully'
      ],
      starterCode: `class DownloadTask implements Runnable {
    private String fileName;
    private int fileSize;
    
    public DownloadTask(String fileName, int fileSize) {
        this.fileName = fileName;
        this.fileSize = fileSize;
    }
    
    public void run() {
        // Simulate download with progress
    }
}

public class DownloadManager {
    public static void main(String[] args) {
        // Create and start downloads
    }
}`,
      expectedOutput: `=== Multi-threaded Download Manager ===

Starting 4 concurrent downloads...

[Thread-1] Downloading: video.mp4 (1024 MB)
[Thread-2] Downloading: music.mp3 (256 MB)
[Thread-3] Downloading: document.pdf (128 MB)
[Thread-4] Downloading: image.jpg (64 MB)

[10:30:00] Progress Update:
  video.mp4    [████░░░░░░] 25% (256/1024 MB) - Thread-1
  music.mp3    [████████░░] 50% (128/256 MB) - Thread-2
  document.pdf [████████████████] 75% (96/128 MB) - Thread-3
  image.jpg    [████████████████████] 100% (64/64 MB) ✓ COMPLETE

[10:30:01] Progress Update:
  video.mp4    [█████░░░░░] 40% (409/1024 MB) - Thread-1
  music.mp3    [████████████████████] 100% (256/256 MB) ✓ COMPLETE
  document.pdf [████████████████████] 100% (128/128 MB) ✓ COMPLETE

[10:30:02] Progress Update:
  video.mp4    [████████████████████] 100% (1024/1024 MB) ✓ COMPLETE

--- Download Summary ---
Total files downloaded: 4
Total data: 1,472 MB
Total time: 2.3 seconds
Average speed: 640 MB/s

✓ All downloads completed successfully`,
      hints: [
        'Use Thread.sleep() for simulation',
        'Calculate progress percentage',
        'Use printf for updates',
        'Handle InterruptedException'
      ],
      points: 100
    },
    {
      id: 'advanced-ex-12-2',
      title: 'Thread-Safe Bank System',
      description: 'Implement banking system with concurrent transactions',
      difficulty: 'Hard',
      instructions: [
        'Create thread-safe BankAccount',
        'Implement deposit, withdraw, transfer',
        'Multiple accounts and transactions',
        'Prevent deadlock in transfers',
        'Verify final balances'
      ],
      starterCode: `class BankAccount {
    private String accountId;
    private double balance;
    
    public BankAccount(String id, double initial) {
        this.accountId = id;
        this.balance = initial;
    }
    
    public synchronized void deposit(double amount) {
        // Implement
    }
    
    public synchronized boolean withdraw(double amount) {
        // Implement
        return false;
    }
}

public class BankingSystem {
    public static void main(String[] args) {
        // Create accounts and transactions
    }
}`,
      expectedOutput: `=== Thread-Safe Banking System ===

Creating 3 bank accounts...
Account A: $5,000.00
Account B: $3,000.00
Account C: $2,000.00

Executing 10 concurrent transactions...

[Thread-1] Transfer: A → B ($500.00)
[Thread-2] Deposit: B ($200.00)
[Thread-3] Withdraw: C ($100.00)
[Thread-4] Transfer: B → C ($300.00)
[Thread-5] Deposit: A ($150.00)
[Thread-6] Withdraw: A ($75.00)
[Thread-7] Transfer: C → A ($250.00)
[Thread-8] Deposit: C ($100.00)
[Thread-9] Transfer: A → C ($400.00)
[Thread-10] Withdraw: B ($50.00)

Processing transactions (using lock ordering to prevent deadlock)...

Transaction Log:
✓ [10:35:01.123] A → B: $500.00
✓ [10:35:01.145] B deposited: $200.00
✓ [10:35:01.167] C withdrew: $100.00
✓ [10:35:01.189] B → C: $300.00
✓ [10:35:01.201] A deposited: $150.00
✓ [10:35:01.223] A withdrew: $75.00
✓ [10:35:01.245] C → A: $250.00
✓ [10:35:01.267] C deposited: $100.00
✓ [10:35:01.289] A → C: $400.00
✓ [10:35:01.311] B withdrew: $50.00

--- Final Account Balances ---
Account A: $4,925.00 (Initial: $5,000.00, Change: -$75.00)
Account B: $3,350.00 (Initial: $3,000.00, Change: +$350.00)
Account C: $1,725.00 (Initial: $2,000.00, Change: -$275.00)

Total System Balance: $10,000.00 ✓ VERIFIED
No deadlocks detected.
All transactions completed successfully.`,
      hints: [
        'Use lock ordering for deadlock prevention',
        'Synchronize on account objects',
        'Simulate processing with sleep',
        'Track all transactions'
      ],
      points: 150
    },
    {
      id: 'advanced-ex-12-3',
      title: 'Producer-Consumer Queue',
      description: 'Implement system with multiple producers and consumers',
      difficulty: 'Hard',
      instructions: [
        'Create SharedQueue with bounded capacity',
        'Implement produce/consume with wait/notify',
        'Multiple producer and consumer threads',
        'Track items produced and consumed',
        'Ensure proper synchronization'
      ],
      starterCode: `import java.util.LinkedList;
import java.util.Queue;

class SharedQueue<T> {
    private Queue<T> queue = new LinkedList<>();
    private int capacity;
    
    public SharedQueue(int capacity) {
        this.capacity = capacity;
    }
    
    public synchronized void produce(T item) throws InterruptedException {
        // Implement
    }
    
    public synchronized T consume() throws InterruptedException {
        return null;
    }
}

public class ProducerConsumerSystem {
    public static void main(String[] args) {
        // Start producers and consumers
    }
}`,
      expectedOutput: `=== Producer-Consumer Queue System ===

Queue capacity: 10 items
Producers: 3 threads
Consumers: 2 threads

Starting system...

[Producer-1] Produced: Item-001 (Queue size: 1/10)
[Producer-2] Produced: Item-002 (Queue size: 2/10)
[Consumer-1] Consumed: Item-001 (Queue size: 1/10)
[Producer-3] Produced: Item-003 (Queue size: 2/10)
[Producer-1] Produced: Item-004 (Queue size: 3/10)
[Consumer-2] Consumed: Item-002 (Queue size: 2/10)
[Producer-2] Produced: Item-005 (Queue size: 3/10)
[Producer-3] Produced: Item-006 (Queue size: 4/10)
[Producer-1] Produced: Item-007 (Queue size: 5/10)
[Consumer-1] Consumed: Item-003 (Queue size: 4/10)
[Producer-2] Produced: Item-008 (Queue size: 5/10)
[Producer-3] Produced: Item-009 (Queue size: 6/10)
[Producer-1] Produced: Item-010 (Queue size: 7/10)
[Consumer-2] Consumed: Item-004 (Queue size: 6/10)
[Producer-2] Produced: Item-011 (Queue size: 7/10)
[Producer-3] Produced: Item-012 (Queue size: 8/10)
[Producer-1] Produced: Item-013 (Queue size: 9/10)
[Consumer-1] Consumed: Item-005 (Queue size: 8/10)
[Producer-2] Produced: Item-014 (Queue size: 9/10)
[Producer-3] Produced: Item-015 (Queue size: 10/10) [QUEUE FULL - WAITING]
[Consumer-2] Consumed: Item-006 (Queue size: 9/10)
[Producer-3] Resumed: Produced Item-015 (Queue size: 10/10)

... (continues for 60 seconds) ...

System shutting down...

--- Final Statistics ---
Total produced: 150 items
Total consumed: 148 items
Items in queue: 2

Producer Statistics:
  Producer-1: 52 items
  Producer-2: 49 items
  Producer-3: 49 items

Consumer Statistics:
  Consumer-1: 74 items
  Consumer-2: 74 items

Wait events: 23 (producers waited 15 times, consumers waited 8 times)
✓ All synchronization working correctly with wait/notify`,
      hints: [
        'Use while loops for conditions',
        'Call notifyAll() after changes',
        'Handle InterruptedException',
        'Use atomic counters for stats'
      ],
      points: 150
    }
  ],

  assessmentProject: {
    id: 'advanced-project-12',
    title: 'Task Management System - Final Integration Project',
    description: 'Create comprehensive task management system integrating all Java concepts: OOP, collections, file I/O, exceptions, and multithreading.',
    objectives: [
      'Demonstrate mastery of all Java concepts',
      'Design complete application architecture',
      'Apply multithreading for concurrent processing',
      'Implement exception handling and logging',
      'Create professional documentation'
    ],
    requirements: [
      'Task class hierarchy with different types',
      'Thread-safe TaskManager operations',
      'Collections Framework for storage',
      'File I/O for persistence',
      'Worker threads for execution',
      'Producer-consumer pattern for queue',
      'Comprehensive exception handling',
      'Detailed Javadoc documentation',
      'At least 3 interfaces',
      'Abstract classes for shared behavior',
      'Proper logging throughout',
      'Menu-driven interface',
      'Graceful thread shutdown'
    ],
    starterCode: `import java.util.*;
import java.util.concurrent.*;
import java.io.*;

/**
 * Task Management System - Final Integration Project
 */

abstract class Task implements Comparable<Task> {
    protected String id;
    protected String description;
    protected TaskStatus status;
    protected int priority;
    
    public Task(String id, String description, int priority) {
        this.id = id;
        this.description = description;
        this.priority = priority;
        this.status = TaskStatus.PENDING;
    }
    
    public abstract void execute();
    
    public int compareTo(Task other) {
        return Integer.compare(other.priority, this.priority);
    }
}

enum TaskStatus {
    PENDING, IN_PROGRESS, COMPLETED, FAILED
}

class TaskQueue {
    private PriorityQueue<Task> queue;
    private int capacity;
    
    public TaskQueue(int capacity) {
        this.capacity = capacity;
        queue = new PriorityQueue<>();
    }
    
    public synchronized void addTask(Task task) throws InterruptedException {
        // Implement with wait/notify
    }
    
    public synchronized Task getTask() throws InterruptedException {
        // Implement
        return null;
    }
}

public class TaskManagementSystem {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("╔════════════════════════════════════╗");
        System.out.println("║  Task Management System v1.0       ║");
        System.out.println("╚════════════════════════════════════╝");
        
        boolean running = true;
        while (running) {
            System.out.println("\\n1. Add Task");
            System.out.println("2. View Status");
            System.out.println("3. Save Tasks");
            System.out.println("4. Load Tasks");
            System.out.println("5. Exit");
            System.out.print("Choice: ");
            
            int choice = scanner.nextInt();
            
            // Implement menu handling
        }
        
        scanner.close();
    }
}`,
    expectedFeatures: [
      'Complete task hierarchy (3+ types)',
      'Thread-safe priority queue',
      'Multiple worker threads',
      'File persistence',
      'Exception handling',
      'Graceful shutdown',
      'Status tracking',
      'Professional menu',
      'Javadoc comments',
      'Collection usage',
      'Interface implementation',
      'Abstract class usage',
      'Design patterns'
    ],
    estimatedTime: '4-6 hours',
    difficulty: 'Hard',
    points: 300
  }
};

// Export both modules
export const advancedTrackPart2 = [module11, module12];
export default advancedTrackPart2;