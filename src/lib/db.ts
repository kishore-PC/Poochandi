import { createClient, type Client, type InArgs } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function resolveConfig() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (tursoUrl) return { url: tursoUrl, authToken };

  // On Vercel/serverless, a local file DB is not persistent and filesystem writes may fail.
  if (process.env.VERCEL) {
    throw new Error('Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel environment variables.');
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const localUrl = `file:${path.join(dbDir, 'poochandi.db').replace(/\\/g, '/')}`;
  return { url: localUrl, authToken };
}

export function getDb(): Client {
  if (!client) client = createClient(resolveConfig());
  return client;
}

export async function queryAll<T = Record<string, unknown>>(sql: string, args: InArgs = []): Promise<T[]> {
  const r = await getDb().execute({ sql, args });
  return r.rows as unknown as T[];
}

export async function queryOne<T = Record<string, unknown>>(sql: string, args: InArgs = []): Promise<T | undefined> {
  const rows = await queryAll<T>(sql, args);
  return rows[0];
}

export async function execute(sql: string, args: InArgs = []) {
  return getDb().execute({ sql, args });
}

export async function batch(statements: Array<{ sql: string; args?: InArgs }>) {
  return getDb().batch(statements.map((s) => ({ sql: s.sql, args: s.args ?? [] })), 'write');
}

const CORE_ARTICLES: Array<Record<string, string>> = [
  {
    id: 'art-core-001',
    slug: 'essential-parenting-tips-for-toddlers-south-india',
    title_en: 'Essential Parenting Tips for Toddlers in South India',
    title_ta: 'குழந்தை வளர்ப்பு முறைகள்: பெற்றோர் அறிய வேண்டிய வழிகாட்டி',
    excerpt_en: 'Discover effective toddler parenting strategies tailored for South Indian families to foster emotional growth and healthy habits.',
    excerpt_ta: 'தென்னிந்திய குடும்பங்களுக்கு ஏற்ற சிறந்த குழந்தை வளர்ப்பு முறைகள் மற்றும் ஆரோக்கியமான பழக்கவழக்கங்களை உருவாக்கும் எளிய வழிகாட்டி.',
    content_en: `1. Understanding toddler behavior in South Indian households is key to positive child development.\n2. Building a strong bond with your child requires daily undivided attention and active listening.\n3. Encourage cultural storytelling and moral tales to teach core values from a young age.\n4. Positive reinforcement works significantly better than strict punishment when guiding toddlers.\n5. Consistent daily routines for meals and sleep provide emotional security for growing children.\n6. Traditional folk characters like Poochandi can be framed positively to teach safety and habits.\n7. Limit screen exposure by introducing traditional indoor games and creative art activities.\n8. Validate your child’s emotions instead of dismissing their feelings during minor meltdowns.\n9. Lead by example, as children constantly mirror their parents' actions and communication style.\n10. Applying these top parenting tips in Tamil Nadu ensures a balanced and happy childhood.`,
    content_ta: `1. நவீன காலத்தில் சரியான குழந்தை வளர்ப்பு முறைகள் என்பது ஒவ்வொரு பெற்றோருக்கும் மிக முக்கியமான கடமையாகும்.\n2. குழந்தைகளுடன் தினமும் நேரம் செலவிட்டு மனம் விட்டுப் பேசுவது அவர்களின் நேர்மறை சிந்தனையை அதிகரிக்கும்.\n3. நற்பண்புகளையும் ஒழுக்கத்தையும் கற்பிக்க கதைகள் மற்றும் பாரம்பரிய முறைகளைப் பயன்படுத்தலாம்.\n4. தவறு செய்யும் போது கண்டிப்பதை விட, நல்ல செயல்களைப் பாராட்டுவது குழந்தை மனவளர்ச்சிக்கு நல்லது.\n5. ஆரோக்கியமான உணவு மற்றும் சரியான தூக்க நேரத்தைப் பராமரிப்பது குழந்தையின் உணர்ச்சிப் பாதுகாப்பை உறுதி செய்யும்.\n6. பூச்சாண்டி கதைகள் போன்ற பாரம்பரிய கற்பனைகள் மூலம் குழந்தைகளுக்கு நற்பண்புகளையும் பாதுகாப்பையும் உணர்த்தலாம்.\n7. மொபைல் திரைகளுக்குப் பதிலாக ஓவியம் வரைதல் மற்றும் உள்அரங்கு விளையாட்டுகளில் அவர்களை ஈடுபடுத்துங்கள்.\n8. குழந்தைகள் தங்களின் கோபத்தையோ வருத்தத்தையோ வெளிப்படுத்தும்போது அவர்களின் உணர்வுகளுக்கு மதிப்பளியுங்கள்.\n9. பெற்றோர் தங்களின் அன்றாட நடத்தையின் மூலமே குழந்தைகளுக்கு முதல் முன்மாதிரியாகத் திகழ்கிறார்கள்.\n10. இத்தகைய எளிய முறைகளைப் பின்பற்றி உங்கள் குழந்தையை மனதளவிலும் உடலளவிலும் திறம்பட வளர்த்தெடுங்கள்.`,
    category: 'Positive Parenting',
    seo_keywords: 'Best parenting tips for toddlers in Tamil Nadu, குழந்தை வளர்ப்பு முறைகள்',
    read_time: '5 min read',
  },
  {
    id: 'art-core-002', slug: 'reduce-screen-time-smartphone-addiction-kids',
    title_en: 'How to Reduce Screen Time & Smartphone Addiction in Kids',
    title_ta: 'குழந்தைகளிடம் செல்போன் அடிமைத்தனத்தை தடுப்பது எப்படி?',
    excerpt_en: 'Practical parenting tips to limit kids screen time, stop mobile phone addiction, and encourage outdoor play.',
    excerpt_ta: 'குழந்தைகள் திரை நேரம் மற்றும் செல்போன் பயன்பாட்டைக் குறைத்து சுறுசுறுப்பாக மாற்றும் சிறந்த வழிகள்.',
    content_en: `1. Excessive screen time for kids is one of the biggest challenges for modern parents today.\n2. Overuse of smartphones leads to reduced attention span, eye strain, and behavioral irritability.\n3. Avoid using mobile screens as a distraction or bribe during meal times for toddlers.\n4. Replace tablet time with hands-on activities like drawing, puzzles, and outdoor playground trips.\n5. Establish strict digital-free zones in your home, especially in bedrooms and dining areas.\n6. Switch off all digital devices at least one hour before bedtime to improve natural sleep quality.\n7. Engage kids with immersive audio stories and traditional narratives to spark imagination without screens.\n8. Poochandi Varaan storytelling audio content offers an engaging, screen-free entertainment alternative.\n9. Be a digital role model by managing your own smartphone consumption around young children.\n10. Implementing a balanced kids screen time control plan ensures better mental and physical health.`,
    content_ta: `1. இன்றைய டிஜிட்டல் சூழலில் குழந்தைகள் செல்போன் பயன்பாடு பெற்றோருக்குப் பெரும் சவாலாக மாறியுள்ளது.\n2. அதிகப்படியான திரை நேரம் (Screen Time) கவனச்சிதறல் மற்றும் கண் பார்வைப் பிரச்சனைகளுக்குக் காரணமாகிறது.\n3. உணவளிக்கும் போது குழந்தைகளிடம் செல்போன் கொடுக்கும் பழக்கத்தை பெற்றோர் தவிர்க்க வேண்டும்.\n4. போனுக்குப் பதிலாக ஓவியம் வரைதல் மற்றும் வெளிப்புற விளையாட்டுகளில் அவர்களை ஈடுபடுத்துங்கள்.\n5. வீட்டில் உணவருந்தும் இடம் மற்றும் படுக்கையறைகளில் செல்போன் பயன்பாட்டைக் கட்டுப்படுத்துங்கள்.\n6. இரவில் தூங்குவதற்கு ஒரு மணி நேரத்திற்கு முன்பே வீட்டில் உள்ள டிஜிட்டல் திரைகளை அணைத்துவிடுங்கள்.\n7. ஆடியோ கதைகள் மற்றும் கற்பனை வடிவங்கள் மூலம் குழந்தைகளின் கவனத்தை திரைகளில் இருந்து திருப்பலாம்.\n8. பூச்சாண்டி வரான் வழங்கும் கதை வடிவங்கள் திரை இல்லாத நல்ல பொழுதுபோக்கைத் தருகின்றன.\n9. பெற்றோர் தங்கள் ஓய்வு நேரத்தில் குழந்தைகள் முன் அதிகம் செல்போன் பயன்படுத்துவதைக் குறைக்க வேண்டும்.\n10. இந்த எளிய வழிகளைப் பின்பற்றி உங்கள் குழந்தைகளை செல்போன் அடிமைத்தனத்தில் இருந்து மீட்கலாம்.`,
    category: 'Screen Time', seo_keywords: 'How to reduce screen time for kids, குழந்தைகள் செல்போன் அடிமைத்தனம்', read_time: '5 min read',
  },
  {
    id: 'art-core-003', slug: 'stop-child-temper-tantrums-stubbornness',
    title_en: '5 Effective Ways to Stop Child Temper Tantrums & Stubbornness',
    title_ta: 'குழந்தைகள் அடம்பிடிப்பதை தடுத்து நல்வழிப்படுத்த 5 வழிகள்',
    excerpt_en: 'Learn gentle discipline strategies to handle child temper tantrums and stubborn toddler behavior without yelling.',
    excerpt_ta: 'கோபப்படும் மற்றும் அடம்பிடிக்கும் குழந்தைகளை சாதுரியமாகக் கையாளுவதற்கான பேரண்டிங் உத்திகள்.',
    content_en: `1. Dealing with toddler temper tantrums requires immense patience and calm parental responses.\n2. Tantrums are often a child’s way of expressing frustration when they lack vocabulary.\n3. Stay composed and avoid yelling back, as aggressive reactions escalate emotional meltdowns.\n4. If a tantrum occurs in public, gently move your child to a quieter space until they calm down.\n5. Offer limited choices (e.g., "Red shirt or Blue shirt?") to give toddlers a healthy sense of control.\n6. Praise calm behavior immediately after the emotional episode subsides to reinforce positivity.\n7. Storytelling using relatable characters can teach children how to handle anger constructively.\n8. Identify underlying triggers like hunger, exhaustion, or overstimulation before reacting.\n9. Maintain consistent boundaries so children understand what behavior is acceptable.\n10. Mastering child temper tantrum management creates a peaceful home environment.`,
    content_ta: `1. குழந்தைகள் தங்களின் தேவைகளை வெளிப்படுத்த பெரும்பாலும் அடம்பிடிக்கும் பழக்கம் கொள்கிறார்கள்.\n2. குழந்தை அடம்பிடிக்கும் போது பெற்றோர் அமைதியாகவும் நிதானமாகவும் செயல்படுவது மிக அவசியம்.\n3. குழந்தைகள் அழும் போது உடனடி எதிர்வினை ஆற்றாமல், அவர்கள் அமைதியான பிறகு அன்பாகப் பேசுங்கள்.\n4. பொது இடங்களில் அடம்பிடித்தால் கோபப்படாமல் தனிமையான இடத்திற்கு அழைத்துச் சென்று பேசுங்கள்.\n5. குழந்தைக்கு இரண்டு எளிய தேர்வுகளைத் தருவது அவர்களின் பிடிவாதத்தைக் குறைக்க உதவும்.\n6. நல்ல பழக்கவழக்கங்களைச் செய்யும்போது சிறிய பாராட்டுக்கள் மூலம் அவர்களை ஊக்கப்படுத்துங்கள்.\n7. கதைகள் மற்றும் கதாபாத்திரங்கள் மூலம் கோபத்தைக் கட்டுப்படுத்தும் முறைகளை அவர்களுக்குக் கற்பிக்கலாம்.\n8. குழந்தைகளின் பிடிவாதத்திற்குப் பின்னால் இருக்கும் பசி அல்லது சோர்வு போன்ற காரணங்களை அறியுங்கள்.\n9. பெற்றோரின் கண்டிப்பில் எப்போதும் ஒரு சீரான தன்மை இருக்க வேண்டியது அவசியமாகும்.\n10. இத்தகைய பேரண்டிங் உத்திகள் மூலம் பிடிவாதக் குழந்தைகளையும் எளிதில் நல்வழிப்படுத்த முடியும்.`,
    category: 'Positive Parenting', seo_keywords: 'How to stop child temper tantrums, குழந்தைகள் அடம்பிடிப்பதை தடுக்க', read_time: '5 min read',
  },
  {
    id: 'art-core-004', slug: 'overcoming-childhood-fear-darkness-monsters',
    title_en: 'Overcoming Childhood Fear of Darkness & Monsters',
    title_ta: 'குழந்தைகளின் மனதில் உள்ள பயத்தை போக்கி தைரியத்தை வளர்ப்பது எப்படி?',
    excerpt_en: 'Proven steps for parents to address night fears, darkness phobia, and imaginary monster fears in young kids.',
    excerpt_ta: 'இருட்டு மற்றும் கற்பனை பயம் கொண்ட குழந்தைகளின் பயத்தைப் போக்கி தைரியத்தை அதிகரிக்கும் வழிகாட்டி.',
    content_en: `1. Childhood fear of darkness and imaginary characters is a normal stage of cognitive growth.\n2. Never shame or mock a child for feeling scared of shadows or night monsters.\n3. Reassure them with warmth and physical presence to build a strong sense of security.\n4. Reframe traditional scary concepts like Poochandi into friendly protectors who watch over them.\n5. Use soft night lamps and comforting bedtime rituals to ease anxiety before sleeping.\n6. Avoid exposing young children to horror movies, scary videos, or unsettling news clips.\n7. Celebrate small acts of bravery when your child confronts a mild fear independently.\n8. Read uplifting stories where main characters overcome obstacles with courage and humor.\n9. Encourage your child to draw their fears on paper and then throw the paper away symbolically.\n10. These child anxiety control techniques help your child grow into a confident individual.`,
    content_ta: `1. சிறு வயதில் குழந்தைகள் பயம் கொள்வது இயற்கையான ஒரு மன உணர்வாகும்.\n2. இருட்டு அல்லது கற்பனை உருவங்களைக் கண்டு குழந்தைகள் பயப்படும் போது அவர்களைக் கேலி செய்யாதீர்கள்.\n3. "நான் உன்னுடன் இருக்கிறேன்" என்ற நம்பிக்கையையும் பாதுகாப்பு உணர்வையும் அவர்களுக்குத் தாருங்கள்.\n4. பூச்சாண்டி போன்ற கதாபாத்திரங்கள் பயமுறுத்துவதற்காக அல்ல, பாதுகாப்பிற்கானவை என கதைகள் மூலம் புரியவையுங்கள்.\n5. இரவில் படுக்கும் போது லேசான வெளிச்சம் தரும் Night Lamp-களைப் பயன்படுத்துவது பயத்தைக் குறைக்கும்.\n6. பயமுறுத்தும் டிவி நிகழ்ச்சிகள் மற்றும் ஆபத்தான வீடியோக்களை குழந்தைகள் பார்ப்பதைத் தவிருங்கள்.\n7. குழந்தைகளின் தைரியமான செயல்களைப் பாராட்டி, அவர்களின் மன உறுதியை உயர்த்துங்கள்.\n8. படுக்கும் முன் நேர்மறையான, வேடிக்கையான கதைகளைக் கூறி தூங்க வைப்பது மன அமைதியைத் தரும்.\n9. உங்கள் குழந்தையின் பயத்தைப் புரிந்து கொண்டு அன்பாக அரவணைப்பதே சிறந்த தீர்வாகும்.\n10. இந்த எளிய முறைகள் குழந்தைகளின் மனதில் உள்ள பயத்தைப் போக்க பெரிதும் உதவும்.`,
    category: 'Bedtime Habits', seo_keywords: 'Overcoming childhood fears dark and ghosts, குழந்தைகளின் பயம் போக்க', read_time: '5 min read',
  },
  {
    id: 'art-core-005', slug: 'mealtime-hacks-picky-fussy-toddlers',
    title_en: 'Mealtime Hacks for Picky & Fussy Toddlers',
    title_ta: 'உணவு உண்ண அடம்பிடிக்கும் குழந்தைகளுக்கு உணவளிக்கும் எளிய உத்திகள்',
    excerpt_en: 'Simple nutrition tips to handle fussy eaters and turn stressful mealtimes into fun experiences for toddlers.',
    excerpt_ta: 'காய்கறிகள் மற்றும் உணவைச் சாப்பிட மறுக்கும் குழந்தைகளுக்கு ஆரோக்கியமாக உணவளிக்கும் தமிழ் வழிகாட்டி.',
    content_en: `1. Handling picky eating toddlers requires creativity rather than forceful feeding.\n2. Avoid relying on smartphone videos to distract kids while feeding them their meals.\n3. Present healthy food visually with bright colors, fun shapes, and engaging platter arrangements.\n4. Encourage family meals where everyone eats the same food together at the dining table.\n5. Never force-feed; let your child decide their fullness level to develop intuitive eating.\n6. Use playful stories about superhero foods to inspire interest in vegetables and fruits.\n7. Poochandi Varaan stories can turn healthy eating habits into a fun and adventurous quest.\n8. Limit sugary snacks and junk foods between major meals to preserve natural appetite.\n9. Involve young kids in basic meal prep like washing fruit to build excitement around food.\n10. Effective toddler feeding strategies build lifelong healthy eating habits for your child.`,
    content_ta: `1. பல வீடுகளில் குழந்தைகள் உணவு சாப்பிட மறுப்பது பெற்றோருக்குப் பெரும் கவலையாக உள்ளது.\n2. உணவளிக்கும் போது மொபைல் போன் அல்லது டிவியைப் பயன்படுத்துவது ஆரோக்கியமான பழக்கம் அல்ல.\n3. உணவைக் வண்ணமயமாகவும், சுவாரஸ்யமான வடிவங்களிலும் சமைத்துக்கொடுப்பது பசியைத் தூண்டும்.\n4. குடும்பத்தினர் அனைவரும் ஒன்றாக அமர்ந்து சாப்பிடும் பழக்கத்தை உருவாக்க வேண்டும்.\n5. குழந்தைகள் மீது உணவைக் கட்டாயப்படுத்தித் திணிக்காமல், பசி எடுக்கும் போது சாப்பிட விடுங்கள்.\n6. காய்கறிகள் மற்றும் பழங்களின் நன்மைகளைக் கதைகள் மூலம் குழந்தைகளுக்கு சுவாரஸ்யமாகக் கூறுங்கள்.\n7. பூச்சாண்டி வரான் சிறப்பு கதைகள் மூலம் சாப்பிடும் பழக்கத்தை ஒரு ஜாலியான அனுபவமாக மாற்றலாம்.\n8. நொறுக்குத் தீனிகளையும் ஜங்க் உணவுகளையும் குறைத்து, சத்துள்ள வீட்டு உணவுகளைப் பழக்குங்கள்.\n9. உணவை ரசித்துச் சாப்பிடும் சூழலை வீட்டில் எப்போதும் பராமரியுங்கள்.\n10. இந்த பேரண்டிங் முறைகள் குழந்தைகளுக்கு ஆரோக்கியமான உணவுப் பழக்கத்தை உருவாக்க உதவும்.`,
    category: 'Food Habits', seo_keywords: 'Healthy eating habits for fussy toddlers, குழந்தை உணவு சாப்பிட வழிகள்', read_time: '5 min read',
  },
  {
    id: 'art-core-006', slug: 'positive-parenting-discipline-without-scolding',
    title_en: 'Positive Parenting Guide: Discipline Without Scolding or Hitting',
    title_ta: 'நேர்மறை வளர்ப்பு முறை: குழந்தையின் எதிர்காலத்தை மாற்றும் ரகசியம்',
    excerpt_en: 'Discover gentle parenting and positive discipline techniques for Indian parents to raise confident kids.',
    excerpt_ta: 'அடித்தல் மற்றும் திட்டுதல் இன்றி குழந்தைகளை அன்பால் வளர்க்கும் நேர்மறை பேரண்டிங் உத்திகள்.',
    content_en: `1. Positive parenting in India focuses on guiding children through empathy and mutual respect.\n2. Physical punishment and harsh yelling cause long-term emotional distress and rebellion.\n3. Set clear, age-appropriate rules and explain the reasons behind them patiently.\n4. Respect your child's opinions and allow them age-appropriate choices daily.\n5. Stop comparing your child with peers or siblings; nurture their unique individuality.\n6. Maintain a calm and supportive home environment where mistakes are viewed as learning tools.\n7. Incorporate moral storytelling and relatable characters to instill discipline naturally.\n8. Acknowledge and appreciate good behavior immediately with genuine praise.\n9. Emotional regulation starts with parents remaining calm during challenging moments.\n10. Following gentle discipline principles strengthens parent-child relationships significantly.`,
    content_ta: `1. நேர்மறை வளர்ப்பு முறை என்பது குழந்தைகளை அன்பாலும் புரிதலாலும் வழிநடத்துவதாகும்.\n2. தவறு செய்யும் குழந்தைகளை அடிப்பது அல்லது திட்டுவது அவர்களின் மனநிலையைப் பாதிக்கும்.\n3. அன்பான கண்டிப்பும் தெளிவான வழிகாட்டலுமே குழந்தையின் நற்பண்புகளுக்கு அடிப்படையாகும்.\n4. அவர்களின் கருத்துக்களுக்கு மதிப்பளித்து, சுய முடிவுகளை எடுக்க வாய்ப்பளிக்க வேண்டும்.\n5. பிற குழந்தைகளுடன் ஒப்பிடுவதைத் தவிர்த்து, உங்கள் குழந்தையின் தனித்துவத்தை அங்கீகரியுங்கள்.\n6. வீட்டில் மகிழ்ச்சியான மற்றும் நேர்மறையான சூழலை உருவாக்குவது பெற்றோர் பொறுப்பாகும்.\n7. நல்ல ஒழுக்கக் கதைகள் மற்றும் கற்பனை கதாபாத்திரங்கள் மூலம் நற்பண்புகளை ஆழமாகப் பதிய வைக்கலாம்.\n8. குழந்தைகள் செய்யும் சிறு சாதனைகளையும் பாராட்டி ஊக்கப்படுத்துங்கள்.\n9. பெற்றோரின் பொறுமையும் அன்பும்தான் நேர்மறை வளர்ப்பின் மிக முக்கியமான தூண்கள்.\n10. இந்த எளிய முறையால் உங்கள் குழந்தையின் எதிர்காலம் சிறப்பாகவும் தைரியமாகவும் அமையும்.`,
    category: 'Positive Parenting', seo_keywords: 'Positive parenting tips for Indian parents, நேர்மறை வளர்ப்பு முறை', read_time: '5 min read',
  },
  {
    id: 'art-core-007', slug: 'healthy-bedtime-sleep-routine-kids',
    title_en: 'Healthy Bedtime Sleep Routine for Kids & Toddlers',
    title_ta: 'குழந்தைகள் ஆரோக்கியமாக தூங்குவதற்கான Bedtime Routine வழிகாட்டி',
    excerpt_en: 'Simple night routine habits to help toddlers fall asleep faster without screen distraction or night fear.',
    excerpt_ta: 'இரவில் தாமதமாகத் தூங்கும் குழந்தைகளுக்கான சீரான தூக்க நேர பேரண்டிங் குறிப்புகள்.',
    content_en: `1. A consistent kids bedtime sleep routine is vital for brain growth and physical health.\n2. Fix a fixed sleep schedule every night, even on weekends, to regulate your child’s body clock.\n3. Bedtime stories help quiet a busy mind and promote deep, restorative sleep.\n4. Ensure the bedroom environment is quiet, cool, and comfortably dim.\n5. Avoid giving sugary drinks or caffeinated treats near bedtime.\n6. Encourage physical outdoor play in the evening so kids naturally feel tired at night.\n7. Poochandi Varaan bedtime audio stories comfort kids and eliminate fear of the dark.\n8. Turn off television screens and smartphones at least one hour before bed.\n9. Children with healthy sleep habits show improved daytime focus and mood stability.\n10. Establishing a reliable child sleep schedule improves overall family well-being.`,
    content_ta: `1. குழந்தைகளின் மூளை வளர்ச்சிக்கும் உடல் ஆரோக்கியத்திற்கும் சரியான தூக்க நேர பராமரிப்பு அவசியம்.\n2. தினமும் குறிப்பிட்ட நேரத்தில் குழந்தைகளைத் தூங்க வைக்கும் பழக்கத்தை உருவாக்க வேண்டும்.\n3. படுக்கும் முன் கதைகள் கேட்பது அவர்களின் மனதை அமைதிப்படுத்தி ஆழ்ந்த தூக்கத்தைத் தரும்.\n4. தூங்கும் அறை அமைதியாகவும், மிதமான வெளிச்சம் கொண்டதாகவும் இருக்க வேண்டும்.\n5. படுக்கும் முன் இனிப்பான உணவுகள் அல்லது நொறுக்குத் தீனிகளைக் கொடுப்பதைத் தவிருங்கள்.\n6. மாலையில் உடற்பயிற்சி அல்லது விளையாட்டுகளில் ஈடுபடுவது இரவில் நல்ல தூக்கத்தைத் தரும்.\n7. பூச்சாண்டி வரான் பிரத்யேக தூக்க நேரக் கதைகள் குழந்தைகள் பயமின்றி தூங்க உதவும்.\n8. தூங்குவதற்கு 1 மணி நேரத்திற்கு முன்பே மொபைல் மற்றும் டிவி திரைகளை அணைத்துவிட வேண்டும்.\n9. சீரான தூக்க பழக்கம் உள்ள குழந்தைகள் பகலில் அதிக கவனத்துடனும் சுறுசுறுப்பாகவும் இருப்பார்கள்.\n10. இத்தகைய தூக்க முறைகள் உங்கள் குழந்தையின் உடல் மற்றும் மன ஆரோக்கியத்தை மேம்படுத்தும்.`,
    category: 'Bedtime Habits', seo_keywords: 'Best bedtime sleep routine for kids, குழந்தைகளின் தூக்க பிரச்சனைகள்', read_time: '5 min read',
  },
  {
    id: 'art-core-008', slug: 'build-self-confidence-courage-shy-kids',
    title_en: 'How to Build Self-Confidence & Courage in Shy Kids',
    title_ta: 'குழந்தைகளிடம் தன்னம்பிக்கையை வளர்க்கும் எளிய வழிகள்',
    excerpt_en: 'Step-by-step parenting techniques to boost self-esteem and independence in shy or hesitant children.',
    excerpt_ta: 'தாழ்வு மனப்பான்மை இன்றி குழந்தைகள் தைரியமாக வளர உதவும் தன்னம்பிக்கை வழிகாட்டி.',
    content_en: `1. Building self-confidence in children empowers them to navigate life's challenges courageously.\n2. Give toddlers small responsibilities at home, such as putting away their toys after play.\n3. Frame mistakes as positive learning opportunities rather than unacceptable failures.\n4. Avoid labeling your child as "shy" or "introverted" in front of relatives or friends.\n5. Encourage participation in sports, creative arts, and group storytelling sessions.\n6. Support their unique interests without forcing your personal ambitions onto them.\n7. Share inspirational tales of characters who turn their flaws into strengths.\n8. Teach kids simple self-help skills so they feel independent and capable.\n9. Your positive words and encouragement serve as the foundation of their self-worth.\n10. Applying child confidence building tips helps raise resilient and bold individuals.`,
    content_ta: `1. வெற்றிகரமான எதிர்காலத்திற்கு குழந்தைகளின் தன்னம்பிக்கை மிகவும் அவசியமான ஒன்றாகும்.\n2. குழந்தைகள் சுய முடிவுகளை எடுக்க சிறிய வாய்ப்புகளை பெற்றோர் வழங்க வேண்டும்.\n3. தோல்விகளைக் கண்டு அஞ்சாமல், மீண்டும் முயற்சி செய்ய அவர்களுக்குத் தைரியம் அளிப்பது முக்கியம்.\n4. பிற குழந்தைகளுடன் உங்கள் குழந்தையை ஒப்பிட்டுப் பேசுவதை முற்றிலுமாகத் தவிர்க்க வேண்டும்.\n5. அவர்களின் திறமைகளைக் கண்டறிந்து அதை வளர்க்கத் தேவையான ஆதரவை வழங்குங்கள்.\n6. விளையாட்டு, கலை நிகழ்ச்சிகள் மற்றும் பேச்சுப் போட்டிகளில் பங்கேற்க ஊக்குவியுங்கள்.\n7. பூச்சாண்டி வரான் வழங்கும் தன்னம்பிக்கை கதைகள் அவர்களின் மன தைரியத்தை உயர்த்தும்.\n8. தவறு செய்வது இயல்பானது என்பதையும், தவறுகளில் இருந்து கற்றுக்கொள்வதையும் புரியவையுங்கள்.\n9. பெற்றோர் வழங்கும் நேர்மறையான வார்த்தைகளே குழந்தையின் மிகப்பெரிய பலமாகும்.\n10. இந்த பேரண்டிங் உத்திகள் மூலம் குழந்தையின் ஆளுமையைச் சிறப்பாக உருவாக்கலாம்.`,
    category: 'Positive Parenting', seo_keywords: 'How to build confidence in shy children, குழந்தைகளின் தன்னம்பிக்கை வளர்க்க', read_time: '5 min read',
  },
  {
    id: 'art-core-009', slug: 'improve-study-focus-concentration-children',
    title_en: 'How to Improve Study Focus & Concentration in Children',
    title_ta: 'கவனச்சிதறல் உள்ள குழந்தைகளை படிப்பில் கவனம் செலுத்த வைப்பது எப்படி?',
    excerpt_en: 'Easy tips for parents to improve study concentration, overcome attention drift, and boost memory in kids.',
    excerpt_ta: 'படிப்பில் கவனமின்மை கொண்ட குழந்தைகளுக்கான நினைவாற்றல் மற்றும் கவனச்சிதறல் மேலாண்மை குறிப்புகள்.',
    content_en: `1. Addressing lack of concentration in kids requires structured study habits and environmental control.\n2. Break long homework tasks into smaller, manageable 20-minute sessions.\n3. Remove distracting items like toys, mobile phones, and television noise from the study area.\n4. Introduce memory games and puzzles to sharpen cognitive focus and analytical thinking.\n5. Ensure proper lighting and comfortable seating to maintain alertness during reading time.\n6. Incorporate short 5-minute break intervals to keep their minds fresh and engaged.\n7. Use visual aids and interactive stories to make academic concepts interesting.\n8. Provide balanced nutrition rich in brain-boosting foods and ensure adequate sleep daily.\n9. Celebrate effort and consistency rather than focusing solely on exam marks.\n10. Utilizing child study focus techniques leads to significant academic improvement.`,
    content_ta: `1. இன்றைய குழந்தைகளிடம் கவனச்சிதறல் என்பது பெரும் சவாலாக உருவெடுத்துள்ளது.\n2. ஒரே நேரத்தில் அதிக பாடங்களைத் தராமல், சிறு சிறு பகுதிகளாகப் படிக்க வைக்க வேண்டும்.\n3. படிக்கும் இடத்தில் பொம்மைகள், செல்போன் மற்றும் டிவி போன்ற கவனச்சிதறல்களை அகற்ற வேண்டும்.\n4. நினைவாற்றலை அதிகரிக்கும் புதிர் விளையாட்டுகள் மற்றும் வினாடி வினாக்களைப் பழக்குங்கள்.\n5. அமைதியான மற்றும் காற்றோட்டமான படிக்கும் சூழலை வீட்டில் ஏற்படுத்தித் தாருங்கள்.\n6. 20 நிமிடங்கள் படித்த பிறகு 5 நிமிடங்கள் இடைவெளி அளிப்பது கவனத்தை அதிகரிக்கும்.\n7. சுவாரஸ்யமான கதைகள் மற்றும் எடுத்துக்காட்டுகள் மூலம் பாடங்களைச் சொல்லிக்கொடுங்கள்.\n8. சத்தான உணவு மற்றும் போதுமான தூக்கம் கவனச் செறிவுக்கு மிக அத்தியாவசியமாகும்.\n9. அவர்களின் குழந்தைப் பருவ முயற்சியைப் பாராட்டி ஊக்கப்படுத்துவது சிறந்தது.\n10. இந்த எளிய வழிகள் மூலம் அவர்களின் கல்வித் திறனையும் கவனத்தையும் மேம்படுத்தலாம்.`,
    category: 'Positive Parenting', seo_keywords: 'Improving concentration in study for kids, குழந்தைகளின் கவனச்சிதறல் மாற', read_time: '5 min read',
  },
  {
    id: 'art-core-010', slug: 'gentle-discipline-self-control-toddlers',
    title_en: 'Gentle Discipline Methods: Teaching Self-Control to Toddlers',
    title_ta: 'குழந்தைகளுக்கு சுய கட்டுப்பாடு மற்றும் ஒழுக்கம் கற்பிக்கும் முறைகள்',
    excerpt_en: 'Learn gentle parenting strategies to teach kids self-control, discipline, and emotional balance without fear.',
    excerpt_ta: 'கோபம் மற்றும் பிடிவாதத்தைக் குறைத்து குழந்தைகளுக்கு ஒழுக்கத்தைக் கற்றுக்கொடுக்கும் சாதுரியமான முறைகள்.',
    content_en: `1. Teaching self-control to toddlers is about guidance and education, not fear or force.\n2. Clearly define house rules and consistently follow through with calm boundaries.\n3. Help young kids identify their emotions like anger, envy, or fatigue by naming them.\n4. Teach sharing and empathy through interactive stories and group play activities.\n5. Allow natural consequences to happen safely so children understand cause and effect.\n6. Model self-discipline in your daily actions, as kids mirror parental emotional balance.\n7. Use engaging audio stories to explain moral values and respectful behaviors naturally.\n8. Encourage kids to take deep breaths when they feel overwhelmed or angry.\n9. Praise moments of patient waiting and self-restraint to reinforce good habits.\n10. Practicing gentle child discipline fosters emotionally resilient and well-behaved children.`,
    content_ta: `1. சிறு வயதிலேயே குழந்தைகளுக்கான சுய கட்டுப்பாடு கற்பிப்பது மிக முக்கியமான ஒன்றாகும்.\n2. ஒழுக்கம் என்பது பயமுறுத்துவது அல்ல, அது சரியான பாதையைக் காட்டுவதாகும்.\n3. வீட்டின் விதிகளையும் எல்லைகளையும் குழந்தைகளுக்கு அன்பாகவும் தெளிவாகவும் புரியவையுங்கள்.\n4. குழந்தைகள் கோபப்படும் போது, அவர்களின் உணர்வுகளைப் புரிந்து கொண்டு அமைதிப்படுத்துங்கள்.\n5. பொருள்களைப் பகிர்ந்து கொள்ளுதல் மற்றும் பிறருக்கு உதவும் நற்பண்புகளைக் கற்றுக்கொடுங்கள்.\n6. தவறு செய்தால் அதற்கான விளைவுகளை அன்பாகப் புரிய வைக்க வேண்டும்.\n7. பூச்சாண்டி கதைகள் போன்ற கருத்துள்ள கதைகள் ஒழுக்கமான நடத்தையை ஆழமாகப் பதிய வைக்கும்.\n8. பெற்றோர் தங்களின் சுய கட்டுப்பாட்டின் மூலம் குழந்தைகளுக்கு சிறந்த முன்மாதிரியாக இருக்க வேண்டும்.\n9. நேர நிர்வாகம் மற்றும் சுய சுத்தத்தைப் பேண சிறு வயதிலிருந்தே பழக்குங்கள்.\n10. இத்தகைய முறைகள் உங்கள் குழந்தையை ஒரு பொறுப்பான குடிமகனாக மாற்றும்.`,
    category: 'Positive Parenting', seo_keywords: 'Gentle discipline methods for toddlers, குழந்தைகளுக்கு ஒழுக்கம் கற்பிக்க', read_time: '5 min read',
  },
];

async function seedIfNeeded() {
  const existingAdmin = await queryOne<{ id: string }>('SELECT id FROM admin_users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('Poochandi#@2001', 10);
    await execute('INSERT OR IGNORE INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)', ['admin-1', 'admin', passwordHash]);
  }
  for (const a of CORE_ARTICLES) {
    await execute(
      `INSERT OR IGNORE INTO articles (id, slug, title_en, title_ta, excerpt_en, excerpt_ta, content_en, content_ta, category, read_time, seo_keywords, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [a.id, a.slug, a.title_en, a.title_ta, a.excerpt_en, a.excerpt_ta, a.content_en, a.content_ta, a.category, a.read_time, a.seo_keywords]
    );
  }

  const defaultSettings: Record<string, string> = {
    site_name: 'Poochandi.in',
    tagline: 'Modern Parenting with Folklore Magic',
    parent_brand: 'Poochandi Varaan',
    instagram_handle: '@poochandi_ig',
    instagram_url: 'https://instagram.com/poochandi_ig',
    youtube_name: 'Poochandi Varaan',
    youtube_url: 'https://youtube.com/@poochandivaraan',
    whatsapp_number: '+919876543210',
    contact_email: 'hello@poochandi.in',
    adsense_publisher_id: 'ca-pub-0000000000000000',
    google_analytics_id: 'G-XXXXXXXXXX',
    reel1_id: 'reel-1', reel1_title: 'When Kids Refuse to Eat Veggies! 🥦', reel1_url: 'https://www.instagram.com/poochandi_ig/reel/sample1/', reel1_thumbnail: '/images/reel-thumb-1.svg', reel1_desc: 'Poochandi explains why spinach gives superhero powers!',
    reel2_id: 'reel-2', reel2_title: 'Say Goodbye to Bedtime Meltdowns 🌙', reel2_url: 'https://www.instagram.com/poochandi_ig/reel/sample2/', reel2_thumbnail: '/images/reel-thumb-2.svg', reel2_desc: 'A calming nighttime story method that puts toddlers to sleep in 15 mins.',
    reel3_id: 'reel-3', reel3_title: 'Smart Alternative to Phone Addiction 📱', reel3_url: 'https://www.instagram.com/poochandi_ig/reel/sample3/', reel3_thumbnail: '/images/reel-thumb-3.svg', reel3_desc: '3 easy games that replace screen cravings naturally.',
    reel4_id: 'reel-4', reel4_title: 'Teaching Kids to Respect Elders with Love ❤️', reel4_url: 'https://www.instagram.com/poochandi_ig/reel/sample4/', reel4_thumbnail: '/images/reel-thumb-4.svg', reel4_desc: 'Why manners become fun habits when taught with humor.',
    logo_url: '/images/poochandi-logo.svg',
    character_hero_url: '/images/poochandi-hero.svg',
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await execute('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
  }

  await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM articles');
}

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await batch([
      { sql: `CREATE TABLE IF NOT EXISTS complaint_names (id TEXT PRIMARY KEY, child_name TEXT NOT NULL, child_age INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE', created_at TEXT DEFAULT (datetime('now')))` },
      { sql: `CREATE TABLE IF NOT EXISTS child_requests (id TEXT PRIMARY KEY, parent_name TEXT NOT NULL, child_name TEXT NOT NULL, nickname TEXT, age_grade TEXT NOT NULL, behavior TEXT NOT NULL, city TEXT, special_instructions TEXT, consent INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT DEFAULT (datetime('now')))` },
      { sql: `CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_en TEXT NOT NULL, title_ta TEXT NOT NULL, excerpt_en TEXT NOT NULL, excerpt_ta TEXT NOT NULL, content_en TEXT NOT NULL, content_ta TEXT NOT NULL, category TEXT NOT NULL, featured_image TEXT, read_time TEXT DEFAULT '5 min read', seo_keywords TEXT, published INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))` },
      { sql: `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)` },
      { sql: `CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))` },
    ]);
    try { await execute('ALTER TABLE articles ADD COLUMN seo_keywords TEXT'); } catch {}
    try { await execute('ALTER TABLE complaint_names ADD COLUMN used_at TEXT'); } catch {}
    await seedIfNeeded();
  })().catch((err) => {
    initPromise = null; // allow retry after config fixes
    throw err;
  });
  return initPromise;
}

export default { getDb, queryAll, queryOne, execute, batch, initDb };
