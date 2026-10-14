import { useEffect, useState } from 'react'
import {
  Bell,
  Camera,
  Home,
  MessageSquare,
  Plus,
  Shield,
  Send,
  Sun,
  Moon,
  MapPin,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Navigation,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Check,
  LocateFixed,
  ShieldCheck,
  Crosshair,
  Clock,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  ExternalLink,
  Eye,
  Gauge,
  Compass,
} from 'lucide-react'

type Lang = 'en' | 'te' | 'hi'
type Status = 'submitted' | 'routed' | 'acknowledged' | 'in_progress' | 'resolution_reported' | 'awaiting_verification' | 'resolved'
type Severity = 'Low' | 'Medium' | 'High' | 'Emergency'

interface Incident {
  id: string
  title: string
  category: string
  severity: Severity
  severityReason?: string
  status: Status
  recipient: string
  timestamp: string
  landmark: string
  photo?: string
  resolutionPhoto?: string
  sla: string
  assignedOfficer?: string
  votesResolved?: number
  votesBroken?: number
}

interface WeatherAlert {
  id: string
  level: 'red' | 'orange' | 'yellow'
  agency: string
  title: { en: string; te: string; hi: string }
  summary: { en: string; te: string; hi: string }
  explanation: { en: string; te: string; hi: string }
  dos: { en: string[]; te: string[]; hi: string[] }
  donts: { en: string[]; te: string[]; hi: string[] }
  helpline: string
  validUntil: string
  portalUrl: string
  portalName: string
  affectedAreas: string
}

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  read: boolean
  incidentId?: string
}

const T = {
  en: {
    appTitle: 'GroundTruth',
    tagline: 'Community Incident Intelligence',
    home: 'Overview',
    weather: 'Weather',
    reportBtn: 'Report',
    myReports: 'Tracker',
    warnings: 'Warnings',
    moderator: 'Console',
    assistant: 'Assistant',
    notifications: 'Alerts',
    heroHeading: 'Community hazard to verified resolution.',
    heroSub: 'Capture local hazards. AI structures, routes to public works, and tracks follow-through.',
    activeAlerts: 'Official Warnings',
    reportPrompt: 'Snap or select a hazard photo. AI auto-triages and dispatches.',
    autoGps: 'Auto GPS',
    gpsLocked: 'GPS Accurate (±3m)',
    aiSuggestedCategory: 'AI Vision Match',
    severityLabel: 'Estimated Severity',
    submitReport: 'Dispatch to Authorities',
    liveTrackerTitle: 'Incident Tracking',
    assignedTeam: 'Assigned Department',
    voteFixed: 'Confirmed Resolved',
    voteBroken: 'Still Broken',
    feedbackPrompt: 'Citizen Ground Verification',
    askPlaceholder: 'Ask anything or query report ID...',
    radarStatus: 'Live Civic Radar: All Systems Active',
    weatherHeader: 'Live Weather & Radar',
    weatherSub: 'Hyperlocal 24h forecast & civic meteorology',
    warningsHeader: 'Official Warnings & Civil Defense',
    warningsSub: 'Real-time advisories from IMD, NDMA SACHET & TSDMA',
  },
  te: {
    appTitle: 'గ్రౌండ్‌ట్రూత్',
    tagline: 'సమాజ సమస్యల పరిష్కారం',
    home: 'హోమ్',
    weather: 'వాతావరణం',
    reportBtn: 'నివేదిక',
    myReports: 'ట్రాకర్',
    warnings: 'హెచ్చరికలు',
    moderator: 'కన్సోల్',
    assistant: 'సహాయకుడు',
    notifications: 'అలర్ట్‌లు',
    heroHeading: 'సమస్య నుండి పూర్తి పరిష్కారం వరకు.',
    heroSub: 'ఫోటో తీయండి. ఏఐ అధికారులకు చేరవేసి పరిష్కారాన్ని పర్యవేక్షిస్తుంది.',
    activeAlerts: 'వాతావరణ హెచ్చరికలు',
    reportPrompt: 'ఫోటో తీయండి. ఏఐ గుర్తించి సంబంధిత విభాగానికి పంపుతుంది.',
    autoGps: 'జీపీఎస్',
    gpsLocked: 'జీపీఎస్ ఖరారైంది (±3మీ)',
    aiSuggestedCategory: 'ఏఐ గుర్తించిన వర్గం',
    severityLabel: 'తీవ్రత అంచనా',
    submitReport: 'అధికారులకు పంపండి',
    liveTrackerTitle: 'సమస్యల పురోగతి',
    assignedTeam: 'కేటాయించిన విభాగం',
    voteFixed: 'పరిష్కారమైంది',
    voteBroken: 'ఇంకా కాలేదు',
    feedbackPrompt: 'క్షేత్రస్థాయి ధృవీకరణ',
    askPlaceholder: 'సమస్య లేదా వాతావరణం గురించి అడగండి...',
    radarStatus: 'లైవ్ సివిక్ రాడార్: పర్యవేక్షణలో ఉంది',
    weatherHeader: 'ప్రత్యక్ష వాతావరణం & రాడార్',
    weatherSub: '24 గంటల సూచన & పౌర వాతావరణ నివేదిక',
    warningsHeader: 'అధికారిక హెచ్చరికలు',
    warningsSub: 'ఐఎండీ మరియు విపత్తు నిర్వహణ విభాగాల సమాచారం',
  },
  hi: {
    appTitle: 'ग्राउंडट्रुथ',
    tagline: 'सामुदायिक समस्या समाधान',
    home: 'होम',
    weather: 'मौसम',
    reportBtn: 'रिपोर्ट',
    myReports: 'ट्रैकर',
    warnings: 'चेतावनियाँ',
    moderator: 'कंसोल',
    assistant: 'सहायक',
    notifications: 'सूचनाएं',
    heroHeading: 'समस्या की रिपोर्ट से लेकर प्रमाणिक समाधान तक।',
    heroSub: 'फोटो खींचें। एआई संबंधित विभाग को भेजकर समाधान ट्रैक करता है।',
    activeAlerts: 'मौसम चेतावनियाँ',
    reportPrompt: 'फोटो लें। एआई समस्या पहचानकर विभाग को प्रेषित करेगा।',
    autoGps: 'जीपीएस',
    gpsLocked: 'जीपीएस लॉक (±3मी)',
    aiSuggestedCategory: 'एआई द्वारा पहचानी गई श्रेणी',
    severityLabel: 'गंभीरता का स्तर',
    submitReport: 'विभाग को प्रेषित करें',
    liveTrackerTitle: 'समस्या ट्रैकिंग',
    assignedTeam: 'नियुक्त विभाग',
    voteFixed: 'हल हो गया',
    voteBroken: 'अभी भी बाकी है',
    feedbackPrompt: 'नागरिक सत्यापन',
    askPlaceholder: 'समस्या, रिपोर्ट या मौसम के बारे में पूछें...',
    radarStatus: 'लाइव म्युनिसिपल रडार: सक्रिय',
    weatherHeader: 'लाइव मौसम और रडार',
    weatherSub: '24 घंटे का पूर्वानुमान और नागरिक मौसम डेटा',
    warningsHeader: 'आधिकारिक चेतावनियाँ',
    warningsSub: 'आईएमडी और आपदा प्रबंधन विभाग के अलर्ट',
  },
} as const

const CATEGORY_ITEMS = [
  { id: 'Road Damage / Pothole', title: 'Road Damage', sub: 'Pothole & asphalt collapse', icon: '🕳️' },
  { id: 'Water Pipeline Leak / Burst', title: 'Pipeline Burst', sub: 'Water pipe rupture / flood', icon: '💧' },
  { id: 'Fallen Tree / Road Block', title: 'Fallen Tree', sub: 'Tree or limb blocking road', icon: '🌳' },
  { id: 'Waterlogging / Blocked Drain', title: 'Waterlogging', sub: 'Submerged road / drain', icon: '🌊' },
  { id: 'Exposed Electrical Cable', title: 'Electrical Hazard', sub: 'Sparking wire / pole damage', icon: '⚡' },
  { id: 'Garbage Dump / Sanitation Overflow', title: 'Sanitation', sub: 'Solid waste accumulation', icon: '🗑️' },
  { id: 'Broken Streetlight', title: 'Dark Street', sub: 'Non-functional street lamp', icon: '💡' },
  { id: 'Open Manhole / Uncovered Drain', title: 'Open Manhole', sub: 'Critical pit hazard', icon: '⚠️' },
]

const SEVERITY_ITEMS: { level: Severity; label: string; sla: string; desc: string }[] = [
  { level: 'Low', label: 'Low', sla: '48h SLA', desc: 'Routine repair' },
  { level: 'Medium', label: 'Medium', sla: '24h SLA', desc: 'Traffic flow impediment' },
  { level: 'High', label: 'High', sla: '4h SLA', desc: 'Active danger' },
  { level: 'Emergency', label: 'Emergency', sla: '1h Rapid', desc: 'Life safety risk' },
]

const ROUTING_DIRECTORY: Record<string, { dept: string; sla: string; phone: string }> = {
  'Road Damage / Pothole': { dept: 'GHMC Road Maintenance Wing', sla: '24 Hours', phone: '040-21111111' },
  'Water Pipeline Leak / Burst': { dept: 'HMWSSB Water & Sewerage Board', sla: '12 Hours', phone: '155313' },
  'Fallen Tree / Road Block': { dept: 'Disaster Response Force (DRF)', sla: '3 Hours', phone: '040-29555500' },
  'Waterlogging / Blocked Drain': { dept: 'Stormwater Emergency Squad', sla: '6 Hours', phone: '040-21111111' },
  'Exposed Electrical Cable': { dept: 'TSSPDCL Electrical Safety Cell', sla: '2 Hours', phone: '1912' },
  'Garbage Dump / Sanitation Overflow': { dept: 'Sanitation & Solid Waste Wing', sla: '18 Hours', phone: '040-21111111' },
  'Broken Streetlight': { dept: 'Municipal Electrical Department', sla: '48 Hours', phone: '040-21111111' },
  'Open Manhole / Uncovered Drain': { dept: 'Drainage Safety Taskforce', sla: '2 Hours', phone: '155313' },
}

const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: 'ALERT-01',
    level: 'red',
    agency: 'IMD Alert • Hyderabad Met Centre',
    title: {
      en: 'Heavy Inundation & Flash Flood Advisory',
      te: 'భారీ వర్షాలు & ముంపు హెచ్చరిక',
      hi: 'भारी बारिश और जलभराव की चेतावनी',
    },
    summary: {
      en: '120-200mm rainfall forecasted across low-lying urban corridors over the next 6 hours.',
      te: 'తదుపరి 6 గంటల్లో నగరంలోని లోతట్టు ప్రాంతాల్లో 120-200మిమీ వర్షపాతం అవకాశం.',
      hi: 'अगले 6 घंटों में निचले इलाकों में 120-200 मिमी तक भारी बारिश का अनुमान है।',
    },
    explanation: {
      en: 'Roads under railway bridges and low-lying underpasses may submerge rapidly. Commuters are advised to stay indoors unless traveling for medical emergencies.',
      te: 'అండర్‌పాస్‌లు, బ్రిడ్జిల కింద నీరు వేగంగా నిండుతుంది. అత్యవసర వైద్యం తప్ప బయటకు వెళ్లవద్దు.',
      hi: 'अंडरपास और निचले रास्तों में तेजी से पानी भर सकता है। बहुत जरूरी होने पर ही बाहर निकलें।',
    },
    dos: {
      en: ['Move vehicles to higher ground', 'Keep emergency numbers ready (112)', 'Charge mobile devices'],
      te: ['వాహనాలను ఎత్తైన ప్రాంతాల్లో ఉంచండి', 'ఎమర్జెన్సీ నంబర్లు సిద్ధంగా ఉంచుకోండి (112)', 'ఫోన్ ఛార్జ్ చేసి ఉంచండి'],
      hi: ['गाड़ियों को ऊंचे स्थान पर रखें', 'इमरजेंसी नंबर तैयार रखें (112)', 'मोबाइल चार्ज रखें'],
    },
    donts: {
      en: ['Avoid flooded roads with hidden open manholes', 'Stay away from electric poles and cables'],
      te: ['నీరు నిండిన రోడ్లపై వెళ్లవద్దు (మ్యాన్‌హోల్స్ కనిపించవు)', 'విద్యుత్ స్తంభాలకు దూరంగా ఉండండి'],
      hi: ['जलभराव वाले रास्तों पर न जाएं', 'बिजली के खंभों से दूर रहें'],
    },
    helpline: '112 / GHMC: 040-21111111',
    validUntil: 'Active until 6:00 PM Today',
    portalUrl: 'https://mausam.imd.gov.in',
    portalName: 'IMD National Mausam Portal',
    affectedAreas: 'Begumpet Underpass, Tolichowki, Musi Basin, Khairatabad, Nizampet',
  },
  {
    id: 'ALERT-02',
    level: 'orange',
    agency: 'NDMA SACHET • Severe Wind Warning',
    title: {
      en: 'Thunderstorm & Strong Gusts (55 km/h)',
      te: 'ఉరుములు మరియు బలమైన ఈదురుగాలులు',
      hi: 'आंधी और तेज हवाओं की चेतावनी',
    },
    summary: {
      en: 'Squally winds may dislodge loose tree limbs or unanchored signage hoardings.',
      te: 'బలమైన గాలుల వల్ల చెట్ల కొమ్మలు, హోర్డింగులు పడిపోయే ప్రమాదం ఉంది.',
      hi: 'तेज हवाओं के कारण पेड़ की टहनियां और बोर्ड गिर सकते हैं।',
    },
    explanation: {
      en: 'Avoid parking underneath mature trees or near roadside commercial billboards during wind bursts.',
      te: 'పెద్ద చెట్ల కింద, హోర్డింగుల కింద వాహనాలు ఆపవద్దు.',
      hi: 'पेड़ों और कमजोर होर्डिंग्स के नीचे वाहन पार्क न करें।',
    },
    dos: {
      en: ['Park inside covered spaces', 'Unplug sensitive electronics during lightning'],
      te: ['సురక్షిత స్థలాల్లో వాహనాలు ఉంచండి', 'ఉరుముల సమయంలో ఎలక్ట్రానిక్స్ ప్లగ్ తీయండి'],
      hi: ['गाड़ियों को सुरक्षित स्थान पर रखें', 'बिजली के उपकरण बंद रखें'],
    },
    donts: {
      en: ['Do not shelter under solitary tall trees in open grounds'],
      te: ['ఖాళీ స్థలాల్లో ఒంటరిగా ఉన్న చెట్ల కింద ఆగవద్దు'],
      hi: ['खुले मैदान में अकेले पेड़ के नीचे न रुकें'],
    },
    helpline: 'Disaster Response Force: 040-29555500',
    validUntil: 'Active until 9:00 PM Tonight',
    portalUrl: 'https://sachet.ndma.gov.in',
    portalName: 'NDMA SACHET Early Warning Portal',
    affectedAreas: 'Jubilee Hills, Banjara Hills, Gachibowli, Madhapur, Hitec City',
  },
  {
    id: 'ALERT-03',
    level: 'yellow',
    agency: 'TSDMA • Waterlogging Watch',
    title: {
      en: 'Localized Waterlogging & Traffic Slowdown',
      te: 'స్థానిక నీటి నిల్వ & ట్రాఫిక్ మందగమనం',
      hi: 'स्थानीय जलभराव और यातायात धीमी गति',
    },
    summary: {
      en: 'Ponding observed on secondary arterial roads and school zones during intermittent showers.',
      te: 'కాలనీ రోడ్లపై చిన్నపాటి నీరు చేరే అవకాశం, ట్రాఫిక్ మందగిస్తుంది.',
      hi: 'कॉलोनियों और संपर्क मार्गों पर रुक-रुक कर जलभराव की संभावना।',
    },
    explanation: {
      en: 'Municipal de-watering pumps are deployed across 48 critical junction choke points. Reduce driving speed.',
      te: 'మున్సిపల్ పంపులు సిద్ధంగా ఉన్నాయి. వాహనాలను నెమ్మదిగా నడపండి.',
      hi: 'नगर निगम के पंप तैनात हैं। वाहन धीमी गति से चलाएं।',
    },
    dos: {
      en: ['Check civic radar before evening commute', 'Keep vehicle headlights illuminated'],
      te: ['ప్రయాణానికి ముందు రాడార్ చూడండి', 'హెడ్‌లైట్లు ఆన్ చేయండి'],
      hi: ['सफर से पहले रडार चेक करें', 'हेडलाइट्स जलाएं'],
    },
    donts: {
      en: ['Do not drive through murky pooled water above tire rim level'],
      te: ['టైర్ల కంటే ఎక్కువ నీరు ఉన్నచోట డ్రైవ్ చేయవద్దు'],
      hi: ['अज्ञात जलभराव में वाहन न ले जाएं'],
    },
    helpline: 'Toll-free 1800-425-0011',
    validUntil: 'Active through Tomorrow 10:00 AM',
    portalUrl: 'https://tsdam.telangana.gov.in',
    portalName: 'Telangana State Disaster Management',
    affectedAreas: 'Secunderabad, Malkajgiri, Kukatpally, Miyapur, Alwal',
  },
]

const HOURLY_FORECAST = [
  { time: 'Now', temp: '27°', rain: '85%', icon: '🌧️', condition: 'Heavy Rain' },
  { time: '14:00', temp: '26°', rain: '90%', icon: '⛈️', condition: 'Thunderstorm' },
  { time: '15:00', temp: '25°', rain: '75%', icon: '🌧️', condition: 'Downpour' },
  { time: '16:00', temp: '25°', rain: '65%', icon: '🌦️', condition: 'Passing Rain' },
  { time: '17:00', temp: '26°', rain: '45%', icon: '⛅', condition: 'Scattered Cloud' },
  { time: '18:00', temp: '24°', rain: '30%', icon: '☁️', condition: 'Overcast' },
  { time: '19:00', temp: '23°', rain: '20%', icon: '☁️', condition: 'Cloudy' },
  { time: '20:00', temp: '23°', rain: '15%', icon: '🌙', condition: 'Cloud Breaks' },
  { time: '21:00', temp: '22°', rain: '10%', icon: '🌙', condition: 'Clear Sky' },
  { time: '22:00', temp: '22°', rain: '10%', icon: '🌙', condition: 'Calm' },
  { time: '23:00', temp: '21°', rain: '5%', icon: '🌙', condition: 'Clear' },
  { time: '00:00', temp: '21°', rain: '5%', icon: '🌙', condition: 'Clear' },
]

const WEATHER_CITIES = [
  {
    id: 'hyd-jubilee',
    name: 'Jubilee Hills / Banjara Hills',
    sub: 'Central Hyderabad • Elev. 540m',
    temp: '27°',
    cond: 'Heavy Downpour & Thunderstorm',
    alertTier: 'red',
    alertText: 'Red Alert • Inundation Risk',
    high: '29°',
    low: '22°',
    humidity: '88%',
    wind: '28 km/h NE',
    gusts: '54 km/h',
    rainRate: '42 mm/h',
    feelsLike: '31°C',
    visibility: '3.2 km',
    pressure: '1008 hPa',
    uv: '2 (Low)',
    aqi: '44 (Good)',
  },
  {
    id: 'hyd-hitec',
    name: 'Hitec City / Madhapur',
    sub: 'Cyberabad IT Corridor',
    temp: '26°',
    cond: 'Squall Winds & Thunderstorm',
    alertTier: 'orange',
    alertText: 'Orange Warning • Gusts 55 km/h',
    high: '28°',
    low: '22°',
    humidity: '91%',
    wind: '34 km/h W',
    gusts: '60 km/h',
    rainRate: '35 mm/h',
    feelsLike: '29°C',
    visibility: '2.8 km',
    pressure: '1007 hPa',
    uv: '1 (Low)',
    aqi: '52 (Moderate)',
  },
  {
    id: 'hyd-sec',
    name: 'Secunderabad / Begumpet',
    sub: 'North Zone • Underpass Risk',
    temp: '26°',
    cond: 'Torrential Inundation',
    alertTier: 'red',
    alertText: 'Red Alert • Submerged Underpass',
    high: '28°',
    low: '21°',
    humidity: '94%',
    wind: '22 km/h N',
    gusts: '45 km/h',
    rainRate: '56 mm/h',
    feelsLike: '30°C',
    visibility: '2.0 km',
    pressure: '1006 hPa',
    uv: '1 (Low)',
    aqi: '40 (Good)',
  },
  {
    id: 'hyd-oldcity',
    name: 'Charminar / Old City',
    sub: 'South Zone • Musi River Corridor',
    temp: '28°',
    cond: 'Intermittent Showers',
    alertTier: 'yellow',
    alertText: 'Yellow Watch • Ponding',
    high: '30°',
    low: '23°',
    humidity: '82%',
    wind: '18 km/h E',
    gusts: '36 km/h',
    rainRate: '18 mm/h',
    feelsLike: '32°C',
    visibility: '4.5 km',
    pressure: '1009 hPa',
    uv: '3 (Moderate)',
    aqi: '65 (Moderate)',
  },
]

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'GT-8491',
    title: 'Severe Asphalt Cavitation on Road 12',
    category: 'Road Damage / Pothole',
    severity: 'Medium',
    severityReason: 'Deep edge collapse on commuter route; two-wheeler hazard.',
    status: 'in_progress',
    recipient: 'GHMC Road Maintenance Wing',
    timestamp: '1h ago',
    landmark: 'Road No. 12, Banjara Hills',
    photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
    sla: '24 Hours',
    assignedOfficer: 'Rapid Action Squad #4',
    votesResolved: 4,
    votesBroken: 1,
  },
  {
    id: 'GT-8492',
    title: 'Drinking Water Pipeline Burst',
    category: 'Water Pipeline Leak / Burst',
    severity: 'High',
    severityReason: 'High pressure leak flooding lanes with ground erosion.',
    status: 'awaiting_verification',
    recipient: 'HMWSSB Water & Sewerage Board',
    timestamp: '3h ago',
    landmark: 'Pillar 42, Ameerpet Metro',
    photo: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&auto=format&fit=crop&q=60',
    resolutionPhoto: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60',
    sla: '12 Hours',
    assignedOfficer: 'HMWSSB Valve Repair Unit',
    votesResolved: 8,
    votesBroken: 0,
  },
  {
    id: 'GT-8493',
    title: 'Fallen Tree Branch Obstructing Lane',
    category: 'Fallen Tree / Road Block',
    severity: 'High',
    severityReason: 'Full blockage of left carriage-way.',
    status: 'resolved',
    recipient: 'Disaster Response Force (DRF)',
    timestamp: 'Yesterday',
    landmark: 'Jubilee Hills Checkpost',
    photo: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=500&auto=format&fit=crop&q=60',
    resolutionPhoto: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60',
    sla: '3 Hours',
    assignedOfficer: 'DRF Clearence Unit 3',
    votesResolved: 15,
    votesBroken: 0,
  },
]

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('gt_dark') === 'true'
  })
  const [view, setView] = useState<'home' | 'report' | 'reports' | 'mod' | 'assistant' | 'notifications' | 'weather' | 'warnings'>('home')
  const [reportFilter, setReportFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [selectedCityId, setSelectedCityId] = useState<string>('hyd-jubilee')
  const [isLocatingWeatherGps, setIsLocatingWeatherGps] = useState(false)
  const [weatherGpsLocked, setWeatherGpsLocked] = useState(false)
  const [warningFilter, setWarningFilter] = useState<'all' | 'red' | 'orange' | 'yellow'>('all')

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const raw = localStorage.getItem('gt_incidents_v4')
    return raw ? JSON.parse(raw) : INITIAL_INCIDENTS
  })

  // Dynamic Island Toast System
  const [islandNotification, setIslandNotification] = useState<string | null>(null)

  const showIslandToast = (msg: string) => {
    setIslandNotification(msg)
    setTimeout(() => {
      setIslandNotification(null)
    }, 3800)
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const raw = localStorage.getItem('gt_notifs_v4')
    return raw
      ? JSON.parse(raw)
      : [
          {
            id: 'n1',
            title: 'Report GT-8492 Repair Submitted',
            desc: 'Water Board squad uploaded resolution evidence. Citizen confirmation pending.',
            time: '15m ago',
            read: false,
            incidentId: 'GT-8492',
          },
          {
            id: 'n2',
            title: 'IMD Alert Active',
            desc: 'Flash flood alert active across central Hyderabad zone until 6:00 PM.',
            time: '1h ago',
            read: true,
          },
        ]
  })

  // Form State
  const [reportPhoto, setReportPhoto] = useState<string>('')
  const [isScanningPhoto, setIsScanningPhoto] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('Road Damage / Pothole')
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('Medium')
  const [aiConfidence, setAiConfidence] = useState<number>(0.92)
  const [landmark, setLandmark] = useState<string>('')
  const [isLocatingGps, setIsLocatingGps] = useState(false)
  const [gpsLocked, setGpsLocked] = useState(false)

  // Weather Alerts Expansion
  const [expandedAlert, setExpandedAlert] = useState<string | null>('ALERT-01')

  // Incident Card Expansion (Apple Card Stack)
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>('GT-8491')

  const handleWeatherGps = () => {
    setIsLocatingWeatherGps(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSelectedCityId('hyd-jubilee')
          setIsLocatingWeatherGps(false)
          setWeatherGpsLocked(true)
          showIslandToast('Weather GPS Locked: Jubilee Hills (±2.5m)')
        },
        () => {
          setSelectedCityId('hyd-jubilee')
          setIsLocatingWeatherGps(false)
          setWeatherGpsLocked(true)
          showIslandToast('Weather Station Auto-Matched: Hyderabad West')
        },
        { timeout: 2500 }
      )
    } else {
      setSelectedCityId('hyd-jubilee')
      setIsLocatingWeatherGps(false)
      setWeatherGpsLocked(true)
      showIslandToast('Weather Station Selected')
    }
  }

  // Assistant Chat
  const [chat, setChat] = useState<{ from: 'user' | 'bot'; text: string; time: string }[]>([
    {
      from: 'bot',
      text: 'Welcome to GroundTruth. Ask about incident tracking, disaster warnings, or municipal emergency contacts.',
      time: 'Now',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)

  const t = T[lang]

  useEffect(() => {
    localStorage.setItem('gt_incidents_v4', JSON.stringify(incidents))
  }, [incidents])

  useEffect(() => {
    localStorage.setItem('gt_notifs_v4', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('gt_dark', darkMode ? 'true' : 'false')
  }, [darkMode])

  const unreadCount = notifications.filter(n => !n.read).length

  // Simulated AI Image Scanner
  const simulateAiScan = (fileUrl: string, presetName?: string) => {
    setReportPhoto(fileUrl)
    setIsScanningPhoto(true)

    setTimeout(() => {
      setIsScanningPhoto(false)
      if (presetName === 'pothole') {
        setSelectedCategory('Road Damage / Pothole')
        setSelectedSeverity('Medium')
        setAiConfidence(0.95)
        showIslandToast('AI Detected: Road Damage / Pothole (95% Match)')
      } else if (presetName === 'leak') {
        setSelectedCategory('Water Pipeline Leak / Burst')
        setSelectedSeverity('High')
        setAiConfidence(0.97)
        showIslandToast('AI Detected: Pipeline Rupture (97% Match)')
      } else if (presetName === 'tree') {
        setSelectedCategory('Fallen Tree / Road Block')
        setSelectedSeverity('High')
        setAiConfidence(0.93)
        showIslandToast('AI Detected: Fallen Tree Obstruction (93% Match)')
      } else if (presetName === 'drain') {
        setSelectedCategory('Waterlogging / Blocked Drain')
        setSelectedSeverity('Emergency')
        setAiConfidence(0.91)
        showIslandToast('AI Detected: Severe Waterlogging (91% Match)')
      } else {
        setSelectedCategory('Road Damage / Pothole')
        setSelectedSeverity('Medium')
        setAiConfidence(0.89)
        showIslandToast('AI Vision: Analyzed & Triaged')
      }
    }, 700)
  }

  // GPS Auto Detect
  const handleAutoGps = () => {
    setIsLocatingGps(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords
          setLandmark(`Road 36, Jubilee Hills (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`)
          setIsLocatingGps(false)
          setGpsLocked(true)
          showIslandToast('GPS Lock Acquired (±3m Accuracy)')
        },
        () => {
          setLandmark('Jubilee Hills Checkpost, Road No. 36 (17.4325° N, 78.4071° E)')
          setIsLocatingGps(false)
          setGpsLocked(true)
          showIslandToast('Simulated Precise Location Locked')
        },
        { timeout: 3000 }
      )
    } else {
      setLandmark('Near Metro Pillar 42, Begumpet')
      setIsLocatingGps(false)
      setGpsLocked(true)
      showIslandToast('Location Geocoded')
    }
  }

  // Submit Report
  const handleSubmitReport = () => {
    const id = 'GT-' + Math.floor(1000 + Math.random() * 9000)
    const routingInfo = ROUTING_DIRECTORY[selectedCategory] || {
      dept: 'Municipal Public Works',
      sla: '24 Hours',
      phone: '040-21111111',
    }

    const newInc: Incident = {
      id,
      title: `${selectedCategory} near ${landmark || 'Designated Area'}`,
      category: selectedCategory,
      severity: selectedSeverity,
      severityReason: 'Citizen submission with verified visual evidence.',
      status: 'submitted',
      recipient: routingInfo.dept,
      timestamp: 'Just now',
      landmark: landmark || 'Geo-tagged Location',
      photo: reportPhoto || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
      sla: routingInfo.sla,
      assignedOfficer: 'Pending Dispatch',
      votesResolved: 0,
      votesBroken: 0,
    }

    setIncidents([newInc, ...incidents])

    const newNotif: NotificationItem = {
      id: 'n_' + Date.now(),
      title: `Report ${id} Dispatched`,
      desc: `Routed to ${routingInfo.dept}. Target SLA: ${routingInfo.sla}.`,
      time: 'Just now',
      read: false,
      incidentId: id,
    }
    setNotifications([newNotif, ...notifications])

    showIslandToast(`Report ${id} Routed to ${routingInfo.dept}`)
    setReportPhoto('')
    setLandmark('')
    setGpsLocked(false)
    setView('reports')
  }

  // Step Status Advancement for Demo & Moderator
  const advanceIncidentStatus = (id: string) => {
    const order: Status[] = ['submitted', 'routed', 'acknowledged', 'in_progress', 'resolution_reported', 'awaiting_verification', 'resolved']
    setIncidents(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const idx = order.indexOf(item.status)
        const next = order[Math.min(idx + 1, order.length - 1)]

        showIslandToast(`${id} Advanced: ${formatStatus(next)}`)

        const notif: NotificationItem = {
          id: 'n_' + Date.now(),
          title: `Update on ${id}`,
          desc: `Status updated to ${formatStatus(next)} by ${item.recipient}.`,
          time: 'Just now',
          read: false,
          incidentId: id,
        }
        setNotifications(n => [notif, ...n])

        return {
          ...item,
          status: next,
          assignedOfficer: item.assignedOfficer === 'Pending Dispatch' ? 'Rapid Response Team' : item.assignedOfficer,
          resolutionPhoto: next === 'resolution_reported' || next === 'awaiting_verification' || next === 'resolved'
            ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60'
            : item.resolutionPhoto,
        }
      })
    )
  }

  const formatStatus = (s: Status) => {
    switch (s) {
      case 'submitted': return lang === 'te' ? 'సమర్పించబడింది' : lang === 'hi' ? 'दर्ज' : 'Logged'
      case 'routed': return lang === 'te' ? 'శాఖకు చేరింది' : lang === 'hi' ? 'प्रेषित' : 'Routed'
      case 'acknowledged': return lang === 'te' ? 'ఆమోదించబడింది' : lang === 'hi' ? 'स्वीकृत' : 'Acknowledged'
      case 'in_progress': return lang === 'te' ? 'పురోగతిలో ఉంది' : lang === 'hi' ? 'प्रगति पर' : 'In Progress'
      case 'resolution_reported': return lang === 'te' ? 'పరిష్కారం నమోదు' : lang === 'hi' ? 'समाधान रिपोर्ट' : 'Fix Submitted'
      case 'awaiting_verification': return lang === 'te' ? 'ధృవీకరణ వేచి ఉంది' : lang === 'hi' ? 'सत्यापन बाकी' : 'Verification'
      case 'resolved': return lang === 'te' ? 'పరిష్కరించబడింది' : lang === 'hi' ? 'हल किया गया' : 'Resolved'
    }
  }

  // Citizen Ground Verification Voting
  const handleVote = (id: string, isFixed: boolean) => {
    setIncidents(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        const newResolved = isFixed ? (i.votesResolved || 0) + 1 : i.votesResolved || 0
        const newBroken = !isFixed ? (i.votesBroken || 0) + 1 : i.votesBroken || 0
        const shouldResolve = newResolved >= 2 && isFixed

        showIslandToast(isFixed ? 'Ground Verification Recorded (+1 Fixed)' : 'Flagged as Still Broken')

        return {
          ...i,
          votesResolved: newResolved,
          votesBroken: newBroken,
          status: shouldResolve ? 'resolved' : i.status,
        }
      })
    )
  }

  // Assistant Logic
  const handleSendChat = (rawPrompt?: string) => {
    const q = (rawPrompt || chatInput).trim()
    if (!q) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChat(prev => [...prev, { from: 'user', text: q, time: now }])
    setChatInput('')
    setIsBotTyping(true)

    setTimeout(() => {
      const lower = q.toLowerCase()
      let reply = ''

      const matchedIncident = incidents.find(i => lower.includes(i.id.toLowerCase()))
      if (matchedIncident) {
        reply = `Incident ${matchedIncident.id} (${matchedIncident.category}):
• Status: ${formatStatus(matchedIncident.status)}
• Destination: ${matchedIncident.recipient}
• Target SLA: ${matchedIncident.sla}
• Verifications: ${matchedIncident.votesResolved || 0} Citizens Confirmed Fixed.`
      } else if (lower.includes('status') || lower.includes('track') || lower.includes('report')) {
        const top = incidents[0]
        reply = `You have ${incidents.length} active incidents on GroundTruth.
Latest: ${top.id} (${top.category}) is currently ${formatStatus(top.status)} at ${top.landmark}. Assigned to ${top.recipient}.`
      } else if (lower.includes('rain') || lower.includes('warning') || lower.includes('flood') || lower.includes('weather')) {
        reply = `IMD Alert: Heavy rainfall active over Hyderabad. Avoid flooded underpasses. Direct emergency helpline: 112 or GHMC central line 040-21111111.`
      } else if (lower.includes('telugu') || lower.includes('తెలుగు')) {
        reply = `ప్రస్తుతం నగరంలో వర్షాల హెచ్చరిక అమలులో ఉంది. సమస్యను నమోదు చేయడానికి 'నివేదిక' ట్యాబ్‌ను ఉపయోగించండి. అత్యవసర సహాయం కొరకు 112 కు కాల్ చేయండి.`
      } else if (lower.includes('hindi') || lower.includes('हिंदी')) {
        reply = `शहर में मौसम की चेतावनी जारी है। किसी भी समस्या को दर्ज करने के लिए 'रिपोर्ट' टैब का उपयोग करें। आपातकालीन सहायता के लिए 112 पर संपर्क करें।`
      } else {
        reply = `For immediate danger to life, dial 112. For civic road, pipeline, or stormwater maintenance, snap a photo in 'Report' and our AI will route it with full SLA accountability.`
      }

      setChat(prev => [...prev, { from: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      setIsBotTyping(false)
    }, 500)
  }

  const getStepNumber = (status: Status) => {
    switch (status) {
      case 'submitted': return 1
      case 'routed': return 2
      case 'acknowledged': return 3
      case 'in_progress': return 4
      case 'resolution_reported': return 5
      case 'awaiting_verification': return 5
      case 'resolved': return 6
    }
  }

  // Filtered Incidents
  const filteredIncidents = incidents.filter(i => {
    if (reportFilter === 'active') return i.status !== 'resolved'
    if (reportFilter === 'resolved') return i.status === 'resolved'
    return true
  })

  // Apple-grade Black & Warm Cream Palette
  // Light: Warm stone cream (#F6F3ED) background with crisp white elevated cards and deep obsidian black typography
  // Dark: True OLED Black (#000000) with deep matte slate (#121212) cards and luminous emerald green accents
  const pageBg = darkMode ? 'bg-black text-[#F4F1EA]' : 'bg-[#F6F3ED] text-[#121110]'
  const shellBg = darkMode ? 'bg-[#080808]' : 'bg-[#FAF8F5]'
  const cardBg = darkMode ? 'bg-[#141414] border-neutral-800 shadow-[0_12px_32px_rgba(0,0,0,0.6)]' : 'bg-white border-[#E8E2D8] shadow-[0_4px_20px_rgba(30,24,16,0.04)]'
  const borderSubtle = darkMode ? 'border-neutral-800' : 'border-[#EAE4DA]'
  const textMuted = darkMode ? 'text-[#8E8980]' : 'text-[#6E685F]'

  return (
    <div className={`min-h-screen ${pageBg} flex justify-center font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300`}>
      {/* Mobile Shell Frame */}
      <div className={`w-full max-w-md ${shellBg} min-h-screen shadow-2xl border-x ${borderSubtle} flex flex-col relative pb-28`}>

        {/* Dynamic Island Header Toast */}
        <div className="sticky top-0 z-40 px-3 pt-2 pb-1.5 backdrop-blur-xl bg-inherit/90">
          <div className="flex items-center justify-between gap-2">
            {/* Apple Dynamic Island Pill */}
            <div className={`flex-1 flex items-center justify-between px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
              darkMode ? 'bg-[#161616] border-neutral-700/80 text-white' : 'bg-white border-[#E4DDD2] text-[#121110] shadow-sm'
            }`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-medium tracking-tight truncate">
                  {islandNotification || t.radarStatus}
                </span>
              </div>
              <Activity size={13} className="text-emerald-500 shrink-0 ml-1" />
            </div>

            {/* Quick Controls Pill */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Dark/Light Switcher */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1.5 rounded-full border transition active:scale-95 ${
                  darkMode ? 'bg-[#161616] border-neutral-700 text-[#E8E2D8]' : 'bg-white border-[#E4DDD2] text-[#121110] shadow-sm'
                }`}
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
              </button>

              {/* Language Selector */}
              <select
                value={lang}
                onChange={e => setLang(e.target.value as Lang)}
                className={`text-[11px] font-semibold tracking-tight border rounded-full px-2 py-1 outline-none cursor-pointer transition ${
                  darkMode ? 'bg-[#161616] border-neutral-700 text-[#E8E2D8]' : 'bg-white border-[#E4DDD2] text-[#121110] shadow-sm'
                }`}
              >
                <option value="en">EN</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिंदी</option>
              </select>

              {/* Alerts Bell */}
              <button
                onClick={() => setView('notifications')}
                className={`relative p-1.5 rounded-full border transition active:scale-95 ${
                  view === 'notifications'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : darkMode
                    ? 'bg-[#161616] border-neutral-700 text-[#E8E2D8]'
                    : 'bg-white border-[#E4DDD2] text-[#121110] shadow-sm'
                }`}
                title="Notifications"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-black text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Authority Console Shortcut */}
              <button
                onClick={() => setView('mod')}
                className={`p-1.5 rounded-full border transition active:scale-95 ${
                  view === 'mod'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : darkMode
                    ? 'bg-[#161616] border-neutral-700 text-[#E8E2D8]'
                    : 'bg-white border-[#E4DDD2] text-[#121110] shadow-sm'
                }`}
                title="Admin Console"
              >
                <Shield size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 px-4 pt-2 space-y-4">

          {/* ================= VIEW 1: HOME ================= */}
          {view === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Apple-Style Hero Headline */}
              <div className="pt-2 px-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                  GroundTruth Platform
                </span>
                <h1 className="text-2xl font-black tracking-tight leading-tight">
                  {t.heroHeading}
                </h1>
                <p className={`text-xs ${textMuted} mt-1.5 leading-relaxed`}>
                  {t.heroSub}
                </p>
              </div>

              {/* Apple Weather Live Hero Card */}
              <div
                onClick={() => setView('weather')}
                className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer active:scale-[0.98] relative overflow-hidden group ${cardBg}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                        Live Hyperlocal Weather
                      </span>
                    </div>
                    <div className="text-xl font-black tracking-tight flex items-baseline gap-2">
                      <span>27°C</span>
                      <span className={`text-xs font-semibold ${textMuted}`}>Heavy Downpour</span>
                    </div>
                    <div className={`text-[11px] ${textMuted} flex items-center gap-2 pt-0.5`}>
                      <span>H: 29° L: 22°</span>
                      <span>•</span>
                      <span>Humidity 88%</span>
                      <span>•</span>
                      <span>Wind 28 km/h</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl">🌧️</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Red Alert
                    </span>
                  </div>
                </div>

                {/* Mini 4-Hour Quick Glance Strip */}
                <div className={`mt-3 pt-2.5 border-t ${borderSubtle} flex justify-between items-center text-[11px]`}>
                  {HOURLY_FORECAST.slice(0, 4).map((hf, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className={`text-[9px] font-medium ${textMuted}`}>{hf.time}</span>
                      <span className="text-xs my-0.5">{hf.icon}</span>
                      <span className="font-bold text-[10px]">{hf.temp}</span>
                    </div>
                  ))}
                  <div className="pl-2 border-l border-neutral-300 dark:border-neutral-700">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Radar & 24h ➔
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual Action Cards with Distinct Layer Depth */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* Primary Card: Report */}
                <button
                  onClick={() => setView('report')}
                  className={`p-4 rounded-3xl text-left transition-all duration-200 active:scale-[0.97] flex flex-col justify-between h-32 relative overflow-hidden group border ${
                    darkMode
                      ? 'bg-gradient-to-b from-[#1C1C1C] to-[#121212] border-neutral-700/80 text-white shadow-[0_12px_24px_rgba(0,0,0,0.5)]'
                      : 'bg-gradient-to-b from-[#181716] to-[#0A0A09] border-[#181716] text-[#FAF7F2] shadow-[0_8px_24px_rgba(20,18,16,0.18)]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Plus size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight">{t.reportBtn}</div>
                    <div className="text-[11px] text-neutral-300 opacity-90 mt-0.5">Camera & auto-routing</div>
                  </div>
                </button>

                {/* Secondary Card: Tracker */}
                <button
                  onClick={() => setView('reports')}
                  className={`p-4 rounded-3xl text-left transition-all duration-200 active:scale-[0.97] flex flex-col justify-between h-32 border ${cardBg}`}
                >
                  <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Navigation size={17} />
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight">{t.myReports}</div>
                    <div className={`text-[11px] ${textMuted} mt-0.5`}>Live Swiggy-style status</div>
                  </div>
                </button>
              </div>

              {/* Official Weather Warnings Section with Portal Link */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
                    {t.activeAlerts}
                  </span>
                  <button
                    onClick={() => setView('warnings')}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View Warning Portal ➔
                  </button>
                </div>

                {/* Featured Warning Card linking directly to Warnings Page */}
                <div
                  onClick={() => setView('warnings')}
                  className={`p-4 rounded-3xl border cursor-pointer active:scale-[0.98] transition group ${cardBg}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600 dark:text-rose-400">
                          IMD Alert • Critical Inundation Advisory
                        </span>
                      </div>
                      <div className="font-bold text-sm leading-snug">
                        Heavy Inundation & Flash Flood Advisory
                      </div>
                      <p className={`text-[11px] ${textMuted} leading-relaxed line-clamp-2`}>
                        120-200mm rainfall forecasted across low-lying urban corridors over the next 6 hours. Tap to view official civil defense guidance, affected areas & helplines.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ShieldAlert size={18} />
                    </div>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t ${borderSubtle} flex items-center justify-between text-[10px]`}>
                    <span className="font-medium text-neutral-400">IMD & NDMA SACHET Verified</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      Open Warning Center ➔
                    </span>
                  </div>
                </div>

                {/* Accordion List for Individual Alerts */}
                {WEATHER_ALERTS.slice(1).map(alert => {
                  const isExpanded = expandedAlert === alert.id
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-3xl border transition-all duration-200 overflow-hidden ${cardBg}`}
                    >
                      <button
                        onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                        className="w-full p-3.5 text-left flex items-start justify-between gap-3 active:opacity-80 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400">
                              {alert.agency}
                            </span>
                          </div>
                          <div className="font-bold text-xs leading-snug">{alert.title[lang]}</div>
                        </div>
                        <div className={`p-1 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-[#EFEAE1]'}`}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className={`px-4 pb-4 pt-1 space-y-2.5 border-t ${borderSubtle} text-xs animate-in slide-in-from-top-1 duration-150`}>
                          <p className={`text-[11px] ${textMuted} leading-relaxed`}>
                            {alert.summary[lang]}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => setView('warnings')}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              View Official Advisory ➔
                            </button>
                            <a
                              href="tel:112"
                              className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-semibold text-[10px] flex items-center gap-1"
                            >
                              <Phone size={10} /> Call Helpline
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Recent Community Incident Feed */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
                    Recent Reports
                  </span>
                  <button
                    onClick={() => setView('reports')}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View All ➔
                  </button>
                </div>

                <div className="space-y-2">
                  {incidents.slice(0, 3).map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => setView('reports')}
                      className={`p-3.5 rounded-3xl border ${cardBg} flex items-center justify-between cursor-pointer active:scale-[0.98] transition`}
                    >
                      <div className="flex items-center gap-3">
                        {inc.photo ? (
                          <img src={inc.photo} alt="Hazard" className="w-11 h-11 rounded-2xl object-cover shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <Camera size={17} className="text-neutral-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-xs leading-tight line-clamp-1">{inc.title}</div>
                          <div className={`text-[10px] ${textMuted} mt-0.5`}>{inc.id} • {inc.timestamp}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : darkMode
                          ? 'bg-neutral-800 text-neutral-300'
                          : 'bg-[#EFEAE1] text-[#222]'
                      }`}>
                        {formatStatus(inc.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: REPORT AN ISSUE (APPLE PRO INSPECTION WORKFLOW) ================= */}
          {view === 'report' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header with Step Tracker */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Step 1 of 3 • Inspection
                    </span>
                  </div>
                  <h2 className="font-bold text-lg tracking-tight">Report Incident</h2>
                  <p className={`text-xs ${textMuted}`}>Vision AI identifies the hazard and routes to municipal authorities.</p>
                </div>
                <button
                  onClick={() => setView('home')}
                  className={`p-1.5 rounded-full border ${borderSubtle} ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-neutral-600'} active:scale-95`}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Step Progress Pill */}
              <div className="flex items-center gap-1.5 px-1">
                <div className="flex-1 h-1 rounded-full bg-emerald-500" />
                <div className="flex-1 h-1 rounded-full bg-emerald-500" />
                <div className={`flex-1 h-1 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-[#EAE4DA]'}`} />
              </div>

              {/* 1. Pro LiDAR & Camera Viewfinder Card */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-3.5 relative overflow-hidden`}>
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-neutral-400 px-0.5">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Camera Viewfinder
                  </span>
                  <span>LiDAR Pro • 48MP Geotagged</span>
                </div>

                {reportPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden group border border-emerald-500/40">
                    <img src={reportPhoto} alt="Upload" className="w-full h-52 object-cover" />
                    
                    {/* Simulated Vision AI Target Box */}
                    <div className="absolute inset-4 border-2 border-dashed border-emerald-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between items-start">
                        <span className="bg-black/75 backdrop-blur-md text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/30">
                          TARGET: {selectedCategory.split('/')[0]}
                        </span>
                        <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                          {(aiConfidence * 100).toFixed(0)}% MATCH
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-mono text-emerald-300 bg-black/60 px-1 rounded">
                          CONFIDENCE: OPTIMAL
                        </span>
                        <Crosshair size={18} className="text-emerald-400 animate-pulse" />
                      </div>
                    </div>

                    <button
                      onClick={() => setReportPhoto('')}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 hover:bg-black active:scale-95 transition"
                    >
                      <RefreshCw size={11} /> Retake
                    </button>

                    {isScanningPhoto && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2.5">
                        <Sparkles size={24} className="animate-spin text-emerald-400" />
                        <span className="text-xs font-bold tracking-wide">Vision AI Scanning Damage Matrix...</span>
                        <div className="w-44 h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite] w-full" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`py-6 rounded-2xl border-2 border-dashed ${borderSubtle} ${darkMode ? 'bg-[#181818]/60' : 'bg-[#F9F7F2]'} text-center space-y-3`}>
                    {/* Viewfinder Reticle */}
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 border border-neutral-400/40 dark:border-neutral-600 rounded-2xl" />
                      <Crosshair size={26} className="text-emerald-500 animate-pulse" />
                    </div>

                    <div>
                      <label className="cursor-pointer">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs shadow-md transition active:scale-95 ${
                          darkMode ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-black text-white hover:bg-neutral-800'
                        }`}>
                          <Camera size={15} />
                          Capture or Upload Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) simulateAiScan(URL.createObjectURL(file))
                          }}
                        />
                      </label>
                      <p className={`text-[10px] ${textMuted} mt-1.5`}>Camera, Gallery, or Select 1-Tap Simulation Below</p>
                    </div>
                  </div>
                )}

                {/* 1-Tap Instant Testing Scenarios */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>Quick Simulation Scenarios</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">1-Tap Live Demo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '🕳️ Pothole Damage', key: 'pothole', sub: 'Road Cavitation', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60' },
                      { label: '💧 Pipeline Burst', key: 'leak', sub: 'High Pressure Water', url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&auto=format&fit=crop&q=60' },
                      { label: '🌳 Fallen Tree', key: 'tree', sub: 'Blocked Commute', url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=500&auto=format&fit=crop&q=60' },
                      { label: '🌊 Flooded Drain', key: 'drain', sub: 'Waterlogging Inundation', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop&q=60' },
                    ].map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => simulateAiScan(p.url, p.key)}
                        className={`p-2.5 rounded-2xl border text-left font-medium active:scale-[0.97] transition flex flex-col justify-between ${
                          darkMode
                            ? 'bg-[#181818] border-neutral-800 text-neutral-200 hover:border-emerald-500/50'
                            : 'bg-[#F9F7F2] border-[#E4DDD2] text-[#121110] hover:border-black'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{p.label}</span>
                        <span className={`text-[10px] ${textMuted} mt-0.5`}>{p.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Visual Category Grid (Replaces standard select) */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold tracking-tight block">Hazard Category</label>
                    <span className={`text-[10px] ${textMuted}`}>Select category or verify AI recommendation</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    AI Auto-Triage: Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_ITEMS.map(cat => {
                    const isSelected = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.97] relative flex flex-col justify-between ${
                          isSelected
                            ? darkMode
                              ? 'bg-neutral-800 border-emerald-500 text-white shadow-sm'
                              : 'bg-[#121110] border-black text-[#FAF8F5] shadow-md'
                            : darkMode
                            ? 'bg-[#181818] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                            : 'bg-[#F9F7F2] border-[#E8E2D8] text-[#121110] hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{cat.icon}</span>
                          {isSelected && (
                            <Check size={14} className={darkMode ? 'text-emerald-400' : 'text-emerald-400'} />
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="font-bold text-xs leading-tight">{cat.title}</div>
                          <div className={`text-[9px] mt-0.5 line-clamp-1 ${isSelected ? 'text-neutral-300 opacity-80' : textMuted}`}>
                            {cat.sub}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Severity Matrix Cards with SLA Turnaround */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold tracking-tight block">{t.severityLabel}</label>
                    <span className={`text-[10px] ${textMuted}`}>Determines municipal triage & dispatch speed</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SEVERITY_ITEMS.map(sev => {
                    const active = selectedSeverity === sev.level
                    return (
                      <button
                        key={sev.level}
                        type="button"
                        onClick={() => setSelectedSeverity(sev.level)}
                        className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.97] flex flex-col justify-between ${
                          active
                            ? darkMode
                              ? 'bg-emerald-500/10 border-emerald-500 text-white'
                              : 'bg-[#121110] border-black text-white shadow-sm'
                            : darkMode
                            ? 'bg-[#181818] border-neutral-800 text-neutral-300'
                            : 'bg-[#F9F7F2] border-[#E8E2D8] text-[#121110]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-bold text-xs ${active && darkMode ? 'text-emerald-400' : ''}`}>
                            {sev.label}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            active
                              ? 'bg-emerald-500 text-black'
                              : darkMode
                              ? 'bg-neutral-800 text-neutral-400'
                              : 'bg-[#EAE4DA] text-neutral-700'
                          }`}>
                            {sev.sla}
                          </span>
                        </div>
                        <span className={`text-[10px] mt-1 line-clamp-1 ${active ? 'opacity-85' : textMuted}`}>
                          {sev.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 4. Apple Maps Mini Radar & Geolocation Card */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <LocateFixed size={14} className="text-emerald-500" />
                    <label className="text-xs font-bold tracking-tight">Geospatial Tagging</label>
                  </div>
                  {gpsLocked ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={11} /> {t.gpsLocked}
                    </span>
                  ) : (
                    <span className={`text-[10px] ${textMuted}`}>Precision GPS optional</span>
                  )}
                </div>

                {/* Simulated Radar Preview */}
                <div className={`p-3 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#161616]' : 'bg-[#F6F3ED]'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                      <MapPin size={18} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">
                        {landmark || 'No landmark specified yet'}
                      </div>
                      <div className={`text-[10px] ${textMuted}`}>
                        {gpsLocked ? '17.4325° N, 78.4071° E • Hyderabad Municipal Zone' : 'Tap Auto GPS to acquire satellite coordinates'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoGps}
                    disabled={isLocatingGps}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1 transition active:scale-95 shrink-0 ${
                      darkMode ? 'bg-emerald-500 text-black' : 'bg-black text-white'
                    }`}
                  >
                    {isLocatingGps ? <RefreshCw size={11} className="animate-spin" /> : <Navigation size={11} />}
                    {t.autoGps}
                  </button>
                </div>

                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="Or enter manual landmark (e.g. Metro Pillar 42)..."
                  className={`w-full px-3.5 py-2.5 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#181818] text-white' : 'bg-[#F9F7F2] text-[#121110]'} text-xs outline-none focus:border-emerald-500`}
                />
              </div>

              {/* 5. Municipal Dispatch Routing Preview */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-2`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="font-bold text-[11px] uppercase tracking-wider">Direct Authority Routing</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Verified Protocol</span>
                </div>

                <div className={`p-3 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#181818]' : 'bg-[#F8F5EE]'} space-y-1`}>
                  <div className="font-bold text-xs">{ROUTING_DIRECTORY[selectedCategory]?.dept}</div>
                  <div className={`text-[10px] ${textMuted} flex items-center justify-between`}>
                    <span>SLA Guarantee: {ROUTING_DIRECTORY[selectedCategory]?.sla}</span>
                    <span>Helpline: {ROUTING_DIRECTORY[selectedCategory]?.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-neutral-400 pt-0.5">
                  <span>🔒 Citizen Privacy Protected</span>
                  <span>•</span>
                  <span>Direct API / Municipal Handoff</span>
                </div>
              </div>

              {/* 6. Primary Dispatch Action Button */}
              <button
                type="button"
                onClick={handleSubmitReport}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-tight transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl ${
                  darkMode
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                    : 'bg-[#121110] text-[#FAF8F5] hover:bg-black shadow-black/25'
                }`}
              >
                <Send size={16} />
                {t.submitReport}
              </button>
            </div>
          )}

          {/* ================= VIEW 3: TRACK REPORTS (APPLE WALLET / TAB STACK INSPECTION) ================= */}
          {view === 'reports' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header with Title and Segmented Filter */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-bold text-base tracking-tight">{t.liveTrackerTitle}</h2>
                  <p className={`text-xs ${textMuted}`}>Tap card to inspect telemetry & verifications</p>
                </div>

                {/* Filter Pill Switcher */}
                <div className={`flex p-0.5 rounded-full border ${borderSubtle} ${darkMode ? 'bg-[#181818]' : 'bg-white'}`}>
                  {(['all', 'active', 'resolved'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setReportFilter(f)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize transition ${
                        reportFilter === f
                          ? darkMode
                            ? 'bg-emerald-500 text-black'
                            : 'bg-black text-white'
                          : textMuted
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stacked Cards Layout */}
              <div className="space-y-3">
                {filteredIncidents.length === 0 ? (
                  <div className={`p-8 rounded-3xl border ${cardBg} text-center ${textMuted} text-xs`}>
                    No incidents matching this filter.
                  </div>
                ) : (
                  filteredIncidents.map(inc => {
                    const step = getStepNumber(inc.status)
                    const isResolved = inc.status === 'resolved'
                    const isExpanded = expandedIncidentId === inc.id

                    return (
                      <div
                        key={inc.id}
                        className={`rounded-3xl border transition-all duration-300 overflow-hidden ${cardBg} ${
                          isExpanded
                            ? 'ring-2 ring-emerald-500/30'
                            : 'hover:border-neutral-400 dark:hover:border-neutral-700'
                        }`}
                      >
                        {/* 1. Stack Preview Card (Hero Image + Core Info) - CLICKABLE */}
                        <div
                          onClick={() => setExpandedIncidentId(isExpanded ? null : inc.id)}
                          className="cursor-pointer group"
                        >
                          {/* Photo Hero Banner */}
                          <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                            {inc.photo ? (
                              <img
                                src={inc.photo}
                                alt={inc.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                <Camera size={24} />
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60" />

                            {/* Top Badges */}
                            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                              <span className="bg-black/75 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                                {inc.id}
                              </span>

                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 ${
                                isResolved
                                  ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                                  : 'bg-black/75 text-emerald-400 border border-emerald-500/40'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-black' : 'bg-emerald-400 animate-ping'}`} />
                                {formatStatus(inc.status)}
                              </span>
                            </div>

                            {/* Bottom Category Chip over Image */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <span className="bg-black/75 backdrop-blur-md text-neutral-200 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                                {inc.category}
                              </span>
                              <span className="text-[10px] font-medium text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                {inc.timestamp}
                              </span>
                            </div>
                          </div>

                          {/* Card Summary Header */}
                          <div className="p-4 space-y-2">
                            <div>
                              <h3 className="font-bold text-sm leading-snug tracking-tight">
                                {inc.title}
                              </h3>
                              <p className={`text-[11px] ${textMuted} mt-1 line-clamp-2 leading-relaxed`}>
                                {inc.severityReason || 'Hazard report logged and under surveillance.'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                              <div className={`flex items-center gap-1.5 ${textMuted} truncate mr-2`}>
                                <MapPin size={12} className="shrink-0 text-emerald-500" />
                                <span className="truncate">{inc.landmark}</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                SLA: {inc.sla}
                              </span>
                            </div>

                            {/* Tap Expand Cue */}
                            <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span>{isExpanded ? 'Collapse inspection details' : 'Tap to inspect live lifecycle & verifications'}</span>
                              <div className={`p-1 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-[#F2ECE1]'} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Deep Expansion Details (Unveiled on Click) */}
                        {isExpanded && (
                          <div className={`p-4 pt-0 space-y-3.5 border-t ${borderSubtle} animate-in slide-in-from-top-2 duration-200`}>
                            {/* Swiggy-Style Step Progress Tracker */}
                            <div className="pt-3 space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  Live Dispatch: Stage {step} of 6
                                </span>
                                <span className={textMuted}>Turnaround SLA: {inc.sla}</span>
                              </div>

                              <div className="flex gap-1.5 h-2 rounded-full overflow-hidden bg-neutral-200/60 dark:bg-neutral-800">
                                {[1, 2, 3, 4, 5, 6].map(s => (
                                  <div
                                    key={s}
                                    className={`flex-1 rounded-full transition-all duration-300 ${
                                      s <= step
                                        ? isResolved
                                          ? 'bg-emerald-500'
                                          : darkMode
                                          ? 'bg-emerald-400'
                                          : 'bg-black'
                                        : 'bg-transparent'
                                    }`}
                                  />
                                ))}
                              </div>

                              <div className={`flex justify-between text-[9px] font-semibold ${textMuted} px-0.5`}>
                                <span>Logged</span>
                                <span>Routed</span>
                                <span>Ack'd</span>
                                <span className={step === 4 ? 'text-emerald-500 font-bold' : ''}>On-Site</span>
                                <span>Fix Proof</span>
                                <span className={step === 6 ? 'text-emerald-500 font-bold' : ''}>Resolved</span>
                              </div>
                            </div>

                            {/* Assigned Department & Emergency Call */}
                            <div className={`p-3 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#181818]' : 'bg-[#F8F5EE]'} flex items-center justify-between text-xs`}>
                              <div className="space-y-0.5">
                                <div className={`text-[9px] font-bold uppercase tracking-wider ${textMuted}`}>
                                  {t.assignedTeam}
                                </div>
                                <div className="font-bold text-xs">{inc.assignedOfficer || inc.recipient}</div>
                                <div className={`text-[10px] ${textMuted}`}>Official Emergency Channel: 040-21111111</div>
                              </div>
                              <a
                                href="tel:040-21111111"
                                className={`p-2.5 rounded-2xl flex items-center gap-1 font-bold text-xs transition active:scale-95 ${
                                  darkMode ? 'bg-emerald-500 text-black' : 'bg-black text-white'
                                }`}
                                title="Call Responsible Authority"
                              >
                                <Phone size={13} />
                                <span>Call Dept</span>
                              </a>
                            </div>

                            {/* Before & After Photo Comparison */}
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted} block`}>
                                Photographic Verification Evidence
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                {inc.photo && (
                                  <div>
                                    <span className={`font-semibold ${textMuted} block mb-1`}>Initial Hazard:</span>
                                    <img src={inc.photo} alt="Initial" className="w-full h-24 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800" />
                                  </div>
                                )}
                                {inc.resolutionPhoto ? (
                                  <div>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1 flex items-center gap-1">
                                      <CheckCircle size={10} /> Verified Fix Proof:
                                    </span>
                                    <img src={inc.resolutionPhoto} alt="Resolution" className="w-full h-24 rounded-xl object-cover border-2 border-emerald-500" />
                                  </div>
                                ) : (
                                  <div className={`h-24 rounded-xl border border-dashed ${borderSubtle} flex flex-col items-center justify-center ${textMuted} text-center p-2`}>
                                    <Clock size={16} className="mb-1 text-neutral-400" />
                                    <span>Resolution photo pending from municipal crew</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Citizen Ground Verification Section */}
                            <div className={`p-3.5 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#181818]/60' : 'bg-[#F9F7F2]'} space-y-2`}>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs tracking-tight">Citizen Ground Verification</span>
                                <span className={`text-[10px] ${textMuted}`}>Community Consensus</span>
                              </div>
                              <p className={`text-[11px] ${textMuted} leading-tight`}>
                                Have you inspected this location? Help verify if the hazard is fixed on ground:
                              </p>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  onClick={() => handleVote(inc.id, true)}
                                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                                    darkMode ? 'bg-emerald-500 text-black' : 'bg-black text-white'
                                  }`}
                                >
                                  <ThumbsUp size={13} /> Confirm Fixed ({inc.votesResolved || 0})
                                </button>
                                <button
                                  onClick={() => handleVote(inc.id, false)}
                                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                                    darkMode ? 'bg-[#222] border-neutral-700 text-neutral-200' : 'bg-white border-[#DCD6CA] text-[#121110]'
                                  }`}
                                >
                                  <ThumbsDown size={13} /> Still Broken ({inc.votesBroken || 0})
                                </button>
                              </div>
                            </div>

                            {/* Quick Judge Demo Controls */}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => advanceIncidentStatus(inc.id)}
                                className={`flex-1 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                                  darkMode ? 'bg-[#202020] border-neutral-700 text-emerald-400' : 'bg-white border-[#DCD6CA] text-emerald-700 shadow-xs'
                                }`}
                              >
                                ⚡ Simulate Lifecycle Advance (Demo)
                              </button>
                              <button
                                onClick={() => setExpandedIncidentId(null)}
                                className={`px-3 py-2 rounded-xl border font-medium text-xs ${borderSubtle} ${textMuted} active:scale-95`}
                              >
                                Collapse
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 4: NOTIFICATIONS ================= */}
          {view === 'notifications' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-bold text-base tracking-tight">{t.notifications}</h2>
                  <p className={`text-xs ${textMuted}`}>Live dispatch updates and weather alerts</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <div className={`p-8 text-center ${textMuted} text-xs`}>No notifications at this time.</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { if (n.incidentId) setView('reports') }}
                      className={`p-3.5 rounded-3xl border ${cardBg} space-y-1 cursor-pointer active:scale-[0.98] transition`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {n.title}
                        </span>
                        <span className={`text-[10px] ${textMuted}`}>{n.time}</span>
                      </div>
                      <p className={`text-[11px] ${textMuted} leading-relaxed`}>{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 5: ADMIN / MODERATOR CONSOLE ================= */}
          {view === 'mod' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-bold text-base tracking-tight">{t.moderator}</h2>
                  <p className={`text-xs ${textMuted}`}>Judge Control & Authority Simulation</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Authority Demo
                </span>
              </div>

              <div className="space-y-2.5">
                {incidents.map(inc => (
                  <div key={inc.id} className={`p-4 rounded-3xl border ${cardBg} space-y-2.5`}>
                    <div className="flex items-start justify-between text-xs">
                      <div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{inc.id}</span>
                        <div className="font-bold mt-0.5">{inc.category}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-[#EFEAE1]'}`}>
                        {formatStatus(inc.status)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => advanceIncidentStatus(inc.id)}
                        className={`flex-1 py-2 rounded-2xl font-bold text-xs transition active:scale-95 ${
                          darkMode ? 'bg-emerald-500 text-black' : 'bg-black text-white'
                        }`}
                      >
                        Advance 1 Lifecycle Step
                      </button>
                      <button
                        onClick={() => {
                          setIncidents(prev =>
                            prev.map(i => (i.id === inc.id ? { ...i, status: 'resolved' } : i))
                          )
                          showIslandToast(`${inc.id} Marked Resolved by Admin`)
                        }}
                        className={`py-2 px-3 rounded-2xl border font-bold text-xs transition active:scale-95 ${
                          darkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-[#DCD6CA] text-black'
                        }`}
                      >
                        Force Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 6: AI ASSISTANT ================= */}
          {view === 'assistant' && (
            <div className="flex flex-col h-[75vh] animate-in fade-in duration-200">
              <div className="pb-2 border-b mb-2 flex items-center justify-between px-1 border-neutral-200 dark:border-neutral-800">
                <div>
                  <h2 className="font-bold text-xs leading-tight">{t.assistant}</h2>
                  <span className={`text-[10px] ${textMuted}`}>Grounded in live civic state & alerts</span>
                </div>
                <button
                  onClick={() => setChat([{ from: 'bot', text: 'Chat reset. How can I assist you?', time: 'Now' }])}
                  className={`text-[10px] ${textMuted} hover:underline`}
                >
                  Clear
                </button>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-3xl max-w-[85%] text-xs leading-relaxed ${
                        m.from === 'user'
                          ? darkMode
                            ? 'bg-emerald-500 text-black font-medium'
                            : 'bg-black text-white font-medium'
                          : darkMode
                          ? 'bg-[#181818] border border-neutral-800 text-neutral-200'
                          : 'bg-white border border-[#E8E2D8] text-[#121110] shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>
                      <div className={`text-[9px] mt-1 opacity-70 text-right`}>{m.time}</div>
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-2 rounded-2xl ${darkMode ? 'bg-[#181818]' : 'bg-white'} text-xs text-neutral-400`}>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Inquiry Pills */}
              <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  'Status of GT-8491?',
                  'Explain IMD Alert',
                  'హైదరాబాద్ అలర్ట్ తెలుగులో',
                ].map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSendChat(chip)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold border transition active:scale-95 ${
                      darkMode ? 'bg-[#181818] border-neutral-800 text-neutral-300' : 'bg-white border-[#E8E2D8] text-[#121110]'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleSendChat()
                }}
                className="flex items-center gap-1.5 pt-1"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={t.askPlaceholder}
                  className={`flex-1 px-3.5 py-2.5 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#141414] text-white' : 'bg-white text-[#121110]'} text-xs outline-none focus:border-emerald-500`}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className={`p-2.5 rounded-2xl transition disabled:opacity-40 active:scale-95 ${
                    darkMode ? 'bg-emerald-500 text-black' : 'bg-black text-white'
                  }`}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* ================= VIEW 7: WEATHER INTELLIGENCE & 24H FORECAST ================= */}
          {view === 'weather' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header with Back button */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Civic Meteorological Wing
                    </span>
                  </div>
                  <h2 className="font-bold text-xl tracking-tight">{t.weatherHeader}</h2>
                  <p className={`text-xs ${textMuted}`}>{t.weatherSub}</p>
                </div>
                <button
                  onClick={() => setView('home')}
                  className={`p-1.5 rounded-full border ${borderSubtle} ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-neutral-600'} active:scale-95`}
                >
                  <X size={15} />
                </button>
              </div>

              {/* 1. Hyperlocal Location Selector & Auto GPS */}
              <div className={`p-3.5 rounded-3xl border ${cardBg} space-y-2.5`}>
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <MapPin size={12} /> Target Weather Station
                  </span>
                  <span>Doppler Radar Sync</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCityId}
                    onChange={e => setSelectedCityId(e.target.value)}
                    className={`flex-1 text-xs font-bold border rounded-2xl px-3 py-2 outline-none cursor-pointer transition ${
                      darkMode ? 'bg-[#181818] border-neutral-700 text-white' : 'bg-[#F9F7F2] border-[#E4DDD2] text-[#121110]'
                    }`}
                  >
                    {WEATHER_CITIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleWeatherGps}
                    disabled={isLocatingWeatherGps}
                    className={`px-3 py-2 rounded-2xl border font-bold text-xs flex items-center gap-1.5 active:scale-95 transition whitespace-nowrap shrink-0 ${
                      weatherGpsLocked
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : darkMode
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                        : 'bg-white border-[#E4DDD2] text-[#121110] shadow-sm'
                    }`}
                  >
                    <LocateFixed size={13} className={isLocatingWeatherGps ? 'animate-spin' : ''} />
                    {isLocatingWeatherGps ? 'Locating...' : weatherGpsLocked ? 'GPS Locked' : 'Auto GPS'}
                  </button>
                </div>
              </div>

              {/* 2. Apple Weather Master Hero Card */}
              {(() => {
                const city = WEATHER_CITIES.find(c => c.id === selectedCityId) || WEATHER_CITIES[0]
                return (
                  <div className={`p-5 rounded-3xl border text-center relative overflow-hidden ${
                    darkMode
                      ? 'bg-gradient-to-b from-[#1A1A1A] to-[#101010] border-neutral-800 shadow-[0_12px_32px_rgba(0,0,0,0.6)]'
                      : 'bg-gradient-to-b from-white to-[#F9F7F2] border-[#E8E2D8] shadow-[0_6px_24px_rgba(20,18,16,0.06)]'
                  }`}>
                    {/* Location & Time */}
                    <div className="space-y-0.5">
                      <div className="text-base font-bold tracking-tight">{city.name}</div>
                      <div className={`text-[11px] ${textMuted}`}>{city.sub}</div>
                    </div>

                    {/* Giant Temp & Condition */}
                    <div className="my-3 flex flex-col items-center">
                      <div className="text-5xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                        {city.temp}
                      </div>
                      <div className="font-bold text-sm mt-1">{city.cond}</div>
                      <div className={`text-xs ${textMuted} mt-1 font-medium`}>
                        H: {city.high}  L: {city.low}  •  Feels like {city.feelsLike}
                      </div>
                    </div>

                    {/* Official Warning Tap-Through Badge */}
                    <button
                      onClick={() => setView('warnings')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
                        city.alertTier === 'red'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <ShieldAlert size={13} />
                      {city.alertText}
                      <span className="opacity-70 ml-0.5">➔</span>
                    </button>
                  </div>
                )
              })()}

              {/* 3. 24-Hour Forecast Horizontal Carousel */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-3`}>
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold tracking-tight">24-Hour Forecast</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${textMuted}`}>Live Doppler Sync</span>
                </div>

                <div className="overflow-x-auto no-scrollbar flex gap-2.5 pb-1">
                  {HOURLY_FORECAST.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-between min-w-[70px] text-center transition-all ${
                        idx === 0
                          ? darkMode
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-white'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : darkMode
                          ? 'bg-[#181818] border-neutral-800'
                          : 'bg-[#F9F7F2] border-[#EAE4DA]'
                      }`}
                    >
                      <span className="text-[10px] font-bold opacity-80">{item.time}</span>
                      <span className="text-xl my-1">{item.icon}</span>
                      <span className="text-xs font-black">{item.temp}</span>
                      <div className="flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        <Droplets size={9} />
                        {item.rain}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Traditional Weather App Metrics (8 Precision Sensors) */}
              {(() => {
                const city = WEATHER_CITIES.find(c => c.id === selectedCityId) || WEATHER_CITIES[0]
                const metrics = [
                  {
                    icon: CloudRain,
                    label: 'Precipitation',
                    val: city.rainRate,
                    sub: 'Peak downpour in next 45m',
                  },
                  {
                    icon: Wind,
                    label: 'Wind & Gusts',
                    val: city.wind,
                    sub: `Gusts up to ${city.gusts}`,
                  },
                  {
                    icon: Droplets,
                    label: 'Humidity',
                    val: city.humidity,
                    sub: 'Dew point: 24°C',
                  },
                  {
                    icon: Thermometer,
                    label: 'Feels Like',
                    val: city.feelsLike,
                    sub: 'High moisture index',
                  },
                  {
                    icon: Eye,
                    label: 'Visibility',
                    val: city.visibility,
                    sub: 'Reduced by rain curtain',
                  },
                  {
                    icon: Gauge,
                    label: 'Barometer',
                    val: city.pressure,
                    sub: 'Monsoon depression',
                  },
                  {
                    icon: Sun,
                    label: 'UV Index',
                    val: city.uv,
                    sub: 'Overcast attenuation',
                  },
                  {
                    icon: Activity,
                    label: 'Air Quality (AQI)',
                    val: city.aqi,
                    sub: 'Rain scavenged air',
                  },
                ]

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
                        Meteorological Metrics
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        8 Real-time Sensors
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {metrics.map((m, idx) => {
                        const Icon = m.icon
                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-3xl border ${cardBg} flex flex-col justify-between space-y-1`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>
                                {m.label}
                              </span>
                              <div className="p-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Icon size={13} />
                              </div>
                            </div>
                            <div className="text-base font-black tracking-tight">{m.val}</div>
                            <div className={`text-[10px] ${textMuted} leading-tight`}>{m.sub}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* 5. Live Doppler Radar Simulation Card */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold tracking-tight">Doppler Reflectivity Radar</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Sweep: 1.2s Active
                  </span>
                </div>

                {/* Radar Graphic Canvas */}
                <div className="relative w-full h-40 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-emerald-500/30">
                  {/* Concentric distance rings */}
                  <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20" />
                  <div className="absolute w-36 h-36 rounded-full border border-emerald-500/15" />
                  <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                  <div className="absolute h-full w-[1px] bg-emerald-500/20" />

                  {/* Sweep Line */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/20 to-transparent animate-spin origin-center duration-1000" />

                  {/* Simulated Rain Cells */}
                  <div className="absolute top-8 left-12 w-12 h-8 rounded-full bg-rose-500/40 blur-xs" />
                  <div className="absolute top-12 left-16 w-16 h-10 rounded-full bg-amber-500/30 blur-xs" />
                  <div className="absolute bottom-10 right-14 w-20 h-12 rounded-full bg-emerald-500/30 blur-xs" />

                  {/* Center Marker */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                    <span className="text-[9px] font-mono text-white bg-black/80 px-1.5 rounded mt-1">
                      Hyderabad Central (Station 4)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] px-1">
                  <span className={textMuted}>Reflectivity: Heavy Rain Core (45-55 dBZ)</span>
                  <button
                    onClick={() => setView('warnings')}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View Official Warnings ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 8: OFFICIAL WARNINGS & CIVIL DEFENSE ================= */}
          {view === 'warnings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header with Back button */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Civil Defense Portal
                    </span>
                  </div>
                  <h2 className="font-bold text-xl tracking-tight">{t.warningsHeader}</h2>
                  <p className={`text-xs ${textMuted}`}>{t.warningsSub}</p>
                </div>
                <button
                  onClick={() => setView('home')}
                  className={`p-1.5 rounded-full border ${borderSubtle} ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white text-neutral-600'} active:scale-95`}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Official Verification Banner */}
              <div className={`p-3.5 rounded-3xl border ${cardBg} flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-xs">Official Disaster Watch Synchronized</div>
                    <div className={`text-[10px] ${textMuted}`}>IMD SACHET • NDMA • TSDMA Ground Feed</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Severity Filter Tabs */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All Notices (${WEATHER_ALERTS.length})` },
                  { id: 'red', label: '🔴 Red Alerts (1)' },
                  { id: 'orange', label: '🟠 Orange Warnings (1)' },
                  { id: 'yellow', label: '🟡 Yellow Watch (1)' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setWarningFilter(tab.id as any)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold border transition active:scale-95 ${
                      warningFilter === tab.id
                        ? darkMode
                          ? 'bg-neutral-700 border-neutral-600 text-white'
                          : 'bg-black border-black text-white'
                        : darkMode
                        ? 'bg-[#181818] border-neutral-800 text-neutral-400'
                        : 'bg-white border-[#E8E2D8] text-[#121110]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Warnings List */}
              <div className="space-y-3.5">
                {WEATHER_ALERTS.filter(a => warningFilter === 'all' || a.level === warningFilter).map(alert => {
                  const isRed = alert.level === 'red'
                  const isOrange = alert.level === 'orange'
                  const borderColor = isRed
                    ? 'border-rose-500/40 dark:border-rose-500/30'
                    : isOrange
                    ? 'border-amber-500/40 dark:border-amber-500/30'
                    : 'border-yellow-500/40 dark:border-yellow-500/30'

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-3xl border ${borderColor} ${cardBg} space-y-3.5 relative overflow-hidden`}
                    >
                      {/* Alert Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isRed ? 'bg-rose-500 animate-ping' : isOrange ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                            <span className={`text-[10px] font-bold tracking-wider uppercase ${
                              isRed ? 'text-rose-600 dark:text-rose-400' : isOrange ? 'text-amber-600 dark:text-amber-400' : 'text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {alert.agency}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm tracking-tight mt-1 leading-snug">
                            {alert.title[lang]}
                          </h3>
                        </div>

                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                          isRed
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : isOrange
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {alert.level} alert
                        </span>
                      </div>

                      {/* Technical Summary */}
                      <p className={`text-xs ${textMuted} leading-relaxed`}>
                        {alert.summary[lang]}
                      </p>

                      {/* Plain-Language Explanation for Everyday Citizens */}
                      <div className={`p-3.5 rounded-2xl ${darkMode ? 'bg-[#181818]' : 'bg-[#F6F3ED]'} space-y-1`}>
                        <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Simple Explanation (What this means for you)
                        </div>
                        <p className="text-xs leading-relaxed opacity-95">
                          {alert.explanation[lang]}
                        </p>
                      </div>

                      {/* Affected Local Corridors */}
                      <div className="space-y-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>
                          Affected Corridors & Roadways
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {alert.affectedAreas.split(',').map((area, i) => (
                            <span
                              key={i}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${borderSubtle} ${
                                darkMode ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-800 shadow-2xs'
                              }`}
                            >
                              📍 {area.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Do's and Don'ts Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className={`p-3 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#181818]' : 'bg-[#F9F7F2]'}`}>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                            ✓ Recommended Do's:
                          </span>
                          {alert.dos[lang].map((d, i) => (
                            <div key={i} className={`leading-tight mt-1 ${textMuted}`}>• {d}</div>
                          ))}
                        </div>
                        <div className={`p-3 rounded-2xl border ${borderSubtle} ${darkMode ? 'bg-[#181818]' : 'bg-[#F9F7F2]'}`}>
                          <span className="font-bold text-rose-500 block mb-1">
                            ✗ Critical Don'ts:
                          </span>
                          {alert.donts[lang].map((d, i) => (
                            <div key={i} className={`leading-tight mt-1 ${textMuted}`}>• {d}</div>
                          ))}
                        </div>
                      </div>

                      {/* Official External Portal Link & Helpline Action */}
                      <div className={`pt-2 border-t ${borderSubtle} flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2`}>
                        <a
                          href={alert.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`px-3 py-2 rounded-2xl border font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition ${
                            darkMode
                              ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white'
                              : 'bg-white border-[#DCD6CA] text-[#121110] shadow-2xs'
                          }`}
                        >
                          <ExternalLink size={12} />
                          {alert.portalName}
                        </a>

                        <a
                          href="tel:112"
                          className="px-3.5 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
                        >
                          <Phone size={12} />
                          Emergency: {alert.helpline}
                        </a>
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] ${textMuted}`}>{alert.validUntil}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Civil Helplines Quick Directory */}
              <div className={`p-4 rounded-3xl border ${cardBg} space-y-2`}>
                <div className="font-bold text-xs">Direct Emergency Contacts Directory</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:112"
                    className={`p-2.5 rounded-2xl border ${borderSubtle} flex items-center justify-between font-bold ${
                      darkMode ? 'bg-[#181818]' : 'bg-[#F9F7F2]'
                    }`}
                  >
                    <span>National Helpline</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">112</span>
                  </a>
                  <a
                    href="tel:040-21111111"
                    className={`p-2.5 rounded-2xl border ${borderSubtle} flex items-center justify-between font-bold ${
                      darkMode ? 'bg-[#181818]' : 'bg-[#F9F7F2]'
                    }`}
                  >
                    <span>GHMC Control</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">040-21111111</span>
                  </a>
                  <a
                    href="tel:040-29555500"
                    className={`p-2.5 rounded-2xl border ${borderSubtle} flex items-center justify-between font-bold ${
                      darkMode ? 'bg-[#181818]' : 'bg-[#F9F7F2]'
                    }`}
                  >
                    <span>Disaster Force</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">040-29555500</span>
                  </a>
                  <a
                    href="tel:155313"
                    className={`p-2.5 rounded-2xl border ${borderSubtle} flex items-center justify-between font-bold ${
                      darkMode ? 'bg-[#181818]' : 'bg-[#F9F7F2]'
                    }`}
                  >
                    <span>Water Board</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">155313</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Apple-Grade Floating Dock Navigation Bar */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-40">
          <div className="backdrop-blur-2xl bg-black/90 dark:bg-[#121212]/95 border border-white/10 rounded-full px-2 py-1.5 flex justify-between items-center shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            {[
              { id: 'home', label: t.home, icon: Home },
              { id: 'weather', label: t.weather, icon: CloudRain },
              { id: 'report', label: t.reportBtn, icon: Plus },
              { id: 'reports', label: t.myReports, icon: Navigation },
              { id: 'warnings', label: t.warnings, icon: ShieldAlert },
              { id: 'assistant', label: t.assistant, icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => {
              const active = view === id
              return (
                <button
                  key={id}
                  onClick={() => setView(id as any)}
                  className={`flex items-center gap-1 py-1.5 px-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-white/15 text-emerald-400 font-bold'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`}
                >
                  <Icon size={16} />
                  {active && <span className="text-[10px] tracking-tight">{label}</span>}
                </button>
              )
            })}
          </div>
        </nav>

      </div>
    </div>
  )
}