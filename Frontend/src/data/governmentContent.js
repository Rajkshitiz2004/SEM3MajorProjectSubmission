/**
 * governmentContent.js
 * Structured demonstration data for RajBhasha AI government portal.
 * All data is explicitly intended for demonstration, academic, and translation testing purposes.
 * Note: Data attributes (data-translatable) can be used to identify content blocks for translation.
 */

/* ─── 1. SCHEMES DATA ─── */
export const SCHEMES_CONTENT = {
  header: {
    tag: 'Flagship Initiatives & Welfare',
    title: 'National Electricity Schemes & Subsidies',
    subtitle:
      'Explore official central initiatives promoting affordable power, rooftop clean energy generation, and universal rural electricity access across India.',
    notice: 'Demo Notice: All scheme descriptions, eligibility parameters, and figures presented here are simulated for demonstration and academic evaluation only.',
  },
  schemesList: [
    {
      id: 'scheme-subsidy',
      title: 'Domestic Electricity Subsidy Scheme',
      category: 'Tariff Relief',
      tag: 'Direct Benefit Transfer',
      summary:
        'Targeted electricity billing subsidy designed to assist low-income domestic households and lifeline consumers with slab-wise tariff concessions.',
      eligibility: [
        'Domestic consumer connections with sanctioned connected load below 3 kW.',
        'Monthly consumption within standard domestic lifeline consumption brackets.',
        'Active bank account linked with consumer connection ID for direct DBT benefit verification.',
      ],
      guidance: [
        'Verify your monthly energy consumption on your recent electricity bill.',
        'Submit the consumer application form along with income category certification.',
        'Subsidy concession reflects directly on monthly electricity bills upon verification.',
      ],
      benefits: 'Up to 50% concession on first 100 units per billing cycle (demonstration parameter).',
    },
    {
      id: 'scheme-solar',
      title: 'PM Surya Ghar: Rooftop Solar Initiative',
      category: 'Renewable Energy',
      tag: 'Solar Transition',
      summary:
        'Empowering residential consumers to set up grid-connected solar rooftop panels, generate clean green power, and export excess generation via net metering.',
      eligibility: [
        'Residential building owner or registered residential housing welfare society.',
        'Adequate shadow-free rooftop space capable of supporting solar installation weight.',
        'Active domestic power supply connection with clear payment record.',
      ],
      guidance: [
        'Estimate your rooftop area and average daily kilowatt-hour demand.',
        'Register your rooftop solar request through the national solar demonstration portal.',
        'Obtain feasibility clearance and meter installation inspection from your local DISCOM.',
      ],
      benefits: 'Central financial subsidy assistance alongside significant reduction in recurring electricity bills.',
    },
    {
      id: 'scheme-rural',
      title: 'Universal Rural Electrification Mission',
      category: 'Infrastructure',
      tag: 'Gramin Jyoti',
      summary:
        'Comprehensive infrastructure expansion to supply uninterrupted 24x7 electricity to rural habitations, primary agricultural feeders, and remote public institutions.',
      eligibility: [
        'Un-electrified rural residential households and hamlets in designated rural areas.',
        'Panchayat community health centres, village schools, and rural water supply stations.',
        'Farmers and agricultural cooperative clusters requiring dedicated solarized farm feeders.',
      ],
      guidance: [
        'Panchayat nodal officers coordinate baseline habitations survey with state power utilities.',
        'Community registration camps are held for un-electrified households.',
        'Free service connection lines are provided to registered eligible rural beneficiaries.',
      ],
      benefits: 'Dedicated agricultural feeder separation, stable voltage supply, and unmetered connection elimination.',
    },
  ],
  applicationProcess: [
    {
      step: '01',
      title: 'Citizen Registration',
      description: 'Create an account using your mobile number and 10-digit consumer identification number.',
    },
    {
      step: '02',
      title: 'Eligibility Verification',
      description: 'Review scheme guidelines, upload required supporting identity proofs, and confirm connection premises.',
    },
    {
      step: '03',
      title: 'Digital Application',
      description: 'Complete the standardized online application form and receive a unique tracking token.',
    },
    {
      step: '04',
      title: 'Inspection & Approval',
      description: 'Utility field engineers review documents, verify site conditions, and sanction scheme benefits.',
    },
  ],
};

/* ─── 2. SERVICES DATA ─── */
export const SERVICES_CONTENT = {
  header: {
    tag: 'Citizen Services & Utilities',
    title: 'Public Electricity Services Portal',
    subtitle:
      'Access essential consumer utilities including duplicate bill downloads, new service connection applications, grievance filing, and real-time status tracking.',
    notice: 'Demo Notice: The services listed below represent functional mock workflows intended for translation testing.',
  },
  servicesList: [
    {
      id: 'service-bill',
      title: 'Electricity Bill Information & Payments',
      category: 'Billing & Tariff',
      description:
        'Check current billing cycle details, review slab-wise energy charges, download verified duplicate invoices, and verify prior transaction history.',
      keyFeatures: [
        'Instant view of current dues, meter reading dates, and prompt payment rebate eligibility.',
        'Breakdown of energy charges, regulatory surcharges, state electricity duty, and fixed tariffs.',
        'Downloadable GST-compliant PDF receipts for domestic and commercial accounts.',
      ],
      actionText: 'View Bill Guide',
    },
    {
      id: 'service-connection',
      title: 'New Electricity Connection Guidance',
      category: 'New Connections',
      description:
        'Comprehensive guidance on applying for new low-tension domestic, commercial, agricultural, and industrial power connections.',
      keyFeatures: [
        'Step-by-step checklist of ownership proofs, identity documents, and electrical contractor test reports.',
        'Standard load calculation guidelines based on appliance wattage and premises square footage.',
        'Transparent timeline benchmarks for meter delivery and service line installation.',
      ],
      actionText: 'Connection Guidelines',
    },
    {
      id: 'service-complaint',
      title: 'Consumer Complaint & Fault Registration',
      category: 'Redressal',
      description:
        'Lodge complaints regarding power interruptions, voltage fluctuation, damaged transformers, faulty meters, and incorrect meter readings.',
      keyFeatures: [
        'Category-based complaint registration with automatic escalation to area sub-divisional officers.',
        'Priority complaint handling for critical public infrastructure, hospitals, and emergency services.',
        'Statutory grievance resolution under the Electricity Regulatory Consumer Rights Charter.',
      ],
      actionText: 'File Complaint',
    },
    {
      id: 'service-status',
      title: 'Application & Request Status Tracking',
      category: 'Track Requests',
      description:
        'Monitor the real-time processing status of your new connection requests, load enhancement applications, and registered complaints.',
      keyFeatures: [
        'Search status by Application Reference Number or Registered Mobile Number.',
        'Transparent workflow timeline showing document verification, field inspection, and meter release.',
        'SMS and email notification preferences for milestone progress updates.',
      ],
      actionText: 'Track Status',
    },
  ],
  consumerCharter: [
    {
      title: 'Guaranteed Power Reliability',
      text: 'Utilities must maintain standard frequency and voltage parameters within prescribed statutory thresholds.',
    },
    {
      title: 'Timely Grievance Redressal',
      text: 'Meter breakdown or distribution transformer failures must be inspected within designated timeline benchmarks.',
    },
    {
      title: 'Transparent Billing',
      text: 'Consumers are entitled to transparent, itemized billing records and timely bill dispute resolution procedures.',
    },
  ],
};

/* ─── 3. NOTICES DATA ─── */
export const NOTICES_CONTENT = {
  header: {
    tag: 'Official Circulars & Advisory',
    title: 'Public Notices, Deadlines & Safety Guidelines',
    subtitle:
      'Stay informed with official circulars, regulatory announcements, application cutoff deadlines, and mandatory electrical safety precautions.',
    notice: 'Demo Notice: Notices, dates, and circulars presented here are demonstration placeholders and do not represent actual government directives.',
  },
  publicNotices: [
    {
      id: 'notice-1',
      date: '10 November 2026',
      title: 'Advisory on Rooftop Solar Phase-II Scheme Subsidies',
      department: 'Renewable Energy Cell',
      category: 'Public Advisory',
      description:
        'Beneficiaries seeking rooftop solar subsidy assistance under Phase-II are advised to submit technical feasibility certificates from authorized state DISCOM vendors before processing final subsidy claims.',
    },
    {
      id: 'notice-2',
      date: '03 November 2026',
      title: 'Scheduled Feeder Maintenance Shutdown Notice',
      department: 'Distribution & Maintenance Wing',
      category: 'Feeder Operations',
      description:
        'Scheduled preventive maintenance of 33/11 kV substations will take place across designated suburban industrial feeder networks. Consumers are requested to plan operational schedules accordingly.',
    },
    {
      id: 'notice-3',
      date: '24 October 2026',
      title: 'Smart Meter Deployment Standards & Consumer Awareness',
      department: 'Metering & Standards Division',
      category: 'Regulation',
      description:
        'Standard operational guidelines regarding bidirectional smart meter deployment, meter calibration testing, and prepaid consumption thresholds have been updated for citizen review.',
    },
  ],
  deadlines: [
    {
      id: 'dl-1',
      event: 'Agricultural Tariff Concession Renewal',
      deadline: '30 November 2026',
      status: 'Open for Renewal',
      notes: 'Eligible agricultural consumers must verify seasonal land possession records to continue concessional power tariff benefits.',
    },
    {
      id: 'dl-2',
      event: 'Solar Rooftop Subsidy Application Cycle',
      deadline: '15 December 2026',
      status: 'Active Window',
      notes: 'Final date for quarterly submission of vendor installation completion certificates for direct benefit settlement.',
    },
    {
      id: 'dl-3',
      event: 'Annual Electric Contractor License Verification',
      deadline: '31 December 2026',
      status: 'Mandatory',
      notes: 'Certified electrical supervisors and licensed contractors must submit renewal applications to the State Licensing Board.',
    },
  ],
  safetyGuidelines: [
    {
      id: 'safe-1',
      title: 'Monsoon Electrical Precautionary Measures',
      points: [
        'Never touch electrical poles, stay wires, or distribution transformers during rainy or waterlogged conditions.',
        'Report broken overhead electric conductors or sparking wires immediately to the 24x7 control helpline.',
        'Ensure proper electrical earth leakage circuit breakers (ELCB) are installed in domestic switchboards.',
      ],
    },
    {
      id: 'safe-2',
      title: 'Domestic Wiring & Overload Protection',
      points: [
        'Always utilize Bureau of Indian Standards (BIS) certified copper cables and standard miniature circuit breakers (MCB).',
        'Avoid overloading single wall sockets with multiple heavy heating or cooling appliances.',
        'Disconnect appliance power cords during severe thunderstorm and lightning warnings.',
      ],
    },
    {
      id: 'safe-3',
      title: 'Agricultural Pump & Farm Field Safety',
      points: [
        'Maintain protective fencing around private transformer installations and borewell switch rooms.',
        'Do not operate motor starters with wet hands or bare feet.',
        'Keep safe clearance distances when operating tall agricultural harvesters near high-tension transmission towers.',
      ],
    },
  ],
};

/* ─── 4. CONTACT DATA ─── */
export const CONTACT_CONTENT = {
  header: {
    tag: 'Citizen Redressal & Support',
    title: 'Department Contact & Grievance Channels',
    subtitle:
      'Reach out to our consumer helpdesk, grievance officers, and administrative offices for queries, technical support, and feedback.',
    notice: 'Demo Notice: All contact numbers, email addresses, and official locations on this page are simulated placeholders for testing purposes.',
  },
  demoOffices: [
    {
      id: 'office-headquarters',
      name: 'Central Electricity Support Headquarters',
      division: 'Department of Power & Energy (Demo)',
      address: 'Shram Shakti Bhawan, Rafi Marg, New Delhi 110001 (Placeholder)',
      email: 'support-demo@rajbhasha-portal.gov.in',
      phone: '+91-11-2300-0000 (Demo Support)',
      timing: 'Monday to Friday: 9:30 AM – 5:30 PM IST',
    },
    {
      id: 'office-grievance',
      name: 'Electricity Consumer Ombudsman Office',
      division: 'Statutory Grievance Redressal Forum',
      address: 'Vidyut Niy नियामक Bhawan, Institutional Area, Sector 4, New Delhi (Placeholder)',
      email: 'ombudsman-demo@rajbhasha-portal.gov.in',
      phone: '+91-11-2600-0000 (Placeholder)',
      timing: 'Public Hearing Days: Tuesday & Thursday (11:00 AM – 4:00 PM)',
    },
    {
      id: 'office-renewable',
      name: 'Solar Energy & Subsidy Project Cell',
      division: 'National Green Energy Mission',
      address: 'Paryavaran Complex, CGO Complex, Lodhi Road, New Delhi (Placeholder)',
      email: 'solar-support-demo@rajbhasha-portal.gov.in',
      phone: '+91-11-2400-0000 (Placeholder)',
      timing: 'Monday to Friday: 10:00 AM – 5:00 PM IST',
    },
  ],
  supportChannels: [
    {
      title: 'Toll-Free Consumer Helpline',
      identifier: '1912 (Standard National Emergency Code)',
      description: 'Round-the-clock emergency assistance for power breakdowns, voltage drops, and hazardous electrical conditions.',
      type: '24x7 Emergency',
    },
    {
      title: 'Digital Portal Helpdesk',
      identifier: 'helpdesk-demo@rajbhasha-portal.gov.in',
      description: 'Email assistance for online payment verification, duplicate receipts, and portal technical troubleshooting.',
      type: 'Technical Support',
    },
    {
      title: 'SMS Status Inquiry Service',
      identifier: 'SMS POWER <Consumer_ID> to 56161 (Demo)',
      description: 'Receive real-time bill due dates and outage status updates directly on your registered mobile number.',
      type: 'Automated SMS',
    },
  ],
  faqList: [
    {
      question: 'How do I lodge an electricity billing dispute online?',
      answer: 'Navigate to the Services section, select "Consumer Complaint & Fault Registration", and provide your 10-digit consumer identification number with your latest billing statement.',
    },
    {
      question: 'What documents are required for a domestic connection load extension?',
      answer: 'Standard requirements include verified property ownership or lease deed, valid national identity proof, and an electrical safety test certificate issued by an authorized contractor.',
    },
    {
      question: 'Is this an operational government transaction portal?',
      answer: 'No. This website is a research and academic demonstration developed for RajBhasha AI to showcase bilingual government portal accessibility and translation capabilities.',
    },
  ],
};

