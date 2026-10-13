// Official NSQF Qualification Packs (QP) and National Occupational Standards (NOS)
export const QUALIFICATIONS = [
  {
    id: "QP-ELE-6001",
    code: "ELE/Q6001",
    title: "Domestic Electrician",
    sector: "Electronics & Electrical",
    nsqfLevel: 4,
    description: "Installation, testing, maintenance and troubleshooting of domestic electrical wiring, switchboards, MCBs, earthing and energy meters.",
    minExperienceMonths: 24,
    icon: "Zap",
    nosList: [
      {
        code: "ELE/N6001",
        title: "Work Safely in Domestic Electrical Environments",
        weightage: 20,
        keySkills: ["PPE compliance", "Safe isolation procedure", "Fire extinguisher usage", "Earthing checks"]
      },
      {
        code: "ELE/N6002",
        title: "Install & Terminate Domestic Wiring & Switchgear",
        weightage: 35,
        keySkills: ["Conduit layout", "Colour coding standard", "MCB/RCCB sizing", "Neat routing & crimping"]
      },
      {
        code: "ELE/N6003",
        title: "Test Circuits & Measure Electrical Parameters",
        weightage: 25,
        keySkills: ["Multimeter & Megger usage", "Insulation resistance", "Loop impedance", "Continuity test"]
      },
      {
        code: "ELE/N6004",
        title: "Diagnose Faults & Perform Rectification",
        weightage: 20,
        keySkills: ["Short circuit tracing", "Overload diagnosis", "Neutral fault isolation", "Customer handover"]
      }
    ],
    mandatoryChecklist: [
      { id: "c1", label: "Confirmed de-energized line with verified tester before touch", mandatory: true },
      { id: "c2", label: "Wore dielectric safety footwear and rated insulated gloves", mandatory: true },
      { id: "c3", label: "Observed standard phase (Red/Yellow/Blue), neutral (Black/Blue) & earth (Green) wire color codes", mandatory: true },
      { id: "c4", label: "Measured earthing pit / soil resistance within safe limits (< 5 Ohms)", mandatory: false },
      { id: "c5", label: "Verified RCCB trip button & sensitivity test (30mA)", mandatory: true }
    ],
    rubricDimensions: [
      {
        id: "rubric-safety",
        name: "Occupational Health & Safety (HSE)",
        weight: 25,
        levels: [
          { score: 1, label: "Novice", desc: "Ignores safety gear, bypasses lockout/tagout, improper tool handling" },
          { score: 2, label: "Emerging", desc: "Uses partial PPE, requires prompting for isolation, basic safety awareness" },
          { score: 3, label: "Competent", desc: "Follows all safety protocols independently, verifies de-energization, keeps work zone hazard-free" },
          { score: 4, label: "Exemplary", desc: "Flawless safety practice, identifies latent hazards, guides assistants on precautions" }
        ]
      },
      {
        id: "rubric-tech",
        name: "Technical Tool Usage & Workmanship",
        weight: 35,
        levels: [
          { score: 1, label: "Novice", desc: "Damages insulation, incorrect crimping, messy wiring layout" },
          { score: 2, label: "Emerging", desc: "Acceptable terminations but inconsistent stripping and uneven conduit clipping" },
          { score: 3, label: "Competent", desc: "Clean conduit bends, secure lugs, proper torque on terminals, neat dressing" },
          { score: 4, label: "Exemplary", desc: "Professional panel layout, precision wire ferruling, industrial-grade finish" }
        ]
      },
      {
        id: "rubric-knowledge",
        name: "Circuit Testing & Diagnostic Logic",
        weight: 25,
        levels: [
          { score: 1, label: "Novice", desc: "Cannot interpret multimeter readings; random guessing for faults" },
          { score: 2, label: "Emerging", desc: "Measures voltage/continuity with difficulty; slow fault isolation" },
          { score: 3, label: "Competent", desc: "Accurately measures V/I/R, explains breaker ratings, systematic fault tracing" },
          { score: 4, label: "Exemplary", desc: "Fast root-cause diagnosis, explains harmonic/neutral imbalances, calculates wire load" }
        ]
      },
      {
        id: "rubric-viva",
        name: "Viva Voce & Professional Communication",
        weight: 15,
        levels: [
          { score: 1, label: "Novice", desc: "Unable to explain electrical concepts or codes; uncommunicative" },
          { score: 2, label: "Emerging", desc: "Answers basic questions with hesitation; struggles with technical terms" },
          { score: 3, label: "Competent", desc: "Confidently explains work steps, safety codes, and customer advice" },
          { score: 4, label: "Exemplary", desc: "Articulate, demonstrates deep trade insights, quotes standard IS regulations" }
        ]
      }
    ]
  },
  {
    id: "QP-SOL-0101",
    code: "SGJ/Q0101",
    title: "Solar PV Installer (Suryamitra)",
    sector: "Green Jobs",
    nsqfLevel: 4,
    description: "Site survey, mounting solar PV panels, inverter wiring, earthing, DC cabling, and commissioning of rooftop systems.",
    minExperienceMonths: 18,
    icon: "Sun",
    nosList: [
      {
        code: "SGJ/N0101",
        title: "Work Safely at Rooftop & Heights",
        weightage: 25,
        keySkills: ["Full body harness", "Rooftop edge protection", "DC high-voltage safety"]
      },
      {
        code: "SGJ/N0102",
        title: "Mount Solar Modules & Structures",
        weightage: 30,
        keySkills: ["Tilt angle alignment", "Fastener torque", "Shadow analysis", "Wind load clamping"]
      },
      {
        code: "SGJ/N0103",
        title: "Install DC/AC Inverter & Grid Connection",
        weightage: 25,
        keySkills: ["MC4 connector crimping", "String open circuit voltage Voc check", "SPD/Inverter integration"]
      },
      {
        code: "SGJ/N0104",
        title: "Test & Commission Solar Plant",
        weightage: 20,
        keySkills: ["I-V curve testing", "Dedicated solar earthing check", "Anti-islanding test"]
      }
    ],
    mandatoryChecklist: [
      { id: "s1", label: "Inspected fall arrest safety harness & lifeline before rooftop ascent", mandatory: true },
      { id: "s2", label: "Crimped MC4 connectors with calibrated solar crimper (no loose pins)", mandatory: true },
      { id: "s3", label: "Verified array string Voc and Isc before connecting to inverter", mandatory: true },
      { id: "s4", label: "Installed separate dedicated earth pits for AC, DC, and Lightning Arrester", mandatory: true }
    ],
    rubricDimensions: [
      {
        id: "rubric-safety",
        name: "Height Safety & High Voltage DC Handling",
        weight: 30,
        levels: [
          { score: 1, label: "Novice", desc: "No fall protection; handles live DC strings without insulation" },
          { score: 2, label: "Emerging", desc: "Wears harness loosely; needs guidance on rooftop anchor points" },
          { score: 3, label: "Competent", desc: "Proper 100% tie-off at height; safely isolates DC disconnects" },
          { score: 4, label: "Exemplary", desc: "Conducts site hazard analysis; enforces strict rooftop safety perimeter" }
        ]
      },
      {
        id: "rubric-tech",
        name: "Module Alignment & DC Cabling Quality",
        weight: 35,
        levels: [
          { score: 1, label: "Novice", desc: "Misaligned panels, damaged backsheet, loose cable loops exposed to UV" },
          { score: 2, label: "Emerging", desc: "Acceptable tilt; some cable zip ties tight or unclipped" },
          { score: 3, label: "Competent", desc: "Precise compass/true-south orientation, weatherproof MC4 joints, neat conduit" },
          { score: 4, label: "Exemplary", desc: "Flawless mechanical alignment, UV-resistant cable trays, thermal scan ready" }
        ]
      },
      {
        id: "rubric-knowledge",
        name: "Electrical Commissioning & Earthing",
        weight: 20,
        levels: [
          { score: 1, label: "Novice", desc: "Cannot calculate string voltage or identify polarity" },
          { score: 2, label: "Emerging", desc: "Checks polarity with guidance; uncertain about earth pit impedance" },
          { score: 3, label: "Competent", desc: "Measures Voc/Isc correctly; verifies inverter sync and earth grounding" },
          { score: 4, label: "Exemplary", desc: "Explains irradiance derating, shading degradation, and net-metering synchronization" }
        ]
      },
      {
        id: "rubric-viva",
        name: "Viva Voce & System Handover",
        weight: 15,
        levels: [
          { score: 1, label: "Novice", desc: "Fails to describe basic inverter error codes" },
          { score: 2, label: "Emerging", desc: "Knows basic startup/shutdown but unclear on troubleshooting" },
          { score: 3, label: "Competent", desc: "Explains maintenance routine, cleaning precautions, safety shutdown" },
          { score: 4, label: "Exemplary", desc: "Clear customer briefing, detailed commissioning checklist explanation" }
        ]
      }
    ]
  },
  {
    id: "QP-WEL-3102",
    code: "ASC/Q3102",
    title: "Automotive MIG / TIG Welder",
    sector: "Automotive & Manufacturing",
    nsqfLevel: 3,
    description: "Manual metal arc, GMAW/MIG and GTAW/TIG welding of chassis, exhaust, sheet metal joints and automotive components.",
    minExperienceMonths: 24,
    icon: "Flame",
    nosList: [
      {
        code: "ASC/N3101",
        title: "Follow Workshop HSE & Fire Safety",
        weightage: 25,
        keySkills: ["Auto-darkening helmet", "Fume extractor setup", "Gas cylinder handling"]
      },
      {
        code: "ASC/N3102",
        title: "Prepare Joint, Edge & Gas Shielding",
        weightage: 25,
        keySkills: ["Bevel preparation", "Rust/grease removal", "Argon/CO2 flow rate setting"]
      },
      {
        code: "ASC/N3103",
        title: "Perform Fillet & Groove Welding in Positions",
        weightage: 30,
        keySkills: ["Travel speed", "Arc length control", "Weave pattern", "Root penetration"]
      },
      {
        code: "ASC/N3104",
        title: "Inspect Weld Defects & Perform Rework",
        weightage: 20,
        keySkills: ["Visual inspection (porosity, undercut, lack of fusion)", "Dye penetrant test"]
      }
    ],
    mandatoryChecklist: [
      { id: "w1", label: "Inspected gas hoses for leaks using soap bubble method (no flames)", mandatory: true },
      { id: "w2", label: "Wore DIN-compliant welding shade mask, leather apron, and gaiters", mandatory: true },
      { id: "w3", label: "Secured ground earth clamp directly to workpiece close to weld area", mandatory: true },
      { id: "w4", label: "Verified shielding gas cylinder chained upright with dual-stage regulator", mandatory: true }
    ],
    rubricDimensions: [
      {
        id: "rubric-safety",
        name: "Hot Work Safety & Gas Handling",
        weight: 25,
        levels: [
          { score: 1, label: "Novice", desc: "Welds without proper screen; handles cylinders improperly" },
          { score: 2, label: "Emerging", desc: "Basic PPE; forgets ventilation or clear spark area" },
          { score: 3, label: "Competent", desc: "Strict adherence to hot work permits, fire extinguisher ready, full PPE" },
          { score: 4, label: "Exemplary", desc: "Proactive safety leadership, flawless gas safety protocols" }
        ]
      },
      {
        id: "rubric-tech",
        name: "Bead Quality, Penetration & Consistency",
        weight: 40,
        levels: [
          { score: 1, label: "Novice", desc: "Excessive spatter, irregular bead height, noticeable cold lap and burn-through" },
          { score: 2, label: "Emerging", desc: "Fair bead appearance with minor undercut and occasional porosity" },
          { score: 3, label: "Competent", desc: "Uniform ripple pattern, full root penetration, clean restarts, minimal spatter" },
          { score: 4, label: "Exemplary", desc: "Aerospace/automotive grade consistency, zero visible defects, mirror symmetry" }
        ]
      },
      {
        id: "rubric-knowledge",
        name: "Welding Parameters & Material Science",
        weight: 20,
        levels: [
          { score: 1, label: "Novice", desc: "Cannot select voltage/wire feed speed for plate thickness" },
          { score: 2, label: "Emerging", desc: "Adjusts settings with multiple test runs; limited knowledge of gases" },
          { score: 3, label: "Competent", desc: "Sets optimal V/A/gas flow instantly for mild/stainless steel" },
          { score: 4, label: "Exemplary", desc: "Deep understanding of metallurgical heat affected zone (HAZ) and distortion control" }
        ]
      },
      {
        id: "rubric-viva",
        name: "Defect Identification & Viva Voce",
        weight: 15,
        levels: [
          { score: 1, label: "Novice", desc: "Cannot name weld defects or explain corrective actions" },
          { score: 2, label: "Emerging", desc: "Identifies obvious surface flaws but misses root causes" },
          { score: 3, label: "Competent", desc: "Accurately diagnoses causes of porosity, lack of penetration, slag inclusions" },
          { score: 4, label: "Exemplary", desc: "Quotes ISO 5817 weld quality levels; suggests process optimization" }
        ]
      }
    ]
  },
  {
    id: "QP-HSS-5101",
    code: "HSS/Q5101",
    title: "General Duty Assistant (Healthcare)",
    sector: "Healthcare",
    nsqfLevel: 4,
    description: "Patient transfer, vital signs monitoring, personal hygiene assistance, infection control, and daily clinic support.",
    minExperienceMonths: 12,
    icon: "HeartPulse",
    nosList: [
      {
        code: "HSS/N5101",
        title: "Infection Control & Biomedical Waste Handling",
        weightage: 25,
        keySkills: ["Hand hygiene (WHO 6 steps)", "Color coded BMW segregation", "PPE donning/doffing"]
      },
      {
        code: "HSS/N5102",
        title: "Monitor & Record Vital Signs",
        weightage: 25,
        keySkills: ["NIBP measurement", "Pulse oximetry", "Digital thermometer", "Respiration rate"]
      },
      {
        code: "HSS/N5103",
        title: "Assist in Patient Mobility & Bed Care",
        weightage: 30,
        keySkills: ["Log roll technique", "Wheelchair/stretcher transfer", "Pressure sore prevention"]
      },
      {
        code: "HSS/N5104",
        title: "First Aid & Emergency Response",
        weightage: 20,
        keySkills: ["CPR basics", "Choking response", "Reporting critical changes to nursing staff"]
      }
    ],
    mandatoryChecklist: [
      { id: "h1", label: "Demonstrated 6-step WHO hand hygiene technique", mandatory: true },
      { id: "h2", label: "Correctly segregated sharps in white/translucent puncture-proof container", mandatory: true },
      { id: "h3", label: "Accurately positioned patient for blood pressure measurement with cuff at heart level", mandatory: true },
      { id: "h4", label: "Maintained patient privacy and dignified communication at all times", mandatory: true }
    ],
    rubricDimensions: [
      {
        id: "rubric-safety",
        name: "Infection Control & Patient Safety",
        weight: 30,
        levels: [
          { score: 1, label: "Novice", desc: "Touches contaminated surfaces, improper needle disposal, breaks aseptic protocol" },
          { score: 2, label: "Emerging", desc: "Practices basic hygiene but requires reminders for BMW bin segregation" },
          { score: 3, label: "Competent", desc: "Consistent sterile precautions, meticulous waste segregation, ensures bedrails up" },
          { score: 4, label: "Exemplary", desc: "Strict adherence to hospital NABH infection protocols, alerts staff to breaches" }
        ]
      },
      {
        id: "rubric-tech",
        name: "Patient Handling & Vital Sign Accuracy",
        weight: 35,
        levels: [
          { score: 1, label: "Novice", desc: "Rough transfer technique; inaccurate vital sign readings" },
          { score: 2, label: "Emerging", desc: "Acceptable vital recording; slightly unsteady patient transfer" },
          { score: 3, label: "Competent", desc: "Gentle ergonomic transfer, precise vital signs documentation, watches for red flags" },
          { score: 4, label: "Exemplary", desc: "Smooth compassionate handling, anticipates patient discomfort, quick vital logging" }
        ]
      },
      {
        id: "rubric-knowledge",
        name: "Clinical Procedures & Ethics",
        weight: 20,
        levels: [
          { score: 1, label: "Novice", desc: "Unaware of normal vital ranges or patient consent protocol" },
          { score: 2, label: "Emerging", desc: "Knows normal ranges; hesitates during emergency reporting" },
          { score: 3, label: "Competent", desc: "Recognizes tachycardia, hypotension, fever; follows reporting ladder" },
          { score: 4, label: "Exemplary", desc: "Strong understanding of patient rights, fall prevention, and geriatric care" }
        ]
      },
      {
        id: "rubric-viva",
        name: "Empathy, Communication & Viva",
        weight: 15,
        levels: [
          { score: 1, label: "Novice", desc: "Rude or indifferent tone; struggles to explain procedures to patient" },
          { score: 2, label: "Emerging", desc: "Polite but quiet; needs improvement in active reassurance" },
          { score: 3, label: "Competent", desc: "Calm, reassuring, explains every step clearly in patient's preferred language" },
          { score: 4, label: "Exemplary", desc: "High emotional intelligence, de-escalates patient anxiety, exemplary bedside manner" }
        ]
      }
    ]
  }
];
