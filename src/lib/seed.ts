// src/lib/seed.ts
import db from './db';
import bcrypt from 'bcryptjs';

export async function seedInitialData() {
  // Check admin
  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Poochandi#@2001', 10);
    db.prepare('INSERT OR IGNORE INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(
      'admin-1',
      'admin',
      passwordHash
    );
  }

  // Check default settings
  const defaultSettings: Record<string, string> = {
    site_name: 'Poochandi.in',
    tagline: 'Modern Parenting with Folklore Magic',
    parent_brand: 'Buzz Creations',
    instagram_handle: '@poochandi_ig',
    instagram_url: 'https://instagram.com/poochandi_ig',
    youtube_name: 'Poochandi Varaan',
    youtube_url: 'https://youtube.com/@poochandivaraan',
    whatsapp_number: '+919876543210',
    contact_email: 'hello@poochandi.in',
    adsense_publisher_id: 'ca-pub-0000000000000000',
    google_analytics_id: 'G-XXXXXXXXXX',
    // 4 Featured Instagram Reels
    reel1_id: 'reel-1',
    reel1_title: 'When Kids Refuse to Eat Veggies! 🥦',
    reel1_url: 'https://www.instagram.com/poochandi_ig/reel/sample1/',
    reel1_thumbnail: '/images/reel-thumb-1.svg',
    reel1_desc: 'Poochandi explains why spinach gives superhero powers!',

    reel2_id: 'reel-2',
    reel2_title: 'Say Goodbye to Bedtime Meltdowns 🌙',
    reel2_url: 'https://www.instagram.com/poochandi_ig/reel/sample2/',
    reel2_thumbnail: '/images/reel-thumb-2.svg',
    reel2_desc: 'A calming nighttime story method that puts toddlers to sleep in 15 mins.',

    reel3_id: 'reel-3',
    reel3_title: 'Smart Alternative to Phone Addiction 📱',
    reel3_url: 'https://www.instagram.com/poochandi_ig/reel/sample3/',
    reel3_thumbnail: '/images/reel-thumb-3.svg',
    reel3_desc: '3 easy games that replace screen cravings naturally.',

    reel4_id: 'reel-4',
    reel4_title: 'Teaching Kids to Respect Elders with Love ❤️',
    reel4_url: 'https://www.instagram.com/poochandi_ig/reel/sample4/',
    reel4_thumbnail: '/images/reel-thumb-4.svg',
    reel4_desc: 'Why manners become fun habits when taught with humor.',

    logo_url: '/images/poochandi-logo.svg',
    character_hero_url: '/images/poochandi-hero.svg',
  };

  const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, value);
  }

  // Check articles
  const countArticles = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number }).count;
  if (countArticles === 0) {
    const articles = [
      {
        id: 'art-1',
        slug: '10-positive-parenting-rules-modern-south-indian-families',
        title_en: '10 Positive Parenting Rules for Modern South Indian Families',
        title_ta: 'நவீன தென்னிந்திய குடும்பங்களுக்கான 10 நேர்மறை குழந்தை வளர்ப்பு விதிகள்',
        excerpt_en: 'Replacing fear-based threats with habit tracking, positive reinforcement, rewards and culturally rooted storytelling.',
        excerpt_ta: 'பயமுறுத்தும் முறைகளைத் தவிர்த்து, பழக்கவழக்க கண்காணிப்பு, நேர்மறை ஊக்கம் மற்றும் கதைகள் மூலம் நல்லொழுக்கத்தை வளர்க்கும் எளிய வழிகள்.',
        category: 'Positive Parenting',
        featured_image: '/images/blog-1.svg',
        read_time: '6 min read',
        content_en: `## Transforming Ancient Discipline into Modern Connection

In traditional South Indian households, discipline often came in the form of stern warnings or imaginary bogeymen. While well-intentioned to keep children safe and respectful, child psychology reveals that fear-based discipline induces anxiety rather than intrinsic motivation.

### 1. Replace "Don't" with Clear Action Verbs
Instead of yelling *"Don't drop the food!"*, try *"Please use your spoon carefully, just like a champion."* Children's developing brains process affirmative instructions twice as fast.

### 2. Connect Before You Direct
Before asking your child to put away toys or start homework, spend 60 seconds entering their world. Acknowledge what they are building or drawing. Once connection is established, cooperation follows naturally.

### 3. Use the Power of Cultural Storytelling
Kids resonate deeply with characters like Poochandi who embody curiosity and gentle guidance. Use tales of resilience and kindness during evening conversations rather than lecture sessions.

### 4. Create a Family Gratitude Circle at Dinner
Encourage each family member to share one happy moment from their day. This fosters open communication and emotional security.

### 5. Validate Big Emotions
When a toddler has a tantrum, their nervous system is overwhelmed. Saying *"You are okay, stop crying"* invalidates their stress. Instead, offer a warm hug and say: *"I see that you are upset. I am right here with you."*`,
        content_ta: `## பயமுறுத்தும் முறையிலிருந்து பாசமான வழிநடத்துதலுக்கு மாறுவோம்

முந்தைய காலங்களில் குழந்தைகளை கீழ்ப்படிய வைக்க பயமுறுத்தும் வழிகள் பயன்படுத்தப்பட்டன. ஆனால் நவீன குழந்தை உளவியல், பயத்தை விட அன்பும் புரிதலும் மட்டுமே நீண்டகால நற்பழக்கங்களை உருவாக்கும் என்பதை நிரூபித்துள்ளது.

### 1. செய்யாதே என்று சொல்வதற்கு பதில் என்ன செய்ய வேண்டும் என்று கூறுங்கள்
"உணவைக் கீழே கொட்டாதே!" என்று கோபப்படுவதை விட, "ஸ்பூனை கெட்டியாகப் பிடித்து அழகாகச் சாப்பிடு" என்று நேர்மறையாகக் கூறுங்கள். குழந்தைகளின் மனம் நேர்மறை வாக்கியங்களை எளிதில் புரிந்துகொள்ளும்.

### 2. கட்டளையிடுவதற்கு முன் குழந்தையுடன் இணையுங்கள்
வீட்டுப்பாடம் செய்யச் சொல்வதற்கு முன், அவர்கள் செய்யும் விளையாட்டை ஒரு நிமிடம் கவனித்து பாராட்டுங்கள். அவர்களோடு நீங்கள் இணையும்போது அவர்கள் உங்கள் பேச்சைக் கேட்கத் தொடங்குவார்கள்.

### 3. பண்பாட்டு கதைகளின் மகத்துவம்
பூச்சாண்டி போன்ற பாசமான கதாபாத்திரங்களின் கதைகள் குழந்தைகளின் மனதில் நற்பண்புகளை எளிதாக விதைக்கும். இரவு நேரங்களில் நல்லொழுக்கக் கதைகளைச் சொல்லுங்கள்.

### 4. உணவருந்தும்போது அன்பான உரையாடல்
அனைவரும் ஒன்றாக அமர்ந்து சாப்பிடும்போது அன்றைய நாளின் நல்ல நிகழ்வுகளைப் பகிர்ந்து கொள்ளுங்கள். இது குழந்தைகளுக்குப் பாதுகாப்பான உணர்வைத் தரும்.

### 5. குழந்தைகளின் உணர்வுகளுக்கு மதிப்பளியுங்கள்
குழந்தை அழும்போது "அழக்கூடாது" என்று அதட்டுவதை விட, "உனக்கு வருத்தமாக இருப்பது எனக்குப் புரிகிறது, நான் உன்னுடன் இருக்கிறேன்" என்று அணைத்துக்கொள்ளுங்கள்.`
      },
      {
        id: 'art-2',
        slug: 'how-to-reduce-screen-time-kids-without-tantrums',
        title_en: 'How to Reduce Screen Time for Kids Without Tantrums',
        title_ta: 'அழுகை மற்றும் அடம்பிடித்தல் இல்லாமல் குழந்தைகளின் மொபைல் பயன்பாட்டைக் குறைப்பது எப்படி?',
        excerpt_en: 'Practical alternative activities, traditional indoor games, and setting healthy digital boundaries at home.',
        excerpt_ta: 'குழந்தைகள் அடம்பிடிக்காமல் செல்போனை தவிர்க்கும் நடைமுறை மாற்று வழிகள், பாரம்பரிய விளையாட்டுகள் மற்றும் ஆரோக்கியமான டிஜிட்டல் எல்லைகள்.',
        category: 'Screen Time',
        featured_image: '/images/blog-2.svg',
        read_time: '5 min read',
        content_en: `## The Modern Screen Dilemma in Every Household

Smartphones and tablets have become universal babysitters, but excessive screen exposure leads to sleep disturbances, attention deficits, and emotional dysregulation in early childhood.

### 1. Give 5-Minute and 2-Minute Warnings
Abruptly snatching the device triggers an immediate fight-or-flight tantrum. Prepare the child's brain: *"When this video ends in 3 minutes, we are closing the screen to build Lego towers."*

### 2. Introduce "Boredom Boxes"
Fill a colorful box with crayons, clay, puzzles, and building blocks. When they complain of boredom, let them discover the surprises in the box.

### 3. Establish Screen-Free Zones & Hours
Strictly keep dining tables and bedrooms free of screens. No screens 60 minutes before bedtime to allow melatonin production.

### 4. Be the Role Model
Children copy what they see, not what they are told. If parents are glued to reels during family time, kids naturally demand the same privilege.`,
        content_ta: `## இன்றைய குடும்பங்களின் மிகப்பெரிய சவால்: மொபைல் போன்

ஸ்மார்ட்போன்கள் குழந்தைகளுக்குப் பொழுதுபோக்காக மாறினாலும், அளவுக்கு அதிகமான பயன்பாடு தூக்கமின்மை, கவனக்குறைவு மற்றும் பிடிவாதக் குணத்தை ஏற்படுத்துகிறது.

### 1. திடீரென போனைப் பறிக்காதீர்கள்
திடீரென போனைப் பிடுங்கும்போது குழந்தைகள் ஆக்ரோஷமாக அடம் பிடிப்பார்கள். "இன்னும் இரண்டு நிமிடங்களில் இந்த பாடல் முடிந்ததும் போனை வைத்துவிட்டு நாம் பந்து விளையாடுவோம்" என்று முன்கூட்டியே கூறுங்கள்.

### 2. ஆர்வமூட்டும் விளையாட்டுப் பெட்டி
வர்ண பென்சில்கள், களிமண் (clay), புதிர்கள் (puzzles) அடங்கிய ஒரு பெட்டியை எப்போதும் தயாராக வையுங்கள். போன் கேட்கும்போது இதை அவர்கள் கைகளில் கொடுங்கள்.

### 3. போன் இல்லாத நேரங்களை உருவாக்குங்கள்
சாப்பிடும்போதும், தூங்கச் செல்லும் 1 மணி நேரத்திற்கு முன்பும் வீட்டில் யாருமே செல்போன் பயன்படுத்தக்கூடாது என்ற விதியை உருவாக்குங்கள்.

### 4. பெற்றோரே சிறந்த முன்மாதிரி
நாம் எப்போதும் போனைப் பார்த்துக்கொண்டிருந்தால் குழந்தைகளும் அதையே பின்பற்றுவார்கள். குடும்ப நேரங்களில் நாம் போனை ஒதுக்கி வைப்பதே முதல் வெற்றி.`
      },
      {
        id: 'art-3',
        slug: 'mealtime-made-easy-healthy-eating-hacks-picky-eaters',
        title_en: 'Mealtime Made Easy: Healthy Eating Hacks for Picky Eaters',
        title_ta: 'சாப்பிட அடம் பிடிக்கும் குழந்தைகளுக்கான எளிய மற்றும் ஆரோக்கியமான உணவு பழக்க குறிப்புகள்',
        excerpt_en: 'Making traditional foods appealing using creative character stories and positive mealtime challenges.',
        excerpt_ta: 'பாரம்பரிய சத்தான உணவுகளை சுவாரசியமான கதைகள் மற்றும் வேடிக்கையான வழிகள் மூலம் குழந்தைகளை விரும்பி உண்ண வைப்பது எப்படி?',
        category: 'Food Habits',
        featured_image: '/images/blog-3.svg',
        read_time: '5 min read',
        content_en: `## Transforming Mealtime Battles into Tasty Adventures

Getting toddlers to eat greens, pulses, and traditional home-cooked meals is a daily struggle for millions of mothers. Turning eating into a creative story changes everything.

### 1. The Poochandi Power Veggie Technique
Instead of calling it spinach or greens, present it as *"Super Poochandi Strength Leaves"* that make muscles strong enough to jump across the living room.

### 2. The Rule of Tiny Bites
Never heap a large bowl of unfamiliar food before a hesitant child. Offer one teaspoon size portion alongside their favorite food. Encourage a "brave taster badge".

### 3. Involve Kids in Meal Prep
Children take immense pride in eating food they helped create. Let them wash tomatoes, shell peas, or stir batter safely under supervision.`,
        content_ta: `## உணவருந்தும் நேரத்தை மகிழ்ச்சியான சாகசமாக மாற்றுங்கள்

காய்கறிகள், கீரைகள் மற்றும் பாரம்பரிய உணவுகளை உண்ண வைக்க தாய்மார்கள் படும் பாடு அளப்பரியது. ஆனால் உணவை ஒரு வேடிக்கையான கதையாக மாற்றும்போது குழந்தைகள் ஆர்வமுடன் உண்பார்கள்.

### 1. பூச்சாண்டியின் சத்துக்கதை
கீரையை வெறும் கீரை என்று சொல்லாமல், "இது பூச்சாண்டியின் சூப்பர் சக்தி தரும் இலைகள், இதைச் சாப்பிட்டால் நீ வேகமாக ஓடலாம்" என்று கதையாகச் சொல்லுங்கள்.

### 2. சிறிய அளவில் பழக்கப்படுத்துங்கள்
அதிக அளவு உணவை வைக்காமல், ஒரு ஸ்பூன் அளவு புதிய காய்கறியை வைத்து "இதை சுவைத்துப் பார்க்கும் கெட்டிக்கார குழந்தை யார்?" என்று உற்சாகப்படுத்துங்கள்.

### 3. சமையலில் குழந்தைகளை ஈடுபடுத்துங்கள்
பட்டாணி உரிப்பது, காய்கறிகளைக் கழுவுவது போன்ற எளிய வேலைகளில் குழந்தைகளை ஈடுபடுத்தும்போது, தாங்கள் உருவாக்கிய உணவை அவர்கள் ஆர்வமுடன் உண்பார்கள்.`
      },
      {
        id: 'art-4',
        slug: 'setting-up-peaceful-bedtime-routine-for-toddlers',
        title_en: 'Setting Up a Peaceful Bedtime Routine for Toddlers',
        title_ta: 'குழந்தைகள் குறித்த நேரத்தில் நிம்மதியாக தூங்குவதற்கான எளிய இரவு நேரப் பழக்கங்கள்',
        excerpt_en: 'Nighttime storytelling, digital wind-down habits, and creating a soothing bedtime sanctuary.',
        excerpt_ta: 'இரவு நேரக் கதைகள், மொபைல் அணைக்கும் பழக்கம் மற்றும் குழந்தைகள் தாமாகவே தூங்க உதவும் அமைதியான சூழலை உருவாக்குவது எப்படி?',
        category: 'Bedtime Habits',
        featured_image: '/images/blog-4.svg',
        read_time: '4 min read',
        content_en: `## Why a Consistent Bedtime Predicts Daytime Happiness

A well-rested child is 80% less prone to daytime meltdowns, emotional fragility, and resistance. 

### 1. The 4-Step Bedtime Routine (Bath, Brush, Book, Bed)
Consistency is your superpower. When children know the sequence, their brain naturally shifts into relaxation mode.

### 2. Dim Lights 30 Minutes Before Bed
Bright LED lights mimic sunlight and block sleep hormones. Use warm amber night lamps to signal nighttime.

### 3. Gentle Bedtime Audio / Folklore
A soothing bedtime story about friendly forest guardians like Poochandi visiting in gentle dreams provides psychological comfort and replaces nighttime darkness anxiety.`,
        content_ta: `## சரியான தூக்கமே குழந்தையின் மகிழ்ச்சியான நாளுக்கு அடித்தளம்

இரவில் போதுமான தூக்கம் பெறும் குழந்தைகள் பகல் வேளையில் சுறுசுறுப்பாகவும் அமைதியாகவும் இருப்பார்கள்.

### 1. நிலையான 4 அடுக்கு பழக்கம்
சுடுநீர் குளியல், பல் துலக்குதல், கதை கேட்டல், உறங்குதல் என்ற வரிசையை தினமும் தவறாமல் பின்பற்றுங்கள். இது குழந்தைகளின் மூளைக்கு தூங்கும் நேரத்தை உணர்த்தும்.

### 2. வெளிச்சத்தைக் குறையுங்கள்
பிரகாசமான வெள்ளை விளக்குகளை அணைத்து, மிதமான மஞ்சள் விளக்குகளைப் பயன்படுத்துங்கள். இது இயற்கையான தூக்க ஹார்மோனைத் தூண்டும்.

### 3. இனிமையான பூச்சாண்டி கதைகள்
பயமில்லாத அன்பான பூச்சாண்டி கதைகளைக் கூறி குழந்தைகளைத் தூங்க வைப்பது அவர்களின் பயத்தைப் போக்கி நிம்மதியான தூக்கத்தைத் தரும்.`
      },
      {
        id: 'art-5',
        slug: 'story-of-poochandi-folklore-meets-modern-parenting',
        title_en: 'The Story of Poochandi: Traditional Folklore Meets Modern Parenting',
        title_ta: 'பூச்சாண்டியின் கதை: பாரம்பரிய நம்பிக்கையும் நவீன குழந்தை வளர்ப்பும் இணையும் அற்புதம்',
        excerpt_en: 'How Buzz Creations reimagined an ancient South Indian cultural figure into an uplifting, loving digital companion.',
        excerpt_ta: 'பழைய தலைமுறையின் பயமுறுத்தும் பூச்சாண்டியை, பஸ் கிரியேஷன்ஸ் எவ்வாறு இன்றைய தலைமுறைக்கான அன்பான டிஜிட்டல் வழிகாட்டியாக மாற்றியது?',
        category: 'Cultural Folklore',
        featured_image: '/images/blog-5.svg',
        read_time: '7 min read',
        content_en: `## Rediscovering Our Cultural Roots with Kindness

In Tamil culture, *"Poochandi varaan"* (The Poochandi is coming) has echoed through courtyard verandas and village lanes for centuries. Originally conceived as an eccentric forest dweller who watches over village borders, over decades it was simplified into a scary figure to discipline stubborn kids.

### The Buzz Creations Reimagination
In 2026, Buzz Creations decided to give Poochandi his true magical personality:
- A curious forest friend with glowing eyes and a warm smile.
- A guardian who loves South Indian cuisine, from crispy dosas to drumstick sambar.
- A mentor who cheers when children put their toys away and share with siblings.

### Why Positive Cultural Icons Matter
When children connect with figures from their own culture rather than only foreign superheroes, it anchors their identity and pride. Poochandi is proving that modern parenting and ancient folklore can create magical, empowering childhood memories.`,
        content_ta: `## அன்புடன் மீட்டெடுக்கப்படும் நமது பண்பாட்டு அடையாளம்

தமிழ் சமுதாயத்தில் பல தலைமுறைகளாக "பூச்சாண்டி வருவான்" என்ற சொற்றொடர் புழக்கத்தில் இருந்து வந்துள்ளது. காடுகளில் வாழும் ஒரு விசித்திரமான பாத்திரமாகத் தொடங்கிய இது, காலப்போக்கில் குழந்தைகளைப் பயமுறுத்தும் ஒன்றாக மாறிவிட்டது.

### பஸ் கிரியேஷன்ஸின் புதிய பரிணாமம்
பஸ் கிரியேஷன்ஸ் பூச்சாண்டியை முற்றிலும் புதிய, நேர்மறையான தோழனாக மாற்றியது:
- ஒளிரும் கண்களும் அன்பான புன்னகையும் கொண்ட வன தேவதைத் தோழன்.
- தோசை, முருங்கைக்காய் சாம்பாரை விரும்பி உண்ணும் பண்பாட்டு நண்பன்.
- குழந்தைகள் நல்ல பழக்கங்களைக் கடைப்பிடிக்கும்போது கைதட்டிப் பாராட்டும் ஆசான்.

### நமது பண்பாட்டுக் கதாபாத்திரங்களின் முக்கியத்துவம்
வெளிநாட்டு கதாபாத்திரங்களை மட்டுமே பார்க்கும் நமது குழந்தைகளுக்கு, நமது சொந்த கலாச்சாரத்தில் ஒரு ஹீரோ இருக்கும்போது அவர்களுக்கு தன்னம்பிக்கையும் பெருமிதமும் வளர்கிறது. பூச்சாண்டி இன்று நவீன பெற்றோருக்கு ஒரு உற்ற தோழனாகத் திகழ்கிறார்.`
      }
    ];

    const insertArticle = db.prepare(`
      INSERT INTO articles (id, slug, title_en, title_ta, excerpt_en, excerpt_ta, content_en, content_ta, category, featured_image, read_time, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const a of articles) {
      insertArticle.run(
        a.id,
        a.slug,
        a.title_en,
        a.title_ta,
        a.excerpt_en,
        a.excerpt_ta,
        a.content_en,
        a.content_ta,
        a.category,
        a.featured_image,
        a.read_time
      );
    }
  }

  return { success: true };
}
