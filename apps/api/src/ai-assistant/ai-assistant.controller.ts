import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiAssistantService } from './ai-assistant.service';
import {
  GenerateIdeasDto,
  GrammarCheckDto,
  SuggestTitlesDto,
  SummarizeDto,
} from './dto/ai-assistant.dto';

@ApiTags('AI Story Assistant')
@ApiBearerAuth()
@Controller('ai-assistant')
@UseGuards(JwtAuthGuard)
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @ApiOperation({ summary: 'Generate story concepts, characters, and ambiance notes' })
  @Post('generate-ideas')
  generateIdeas(@Body() dto: GenerateIdeasDto) {
    return this.aiAssistantService.generateIdeas(dto);
  }

  @ApiOperation({ summary: 'Suggest catchy Tamil titles and subtitles' })
  @Post('suggest-titles')
  suggestTitles(@Body() dto: SuggestTitlesDto) {
    return this.aiAssistantService.suggestTitles(dto);
  }

  @ApiOperation({ summary: 'Tamil script grammar check and audio narration polish' })
  @Post('grammar-check')
  grammarCheck(@Body() dto: GrammarCheckDto) {
    return this.aiAssistantService.grammarCheck(dto);
  }

  @ApiOperation({ summary: 'Summarize episode script, estimate audio length, and suggest tags' })
  @Post('summarize')
  summarize(@Body() dto: SummarizeDto) {
    return this.aiAssistantService.summarize(dto);
  }
}
