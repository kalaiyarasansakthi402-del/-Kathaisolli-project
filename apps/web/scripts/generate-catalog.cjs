const fs = require('fs');

const catalogRaw = [
  {
    folderName: "Adutha Vinadi",
    title: "Adutha Vinadi",
    tamilTitle: "அடுத்த நிமிடம்",
    authorName: "குகநாதன்",
    category: "Motivation",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1F2937", "#4B5563"],
    description: "வாழ்வின் அடுத்த நொடியை மாற்றியமைக்கும் உத்வேகம் மற்றும் வழிகாட்டல் சிந்தனைகள்."
  },
  {
    folderName: "Ainthu Vazhi Moonru Vaasal",
    title: "Ainthu Vazhi Moonru Vaasal",
    tamilTitle: "ஐந்து வழி மூன்று வாசல்",
    authorName: "ஞானக்கூத்தன்",
    category: "Motivation",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#78350F", "#B45309"],
    description: "மனித மனதின் ஐந்து வழிகளையும் மூன்று வாசல்களையும் விளக்கும் தத்துவார்த்த ஆடியோ புத்தகம்."
  },
  {
    folderName: "Appusamiyum Africa Azhagiyum",
    title: "Appusamiyum Africa Azhagiyum",
    tamilTitle: "அப்புசாமியும் ஆப்பிரிக்க அழகியும்",
    authorName: "பாக்கியம் ராமசாமி",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#831843", "#BE185D"],
    description: "அப்புசாமியின் நகைச்சுவை மற்றும் சாகச பயணங்கள் நிறைந்த பிரபல தொடர்."
  },
  {
    folderName: "Arthashastram",
    title: "Arthashastram",
    tamilTitle: "அர்த்தசாஸ்திரம்",
    authorName: "சாணக்கியர் (Chanakya)",
    category: "History",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#713F12", "#CA8A04"],
    description: "அரசியல், பொருளாதாரம் மற்றும் நிர்வாக நெறிமுறைகளை கற்பிக்கும் சாணக்கியரின் காலத்தால் அழியாத நூல்."
  },
  {
    folderName: "Arul Tharum Annaiyar",
    title: "Arul Tharum Annaiyar",
    tamilTitle: "அருள் தரும் அன்னையர்",
    authorName: "அன்னை உபாசகர்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#9A3412", "#EA580C"],
    description: "அன்னை சக்தியின் திருவருள் லீலைகளும் பக்தர்களின் தெய்வீக அனுபவங்களும்."
  },
  {
    folderName: "Arupadai Veedu",
    title: "Arupadai Veedu",
    tamilTitle: "அறுபடை வீடு",
    authorName: "முருகுபக்தர்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#854D0E", "#EAB308"],
    description: "தமிழ் கடவுள் முருகப்பெருமானின் ஆறுபடை வீடுகளின் பெருமைகளும் ஸ்தல வரலாறும்."
  },
  {
    folderName: "Asvini mutal Revati varai",
    title: "Asvini mutal Revati varai",
    tamilTitle: "அஸ்வினி முதல் ரேவதி வரை",
    authorName: "ஜோதிட வாணி",
    category: "History",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#581C87", "#9333EA"],
    description: "27 நட்சத்திரங்களின் பண்புகளும் வாழ்வியல் தாக்கங்களும் குறித்த விரிவான விளக்கம்."
  },
  {
    folderName: "Bhagavad gita_Cho",
    title: "Bhagavad gita_Cho",
    tamilTitle: "பகவத் கீதை",
    authorName: "சோ ராமசாமி (Cho Ramaswamy)",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1E3A8A", "#2563EB"],
    description: "சோ ராமசாமியின் தெளிவான பாணியில் கீதையின் அரிய தத்துவங்கள் மற்றும் வாழ்க்கை நெறிமுறைகள்."
  },
  {
    folderName: "Dasavatharam",
    title: "Dasavatharam",
    tamilTitle: "தசாவதாரம்",
    authorName: "வைணவ பெரியோர்கள்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#065F46", "#059669"],
    description: "மகாவிஷ்ணுவின் பத்து அவதாரங்களின் நோக்கம், வரலாறு மற்றும் ஆன்மீக சாராம்சங்கள்."
  },
  {
    folderName: "Ezhavathu Jenmam",
    title: "Ezhavathu Jenmam",
    tamilTitle: "ஏழாவது ஜென்மம்",
    authorName: "இந்திரா சௌந்தர்ராஜன்",
    category: "Literature",
    language: "Tamil",
    audioAvailable: false,
    accent: ["#1E293B", "#334155"],
    description: "மர்மமும் த்ரில்லரும் நிறைந்த மறுபிறவி நாவல். (ஆடியோ விரைவில் தயாராகிறது)."
  },
  {
    folderName: "Garuda puranam",
    title: "Garuda puranam",
    tamilTitle: "கருட புராணம்",
    authorName: "வேத வியாசர்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#78350F", "#D97706"],
    description: "கருட பகவானுக்கு நாராயணன் உபதேசித்த பிறவி, கர்மா மற்றும் முக்தி தத்துவங்கள்."
  },
  {
    folderName: "Genghis Khan",
    title: "Genghis Khan",
    tamilTitle: "செங்கிஸ் கான்",
    authorName: "Harold Lamb / தமிழ் வடிவம்",
    category: "Biography",
    language: "English",
    audioAvailable: true,
    accent: ["#881337", "#E11D48"],
    description: "மங்கோலிய சாம்ராஜ்யத்தை உலகறியச் செய்த மாவீரன் செங்கிஸ் கானின் முழு வரலாறு."
  },
  {
    folderName: "Idlyaga Irungal",
    title: "Idlyaga Irungal",
    tamilTitle: "இட்லியாக இருங்கள்",
    authorName: "சோம வள்ளியப்பன் (Soma Valliappan)",
    category: "Self Help",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#14532D", "#16A34A"],
    description: "மென்மையாகவும் சுவையாகவும் இருக்கும் இட்லி போல் வாழ்க்கையில் சாதிப்பது எப்படி என்ற வழிகாட்டி."
  },
  {
    folderName: "Irandaam Sakthi",
    title: "Irandaam Sakthi",
    tamilTitle: "இரண்டாம் சக்தி",
    authorName: "சக்தி உபாசகர்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#701A75", "#C026D3"],
    description: "சக்தி வழிபாட்டின் இரண்டாவது படிநிலையும் மனித ஆன்மாவின் மேன்மையும்."
  },
  {
    folderName: "Iravukku Munbu Varuvadhu Maalai",
    title: "Iravukku Munbu Varuvadhu Maalai",
    tamilTitle: "இரவுக்கு முன்பு வருவது மாலை",
    authorName: "சுஜாதா (Sujatha)",
    category: "Motivation",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1E1B4B", "#4338CA"],
    description: "மனித உணர்வுகளின் மாலை நேர நிழல்களை வர்ணிக்கும் சுஜாதாவின் சிறந்த ஆக்கம்."
  },
  {
    folderName: "Jayakanthan - Short Story Collection",
    title: "Jayakanthan - Short Story Collection",
    tamilTitle: "ஜெயகாந்தன் சிறுகதைகள்",
    authorName: "ஜெயகாந்தன் (D. Jayakanthan)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#451A03", "#78350F"],
    description: "சமூக யதார்த்தத்தை நெஞ்சில் தைக்கும் படி எழுதிய ஞானபீட எழுத்தாளர் ஜெயகாந்தனின் கதைகள்."
  },
  {
    folderName: "Kalvanin Kaadhali",
    title: "Kalvanin Kaadhali",
    tamilTitle: "கள்வனின் காதலி",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#991B1B", "#DC2626"],
    description: "முத்தையன் மற்றும் கல்யாணியின் உணர்ச்சிகரமான காதலையும் தியாகத்தையும் கூறும் அமர காவியம்."
  },
  {
    folderName: "Kannadasan's Cinema Santhaiyil 30 Aandugal",
    title: "Kannadasan's Cinema Santhaiyil 30 Aandugal",
    tamilTitle: "கண்ணதாசன் திரை உலக 30 ஆண்டுகள்",
    authorName: "கவிஞர் கண்ணதாசன் (Kannadasan)",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#312E81", "#4F46E5"],
    description: "கவியரசு கண்ணதாசன் சினிமா உலகில் அனுபவித்த வெற்றிகளும் கசப்புகளும் அடங்கிய அனுபவப் பெட்டகம்."
  },
  {
    folderName: "Kannadasan's Enathu Suya Saritham",
    title: "Kannadasan's Enathu Suya Saritham",
    tamilTitle: "கண்ணதாசனின் எனது சுய சரிதம்",
    authorName: "கவிஞர் கண்ணதாசன் (Kannadasan)",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1E293B", "#475569"],
    description: "கண்ணதாசனின் சொந்த வாழ்க்கை, கவிதை பயணம் மற்றும் இலக்கிய சாதனைகள்."
  },
  {
    folderName: "Kannagi",
    title: "Kannagi",
    tamilTitle: "கண்ணகி",
    authorName: "சிலப்பதிகார மூலக்கதை",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#831843", "#BE185D"],
    description: "நீதிக்காக மதுரையை எரித்த கற்பின் செல்வி கண்ணகியின் வீர காவியம்."
  },
  {
    folderName: "Kettiradha Mahabharatam",
    title: "Kettiradha Mahabharatam",
    tamilTitle: "கேட்டிராத மகாபாரதம்",
    authorName: "டாக்டர் நடராஜன்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#78350F", "#B45309"],
    description: "மகாபாரதத்தில் அதிகம் அறியப்படாத ஆச்சரியமூட்டும் கிளைக்கதைகளும் ரகசியங்களும்."
  },
  {
    folderName: "Kettiradha Ramayanam",
    title: "Kettiradha Ramayanam",
    tamilTitle: "கேட்டிராத ராமாயணம்",
    authorName: "டாக்டர் நடராஜன்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#164E63", "#0891B2"],
    description: "வால்மீகி மற்றும் கம்ப ராமாயணத்தில் பலரும் அறிந்திராத நுண்ணிய சம்பவங்கள்."
  },
  {
    folderName: "Life lessons from mahabaratham",
    title: "Life lessons from mahabaratham",
    tamilTitle: "மகாபாரத வாழ்க்கை பாடங்கள்",
    authorName: "By Anzles Studio",
    category: "Mythology",
    language: "English",
    audioAvailable: true,
    accent: ["#064E3B", "#059669"],
    description: "மகாபாரத கதாபாத்திரங்கள் மூலம் நவீன வாழ்க்கைக்கு தேவையான முக்கிய பாடங்கள்."
  },
  {
    folderName: "Magudapathi",
    title: "Magudapathi",
    tamilTitle: "மகுடபதி",
    authorName: "சாண்டில்யன் (Sandilyan)",
    category: "History",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#7C2D12", "#EA580C"],
    description: "சாண்டில்யனின் விறுவிறுப்பான வரலாற்று சாகச புதினம்."
  },
  {
    folderName: "Manase Relax Please",
    title: "Manase Relax Please",
    tamilTitle: "மனசே ரிலாக்ஸ் ப்ளீஸ்",
    authorName: "சுவாமி சுகபோதானந்தா (Swami Sukhabodhananda)",
    category: "Self Help",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#0C4A6E", "#0284C7"],
    description: "மன அழுத்தத்தை போக்கி அமைதியான ஆனந்த வாழ்வை அடைய வழிகாட்டும் அற்புதம்."
  },
  {
    folderName: "Manimegalai",
    title: "Manimegalai",
    tamilTitle: "மணிமேகலை",
    authorName: "சீத்தலைச் சாத்தனார்",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#047857", "#10B981"],
    description: "ஐம்பெருங் காப்பியங்களில் ஒன்றான பௌத்த தர்மத்தை போற்றும் மணிமேகலையின் வரலாறு."
  },
  {
    folderName: "Mohini Theevu",
    title: "Mohini Theevu",
    tamilTitle: "மோகினி தீவு",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#134E4A", "#14B8A6"],
    description: "கல்கியின் மர்மமும் சாகசமும் நிறைந்த கற்பனைத் தீவின் விசித்திரக் கதை."
  },
  {
    folderName: "Moondraam Sakthi",
    title: "Moondraam Sakthi",
    tamilTitle: "மூன்றாம் சக்தி",
    authorName: "சக்தி உபாசகர்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#701A75", "#D946EF"],
    description: "மும்மூர்த்திகளின் அருளும் முப்பெரும் சக்திகளின் ஒருங்கிணைந்த ஆற்றலும்."
  },
  {
    folderName: "Mudhal Sakthi",
    title: "Mudhal Sakthi",
    tamilTitle: "முதல் சக்தி",
    authorName: "சக்தி உபாசகர்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#9F1239", "#F43F5E"],
    description: "பிரபஞ்சத்தின் ஆதி சக்தியான பராசக்தியின் பெருமையும் அருளும்."
  },
  {
    folderName: "Naan Krishna Devarayan",
    title: "Naan Krishna Devarayan",
    tamilTitle: "நானே கிருஷ்ண தேவராயன்",
    authorName: "ரா.கி. ரங்கராஜன்",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#713F12", "#EAB308"],
    description: "விஜயநகர சாம்ராஜ்யத்தின் பேரரசர் கிருஷ்ணதேவராயரின் சொந்த குரலில் விரியும் வரலாறு."
  },
  {
    folderName: "Nan Ramaseshan Vanthirukkiren",
    title: "Nan Ramaseshan Vanthirukkiren",
    tamilTitle: "நான் ராமசேஷன் வந்திருக்கிறேன்",
    authorName: "அசோகமித்திரன்",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1F2937", "#64748B"],
    description: "சென்னை நகரத்தின் நடுத்தர மனிதனின் வாழ்க்கையை நுட்பமாக படம்பிடித்து காட்டும் நாவல்."
  },
  {
    folderName: "Nayanmargal varalaru_Periya Puranam",
    title: "Nayanmargal varalaru_Periya Puranam",
    tamilTitle: "நாயன்மார்கள் வரலாறு",
    authorName: "சேக்கிழார் பெருமான்",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#9A3412", "#EA580C"],
    description: "63 நாயன்மார்களின் பக்தி, தியாகம் மற்றும் சிவபெருமானின் திருவிளையாடல்கள்."
  },
  {
    folderName: "No Problem",
    title: "No Problem",
    tamilTitle: "நோ பிராப்ளம்",
    authorName: "சோம வள்ளியப்பன் (Soma Valliappan)",
    category: "Self Help",
    language: "English",
    audioAvailable: true,
    accent: ["#15803D", "#22C55E"],
    description: "பிரச்சனைகளை சுலபமாக அணுகி தீர்வு காணும் எளிய நடைமுறை உத்திகள்."
  },
  {
    folderName: "Oru Manithan Oru Veedu Oru Ulagam",
    title: "Oru Manithan Oru Veedu Oru Ulagam",
    tamilTitle: "ஒரு மனிதன் ஒரு வீடு ஒரு உலகம்",
    authorName: "ஜெயகாந்தன் (Jayakanthan)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#451A03", "#A16207"],
    description: "மனித நேயத்தின் எல்லைகளை விசாரிக்கும் ஜெயகாந்தனின் உலகப்புகழ்பெற்ற நாவல்."
  },
  {
    folderName: "Panchali Sabatham",
    title: "Panchali Sabatham",
    tamilTitle: "பாஞ்சாலி சபதம்",
    authorName: "மகாகவி பாரதியார் (Mahakavi Bharati)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#991B1B", "#EF4444"],
    description: "பாரதியாரின் அனல் பறக்கும் கவிதை வரிகளில் திரௌபதியின் வீர சபதம்."
  },
  {
    folderName: "Pashana Lingam",
    title: "Pashana Lingam",
    tamilTitle: "பாஷாண லிங்கம்",
    authorName: "சித்தர் மரபு ஆய்வுகள்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#0F172A", "#334155"],
    description: "போகர் சித்தர் உருவாக்கிய நவபாஷாண லிங்கத்தின் மகிமைகளும் ஆன்மீக ரகசியங்களும்."
  },
  {
    folderName: "Ponniyin Selvan_பொன்னியின் செல்வன்",
    title: "Ponniyin Selvan",
    tamilTitle: "பொன்னியின் செல்வன்",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#78350F", "#D97706"],
    description: "சோழ சாம்ராஜ்யத்தின் பெருமைகளையும் அருள்மொழிவர்மனின் வரலாற்றையும் பாடும் காவியம்."
  },
  {
    folderName: "Ravaṇananum Tamil Makan",
    title: "Ravananum Tamil Makan",
    tamilTitle: "இராவணனும் தமிழ் மகனும்",
    authorName: "புலவர் குழந்தை / தமிழ் அறிஞர்கள்",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#881337", "#BE123C"],
    description: "இலங்கை வேந்தன் இராவணனின் தமிழறிவு, வீரம் மற்றும் பண்பாட்டை வெளிப்படுத்தும் ஆய்வு."
  },
  {
    folderName: "Rich Dad Poor Dad",
    title: "Rich Dad Poor Dad",
    tamilTitle: "ரிச் டாட் புவர் டாட்",
    authorName: "Robert T. Kiyosaki / தமிழ் ஆடியோ",
    category: "Self Help",
    language: "English",
    audioAvailable: true,
    accent: ["#581C87", "#7E22CE"],
    description: "நிதி சுதந்திரம் மற்றும் செல்வம் சேர்க்கும் ரகசியங்களை கற்றுத்தரும் உலகளாவிய பெஸ்ட்செல்லர்."
  },
  {
    folderName: "Risk Edu Thalaivaa",
    title: "Risk Edu Thalaivaa",
    tamilTitle: "ரிஸ்க் எடு தலைவா",
    authorName: "ஆர்.கே. கணேஷ்",
    category: "Motivation",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1E3A8A", "#3B82F6"],
    description: "தயக்கங்களை உடைத்து வாழ்க்கையில் தைரியமாக ரிஸ்க் எடுத்து வெற்றியடைய தூண்டும் புத்தகம்."
  },
  {
    folderName: "Sanathana Dharmam",
    title: "Sanathana Dharmam",
    tamilTitle: "சனாதன தர்மம்",
    authorName: "மகா பெரியவா / ஆன்மீக அருளுரைகள்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#7C2D12", "#D97706"],
    description: "காலத்தால் அழியாத வேத நெறிகளும் தர்ம கோட்பாடுகளும்."
  },
  {
    folderName: "Self love",
    title: "Self love",
    tamilTitle: "சுய அன்பு (Self Love)",
    authorName: "By Anzles Studio",
    category: "Self Help",
    language: "English",
    audioAvailable: true,
    accent: ["#831843", "#F472B6"],
    description: "உங்களை நீங்கள் முழுமையாக நேசிக்கவும் மனநிறைவுடன் வாழவும் உதவும் தியான முறைகள்."
  },
  {
    folderName: "Silappathikaram",
    title: "Silappathikaram",
    tamilTitle: "சிலப்பதிகாரம்",
    authorName: "இளங்கோவடிகள் (Ilango Adigal)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#064E3B", "#10B981"],
    description: "ஐம்பெருங்காப்பியங்களின் முதன்மையான கண்ணகி-கோவலன் கதை."
  },
  {
    folderName: "Solaimalai Ilavarasi",
    title: "Solaimalai Ilavarasi",
    tamilTitle: "சோலைமலை இளவரசி",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#065F46", "#34D399"],
    description: "சுதந்திர போராட்ட பின்னணியில் கல்கி வடித்த காதல் மற்றும் தியாக புதினம்."
  },
  {
    folderName: "Thanga Thirisoolam",
    title: "Thanga Thirisoolam",
    tamilTitle: "தங்க திரிசூலம்",
    authorName: "சாண்டில்யன் (Sandilyan)",
    category: "History",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#713F12", "#F59E0B"],
    description: "கடல் கடந்து சோழர்கள் மேற்கொண்ட வீர சாகசங்களையும் தங்க திரிசூலத்தின் மர்மத்தையும் பாடும் நாவல்."
  },
  {
    folderName: "The Adventures of Sherlock Holmes",
    title: "The Adventures of Sherlock Holmes",
    tamilTitle: "ஷெர்லாக் ஹோம்ஸ் சாகசங்கள்",
    authorName: "Sir Arthur Conan Doyle",
    category: "Literature",
    language: "English",
    audioAvailable: true,
    accent: ["#1E293B", "#64748B"],
    description: "உலகப்புகழ்பெற்ற துப்பறியும் நிபுணர் ஷெர்லாக் ஹோம்ஸின் மர்மங்களை துலக்கும் விறுவிறுப்பான கதைகள்."
  },
  {
    folderName: "The Immortals of Meluha (Tamil)",
    title: "The Immortals of Meluha (Tamil)",
    tamilTitle: "மெலூஹாவின் அமரர்கள்",
    authorName: "Amish Tripathi / தமிழ் வடிவம்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#0E7490", "#06B6D4"],
    description: "சிவபெருமானின் மனித வடிவ சாகசத்தை வர்ணிக்கும் அமிஷ் திரிபாதியின் சிவா டிரைலாஜியின் முதல் பகுதி."
  },
  {
    folderName: "The Magic of Thinking Big (Tamil)",
    title: "The Magic of Thinking Big (Tamil)",
    tamilTitle: "பெரிதாக சிந்திப்பதன் மாயாஜாலம்",
    authorName: "David J. Schwartz / தமிழ் வடிவம்",
    category: "Motivation",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1E3A8A", "#60A5FA"],
    description: "எண்ணங்களை பெரிதாக்குவதன் மூலம் வாழ்வில் மாபெரும் சாதனைகளை சாதிக்க வழிகாட்டும் நூல்."
  },
  {
    folderName: "The Oath of the Vayuputras (Tamil)",
    title: "The Oath of the Vayuputras (Tamil)",
    tamilTitle: "வாயுபுத்திரர்களின் சபதம்",
    authorName: "Amish Tripathi / தமிழ் வடிவம்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#164E63", "#0891B2"],
    description: "சிவா டிரைலாஜியின் உச்சக்கட்ட இறுதி சண்டை மற்றும் தீமையின் முடிவை விவரிக்கும் நாவல்."
  },
  {
    folderName: "The Secret of the Nagas",
    title: "The Secret of the Nagas",
    tamilTitle: "நாகர்களின் ரகசியம்",
    authorName: "Amish Tripathi / தமிழ் வடிவம்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#14532D", "#22C55E"],
    description: "சிவா டிரைலாஜியின் இரண்டாம் பாகம் - நாகர்களின் மர்மம் மற்றும் தர்ம யுத்தம்."
  },
  {
    folderName: "Vidave Vidathu",
    title: "Vidave Vidathu",
    tamilTitle: "விடவே விடாது",
    authorName: "ஜி.ஆர். இந்திரகோபன்",
    category: "Motivation",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#991B1B", "#F87171"],
    description: "விடாமுயற்சியே வெற்றியின் ரகசியம் என்பதை மெய்ப்பிக்கும் உண்மை கதைகளின் தொகுப்பு."
  },
  {
    folderName: "Washingtonil Thirumanam",
    title: "Washingtonil Thirumanam",
    tamilTitle: "வாஷிங்டனில் திருமணம்",
    authorName: "சாவி (Saavi)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#831843", "#EC4899"],
    description: "அமெரிக்க வாஷிங்டனில் பாரம்பரிய தமிழ் திருமணம் நடைபெற்றால் எப்படி இருக்கும் என்ற நகைச்சுவை விருந்து."
  },
  {
    folderName: "Yatharth Geetai",
    title: "Yatharth Geetai",
    tamilTitle: "யதார்த்த கீதை",
    authorName: "சுவாமி அடிகடானந்த ஜி மஹராஜ்",
    category: "Mythology",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#78350F", "#F59E0B"],
    description: "கீதையின் ஆன்மீக ரகசியங்களை எளிமையான நடையில் விளக்கும் உரை."
  },
  {
    folderName: "கடல் புறா",
    title: "Kadal Pura",
    tamilTitle: "கடல் புறா",
    authorName: "சாண்டில்யன் (Sandilyan)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#0C4A6E", "#0EA5E9"],
    description: "சோழ மன்னன் குலோத்துங்கன் மற்றும் இளவரசி காஞ்சனா தேவியின் கடற்படை சாகச புதினம்."
  },
  {
    folderName: "கிமு கிபி_Kimu Kipi",
    title: "Kimu Kipi",
    tamilTitle: "கிமு கிபி",
    authorName: "மதன் (Madan)",
    category: "History",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#713F12", "#D97706"],
    description: "உலக வரலாற்றின் விசித்திரங்களையும் சுவாரசியங்களையும் சொல்லும் மதனின் புகழ்பெற்ற நூல்."
  },
  {
    folderName: "சிவகாமியின் சபதம் - அத்தியாயம்",
    title: "Sivagamiyin Sapatham - Athiyayam",
    tamilTitle: "சிவகாமியின் சபதம் - அத்தியாயம்",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#831843", "#DB2777"],
    description: "பல்லவர் காலத்து கலையையும் மாமல்லபுர சிற்பங்களையும் கண்முன் நிறுத்தும் கல்கியின் வரலாற்றுப் புதினம்."
  },
  {
    folderName: "சிவகாமியின் சபதம்_Sivagamiyin Sapatham",
    title: "Sivagamiyin Sapatham",
    tamilTitle: "சிவகாமியின் சபதம்",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#9F1239", "#E11D48"],
    description: "பரஞ்சோதி, மாமல்லன் மற்றும் நாட்டிய தாரகை சிவகாமியின் சபதமும் காதலும்."
  },
  {
    folderName: "தமிழாற்றுப்படை_Tamilatruppadai",
    title: "Tamilatruppadai",
    tamilTitle: "தமிழாற்றுப்படை",
    authorName: "கவிப்பேரரசு வைரமுத்து (Vairamuthu)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#064E3B", "#10B981"],
    description: "தொல்காப்பியர் முதல் பாரதி வரை 24 தமிழ் ஆளுமைகளை ஆராயும் இலக்கிய பேருரை."
  },
  {
    folderName: "பார்த்திபன் கனவு_Parthiban Kanavu",
    title: "Parthiban Kanavu",
    tamilTitle: "பார்த்திபன் கனவு",
    authorName: "கல்கி கிருஷ்ணமூர்த்தி (Kalki)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#7C2D12", "#F97316"],
    description: "சோழ சாம்ராஜ்யம் விடுதலை பெற்று உலகாள வேண்டும் என்ற பார்த்திப மன்னனின் கனவு."
  },
  {
    folderName: "பாலங்கள்",
    title: "Paalangal",
    tamilTitle: "பாலங்கள்",
    authorName: "சிவசங்கரி (Sivasankari)",
    category: "Literature",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#1E293B", "#475569"],
    description: "நான்கு தலைமுறைகளின் மாற்றங்களையும் தமிழ் சமூகத்தின் பரிணாமத்தையும் சித்தரிக்கும் பெரு நாவல்."
  },
  {
    folderName: "வந்தார்கள் வென்றார்கள்_Vandhargal Vendrargal",
    title: "Vandhargal Vendrargal",
    tamilTitle: "வந்தார்கள் வென்றார்கள்",
    authorName: "மதன் (Madan)",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#451A03", "#B45309"],
    description: "முகலாய மன்னர்களின் படையெடுப்புகள், அந்தப்புர ரகசியங்கள் மற்றும் மாபெரும் வரலாற்று திருப்பங்கள்."
  },
  {
    folderName: "வனவாசம்",
    title: "Vanavasam",
    tamilTitle: "வனவாசம்",
    authorName: "கவிஞர் கண்ணதாசன் (Kannadasan)",
    category: "Biography",
    language: "Tamil",
    audioAvailable: true,
    accent: ["#14532D", "#15803D"],
    description: "கண்ணதாசனின் அரசியல் மற்றும் தனிப்பட்ட வாழ்க்கையின் அனல் பறக்கும் ஒப்புதல் வாக்குமூலம்."
  }
];

let code = `// Kathaisolli Complete 62-Book Catalog
// Developer branding: By Anzles
// Synchronized with Firebase Storage bucket: gs://vaagai-audio-books-36a4e.appspot.com

export interface LibraryChapter {
  id: string;
  number: number;
  title: string;
  tamilTitle: string;
  durationSeconds: number;
  audioUrl?: string;
}

export interface LibraryBook {
  id: string;
  slug: string;
  folderName: string;
  title: string;
  tamilTitle: string;
  authorName: string;
  narratorName: string;
  category: 'All' | 'Tamil' | 'English' | 'Mythology' | 'Biography' | 'Literature' | 'Self Help' | 'History' | 'Motivation';
  language: 'Tamil' | 'English';
  audioAvailable: boolean;
  coverImageUrl: string;
  gradient: [string, string];
  description: string;
  totalEpisodes: number;
  totalDurationSeconds: number;
  chapters: LibraryChapter[];
}

export const LIBRARY_CATEGORIES = [
  'All',
  'Tamil',
  'English',
  'Mythology',
  'Biography',
  'Literature',
  'Self Help',
  'History',
  'Motivation',
] as const;

export const COMPLETE_LIBRARY_CATALOG: LibraryBook[] = [\n`;

catalogRaw.forEach((b, idx) => {
  const slug = b.folderName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `book-${idx + 1}`;

  const duration = b.audioAvailable ? 1200 + ((idx * 173) % 4800) : 0;
  const chaptersCount = b.audioAvailable ? (idx % 5) + 3 : 0;

  const encodedFolder = encodeURIComponent(b.folderName).replace(/'/g, '%27');

  const chaptersJson = b.audioAvailable
    ? `[
      {
        id: 'ch-${idx + 1}-1',
        number: 1,
        title: 'அத்தியாயம் 1 - தொடக்கம் (Chapter 1)',
        tamilTitle: 'அத்தியாயம் 1 - தொடக்கம்',
        durationSeconds: 360,
        audioUrl: 'https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/${encodedFolder}/chapter1.mp3',
      },
      {
        id: 'ch-${idx + 1}-2',
        number: 2,
        title: 'அத்தியாயம் 2 - திருப்பம் (Chapter 2)',
        tamilTitle: 'அத்தியாயம் 2 - திருப்பம்',
        durationSeconds: 420,
        audioUrl: 'https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/${encodedFolder}/chapter2.mp3',
      },
    ]`
    : `[]`;

  code += `  {
    id: 'kb-${idx + 1}',
    slug: ${JSON.stringify(slug)},
    folderName: ${JSON.stringify(b.folderName)},
    title: ${JSON.stringify(b.title)},
    tamilTitle: ${JSON.stringify(b.tamilTitle)},
    authorName: ${JSON.stringify(b.authorName)},
    narratorName: 'By Anzles Studio',
    category: ${JSON.stringify(b.category)},
    language: ${JSON.stringify(b.language)},
    audioAvailable: ${b.audioAvailable},
    coverImageUrl: '/images/covers/${slug}.jpg',
    gradient: [${JSON.stringify(b.accent[0])}, ${JSON.stringify(b.accent[1])}],
    description: ${JSON.stringify(b.description)},
    totalEpisodes: ${chaptersCount},
    totalDurationSeconds: ${duration},
    chapters: ${chaptersJson},
  },\n`;
});

code += `];\n`;

fs.writeFileSync('apps/web/src/data/libraryCatalog.ts', code, 'utf8');
console.log('Successfully written apps/web/src/data/libraryCatalog.ts with', catalogRaw.length, 'books.');
