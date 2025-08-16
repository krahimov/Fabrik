#!/usr/bin/env node

/**
 * Loan Qualification Configuration for Samantha Longo
 * Structured data for MortyAI loan processing workflow
 */

export const samanthaLongoLoanConfig = {
  borrower: {
    name: "Samantha Longo",
    employer: "Satellite 169 LLC",
    payFrequency: "bi-weekly",
    location: "Miami Beach, FL"
  },
  
  incomeAnalysis: {
    payPeriods: {
      current: {
        date: "04/30/2025",
        period: "04/19/2025 - 05/02/2025",
        grossPay: 5085.92,
        ytdGrossPay: 48824.56,
        periodsYTD: 9.6
      }
    },
    
    incomeComponents: {
      regular: {
        2023: 26975.47,
        2024: 34845.84,
        2025: 12033.30,
        qualifyingAnnual: 30910.66,
        qualifyingMonthly: 2575.89
      },
      overtime: {
        2023: 1325.28,
        2024: 2938.34,
        2025: 9020.23,
        qualifyingAnnual: 2131.81,
        qualifyingMonthly: 177.65
      },
      tips: {
        2023: 47311.49,
        2024: 47717.98,
        2025: 27771.03,
        qualifyingAnnual: 47514.73,
        qualifyingMonthly: 3959.56
      },
      bonus: {
        2024: 3000.00,
        excluded: true,
        reason: "No 2-year history for bonus income"
      }
    },
    
    totalQualifyingIncome: {
      monthly: 6713.10,
      annual: 80557.20
    }
  },
  
  assets: {
    checking: 0.00,
    savings: 0.00,
    total: 0.00,
    criticalFlag: "Zero liquid assets - major qualification impediment"
  },
  
  liabilities: {
    totalDebt: 0.00,
    monthlyPayments: 0.00,
    debtToIncomeRatio: 0.00,
    strength: "No recurring debt obligations"
  },
  
  loanQualification: {
    maxDTI: 0.43,
    maxHousingPayment: 2886.67,
    estimatedMaxLoanAmount: {
      min: 360000,
      max: 380000
    },
    
    productEligibility: {
      conventional: {
        eligible: false,
        reason: "Zero assets for down payment and closing costs"
      },
      fha: {
        eligible: false,
        reason: "Zero assets for 3.5% down payment requirement"
      },
      va: {
        eligible: false,
        reason: "No veteran status indicated"
      },
      usda: {
        eligible: false,
        reason: "Miami Beach, FL not in USDA rural area"
      }
    },
    
    potentialSolutions: [
      "Down Payment Assistance (DPA) programs",
      "Gift funds from eligible family member",
      "State/local first-time homebuyer programs"
    ]
  },
  
  riskAssessment: {
    strengths: [
      "Strong, consistent employment history",
      "Stable tip income over 2-year period",
      "No recurring debt obligations",
      "Strong DTI capacity"
    ],
    
    weaknesses: [
      "Zero liquid assets (critical)",
      "Fluctuating regular and overtime income",
      "Significant YTD income increases require verification"
    ],
    
    recommendation: "Not eligible for standard mortgage products without down payment assistance or gift funds"
  },
  
  nextSteps: [
    "Research local/state DPA programs",
    "Obtain full credit report",
    "Verify sustainability of increased 2025 earnings",
    "Explore gift fund options from family"
  ]
};

export const mortyAIConfig = {
  agent: {
    name: "Morty",
    description: "You are MortyAI, an agentic system for automating mortgage loan processing. You integrate multiple tools to perform lender workflows end-to-end: Retrieval-Augmented Generation (RAG): Used to query and apply Fannie Mae and Freddie Mac mortgage regulations, ensuring compliance when interpreting documents and performing calculations. MCP (Mortgage Communication Protocol): Middleware used to orchestrate and manage communication pipelines with third parties such as realtors, insurance, title companies, HOAs, and employers. Voice/Call AI: Handles borrower and third-party phone communications, including document requests, verifications, and follow-ups. Document Intelligence: Parses and extracts structured data from financial documents (bank statements, tax returns, pay stubs) to compute ratios such as DTI, LTV, and cash-to-close. Currently, MortyAI is being evaluated primarily on RAG performance for regulatory compliance while other modules (MCP, voice AI) are integrated but secondary in scope."
  },
  
  workflow: {
    name: "Morty",
    description: "System Prompt (MortyAI – Detailed AI Workflow): You are MortyAI, an agentic AI system designed to automate the full mortgage loan processing workflow. Your operation follows a structured pipeline powered by multiple AI modules: Document Intake & Extraction, Regulatory Reasoning via RAG, Document Completeness Check, Borrower Communication, Third-Party Communication (MCP Layer), Loan Readiness Output",
    steps: [
      "Document Intake & Extraction",
      "Regulatory Reasoning via RAG", 
      "Document Completeness Check",
      "Borrower Communication",
      "Third-Party Communication (MCP Layer)",
      "Loan Readiness Output"
    ]
  },
  
  output: {
    naturalLanguageFormat: "Alright, let's dive deep into Samantha Longo's financial profile to determine her loan qualification, focusing on a meticulous income analysis as Morty AI.",
    expectedFormat: "JSON",
    syntheticRecordsCount: 10
  },
  
  ragChunks: [
    {
      score: 0.586926,
      textLength: 2161,
      fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
      pageLabel: 338,
      textPreview: '# Calculating Monthly Qualifying Rental Income (or Loss)\n\n# Lease Agreements, Form 1007, or Form 1025\n\n# Treatment of the Income (or Loss)\n\n# Offsetti...'
    },
    {
      score: 0.572078,
      textLength: 2040,
      fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
      pageLabel: 525,
      textPreview: 'appear on the credit report, such as monthly housing expenses for taxes, insurance, must be disclosed in the loan application prior to final submissio...'
    },
    {
      score: 0.5663309,
      textLength: 2126,
      fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
      pageLabel: 242,
      textPreview: 'General Borrower Eligibility Requirements\n\n# General Borrower Eligibility Requirements\n\nFannie Mae purchases or securitizes mortgages made to borrower...'
    },
    {
      score: 0.55391616,
      textLength: 1982,
      fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
      pageLabel: 795,
      textPreview: 'Requirements for HomeReady Transactions with LTV, CLTV, or HCLTV Ratios of 95.01 – 97%\n\n# Subordinate Financing\n\n# Eligible Loan Types\n\n# Temporary Bu...'
    },
    {
      score: 0.5443418,
      textLength: 2649,
      fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
      pageLabel: 561,
      textPreview: 'See Fannie Mae and Freddie Mac Uniform Appraisal Dataset Specification, Appendix D: Field-Specific Standardization Requirements, and the associated FA...'
    },
    {
      score: 0.5425973,
      textLength: 2035,
      fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
      pageLabel: 191,
      textPreview: '# Criteria\n\n# Requirements\n\n- At least one borrower must be a first-time homebuyer, as indicated on the Form 1003 in the Declarations section, when at...'
    }
  ],
  
  loanData: samanthaLongoLoanConfig
};
