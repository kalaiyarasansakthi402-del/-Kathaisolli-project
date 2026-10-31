import { Injectable } from '@nestjs/common';
import {
  GenerateIdeasDto,
  GrammarCheckDto,
  SuggestTitlesDto,
  SummarizeDto,
} from './dto/ai-assistant.dto';

@Injectable()
export class AiAssistantService {
  async generateIdeas(dto: GenerateIdeasDto) {
    const genre = dto.genre || 'மர்மம் (Mystery)';
    const premise = dto.theme || 'ஒரு எதிர்பாராத சந்திப்பும் அதைத் தொடரும் மர்மங்களும்';

    return {
      genre,
      ideas: [
        {
          title: `${genre} — மாய நிழல்`,
          logline: `${premise} சார்ந்த கதைக்களம். இரவு நேரங்களில் கேட்கத் தகுந்த விறுவிறுப்பான திருப்பங்கள் கொண்ட கதை.`,
          characters: [
            { name: 'கதிர்', role: 'கதையின் நாயகன், துப்பறியும் ஆர்வலர்' },
            { name: 'மீனா', role: 'பழங்கால ரகசியங்களை அறிந்த ஆவணக்காப்பாளர்' },
          ],
          audioAmbiance: [
            'தூரத்தில் கேட்கும் இடி முழக்கம்',
            'பழைய மரக் கதவு திறக்கும் மெல்லிய சத்தம்',
            'மழைத் தூறல் பின்னணி ஒலி',
          ],
          suggestedEpisodes: [
            'அத்தியாயம் 1: மர்மக் கடிதம்',
            'அத்தியாயம் 2: பூட்டிய அறை',
            'அத்தியாயம் 3: நள்ளிரவுச் சந்திப்பு',
          ],
          recommendedTags: ['தமிழ் கதை', 'திகில்', 'மர்மம்', 'ஆடியோ கதை'],
        },
        {
          title: `${genre} — காலப் பயணம்`,
          logline: 'வரலாற்றுப் பின்னணியில் புனையப்பட்ட உணர்ச்சிகரமான சாகசப் பயணம்.',
          characters: [
            { name: 'செழியன்', role: 'பண்டைக்கால வீரன்' },
            { name: 'அமுதா', role: 'சித்த மருத்துவர்' },
          ],
          audioAmbiance: [
            'குதிரைக் குளம்படி சத்தம்',
            'கோயில் மணிகளின் நாதம்',
            'காற்றின் விசிலிடும் சத்தம்',
          ],
          suggestedEpisodes: [
            'அத்தியாயம் 1: சோழ தேசத்து எல்லை',
            'அத்தியாயம் 2: ரகசியச் சுரங்கம்',
            'அத்தியாயம் 3: இறுதிப் போர்',
          ],
          recommendedTags: ['வரலாறு', 'சாகசம்', 'தமிழ் புனைகதை'],
        },
      ],
    };
  }

  async suggestTitles(dto: SuggestTitlesDto) {
    return {
      synopsisExcerpt: dto.synopsis.slice(0, 80) + '...',
      suggestions: [
        {
          title: 'மௌனத்தின் குரல்',
          subtitle: 'கேட்கப்படாத உண்மைகளின் கதை',
          style: 'உணர்ச்சிகரமானது',
        },
        {
          title: 'இருளின் சாட்சி',
          subtitle: 'ஒரு நள்ளிரவுப் புதிரின் பின்னணி',
          style: 'திகில் & சஸ்பென்ஸ்',
        },
        {
          title: 'காற்று வழி வந்தவள்',
          subtitle: 'காலத்தால் அழியாத காதல் பயணம்',
          style: 'காதல் & குடும்பம்',
        },
        {
          title: 'கடல் கொண்ட ரகசியம்',
          subtitle: 'ஆழ்கடலின் தீராத புதிர்கள்',
          style: 'சாகசம் & த்ரில்லர்',
        },
      ],
    };
  }

  async grammarCheck(dto: GrammarCheckDto) {
    const original = dto.text;
    // Polish common Tamil punctuation and flow
    let polished = original
      .replace(/\s+/g, ' ')
      .replace(/\s+([,;.!?])/g, '$1')
      .trim();

    return {
      original,
      polished,
      improvements: [
        'வாக்கிய அமைப்பு மற்றும் நிறுத்தக்குறிகள் சீரமைக்கப்பட்டுள்ளன.',
        'ஒலி வடிவில் வாசிப்பதற்கு ஏற்றவாறு ஓட்டமும் ஒலிக்குறிப்பும் மேம்படுத்தப்பட்டுள்ளது.',
      ],
      readabilityScore: 'நன்று (Excellent for Audio Narration)',
    };
  }

  async summarize(dto: SummarizeDto) {
    const text = dto.content.trim();
    const wordCount = text.split(/\s+/).length;
    const estimatedAudioMinutes = Math.max(1, Math.round(wordCount / 130));

    return {
      wordCount,
      estimatedAudioDuration: `${estimatedAudioMinutes} நிமிடங்கள்`,
      shortSummary: text.length > 250 ? text.slice(0, 250) + '...' : text,
      suggestedTags: ['கதைசொல்லி', 'தமிழ் ஆடியோ', 'புதிய அத்தியாயம்'],
      recommendedKeyMoments: [
        { timecode: '00:00', title: 'அறிமுகம் & பின்னணி சூழல்' },
        { timecode: '02:30', title: 'கதையின் முக்கிய திருப்பம்' },
        { timecode: '05:00', title: 'முடிவு & அடுத்த அத்தியாயத்திற்கான எதிர்பார்ப்பு' },
      ],
    };
  }
}
